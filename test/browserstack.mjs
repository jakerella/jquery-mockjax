
import { readFileSync, writeFileSync } from 'fs'
import browserstackRunner from 'browserstack-runner'
import { getjQueryVersions } from './get-jquery-versions.mjs'
import reporter from './qunit-reporter.cjs'

const alljQueryVersions = getjQueryVersions()

const URLs = []
for (let jqVersion of alljQueryVersions) {
    URLs.push(`test/integration/index.html?jquery=${jqVersion}`)
}

const config = {
    username: process.env.BROWSERSTACK_USERNAME,
    key: process.env.BROWSERSTACK_KEY,
    test_framework: 'qunit',
    test_path: URLs,
    test_server_port: 3000,
    browsers: [
        'chrome_latest',
        'firefox_latest',
        'safari_latest',
        'edge_latest'
    ]
}

if (!config.username || !config.key) {
    console.error('Please be sure to the BROWSERSTACK_USERNAME and BROWSERSTACK_KEY environment variables before running this script!')
    process.exit(1)
}

console.log('Starting BrowserStack run against URLs:', URLs)
console.log('and in these browsers:', config.browsers, '\n')

browserstackRunner.run(config, function(err, report) {
    if (err) {
        console.error('BrowserStack Error:', err)
        process.exit(1)
    }
    reportResults(report)
    writeFileSync('browserstack-test-report.json', JSON.stringify(report, null, 4))
    process.exit(0)
})

function reportResults(report) {
    let context = {
        passed: 0,
        failed: 0,
        skipped: 0,
        runtime: 0
    }
    report.forEach(run => {
        console.log('**********************************************')
        console.log(run.browser, '\n')

        run.suites.childSuites.forEach(suite => {
            reporter.moduleStart(suite)

            let moduleFailed = false
            suite.tests.forEach(test => {
                context.runtime += test.runtime || 0

                if (test.assertions) {
                    test.assertions.forEach(assertion => {
                        if (!assertion.passed) {
                            reporter.log({...assertion, result: assertion.passed})
                        }
                    })
                } else {
                    reporter.log({ result: false, message: 'Expected at least one assertion' })
                    test.status = 'failed'
                }

                reporter.testDone({
                    name: test.name,
                    module: test.suiteName,
                    passed: test.status === 'passed',
                    failed: test.status === 'failed',
                    skipped: test.status === 'skipped'
                })
                if (test.status === 'failed') {
                    context.failed++
                    moduleFailed = true
                } else if (test.status === 'skipped') {
                    context.skipped++
                } else {
                    context.passed++
                }
            })

            reporter.moduleDone({
                failed: moduleFailed,
                tests: suite.tests
            })
        })

        reporter.done(context)
        reporter.reset()
    })
}
