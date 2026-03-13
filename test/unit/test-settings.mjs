/**
 * Unit tests for settings module
 * Run with: node test/unit/test-settings.mjs
 * **Validates: Requirements 19.8**
 */

import QUnit from 'qunit'

// Set up mock jQuery
global.$ = {}

// Import the module to test
import { getSettings, resetSettings, validateSettings } from '../../src/settings.mjs'

// Configure QUnit
QUnit.config.autostart = false

QUnit.done((results) => {
    console.log('QUnit complete.')
    console.log(results)
})

/* ----------------- */
QUnit.module('Settings Module - getSettings', {
    beforeEach: function () {
        global.$.mockjaxSettings = null
    }
})
/* ----------------- */

QUnit.test('getSettings returns default settings when not initialized', function (assert) {
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

QUnit.test('getSettings returns current global settings', function (assert) {
    global.$.mockjaxSettings = {
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

QUnit.test('getSettings returns object with all default properties', function (assert) {
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
QUnit.module('Settings Module - resetSettings', {
    beforeEach: function () {
        global.$.mockjaxSettings = null
    }
})
/* ----------------- */

QUnit.test('resetSettings restores default values', function (assert) {
    global.$.mockjaxSettings = {
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

QUnit.test('resetSettings returns the reset settings object', function (assert) {
    global.$.mockjaxSettings = { status: 404 }
    const settings = resetSettings()
    assert.ok(typeof settings === 'object', 'Should return settings object')
    assert.equal(settings.status, 200, 'Returned settings should have default status')
})

QUnit.test('resetSettings sets $.mockjaxSettings', function (assert) {
    global.$.mockjaxSettings = { status: 404 }
    resetSettings()
    assert.equal(global.$.mockjaxSettings.status, 200, '$.mockjaxSettings should be updated')
})

QUnit.test('resetSettings can be called multiple times', function (assert) {
    resetSettings()
    resetSettings()
    resetSettings()
    const settings = getSettings()
    assert.equal(settings.status, 200, 'Should maintain defaults after multiple resets')
})

QUnit.test('resetSettings handles missing $.mockjaxSettings', function (assert) {
    global.$.mockjaxSettings = undefined
    const settings = resetSettings()
    assert.ok(settings !== undefined, 'Should create settings object')
    assert.equal(settings.status, 200, 'Should have default status')
})

/* ----------------- */
QUnit.module('Settings Module - validateSettings (positive)', {
    beforeEach: function () {
        resetSettings()
    }
})
/* ----------------- */

QUnit.test('validateSettings accepts valid default settings', function (assert) {
    resetSettings()
    validateSettings() // Should not throw
    assert.ok(true, 'Valid default settings should not throw')
})

QUnit.test('validateSettings accepts valid custom settings', function (assert) {
    global.$.mockjaxSettings = {
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

QUnit.test('validateSettings accepts status as array', function (assert) {
    global.$.mockjaxSettings = { 
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

QUnit.test('validateSettings accepts null logger', function (assert) {
    global.$.mockjaxSettings = { 
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

QUnit.test('validateSettings accepts null namespace', function (assert) {
    global.$.mockjaxSettings = { 
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

QUnit.test('validateSettings accepts empty responseHeaders', function (assert) {
    global.$.mockjaxSettings = { 
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

QUnit.test('validateSettings accepts responseHeaders with string values', function (assert) {
    global.$.mockjaxSettings = { 
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
QUnit.module('Settings Module - validateSettings (negative)', {
    beforeEach: function () {
        resetSettings()
    }
})
/* ----------------- */

QUnit.test('validateSettings throws for invalid logger type', function (assert) {
    global.$.mockjaxSettings.logger = 'not-an-object'
    assert.throws(
        () => validateSettings(),
        /logger/,
        'Should throw for invalid logger'
    )
})

QUnit.test('validateSettings throws for logger missing methods', function (assert) {
    global.$.mockjaxSettings.logger = { error: () => {} }
    assert.throws(
        () => validateSettings(),
        /logger/,
        'Should throw for incomplete logger'
    )
})

QUnit.test('validateSettings throws for invalid logLevel', function (assert) {
    global.$.mockjaxSettings.logLevel = 'not-a-number'
    assert.throws(
        () => validateSettings(),
        /logLevel/,
        'Should throw for invalid logLevel'
    )
})

QUnit.test('validateSettings throws for invalid namespace type', function (assert) {
    global.$.mockjaxSettings.namespace = 123
    assert.throws(
        () => validateSettings(),
        /namespace/,
        'Should throw for invalid namespace'
    )
})

QUnit.test('validateSettings throws for status out of range (too high)', function (assert) {
    global.$.mockjaxSettings.status = 600
    assert.throws(
        () => validateSettings(),
        /status/,
        'Should throw for status >= 600'
    )
})

QUnit.test('validateSettings throws for status out of range (too low)', function (assert) {
    global.$.mockjaxSettings.status = 99
    assert.throws(
        () => validateSettings(),
        /status/,
        'Should throw for status < 100'
    )
})

QUnit.test('validateSettings throws for invalid status in array', function (assert) {
    global.$.mockjaxSettings.status = [200, 999]
    assert.throws(
        () => validateSettings(),
        /status/,
        'Should throw for invalid status in array'
    )
})

QUnit.test('validateSettings throws for non-string statusText', function (assert) {
    global.$.mockjaxSettings.statusText = 123
    assert.throws(
        () => validateSettings(),
        /statusText/,
        'Should throw for invalid statusText'
    )
})

QUnit.test('validateSettings throws for negative responseTime', function (assert) {
    global.$.mockjaxSettings.responseTime = -1
    assert.throws(
        () => validateSettings(),
        /responseTime/,
        'Should throw for negative responseTime'
    )
})

QUnit.test('validateSettings throws for non-integer responseTime', function (assert) {
    global.$.mockjaxSettings.responseTime = 'not-a-number'
    assert.throws(
        () => validateSettings(),
        /responseTime/,
        'Should throw for non-integer responseTime'
    )
})

QUnit.test('validateSettings throws for non-boolean isTimeout', function (assert) {
    global.$.mockjaxSettings.isTimeout = 'not-a-boolean'
    assert.throws(
        () => validateSettings(),
        /isTimeout/,
        'Should throw for invalid isTimeout'
    )
})

QUnit.test('validateSettings throws for non-boolean throwUnmocked', function (assert) {
    global.$.mockjaxSettings.throwUnmocked = 'not-a-boolean'
    assert.throws(
        () => validateSettings(),
        /throwUnmocked/,
        'Should throw for invalid throwUnmocked'
    )
})

QUnit.test('validateSettings throws for non-integer retainAjaxCalls', function (assert) {
    global.$.mockjaxSettings.retainAjaxCalls = 'not-a-number'
    assert.throws(
        () => validateSettings(),
        /retainAjaxCalls/,
        'Should throw for invalid retainAjaxCalls'
    )
})

QUnit.test('validateSettings throws for invalid contentType format', function (assert) {
    global.$.mockjaxSettings.contentType = 'invalid'
    assert.throws(
        () => validateSettings(),
        /contentType/,
        'Should throw for invalid contentType'
    )
})

QUnit.test('validateSettings throws for non-function response', function (assert) {
    global.$.mockjaxSettings.response = 'not-a-function'
    assert.throws(
        () => validateSettings(),
        /response/,
        'Should throw for invalid response'
    )
})

QUnit.test('validateSettings throws for null responseText', function (assert) {
    global.$.mockjaxSettings.responseText = null
    assert.throws(
        () => validateSettings(),
        /responseText/,
        'Should throw for null responseText'
    )
})

QUnit.test('validateSettings throws for undefined responseText', function (assert) {
    global.$.mockjaxSettings.responseText = undefined
    assert.throws(
        () => validateSettings(),
        /responseText/,
        'Should throw for undefined responseText'
    )
})

QUnit.test('validateSettings throws for non-string responseXML', function (assert) {
    global.$.mockjaxSettings.responseXML = 123
    assert.throws(
        () => validateSettings(),
        /responseXML/,
        'Should throw for invalid responseXML'
    )
})

QUnit.test('validateSettings throws for non-string proxy', function (assert) {
    global.$.mockjaxSettings.proxy = 123
    assert.throws(
        () => validateSettings(),
        /proxy/,
        'Should throw for invalid proxy'
    )
})

QUnit.test('validateSettings throws for non-string proxyType', function (assert) {
    global.$.mockjaxSettings.proxyType = 123
    assert.throws(
        () => validateSettings(),
        /proxyType/,
        'Should throw for invalid proxyType'
    )
})

QUnit.test('validateSettings throws for non-string lastModified', function (assert) {
    global.$.mockjaxSettings.lastModified = 123
    assert.throws(
        () => validateSettings(),
        /lastModified/,
        'Should throw for invalid lastModified'
    )
})

QUnit.test('validateSettings throws for non-string etag', function (assert) {
    global.$.mockjaxSettings.etag = 123
    assert.throws(
        () => validateSettings(),
        /etag/,
        'Should throw for invalid etag'
    )
})

QUnit.test('validateSettings throws for invalid responseHeaders type', function (assert) {
    global.$.mockjaxSettings.responseHeaders = 'not-an-object'
    assert.throws(
        () => validateSettings(),
        /responseHeaders/,
        'Should throw for invalid responseHeaders type'
    )
})

QUnit.test('validateSettings throws for responseHeaders with non-string values', function (assert) {
    global.$.mockjaxSettings.responseHeaders = { 'X-Custom': 123 }
    assert.throws(
        () => validateSettings(),
        /responseHeaders/,
        'Should throw for non-string header values'
    )
})

QUnit.test('validateSettings throws for non-boolean matchInRegistrationOrder', function (assert) {
    global.$.mockjaxSettings.matchInRegistrationOrder = 'not-a-boolean'
    assert.throws(
        () => validateSettings(),
        /matchInRegistrationOrder/,
        'Should throw for invalid matchInRegistrationOrder'
    )
})

QUnit.test('validateSettings throws for non-boolean followRedirects', function (assert) {
    global.$.mockjaxSettings.followRedirects = 'not-a-boolean'
    assert.throws(
        () => validateSettings(),
        /followRedirects/,
        'Should throw for invalid followRedirects'
    )
})

/* ----------------- */
QUnit.module('Settings Module - validateSettings (edge cases)', {
    beforeEach: function () {
        resetSettings()
    }
})
/* ----------------- */

QUnit.test('validateSettings accepts zero responseTime', function (assert) {
    global.$.mockjaxSettings.responseTime = 0
    validateSettings()
    assert.ok(true, 'Zero responseTime should be valid')
})

QUnit.test('validateSettings accepts retainAjaxCalls = 0', function (assert) {
    global.$.mockjaxSettings.retainAjaxCalls = 0
    validateSettings()
    assert.ok(true, 'retainAjaxCalls = 0 should be valid')
})

QUnit.test('validateSettings accepts retainAjaxCalls = -1', function (assert) {
    global.$.mockjaxSettings.retainAjaxCalls = -1
    validateSettings()
    assert.ok(true, 'retainAjaxCalls = -1 should be valid')
})

QUnit.test('validateSettings accepts large positive retainAjaxCalls', function (assert) {
    global.$.mockjaxSettings.retainAjaxCalls = 10000
    validateSettings()
    assert.ok(true, 'Large retainAjaxCalls should be valid')
})

QUnit.test('validateSettings accepts empty string responseText', function (assert) {
    global.$.mockjaxSettings.responseText = ''
    validateSettings()
    assert.ok(true, 'Empty string responseText should be valid')
})

QUnit.test('validateSettings accepts various contentType formats', function (assert) {
    const validTypes = ['text/plain', 'application/json', 'application/xml', 'text/html', 'application/x-www-form-urlencoded']
    validTypes.forEach(contentType => {
        resetSettings()
        global.$.mockjaxSettings.contentType = contentType
        validateSettings()
    })
    assert.ok(true, 'Various contentType formats should be valid')
})

QUnit.test('validateSettings accepts status boundary values', function (assert) {
    global.$.mockjaxSettings.status = 100
    validateSettings()
    
    resetSettings()
    global.$.mockjaxSettings.status = 599
    validateSettings()
    
    assert.ok(true, 'Boundary status values (100, 599) should be valid')
})

QUnit.test('validateSettings accepts deprecated logging setting', function (assert) {
    global.$.mockjaxSettings.logging = 2
    validateSettings()
    assert.ok(true, 'Deprecated logging setting should be valid')
})

QUnit.test('validateSettings accepts null for optional string properties', function (assert) {
    global.$.mockjaxSettings.namespace = null
    global.$.mockjaxSettings.response = null
    global.$.mockjaxSettings.responseXML = null
    global.$.mockjaxSettings.proxy = null
    global.$.mockjaxSettings.proxyType = null
    global.$.mockjaxSettings.lastModified = null
    global.$.mockjaxSettings.etag = null
    validateSettings()
    assert.ok(true, 'Null values for optional properties should be valid')
})

QUnit.test('validateSettings accepts string etag', function (assert) {
    global.$.mockjaxSettings.etag = 'custom-etag-value'
    validateSettings()
    assert.ok(true, 'String etag should be valid')
})

QUnit.test('validateSettings accepts string lastModified', function (assert) {
    global.$.mockjaxSettings.lastModified = 'Mon, 01 Jan 2024 00:00:00 GMT'
    validateSettings()
    assert.ok(true, 'String lastModified should be valid')
})

QUnit.test('validateSettings accepts function response', function (assert) {
    global.$.mockjaxSettings.response = function () {}
    validateSettings()
    assert.ok(true, 'Function response should be valid')
})

QUnit.test('validateSettings accepts string responseXML', function (assert) {
    global.$.mockjaxSettings.responseXML = '<xml/>'
    validateSettings()
    assert.ok(true, 'String responseXML should be valid')
})

QUnit.test('validateSettings accepts string proxy', function (assert) {
    global.$.mockjaxSettings.proxy = '/proxy/path'
    validateSettings()
    assert.ok(true, 'String proxy should be valid')
})

QUnit.test('validateSettings accepts string proxyType', function (assert) {
    global.$.mockjaxSettings.proxyType = 'POST'
    validateSettings()
    assert.ok(true, 'String proxyType should be valid')
})

// Start QUnit
QUnit.start()
