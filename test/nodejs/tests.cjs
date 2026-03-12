/* Globals: QUnit */

const path = require('path')
const fs = require('fs')
const JSDOM = require('jsdom').JSDOM

const metadata = JSON.parse(fs.readFileSync('./package.json').toString())
const jqVersions = Object.keys(metadata.peerDependencies)

// NOTE: There is a bug in jQuery 4.0.0 which breaks usage of jQuery in CommonJS
// (at least, how it is used in v3.7.1)
// For now, we'll run these tests in v3. When the bug is fixed, we can change 
// the "-2" below to "-1" to test on the latest jQuery version
// https://github.com/jquery/jquery/issues/5797
const jqLibrary = jqVersions[jqVersions.length-2]

const window = (new JSDOM('<html></html>')).window
window.jQuery = require(jqLibrary)(window)
const $ = window.jQuery

QUnit.module('Basic Nodejs Tests', {
    teardown: () => {
        $.mockjax.clearAll()
        $.mockjax.clearRetainedAjaxCalls()
        $.mockjaxSettings = $.extend({}, QUnit.defaultMockjaxSettings)
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

// QUnit.test('Basic match with onAfterSuccess callback', function(assert) {
//     var done = assert.async();
//     assert.expect(2)

//     let successFired = false
    
//     $.mockjax({
//         url: '/api/resource',
//         responseText: 'resource content',
//         onAfterSuccess: (settings) => {
//             assert.equal(successFired, true, 'onAfterSuccess fires after success')
//             done()
//         }
//     })

//     $.ajax({
//         url: '/api/resource',
//         error: () => {
//             assert.ok(false, 'Basic matching mocked request should not fail')
//         },
//         success: function(data) {
//             successFired = true
//             assert.equal(data, 'resource content', 'Basic url string match')
//         }
//     })
// })

// QUnit.test('Blank response with no Response params', function(assert) {
//     var done = assert.async();
    
//     $.mockjax({
//         url: '/api/resource'
//     })

//     $.ajax({
//         url: '/api/resource',
//         error: () => {
//             assert.ok(false, 'Basic matching mocked request should not fail')
//         },
//         complete: function(xhr) {
//             assert.equal(xhr.responseText, '', 'Blank response expected with no params')
//             done()
//         }
//     })
// })

// QUnit.test('Throw with no match criteria in settings', function(assert) {
//     assert.throws(() => {
//         $.mockjax({})
//     }, 'Registering a handler with no match settings throws')
// })

// QUnit.test('Return XMLHttpRequest object from $.ajax', function(assert) {
//     $.mockjax({
//         url: '/xmlhttprequest',
//         responseText: 'Hello Word'
//     })

//     var xhr = $.ajax({
//         url: '/xmlhttprequest',
//         complete: function() { }
//     })
//     if (xhr && xhr.abort) {
//         xhr.abort()
//     }

//     assert.ok(xhr, 'XHR object is not null or undefined')
//     assert.ok(xhr.done && xhr.fail, 'Got Promise methods')
// })
