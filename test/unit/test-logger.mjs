
import sinon from 'sinon'
import QUnit from 'qunit'
import * as settingsModule from '../../src/settings.mjs'
const it = QUnit.test

// Set up mock jQuery for settings to attach to
global.$ = {}

const mockSettings = {...settingsModule.getSettings()}
let mockGetSettings = null

const sandbox = sinon.createSandbox()

const beforeEach = () => {
    DEFAULT_LOG_LEVEL_METHODS.forEach((method) => {
        sinon.stub(global.console, method)
    })
    const testSettings = {...mockSettings}
    mockGetSettings = sandbox.fake(() => {
        return testSettings
    })
    sandbox.replace.usingAccessor(settingsModule.mocks, 'getSettings', mockGetSettings)
}
const afterEach = () => {
    DEFAULT_LOG_LEVEL_METHODS.forEach((method) => {
        global.console[method].restore()
    })
    sandbox.restore()
}

import {
    getLogger,
    DEFAULT_LOG_LEVEL_METHODS
} from '../../src/logger.mjs'

/* ----------------- */
QUnit.module('Logger: getLogger', { beforeEach, afterEach })
/* ----------------- */

it('should return a logger object', (assert) => {
    const logger = getLogger()
    assert.ok(typeof logger === 'object', 'Logger should be an object')
})

it('should return logger with all log methods', (assert) => {
    assert.expect(DEFAULT_LOG_LEVEL_METHODS.length)
    const logger = getLogger()

    DEFAULT_LOG_LEVEL_METHODS.forEach((method) => {
        assert.ok(typeof logger[method] === 'function', `Logger should have ${method} method`)
    })
})

it('should return same logger instance on multiple calls', (assert) => {
    const logger1 = getLogger()
    const logger2 = getLogger()
    assert.equal(logger1, logger2, 'Should return same logger instance')
})

it('should use existing logger when set', (assert) => {
    const customLogger = {
        error: () => {},
        warn: () => {},
        info: () => {},
        log: () => {},
        debug: () => {}
    }
    mockGetSettings().logger = customLogger
    const logger = getLogger()
    assert.equal(logger, customLogger, 'Should return existing custom logger')
})

/* ----------------- */
QUnit.module('Logger: log methods', { beforeEach, afterEach })
/* ----------------- */

it('should log with default levels', (assert) => {
    assert.expect(DEFAULT_LOG_LEVEL_METHODS.length * 2)

    const logger = getLogger()

    DEFAULT_LOG_LEVEL_METHODS.forEach((method, i) => {
        logger[method](`Test ${method} message`)

        if (i <= mockGetSettings().logLevel) {
            assert.ok(global.console[method].calledOnce, `mock ${method} log should be called once`)
            assert.ok(global.console[method].calledWith(`Test ${method} message`), `mock ${method} log should be called with correct message`)
        } else {
            assert.notOk(global.console[method].called, `mock ${method} log should not be called`)
            assert.equal(typeof global.console[method], 'function', `mock ${method} method is a function`)
        }
    })
})

it('should log multiple arguments', (assert) => {
    const logger = getLogger()

    logger.error('Error', { code: 500 }, true)

    assert.ok(global.console.error.calledOnce, 'mock error log should be called once')
    assert.ok(global.console.error.calledWith('Error', { code: 500 }, true), 'mock error log should be called with correct message and data')
})

/* ----------------- */
QUnit.module('Logger: log level filtering', { beforeEach, afterEach })
/* ----------------- */

function testLogLevel(assert, level) {
    mockGetSettings().logLevel = level
    const logger = getLogger()

    DEFAULT_LOG_LEVEL_METHODS.forEach((method) => {
        logger[method](`${method} message`)
    })

    DEFAULT_LOG_LEVEL_METHODS.forEach((method, i) => {
        if (i <= level) {
            assert.ok(global.console[method].calledOnce, `mock ${method} log should be called once`)
        }
    })
}

it('should not log any messages based on logLevel: -1', (assert) => {
    assert.expect(2)
    testLogLevel(assert, -1)
    assert.notOk(global.console.error.called, 'mock error log should not be called')
    assert.notOk(global.console.debug.called, 'mock debug log should not be called')
})

it('should filter messages based on logLevel: 0', (assert) => {
    assert.expect(DEFAULT_LOG_LEVEL_METHODS.length - 4)
    testLogLevel(assert, 0)
})

it('should filter messages based on logLevel: 1', (assert) => {
    assert.expect(DEFAULT_LOG_LEVEL_METHODS.length - 3)
    testLogLevel(assert, 1)
})

it('should filter messages based on logLevel: 2', (assert) => {
    assert.expect(DEFAULT_LOG_LEVEL_METHODS.length - 2)
    testLogLevel(assert, 2)
})

it('should filter messages based on logLevel: 3', (assert) => {
    assert.expect(DEFAULT_LOG_LEVEL_METHODS.length - 1)
    testLogLevel(assert, 3)
})

it('should filter messages based on logLevel: 4', (assert) => {
    assert.expect(DEFAULT_LOG_LEVEL_METHODS.length)
    testLogLevel(assert, 4)
})

it('should not filter messages based on logLevel: 99', (assert) => {
    assert.expect(DEFAULT_LOG_LEVEL_METHODS.length)
    testLogLevel(assert, 99)
})

it('should not log any messages when "logging" is false', (assert) => {
    mockGetSettings().logLevel = null
    mockGetSettings().logging = false
    
    const logger = getLogger()

    DEFAULT_LOG_LEVEL_METHODS.forEach((method) => {
        logger[method](`${method} message`)
    })

    assert.notOk(global.console.error.called, 'mock error log should not be called')
    assert.notOk(global.console.debug.called, 'mock debug log should not be called')
})

it('should use deprecated logging setting as log level', (assert) => {
    mockGetSettings().logLevel = null
    mockGetSettings().logging = 1

    const logger = getLogger()

    assert.equal(logger.getLevel(), 1, 'logLevel and logging settings should be the same')

})

it('should prefer logLevel over deprecated logging setting', (assert) => {
    mockGetSettings().logLevel = 1
    mockGetSettings().logging = 4

    const logger = getLogger()
    
    assert.equal(logger.getLevel(), 1, 'logLevel should override logging setting')
})
