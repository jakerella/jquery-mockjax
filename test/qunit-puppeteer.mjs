
/**
 * This file was modified from the original to support being used as an ES module.
 * https://github.com/davidtaylorhq/qunit-puppeteer
 * 
 * LICENSE: MIT
 *
 * ORIGINAL LICENSE (https://github.com/davidtaylorhq/qunit-puppeteer/blob/master/LICENSE)
 * MIT License
 * 
 * Copyright (c) 2017 David Taylor
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import path from 'path'
import puppeteer from 'puppeteer'
import { spawn, spawnSync } from 'child_process'

const PROCESS_TIMEOUT = 30000
const IS_WINDOWS = process.platform === 'win32'
const COLORS = {
  reset: '\x1b[0m',
  white: '\x1b[37m',
  gray: '\x1b[38;5;247m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  teal: '\x1b[36m'
}
const UNDERLINE = IS_WINDOWS ? '' : '\x1b[4m'

let serverProc = null

process.on('SIGTERM', killServerProcess)
process.on('SIGINT', killServerProcess)
process.on('SIGHUP', killServerProcess)

/**
 * TODO: fill this in
 * @param {*} targetURLs 
 * @param {*} projectBaseDir 
 * @param {*} port 
 * @returns 
 */
export default async function testRunner(targetURLs, projectBaseDir, port) {
  if (IS_WINDOWS) {
    // Ugh... ANSI colors on Powershell == :(
    // https://github.com/nodejs/node/issues/29387
    Object.keys(COLORS).forEach(c => { COLORS[c] = '' })
  }
  process.stdout.write(`${COLORS.reset}\n`)
  serverProc = await startServer(projectBaseDir, port)
  if (!serverProc) {
    return Promise.reject(new Error('HTTP server never started.'))
  }

  try {
    await wait(() => {
      if (serverProc.ready) { return true }
      if (serverProc.error) { return serverProc.error }
      return false
    }, 10000, 500)
  } catch (err) {
    await killServerProcess()
    let errMessage = err.message || String(err)
    if (/timeout/.test(err)) {
      errMessage = 'HTTP server never started (timeout).'
    } else if (err instanceof Error) {
      const errMatch = errMessage.match(/Error: ([^\n]+)/)
      errMessage = `ERROR on http-server termination: ${(errMatch && errMatch[1]) || errMessage}`
    }
    return Promise.reject(errMessage)
  }

  process.stdout.write(`${COLORS.teal}Launching browser...${COLORS.reset}\n`)
  const browser = await puppeteer.launch()

  if (!Array.isArray(targetURLs)) {
    targetURLs = [targetURLs]
  }

  const allStats = {}
  for (let url of targetURLs) {
    const page = await setupNewPage(browser)
    await startTests(page, url)
    allStats[url] = page.testStats
  }
  await browser.close()
  await killServerProcess()
  return Promise.resolve(allStats)
}

function startServer(projectBaseDir, port) {
  return new Promise((resolve, _) => {
    const server = spawn(
      'node',
      [path.resolve(projectBaseDir, 'node_modules', 'http-server', 'bin', 'http-server'), '-c-1', `-p ${port}`, '.'],
      { encoding: 'utf8' }
    )
    
    server.ready = false
    
    server.on('error', async (err) => {
      process.stderr.write(`\n${COLORS.red}ERROR from http-server: ${err.message || err}${COLORS.reset}\n`)
      await killServerProcess()
    })
    function checkForStart(output) {
      if (/available/i.test(output)) {
        process.stdout.write(`${COLORS.teal}HTTP server up and running on port ${port}${COLORS.reset}\n`)
        server.ready = true
        server.stdout.off('data', checkForStart)
      }
    }
    server.stdout.on('data', checkForStart)
    server.on('spawn', async () => {
      process.stdout.write(`${COLORS.teal}HTTP server starting...${COLORS.reset}\n`)
      resolve(server)
    })
  })
}

