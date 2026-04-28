
const QUnit = require('qunit')
const path = require('path')
const fs = require('fs')
const JSDOM = require('jsdom').JSDOM

const it = QUnit.test

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

QUnit.module('Nodejs', () => {

    QUnit.module('require via CommonJS', () => {
        it('should be pulled in using require()', (assert) => {
            const mockjax = require(path.resolve(__dirname, '..', '..', 'dist', 'jquery.mockjax.js'))(window.jQuery, window)
            assert.equal(typeof mockjax, 'function', 'local mockjax is a function')
            assert.equal(typeof window.jQuery.mockjax, 'function', 'mockjax is on window.jQuery')
            assert.strictEqual(mockjax, $.mockjax, 'local mockjax is exactly the same as $.mockjax')
        })
    })

    QUnit.module('basic mocking and matching', (hooks) => {

        hooks.before(() => {
            $.mockjaxSettings.logLevel = -1
        })
        hooks.afterEach(() => {
            $.mockjax.clearAll()
            $.mockjax.clearRetainedAjaxCalls()
            $.mockjax.resetSettings(true)
        })

        it('should be able to perform a basic mock and match', function(assert) {
            var done = assert.async()
            assert.expect(5)
            
            assert.equal($.mockjax.handlers().length, 0, 'There are zero handlers to start')

            $.mockjax({
                url: '/api/basic',
                responseText: 'basic content'
            })

            assert.equal($.mockjax.handlers().length, 1, 'There is one handler after registration')

            $.ajax({
                url: '/api/basic',
                error: () => {
                    assert.ok(false, 'Basic matching mocked request should not fail')
                },
                success: function(data) {
                    assert.equal(data, 'basic content', 'Basic url string match')
                },
                complete: function(xhr) {
                    assert.equal(xhr.responseText, 'basic content', 'Basic url string match')
                    assert.equal($.mockjax.mockedAjaxCalls().length, 1, 'One mock call is registered')
                    done()
                }
            })
        })

        it('Basic match with onAfterSuccess callback', function(assert) {
            var done = assert.async()
            assert.expect(2)

            let successFired = false
            
            $.mockjax({
                url: '/api/afterSuccess',
                responseText: 'success content',
                onAfterSuccess: () => {
                    assert.equal(successFired, true, 'onAfterSuccess fires after success')
                    done()
                }
            })

            $.ajax({
                url: '/api/afterSuccess',
                error: () => {
                    assert.ok(false, 'Basic matching mocked request should not fail')
                },
                success: function(data) {
                    successFired = true
                    assert.equal(data, 'success content', 'Basic url string match')
                }
            })
        })

        it('should use the default responseText with no provided argument', function(assert) {
            var done = assert.async()
            
            $.mockjax({
                url: '/api/resource'
            })

            $.ajax({
                url: '/api/resource',
                error: () => {
                    assert.ok(false, 'Basic matching mocked request should not fail')
                },
                complete: function(xhr) {
                    assert.equal(xhr.responseText, $.mockjaxSettings.responseText, 'Use default response text with no explicit arg')
                    done()
                }
            })
        })

        it('should clear all mocks when told', function(assert) {
            var done = assert.async()
            assert.expect(5)
            
            $.mockjax({
                url: '/api/clear/one',
                responseText: 'content one'
            })
            $.mockjax({
                url: '/api/clear/two',
                responseText: 'content two'
            })

            assert.equal($.mockjax.handlers().length, 2, 'There are two handlers')

            $.ajax({
                url: '/api/clear/one',
                async: false,
                complete: function(xhr) {
                    assert.equal(xhr.responseText, 'content one', 'responseText should match')
                }
            })

            $.mockjax.clearAll()

            assert.equal($.mockjax.handlers().length, 0, 'There are zero handlers')

            $.ajax('/api/clear/one', $.ajaxSetup({
                error: function(xhr) {
                    assert.ok(xhr, 'ajax call one should fail')
                },
                complete: () => {
                    $.ajax('/api/clear/two', {
                        error: function(xhr) {
                            assert.ok(xhr, 'ajax call two should fail')
                        },
                        complete: done
                    })
                }
            }))
        })

        it('should throw with no match criteria in settings', function(assert) {
            assert.throws(() => {
                $.mockjax({})
            }, 'Registering a handler with no match settings throws')
        })

        it('should return an XHR object from $.ajax', function(assert) {
            const done = assert.async()
            assert.expect(2)

            $.mockjax({
                url: '/foobar',
                responseText: 'Hello Word'
            })

            var xhr = $.ajax({
                url: '/foobar',
                async: false,
                complete: function() { }
            })
            assert.ok(xhr, 'XHR object is not null or undefined')
            assert.ok(xhr.done && xhr.fail, 'Got Promise methods')
            done()
        })
    })
})
