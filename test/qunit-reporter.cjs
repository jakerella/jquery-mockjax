
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

if (IS_WINDOWS) {
    // Ugh... ANSI colors on Powershell == :(
    // https://github.com/nodejs/node/issues/29387
    Object.keys(COLORS).forEach(c => { COLORS[c] = '' })
}
process.stdout.write(`${COLORS.reset}\n`)

let moduleChain = []
const modulesStarted = new Set()
const moduleErrors = []
let testErrors = []
let assertionErrors = []
let totalTests = 0
let skippedTests = 0

function begin(context) {
    reset()

    let moduleCount = context.modules.length
    context.modules.forEach(module => {
        moduleCount += module.childSuites.length
    })

    process.stdout.write(`${COLORS.white}Starting test suite, running ${context.totalTests} Tests across ${moduleCount} Modules\n`)
}

function moduleStart(context) {
    if (modulesStarted.has(context.name)) {
        return
    } else {
        modulesStarted.add(context.name)
    }

    moduleChain.push(context.name)

    if (context.tests.length) {
        let name = moduleChain.join(': ')
        process.stdout.write(`${COLORS.gray}  Module: ${UNDERLINE}${name}${COLORS.reset} `)
    }
}

function testDone(context) {
    totalTests++
    if (context.failed) {
        const msg = `${COLORS.red}${context.module}: ${context.name}${assertionErrors.join('    ')}${COLORS.reset}`
        testErrors.push(msg)
        assertionErrors = []
        process.stdout.write(`${COLORS.red}F${COLORS.reset}`)
    } else if (context.skipped) {
        skippedTests++
        process.stdout.write(`${COLORS.yellow}S${COLORS.reset}`)
    } else {
        process.stdout.write(`${COLORS.white}.${COLORS.reset}`)
    }
}

function log(context) {
    if (context.result) { return } // If success doesn't log

    let msg = `\n    ${COLORS.white}Assertion:`
    if (context.message) {
        msg += ` ${context.message}`
    }

    if (typeof context.expected !== 'undefined') {
        msg += `
      ${COLORS.white}✓ ${COLORS.teal}${context.expected}
      ${COLORS.white}X ${COLORS.red}${context.actual}${COLORS.reset}`
    }

    assertionErrors.push(msg)
}

function moduleDone(context) {
    moduleChain.pop()
    if (context.failed) {
        const msg = `${testErrors.join('\n')}${COLORS.reset}`
        moduleErrors.push(msg)
    }
    testErrors = []
    if (context.tests.length) {
        process.stdout.write('\n')
    }
}

function done(context) {
    if (moduleErrors.length > 0) {
        for (let idx = 0; idx < moduleErrors.length; idx++) {
            process.stderr.write(`${moduleErrors[idx]}\n\n`)
        }
    }

    const skipCount = context.skipped || skippedTests

    process.stdout.write(`${COLORS.white}Ran ${totalTests} Tests and ${context.total} Assertions in ${context.runtime}ms: `)
    process.stdout.write([
        `${(context.passed) ? COLORS.green : COLORS.red}${context.passed} Passed${COLORS.reset}`,
        `${(skipCount > 0) ? COLORS.yellow : COLORS.green}${skipCount} Skipped${COLORS.reset}`,
        `${(context.failed > 0) ? COLORS.red : COLORS.green}${context.failed} Failed${COLORS.reset}`
    ].join(', ') + '\n\n')
}

function reset() {
    modulesStarted.clear()
    moduleErrors.length = 0
    testErrors = []
    assertionErrors = []
    totalTests = 0
    skippedTests = 0
}

/**
 * This one is required for QUnit to register this as a reporter
 * @param {object} QUnit The QUnit framework
 * @returns {void}
 */
function init(QUnit) {
    QUnit.on('error', (error) => {
        console.error(error)
    })

    // Each of these handlers will convert from the Common Reporting Interface
    // to QUnit's own handler context object properties. This lets us use the 
    // methods above as a formal CRI "reporter" or as QUnit.[event]() handlers.

    QUnit.on('runStart', (runStart) => {
        begin({ totalTests: runStart.testCounts.total, modules: runStart.childSuites })
    })

    QUnit.on('suiteStart', (suiteStart) => {
        moduleStart(suiteStart)
    })

    QUnit.on('testEnd', (testEnd) => {
        testEnd.errors.forEach(result => {
            log({...result, result: result.passed})
        })
        testDone({
            ...testEnd,
            module: testEnd.suiteName,
            failed: testEnd.status === 'failed',
            skipped: testEnd.status === 'skipped'
        })
    })

    QUnit.on('suiteEnd', (suiteEnd) => {
        moduleDone({...suiteEnd, failed: suiteEnd.status === 'failed'})
    })

    QUnit.on('runEnd', (runEnd) => {
        done({
            ...runEnd,
            total: runEnd.testCounts.total,
            passed: runEnd.testCounts.passed,
            failed: runEnd.testCounts.failed,
            skipped: runEnd.testCounts.skipped
        })
    })
}

// We export the other functions so they can be used in other contexts, if necessary
// Running `init()` will attach all of the handlers to the correct QUnit events
module.exports = {
    init, begin, moduleStart, log, testDone, moduleDone, done, reset
}
