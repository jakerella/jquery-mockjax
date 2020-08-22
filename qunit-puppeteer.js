
/**
 * This file was modified from the original located at:
 * https://github.com/davidtaylorhq/qunit-puppeteer
 *
 * ORIGINAL LICENSE:
MIT License

Copyright (c) 2017 David Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

const puppeteer = require('puppeteer');
const spawn = require('child_process').spawn;

module.exports = async function testRunner(targetURL, port) {
  const timeout = 30000;
  let complete = false;

  let proc;

  try {
    proc = spawn('http-server', ['-c-1', '-p ' + port], { shell: true });  // disable caching

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Attach to browser console log events, and log to node console
    await page.on('console', (...params) => {
      for (let i = 0; i < params.length; ++i) {
        process.stdout.write(`${(typeof(params[i]) === 'object') ? params[i]._text : params[i]}\n`);
      }
    });

    let moduleErrors = [];
    let testErrors = [];
    let assertionErrors = [];

    await page.exposeFunction('harness_moduleStart', context => {
      const skippedTests = context.tests.filter(t => t.skip).length;
      if (skippedTests === context.tests.length) {
        process.stdout.write(`\x1b[4m\x1b[36mSkipping Module: ${context.name}\x1b[0m `);
      } else {
        process.stdout.write(`\x1b[4mRunning Module: ${context.name}\x1b[0m `);
      }
    });

    await page.exposeFunction('harness_moduleDone', context => {
      if (context.failed) {
        const msg = "Module Failed: " + context.name + "\n" + testErrors.join("\n");
        moduleErrors.push(msg);
        testErrors = [];
      }
      process.stdout.write('\n');
    });

    await page.exposeFunction('harness_testDone', context => {
      if (context.failed) {
        const msg = "  Test Failed: " + context.name + assertionErrors.join("    ");
        testErrors.push(msg);
        assertionErrors = [];
        process.stdout.write("\x1b[31mF\x1b[0m");
      } else if (context.skipped) {
        process.stdout.write(`\x1b[36ms\x1b[0m`);
      } else {
        process.stdout.write("\x1b[37m.\x1b[0m");
      }
    });

    await page.exposeFunction('harness_log', context => {
      if (context.result) { return; } // If success don't log

      let msg = "\n    Assertion Failed:";
      if (context.message) {
        msg += " " + context.message;
      }

      if (context.expected) {
        msg += "\n      Expected: " + context.expected + ", Actual: " + context.actual;
      }

      assertionErrors.push(msg);
    });

    await page.exposeFunction('harness_done', context => {
      process.stdout.write("\n");

      if (moduleErrors.length > 0) {
        for (let idx=0; idx<moduleErrors.length; idx++) {
          process.stderr.write(`${moduleErrors[idx]}\n\n`);
        }
      }

      const stats = [
        "Time: " + context.runtime + "ms",
        "Total: " + context.total,
        "Passed: " + context.passed,
        "Failed: " + context.failed
      ];
      process.stdout.write(stats.join(", ")+'\n');

      browser.close();
      proc.kill('SIGINT');
      complete = true;
    });

    await page.goto(targetURL);

    await page.evaluate(() => {
      QUnit.config.testTimeout = 5000;

      // Cannot pass the window.harness_blah methods directly, because they are
      // automatically defined as async methods, which QUnit does not support
      QUnit.moduleStart((context) => { window.harness_moduleStart(context); });
      QUnit.moduleDone((context) => { window.harness_moduleDone(context); });
      QUnit.testDone((context) => { window.harness_testDone(context); });
      QUnit.log((context) => { window.harness_log(context); });
      QUnit.done((context) => { window.harness_done(context); });

      if (Object.keys(QUnit.urlParams).length) {
        console.log(`\nRunning with params: ${JSON.stringify(QUnit.urlParams)}`);
      }

      if (!QUnit.config.autostart) {
        QUnit.start();
      }
    });

    function wait(ms) {
      let total = 0;
      return new Promise(resolve => {
        setInterval(() => {
          total += 500;
          if (complete || total >= ms) { return resolve(); }
        }, 500)
      });
    }

    await wait(timeout);

    if (!complete) {
      process.stderr.write(`\x1b[33mTests timed out after ${timeout}ms\x1b[0m\n`);
      browser.close();
      proc.kill('SIGINT');
      throw new Error(`Tests timed out after ${timeout}ms`);
    }

  } catch(err) {
    process.stderr.write(`ERROR: ${err}\n`);
    proc.kill('SIGINT');
    throw err;
  }

};
