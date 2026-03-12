
const path = require('path')
const testrunner = require('node-qunit')

testrunner.setup({
    log: {
        assertions: true,
        errors: true,
        tests: false,
        summary: true,
        globalSummary: false,
        coverage: false,
        globalCoverage: false,
        testing: false
    },
    coverage: false,
    maxBlockDuration: 3000
})

testrunner.run({
    code: path.resolve(__dirname, 'app.cjs'),
    tests: [
        path.resolve(__dirname, 'tests.cjs')
    ]
}, (err, results) => {
	if (err) {
		console.error('Errors during test run:\n', err)
	}
})