async function setupNewPage(browser) {
  try {
    const page = await browser.newPage()
    page.testsComplete = false
    page.skippedTests = 0

    // Attach to page's console log events, and log to node console
    page.on('console', (...params) => {
      for (let i = 0; i < params.length; ++i) {
        let output = params[i]
        if (output && typeof(output) === 'object') {
          output = JSON.stringify(output)
          if (output === '{}') { output = '' }
        } else if (typeof(output) === 'string') {
          output = output.trim()
        }
        if (output || output === 0 || output === false) {
          process.stdout.write(`\n${String(output)}\n`)
        }
      }
    })

    let moduleErrors = []
    let testErrors = []
    let assertionErrors = []
    let skippedModules = []

    await page.exposeFunction('harness_moduleStart', context => {
      if (skippedModules.includes(context.name)) { return }
      const skipCount = context.tests.filter(t => t.skip).length
      let method = `${COLORS.gray}Runnning`
      if (skipCount === context.tests.length) {
        method = `${COLORS.yellow}Skipping`
        skippedModules.push(context.name)
      }
      process.stdout.write(`${method} Module: ${UNDERLINE}${context.name}${COLORS.reset} `)
    })

    await page.exposeFunction('harness_moduleDone', context => {
      if (context.failed) {
        const msg = `${COLORS.yellow}Module Failed: "${context.name}"\n${testErrors.join('\n')}${COLORS.reset}`
        moduleErrors.push(msg)
        testErrors = []
      }
      process.stdout.write('\n')
    })

    await page.exposeFunction('harness_testDone', context => {
      if (context.failed) {
        const msg = `  ${COLORS.red}Test Failed: ${context.name}${assertionErrors.join('    ')}${COLORS.reset}`
        testErrors.push(msg)
        assertionErrors = []
        process.stdout.write(`${COLORS.red}F${COLORS.reset}`)
      } else if (context.skipped) {
        page.skippedTests++
        process.stdout.write(`${COLORS.yellow}S${COLORS.reset}`)
      } else {
        process.stdout.write(`${COLORS.white}.${COLORS.reset}`)
      }
    })

    await page.exposeFunction('harness_log', context => {
      if (context.result) { return } // If success doesn't log

      let msg = `\n    ${COLORS.white}Assertion:`
      if (context.message) {
        msg += ` ${context.message}`
      }

      if (context.expected) {
        msg += `
      ${COLORS.white}✓ ${COLORS.teal}${context.expected}
      ${COLORS.white}X ${COLORS.red}${context.actual}${COLORS.reset}`
      }

      assertionErrors.push(msg)
    })

    await page.exposeFunction('harness_done', context => {
      process.stdout.write('\n')

      if (moduleErrors.length > 0) {
        for (let idx = 0; idx < moduleErrors.length; idx++) {
          process.stderr.write(`${moduleErrors[idx]}\n\n`)
        }
      }

      const stats = [
        `${COLORS.white}Runtime: ${context.runtime}ms`,
        `${COLORS.white}Total: ${context.total}`,
        `${COLORS.green}Passed: ${context.passed}${COLORS.reset}`,
        `${(page.skippedTests > 0) ? COLORS.yellow : COLORS.green}Skipped: ${page.skippedTests}${COLORS.reset}`,
        `${(context.failed > 0) ? COLORS.red : COLORS.green}Failed: ${context.failed}${COLORS.reset}`
      ]
      process.stdout.write(stats.join(', ') + '\n\n')

      page.testStats = { ...context, skipped: page.skippedTests }
      page.testsComplete = true
    })

    return page

  } catch (err) {
    process.stderr.write(`PAGE SETUP ERROR: ${err}\n`)
  }
}

async function startTests(page, targetURL) {
  process.stdout.write(`${COLORS.white}==> Navigating to ${targetURL}\n`)

  try {
    await page.goto(targetURL)

    await page.evaluate(() => {
      QUnit.config.testTimeout = 5000

      QUnit.moduleStart(window.harness_moduleStart)
      QUnit.moduleDone(window.harness_moduleDone)
      QUnit.testDone(window.harness_testDone)
      QUnit.log(window.harness_log)
      QUnit.done(window.harness_done)

      if (Object.keys(QUnit.urlParams).length) {
        console.log(`\nRunning with params: ${JSON.stringify(QUnit.urlParams)}\n`)
      }

      if (!QUnit.config.autostart && !QUnit.config.noHeadlessStart) {
        QUnit.start()
      }
    })

    try {
      await wait(() => page.testsComplete, PROCESS_TIMEOUT)
    } catch (err) {
      await killServerProcess()
      let errMessage = err.message || String(err)
      if (err instanceof Error) {
        const errMatch = errMessage.match(/Error: ([^\n]+)/)
        errMessage = `ERROR waiting for tests to finish: ${(errMatch && errMatch[1]) || errMessage}`
      } else if (/timeout/.test(err) || !page.testsComplete) {
        errMessage = `Test run timed out after ${PROCESS_TIMEOUT}ms`
      }
      return Promise.reject(errMessage)
    }

  } catch (err) {
    process.stderr.write(`TEST ERROR: ${err}\n`)
    Error.captureStackTrace(err)
    process.stderr.write(err.stack + '\n\n')
  }
}

function wait(trigger, timeout=5000, delay) {
  let time = 0
  let delayTime = Number(delay) || 500
  return new Promise((resolve, reject) => {
    const waitHandler = setInterval(() => {
      time += delayTime
      const triggerResult = trigger()
      if (triggerResult === true) {
        clearInterval(waitHandler)
        return resolve()
      } else if (triggerResult instanceof Error) {
        clearInterval(waitHandler)
        return reject(triggerResult)
      } else if (time >= timeout) {
        clearInterval(waitHandler)
        return reject(new Error(`Wait timer timed out after ${timeout}ms`))
      }
    }, delayTime)
  })
}

async function killServerProcess() {
  if (IS_WINDOWS && serverProc && !serverProc.killed) {
    process.stdout.write('\nKilling http-server process\n')
    if (!serverProc?.kill()) {
      process.stderr.write(`${COLORS.red}Problem killing server process on Windows! (${serverProc ? '(false result)' : 'No serverProc exists'})${COLORS.reset}`)
    }
  } else if (serverProc && serverProc.pid && !serverProc.killed) {
    process.stdout.write('\nKilling http-server process\n')
    spawnSync('kill', [serverProc.pid])
  }
}
