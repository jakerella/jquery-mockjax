
import QUnit from 'qunit'
import { getJQueryMock } from './mocks.mjs'
import { getJQuery } from '../../src/lib.mjs'

const it = QUnit.test
let $ = getJQuery(getJQueryMock())

import {
    getSettings,
    resetSettings,
    validateSettings
} from '../../src/settings.mjs'

/* ----------------- */
QUnit.module('Settings: getSettings', {
    beforeEach: () => {
        $ = getJQuery(getJQueryMock())
        resetSettings()
    },
    afterEach: () => {
        resetSettings()
    }
})
/* ----------------- */

it('should return default settings when not initialized', (assert) => {
    const settings = getSettings()
    assert.ok(typeof settings === 'object', 'Settings should be an object')
    assert.equal(settings.status, 200, 'Default status should be 200')
    assert.equal(settings.statusText, 'OK', 'Default statusText should be OK')
    assert.equal(settings.responseTime, 500, 'Default responseTime should be 500')
    assert.equal(settings.retainAjaxCalls, -1, 'Default retainAjaxCalls should be -1')
    assert.equal(settings.contentType, 'text/plain', 'Default contentType should be text/plain')
    assert.equal(settings.isTimeout, false, 'Default isTimeout should be false')
    assert.equal(settings.throwUnmocked, false, 'Default throwUnmocked should be false')
    assert.equal(settings.namespace, null, 'Default namespace should be null')
})

it('should return current global settings', (assert) => {
    $.mockjaxSettings = {
        status: 404,
        statusText: 'Not Found',
        responseTime: 1000,
        retainAjaxCalls: 10,
        contentType: 'application/json',
        namespace: '/api'
    }
    const settings = getSettings()
    assert.equal(settings.status, 404, 'Should return modified status')
    assert.equal(settings.responseTime, 1000, 'Should return modified responseTime')
    assert.equal(settings.namespace, '/api', 'Should return modified namespace')
})

it('should return object with all default properties', (assert) => {
    const settings = getSettings()
    assert.ok('logger' in settings, 'Should have logger property')
    assert.ok('logLevel' in settings, 'Should have logLevel property')
    assert.ok('namespace' in settings, 'Should have namespace property')
    assert.ok('status' in settings, 'Should have status property')
    assert.ok('statusText' in settings, 'Should have statusText property')
    assert.ok('responseTime' in settings, 'Should have responseTime property')
    assert.ok('isTimeout' in settings, 'Should have isTimeout property')
    assert.ok('throwUnmocked' in settings, 'Should have throwUnmocked property')
    assert.ok('retainAjaxCalls' in settings, 'Should have retainAjaxCalls property')
    assert.ok('contentType' in settings, 'Should have contentType property')
    assert.ok('response' in settings, 'Should have response property')
    assert.ok('responseText' in settings, 'Should have responseText property')
    assert.ok('proxy' in settings, 'Should have proxy property')
    assert.ok('proxyType' in settings, 'Should have proxyType property')
    assert.ok('responseHeaders' in settings, 'Should have responseHeaders property')
    assert.ok('matchInRegistrationOrder' in settings, 'Should have matchInRegistrationOrder property')
})

/* ----------------- */
QUnit.module('Settings: resetSettings', {
    beforeEach: () => {
        $ = getJQuery(getJQueryMock())
        resetSettings()
    },
    afterEach: () => {
        resetSettings()
    }
})
/* ----------------- */

it('should restore default values', (assert) => {
    $.mockjaxSettings = {
        status: 404,
        responseTime: 1000,
        namespace: '/api',
        retainAjaxCalls: 5
    }
    resetSettings()
    const settings = getSettings()
    assert.equal(settings.status, 200, 'Status should be reset to 200')
    assert.equal(settings.responseTime, 500, 'ResponseTime should be reset to 500')
    assert.equal(settings.namespace, null, 'Namespace should be reset to null')
    assert.equal(settings.retainAjaxCalls, -1, 'RetainAjaxCalls should be reset to -1')
})

