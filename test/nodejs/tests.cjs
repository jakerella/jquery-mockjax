/* Globals: QUnit */

const path = require('path')
const fs = require('fs')
const JSDOM = require('jsdom').JSDOM

const metadata = JSON.parse(fs.readFileSync('./package.json').toString())
const jqVersions = Object.keys(metadata.peerDependencies)
const jqLibrary = jqVersions[jqVersions.length-1]

const window = (new JSDOM('<html></html>')).window

// NOTE: jQuery 4.0.0 changed the UMD wrapper which changes how we use 
// jQuery in a CommonJS context. This check ensures we use the correct
// method (https://github.com/jquery/jquery/issues/5797)
if (/4$/.test(jqLibrary)) {
    const { jQueryFactory } = require('jquery4/factory')
    window.jQuery = jQueryFactory(window)
} else {
    window.jQuery = require(jqLibrary)(window)
}
const $ = window.jQuery

console.log(`Running Nodejs tests against jQuery ${$.fn.jquery} and Mockjax ${metadata.version}`)

QUnit.module('Basic Nodejs Tests', {
    teardown: () => {
        $.mockjax.clearAll()
        $.mockjax.clearRetainedAjaxCalls()
        $.mockjaxSettings = {...QUnit.defaultMockjaxSettings}
    }
})

QUnit.test('Mockjax can be required using CommonJS', (assert) => {
    const mockjax = require(path.resolve(__dirname, '..', '..', 'dist', 'jquery.mockjax.js'))(window.jQuery, window)
    assert.equal(typeof mockjax, 'function', 'local mockjax is a function')
    assert.equal(typeof window.jQuery.mockjax, 'function', 'mockjax is on window.jQuery')
    assert.strictEqual(mockjax, $.mockjax, 'local mockjax is exactly the same as $.mockjax')

    // I don't like this, but I need to capture mockjaxSettings AFTER it's been loaded, which is the first test :/
    QUnit.defaultMockjaxSettings = {...$.mockjaxSettings}
})

QUnit.test('Basic mock and match', function(assert) {
    var done = assert.async()
    assert.expect(3)
    
    $.mockjax({
        url: '/api/resource',
        responseText: 'resource content'
    })

    $.ajax({
        url: '/api/resource',
        error: () => {
            assert.ok(false, 'Basic matching mocked request should not fail')
        },
        success: function(data) {
            assert.equal(data, 'resource content', 'Basic url string match')
        },
        complete: function(xhr) {
            assert.equal(xhr.responseText, 'resource content', 'Basic url string match')
            assert.equal($.mockjax.mockedAjaxCalls().length, 1, 'One mock call is registered')
            done()
        }
    })
})

QUnit.test.skip('Basic match with onAfterSuccess callback', function(assert) {
    var done = assert.async();
    assert.expect(2)

    let successFired = false
    
    $.mockjax({
        url: '/api/resource',
        responseText: 'resource content',
        onAfterSuccess: (settings) => {
            assert.equal(successFired, true, 'onAfterSuccess fires after success')
            done()
        }
    })

    $.ajax({
        url: '/api/resource',
        error: () => {
            assert.ok(false, 'Basic matching mocked request should not fail')
        },
        success: function(data) {
            successFired = true
            assert.equal(data, 'resource content', 'Basic url string match')
        }
    })
})

QUnit.test.skip('Blank response with no Response params', function(assert) {
    var done = assert.async();
    
    $.mockjax({
        url: '/api/resource'
    })

    $.ajax({
        url: '/api/resource',
        error: () => {
            assert.ok(false, 'Basic matching mocked request should not fail')
        },
        complete: function(xhr) {
            assert.equal(xhr.responseText, '', 'Blank response expected with no params')
            done()
        }
    })
})

QUnit.test.skip('Throw with no match criteria in settings', function(assert) {
    assert.throws(() => {
        $.mockjax({})
    }, 'Registering a handler with no match settings throws')
})

QUnit.test.skip('Return XMLHttpRequest object from $.ajax', function(assert) {
    $.mockjax({
        url: '/xmlhttprequest',
        responseText: 'Hello Word'
    })

    var xhr = $.ajax({
        url: '/xmlhttprequest',
        complete: function() { }
    })
    if (xhr && xhr.abort) {
        xhr.abort()
    }

    assert.ok(xhr, 'XHR object is not null or undefined')
    assert.ok(xhr.done && xhr.fail, 'Got Promise methods')
})
