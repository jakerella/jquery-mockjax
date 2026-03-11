
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

import puppeteer from 'puppeteer'
import { spawn } from 'child_process'

const PROCESS_TIMEOUT = 30000

let serverProc = null

process.on('SIGTERM', killServerProcess)
process.on('SIGINT', killServerProcess)
process.on('SIGHUP', killServerProcess)

export default async function testRunner(targetURLs, port) {
  startServer(port)

  process.stdout.write('\x1b[36mLaunching browser...\x1b[0m\n')
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
  killServerProcess()
  return Promise.resolve(allStats)
}

function startServer(port) {
  // TODO: can we switch this to npx? (getting connection failures)
  // serverProc = spawn('npx', ['http-server', '-c-1', `-p ${port}`], { encoding: 'utf8' })
  serverProc = spawn('http-server', ['-c-1', `-p ${port}`], { encoding: 'utf8' })
  serverProc.on('error', (err) => {
    process.stderr.write(`\n\x1b[32m${err.message || err}\x1b[0m\n`)
    killServerProcess()
  })
  // serverProc.stdout.on('data', console.log)
  // serverProc.stderr.on('data', console.error)
  serverProc.on('spawn', async () => {
    process.stdout.write('\x1b[36mHTTP server up and running\x1b[0m\n')
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
      let method = '\x1b[38;5;247mRunnning'
      if (skipCount === context.tests.length) {
        method = '\x1b[33mSkipping'
        skippedModules.push(context.name)
      }
      process.stdout.write(`${method} Module: \x1b[4m${context.name}\x1b[0m `)
    })

    await page.exposeFunction('harness_moduleDone', context => {
      if (context.failed) {
        const msg = `\x1b[33mModule Failed: "${context.name}"\n${testErrors.join('\n')}\x1b[0m`
        moduleErrors.push(msg)
        testErrors = []
      }
      process.stdout.write('\n')
    })

    await page.exposeFunction('harness_testDone', context => {
      if (context.failed) {
        const msg = "  \x1b[31mTest Failed: " + context.name + assertionErrors.join("    ") + '\x1b[0m'
        testErrors.push(msg)
        assertionErrors = []
        process.stdout.write("\x1b[31mF\x1b[0m")
      } else if (context.skipped) {
        page.skippedTests++
        process.stdout.write("\x1b[33mS\x1b[0m")
      } else {
        process.stdout.write("\x1b[37m.\x1b[0m")
      }
    })

    await page.exposeFunction('harness_log', context => {
      if (context.result) { return } // If success doesn't log

      let msg = "\n    \x1b[37mAssertion:"
      if (context.message) {
        msg += " " + context.message
      }

      if (context.expected) {
        msg += `
      \x1b[37m✓ \x1b[36m${context.expected}
      \x1b[37mX \x1b[31m${context.actual}\x1b[0m`
      }

      assertionErrors.push(msg)
    })

    await page.exposeFunction('harness_done', context => {
      process.stdout.write("\n")

      if (moduleErrors.length > 0) {
        for (let idx = 0; idx < moduleErrors.length; idx++) {
          process.stderr.write(`${moduleErrors[idx]}\n\n`)
        }
      }

      const stats = [
        `\x1b[37mRuntime: ${context.runtime}ms`,
        `\x1b[37mTotal: ${context.total}`,
        `\x1b[32mPassed: ${context.passed}\x1b[0m`,
        `${(page.skippedTests > 0) ? '\x1b[33m' : '\x1b[32m'}Skipped: ${page.skippedTests}\x1b[0m`,
        `${(context.failed > 0) ? '\x1b[31m' : '\x1b[32m'}Failed: ${context.failed}\x1b[0m`
      ]
      process.stdout.write(stats.join(", ") + '\n\n')

      page.testStats = { ...context, skipped: page.skippedTests }
      page.testsComplete = true
    })

    return page

  } catch (err) {
    process.stderr.write(`PAGE SETUP ERROR: ${err}\n`)
  }
}

async function startTests(page, targetURL) {
  process.stdout.write(`\x1b[37m==> Navigating to ${targetURL}\n`)

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

      if (!QUnit.config.autostart) {
        QUnit.start()
      }
    })

    function wait(timeout) {
      let total = 0
      return new Promise(resolve => {
        setInterval(() => {
          total += 500
          if (page.testsComplete || total >= timeout) {
            resolve()
          }
        }, 500)
      })
    }

    await wait(PROCESS_TIMEOUT)

    if (!page.testsComplete) {
      process.stderr.write(`\x1b[33mTests timed out after ${PROCESS_TIMEOUT}ms\x1b[0m\n`)
    }

  } catch (err) {
    process.stderr.write(`TEST ERROR: ${err}\n`)
  }
}

function killServerProcess() {
  spawn('kill', [serverProc.pid])
}