it('should return the reset settings object', (assert) => {
    $.mockjaxSettings = { status: 404 }
    const settings = resetSettings()
    assert.ok(typeof settings === 'object', 'Should return settings object')
    assert.equal(settings.status, 200, 'Returned settings should have default status')
})

it('should set $.mockjaxSettings', (assert) => {
    $.mockjaxSettings = { status: 404 }
    resetSettings()
    assert.equal($.mockjaxSettings.status, 200, '$.mockjaxSettings should be updated')
})

it('should be able to be called multiple times', (assert) => {
    resetSettings()
    resetSettings()
    resetSettings()
    const settings = getSettings()
    assert.equal(settings.status, 200, 'Should maintain defaults after multiple resets')
})

it('should handle missing $.mockjaxSettings', (assert) => {
    $.mockjaxSettings = undefined
    const settings = resetSettings()
    assert.ok(settings !== undefined, 'Should create settings object')
    assert.equal(settings.status, 200, 'Should have default status')
})

/* ----------------- */
QUnit.module('Settings: validateSettings (positive)', {
    beforeEach: () => {
        $ = getJQuery(getJQueryMock())
        resetSettings()
    },
    afterEach: () => {
        resetSettings()
    }
})
/* ----------------- */

it('should accept valid default settings', (assert) => {
    resetSettings()
    validateSettings() // Should not throw
    assert.ok(true, 'Valid default settings should not throw')
})

it('should accept valid custom settings', (assert) => {
    $.mockjaxSettings = {
        logger: {
            error: () => {},
            warn: () => {},
            info: () => {},
            log: () => {},
            debug: () => {}
        },
        logLevel: 3,
        namespace: '/api/v1',
        status: 201,
        statusText: 'Created',
        responseTime: 100,
        isTimeout: false,
        throwUnmocked: true,
        retainAjaxCalls: 50,
        contentType: 'application/json',
        response: () => {},
        responseText: 'test',
        responseXML: '<xml/>',
        proxy: '/proxy',
        proxyType: 'POST',
        lastModified: 'Mon, 01 Jan 2024 00:00:00 GMT',
        etag: 'abc123',
        responseHeaders: { 'X-Custom': 'value' },
        matchInRegistrationOrder: false,
        followRedirects: false
    }
    validateSettings() // Should not throw
    assert.ok(true, 'Valid custom settings should not throw')
})

it('should accept status as array', (assert) => {
    $.mockjaxSettings = { 
        status: [200, 201, 204], 
        statusText: 'OK', 
        responseTime: 500, 
        contentType: 'text/plain', 
        responseText: '', 
        isTimeout: false, 
        throwUnmocked: false, 
        retainAjaxCalls: -1, 
        responseHeaders: {}, 
        matchInRegistrationOrder: true, 
        followRedirects: true, 
        logLevel: 2,
        namespace: null,
        response: null,
        responseXML: null,
        proxy: null,
        proxyType: null,
        lastModified: null,
        etag: null
    }
    validateSettings()
    assert.ok(true, 'Status array should be valid')
})

it('should accept null logger', (assert) => {
    $.mockjaxSettings = { 
        logger: null, 
        logLevel: 2, 
        status: 200, 
        statusText: 'OK', 
        responseTime: 500, 
        contentType: 'text/plain', 
        responseText: '', 
        isTimeout: false, 
        throwUnmocked: false, 
        retainAjaxCalls: -1, 
        responseHeaders: {}, 
        matchInRegistrationOrder: true, 
        followRedirects: true,
        namespace: null,
        response: null,
        responseXML: null,
        proxy: null,
        proxyType: null,
        lastModified: null,
        etag: null
    }
    validateSettings()
    assert.ok(true, 'Null logger should be valid')
})

