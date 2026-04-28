
/**
 * This file was heavily modified from the original to support being used as an ES module
 * and with other benefits like an external (shared) reporter.
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

import { moduleStart, log, testDone, moduleDone, done, reset } from './qunit-reporter.cjs'

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

let serverProc = null

process.on('SIGTERM', killServerProcess)
process.on('SIGINT', killServerProcess)
process.on('SIGHUP', killServerProcess)

/**
 * Run one or more target QUnit URLs with tests in a headless browser
 * @param {string[]} targetURLs The URLs to run in the headless browser
 * @param {string} projectBaseDir The base directory for the project
 * @param {number} port The port to run the http server on
 * @returns {Promise<object>} Resolves with the test stats
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
    reset()

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

    await page.exposeFunction('harness_moduleStart', moduleStart)

    await page.exposeFunction('harness_moduleDone', moduleDone)

    await page.exposeFunction('harness_testDone', testDone)

    await page.exposeFunction('harness_log', log)

    await page.exposeFunction('harness_done', context => {
      done(context)
      page.testStats = context
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