it('should accept null namespace', (assert) => {
    $.mockjaxSettings = { 
        namespace: null, 
        logLevel: 2, 
        status: 200, 
        statusText: 'OK', 
        responseTime: 500, 
        contentType: 'text/plain', 
        responseText: '', 
        isTimeout: false, 
        throwUnmocked: false, 
        retainAjaxCalls: -1, 
        responseHeaders: {}, 
        matchInRegistrationOrder: true, 
        followRedirects: true,
        response: null,
        responseXML: null,
        proxy: null,
        proxyType: null,
        lastModified: null,
        etag: null
    }
    validateSettings()
    assert.ok(true, 'Null namespace should be valid')
})

it('should accept empty responseHeaders', (assert) => {
    $.mockjaxSettings = { 
        responseHeaders: {}, 
        logLevel: 2, 
        status: 200, 
        statusText: 'OK', 
        responseTime: 500, 
        contentType: 'text/plain', 
        responseText: '', 
        isTimeout: false, 
        throwUnmocked: false, 
        retainAjaxCalls: -1, 
        matchInRegistrationOrder: true, 
        followRedirects: true,
        namespace: null,
        response: null,
        responseXML: null,
        proxy: null,
        proxyType: null,
        lastModified: null,
        etag: null
    }
    validateSettings()
    assert.ok(true, 'Empty responseHeaders should be valid')
})

it('should accept responseHeaders with string values', (assert) => {
    $.mockjaxSettings = { 
        responseHeaders: { 'Content-Type': 'application/json', 'X-Custom': 'value' },
        logLevel: 2, 
        status: 200, 
        statusText: 'OK', 
        responseTime: 500, 
        contentType: 'text/plain', 
        responseText: '', 
        isTimeout: false, 
        throwUnmocked: false, 
        retainAjaxCalls: -1, 
        matchInRegistrationOrder: true, 
        followRedirects: true,
        namespace: null,
        response: null,
        responseXML: null,
        proxy: null,
        proxyType: null,
        lastModified: null,
        etag: null
    }
    validateSettings()
    assert.ok(true, 'Valid responseHeaders should be accepted')
})

/* ----------------- */
QUnit.module('Settings: validateSettings (negative)', {
    beforeEach: () => {
        $ = getJQuery(getJQueryMock())
        resetSettings()
    },
    afterEach: () => {
        resetSettings()
    }
})
/* ----------------- */

it('should throw for invalid logger type', (assert) => {
    $.mockjaxSettings.logger = 'not-an-object'
    assert.throws(
        () => validateSettings(),
        /logger/,
        'Should throw for invalid logger'
    )
})

it('should throw for logger missing methods', (assert) => {
    $.mockjaxSettings.logger = { error: () => {} }
    assert.throws(
        () => validateSettings(),
        /logger/,
        'Should throw for incomplete logger'
    )
})

it('should throw for invalid logLevel', (assert) => {
    $.mockjaxSettings.logLevel = 'not-a-number'
    assert.throws(
        () => validateSettings(),
        /logLevel/,
        'Should throw for invalid logLevel'
    )
})

it('should throw for invalid namespace type', (assert) => {
    $.mockjaxSettings.namespace = 123
    assert.throws(
        () => validateSettings(),
        /namespace/,
        'Should throw for invalid namespace'
    )
})

it('should throw for status out of range (too high)', (assert) => {
    $.mockjaxSettings.status = 600
    assert.throws(
        () => validateSettings(),
        /status/,
        'Should throw for status >= 600'
    )
})

it('should throw for status out of range (too low)', (assert) => {
    $.mockjaxSettings.status = 99
    assert.throws(
        () => validateSettings(),
        /status/,
        'Should throw for status < 100'
    )
})

it('should throw for invalid status in array', (assert) => {
    $.mockjaxSettings.status = [200, 999]
    assert.throws(
        () => validateSettings(),
        /status/,
        'Should throw for invalid status in array'
    )
})

it('should throw for non-string statusText', (assert) => {
    $.mockjaxSettings.statusText = 123
    assert.throws(
        () => validateSettings(),
        /statusText/,
        'Should throw for invalid statusText'
    )
})

it('should throw for negative responseTime', (assert) => {
    $.mockjaxSettings.responseTime = -1
    assert.throws(
        () => validateSettings(),
        /responseTime/,
        'Should throw for negative responseTime'
    )
})

it('should throw for non-integer responseTime', (assert) => {
    $.mockjaxSettings.responseTime = 'not-a-number'
    assert.throws(
        () => validateSettings(),
        /responseTime/,
        'Should throw for non-integer responseTime'
    )
})

it('should throw for non-boolean isTimeout', (assert) => {
    $.mockjaxSettings.isTimeout = 'not-a-boolean'
    assert.throws(
        () => validateSettings(),
        /isTimeout/,
        'Should throw for invalid isTimeout'
    )
})

it('should throw for non-boolean throwUnmocked', (assert) => {
    $.mockjaxSettings.throwUnmocked = 'not-a-boolean'
    assert.throws(
        () => validateSettings(),
        /throwUnmocked/,
        'Should throw for invalid throwUnmocked'
    )
})

it('should throw for non-integer retainAjaxCalls', (assert) => {
    $.mockjaxSettings.retainAjaxCalls = 'not-a-number'
    assert.throws(
        () => validateSettings(),
        /retainAjaxCalls/,
        'Should throw for invalid retainAjaxCalls'
    )
})

it('should throw for invalid contentType format', (assert) => {
    $.mockjaxSettings.contentType = 'invalid'
    assert.throws(
        () => validateSettings(),
        /contentType/,
        'Should throw for invalid contentType'
    )
})

it('should throw for non-function response', (assert) => {
    $.mockjaxSettings.response = 'not-a-function'
    assert.throws(
        () => validateSettings(),
        /response/,
        'Should throw for invalid response'
    )
})

it('should throw for null responseText', (assert) => {
    $.mockjaxSettings.responseText = null
    assert.throws(
        () => validateSettings(),
        /responseText/,
        'Should throw for null responseText'
    )
})

it('should throw for undefined responseText', (assert) => {
    $.mockjaxSettings.responseText = undefined
    assert.throws(
        () => validateSettings(),
        /responseText/,
        'Should throw for undefined responseText'
    )
})

it('should throw for non-string responseXML', (assert) => {
    $.mockjaxSettings.responseXML = 123
    assert.throws(
        () => validateSettings(),
        /responseXML/,
        'Should throw for invalid responseXML'
    )
})

it('should throw for non-string proxy', (assert) => {
    $.mockjaxSettings.proxy = 123
    assert.throws(
        () => validateSettings(),
        /proxy/,
        'Should throw for invalid proxy'
    )
})

it('should throw for non-string proxyType', (assert) => {
    $.mockjaxSettings.proxyType = 123
    assert.throws(
        () => validateSettings(),
        /proxyType/,
        'Should throw for invalid proxyType'
    )
})

it('should throw for non-string lastModified', (assert) => {
    $.mockjaxSettings.lastModified = 123
    assert.throws(
        () => validateSettings(),
        /lastModified/,
        'Should throw for invalid lastModified'
    )
})

it('should throw for non-string etag', (assert) => {
    $.mockjaxSettings.etag = 123
    assert.throws(
        () => validateSettings(),
        /etag/,
        'Should throw for invalid etag'
    )
})

it('should throw for invalid responseHeaders type', (assert) => {
    $.mockjaxSettings.responseHeaders = 'not-an-object'
    assert.throws(
        () => validateSettings(),
        /responseHeaders/,
        'Should throw for invalid responseHeaders type'
    )
})

it('should throw for responseHeaders with non-string values', (assert) => {
    $.mockjaxSettings.responseHeaders = { 'X-Custom': 123 }
    assert.throws(
        () => validateSettings(),
        /responseHeaders/,
        'Should throw for non-string header values'
    )
})

it('should throw for non-boolean matchInRegistrationOrder', (assert) => {
    $.mockjaxSettings.matchInRegistrationOrder = 'not-a-boolean'
    assert.throws(
        () => validateSettings(),
        /matchInRegistrationOrder/,
        'Should throw for invalid matchInRegistrationOrder'
    )
})

it('should throw for non-boolean followRedirects', (assert) => {
    $.mockjaxSettings.followRedirects = 'not-a-boolean'
    assert.throws(
        () => validateSettings(),
        /followRedirects/,
        'Should throw for invalid followRedirects'
    )
})

/* ----------------- */
QUnit.module('Settings: validateSettings (edge cases)', {
    beforeEach: () => {
        $ = getJQuery(getJQueryMock())
        resetSettings()
    },
    afterEach: () => {
        resetSettings()
    }
})
/* ----------------- */

it('should accept zero responseTime', (assert) => {
    $.mockjaxSettings.responseTime = 0
    validateSettings()
    assert.ok(true, 'Zero responseTime should be valid')
})

it('should accept retainAjaxCalls = 0', (assert) => {
    $.mockjaxSettings.retainAjaxCalls = 0
    validateSettings()
    assert.ok(true, 'retainAjaxCalls = 0 should be valid')
})

it('should accept retainAjaxCalls = -1', (assert) => {
    $.mockjaxSettings.retainAjaxCalls = -1
    validateSettings()
    assert.ok(true, 'retainAjaxCalls = -1 should be valid')
})

it('should accept large positive retainAjaxCalls', (assert) => {
    $.mockjaxSettings.retainAjaxCalls = 10000
    validateSettings()
    assert.ok(true, 'Large retainAjaxCalls should be valid')
})

it('should accept empty string responseText', (assert) => {
    $.mockjaxSettings.responseText = ''
    validateSettings()
    assert.ok(true, 'Empty string responseText should be valid')
})

it('should accept various contentType formats', (assert) => {
    const validTypes = ['text/plain', 'application/json', 'application/xml', 'text/html', 'application/x-www-form-urlencoded']
    validTypes.forEach(contentType => {
        resetSettings()
        $.mockjaxSettings.contentType = contentType
        validateSettings()
    })
    assert.ok(true, 'Various contentType formats should be valid')
})

it('should accept status boundary values', (assert) => {
    $.mockjaxSettings.status = 100
    validateSettings()
    
    resetSettings()
    $.mockjaxSettings.status = 599
    validateSettings()
    
    assert.ok(true, 'Boundary status values (100, 599) should be valid')
})

it('should accept deprecated logging setting', (assert) => {
    $.mockjaxSettings.logging = 2
    validateSettings()
    assert.ok(true, 'Deprecated logging setting should be valid')
})

it('should accept null for optional string properties', (assert) => {
    $.mockjaxSettings.namespace = null
    $.mockjaxSettings.response = null
    $.mockjaxSettings.responseXML = null
    $.mockjaxSettings.proxy = null
    $.mockjaxSettings.proxyType = null
    $.mockjaxSettings.lastModified = null
    $.mockjaxSettings.etag = null
    validateSettings()
    assert.ok(true, 'Null values for optional properties should be valid')
})

it('should accept string etag', (assert) => {
    $.mockjaxSettings.etag = 'custom-etag-value'
    validateSettings()
    assert.ok(true, 'String etag should be valid')
})

it('should accept string lastModified', (assert) => {
    $.mockjaxSettings.lastModified = 'Mon, 01 Jan 2024 00:00:00 GMT'
    validateSettings()
    assert.ok(true, 'String lastModified should be valid')
})

it('should accept function response', (assert) => {
    $.mockjaxSettings.response = function () {}
    validateSettings()
    assert.ok(true, 'Function response should be valid')
})

it('should accept string responseXML', (assert) => {
    $.mockjaxSettings.responseXML = '<xml/>'
    validateSettings()
    assert.ok(true, 'String responseXML should be valid')
})

it('should accept string proxy', (assert) => {
    $.mockjaxSettings.proxy = '/proxy/path'
    validateSettings()
    assert.ok(true, 'String proxy should be valid')
})

it('should accept string proxyType', (assert) => {
    $.mockjaxSettings.proxyType = 'POST'
    validateSettings()
    assert.ok(true, 'String proxyType should be valid')
})
