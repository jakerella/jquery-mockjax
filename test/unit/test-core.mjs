
import sinon from 'sinon'
import QUnit from 'qunit'
import { createMockXHR, getJQueryMock } from './mocks.mjs'
import { getJQuery } from '../../src/lib.mjs'
import { getLogger } from '../../src/logger.mjs'
import * as xhrModule from '../../src/xhr.mjs'
import { getSettings, resetSettings } from '../../src/settings.mjs'

// Initialize jQuery to the mock for this and any imported modules
getJQuery(getJQueryMock())
// Initialize mockjaxSettings object
resetSettings()

const it = QUnit.test

let mockCreateMockXHR = null

import {
    registerMockjaxHandler,
    mockAjaxCall,
    realAjaxCall,
    clear,
    clearAll,
    clearById,
    clearByUrl,
    handlers,
    handler,
    unfiredHandlers,
    mockedAjaxCalls,
    unmockedAjaxCalls,
    clearRetainedAjaxCalls
} from '../../src/core.mjs'

const sandbox = sinon.createSandbox()

QUnit.module('Core', (hooks) => {
    hooks.before(() => {
        getLogger().disable()
    })

    QUnit.module('realAjaxCall', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should call the _ajax method of the jQuery mock for "real" ajax calls', (assert) => {
            const done = assert.async()
            assert.expect(3)

            const defer = realAjaxCall('/foo', {})
            assert.equal(typeof defer.always, 'function', 'The method returns a Deferred object')

            defer.always((xhr) => {
                assert.equal(xhr.url, '/foo', 'The callback received the url')
                assert.equal(xhr.status, 200, 'The callback received 200 status')
                done()
            })

            defer.resolveWith({}, [{ url: '/foo', status: 200 }])
        })
    })

    QUnit.module('registerMockjaxHandler - basic functionality', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should register a mock handler and return an ID', (assert) => {
            const id = registerMockjaxHandler({
                url: '/api/users',
                responseText: { data: 'test' }
            })
            
            assert.ok(id, 'should return an ID')
            assert.equal(typeof id, 'string', 'ID should be a string')
        })

        it('should register multiple handlers from array', (assert) => {
            const ids = registerMockjaxHandler([
                { url: '/api/users', responseText: 'users' },
                { url: '/api/posts', responseText: 'posts' }
            ])
            
            assert.ok(Array.isArray(ids), 'should return an array')
            assert.equal(ids.length, 2, 'should return 2 IDs')
        })

        it('should set default method from type property', (assert) => {
            const id = registerMockjaxHandler({
                url: '/api/users',
                type: 'POST',
                responseText: 'test'
            })
            
            const registeredHandlers = handlers([id])
            assert.equal(registeredHandlers[0].method, 'POST', 'method should be set from type')
        })

        it('should add fired and registeredAt properties', (assert) => {
            const id = registerMockjaxHandler({
                url: '/api/users',
                responseText: 'test'
            })
            
            const registeredHandlers = handlers([id])
            assert.equal(registeredHandlers[0].fired, false, 'fired should be false initially')
            assert.equal(typeof registeredHandlers[0].registeredAt, 'number', 'registeredAt should be a number')
            assert.ok(registeredHandlers[0].registeredAt > Date.now() - 200, 'registeredAt should be a recent timestamp')
        })

        it('should handle function handlers', (assert) => {
            const handlerFunc = (settings) => {
                if (settings.url === '/api/users') {
                    return { url: '/api/users', responseText: 'matched' }
                }
                return null
            }
            
            const id = registerMockjaxHandler(handlerFunc)
            assert.ok(id, 'should register function handler')
        })

        it('should copy headers to responseHeaders', (assert) => {
            const id = registerMockjaxHandler({
                url: '/api/users',
                headers: { 'X-Custom': 'value' },
                responseText: 'test'
            })
            
            const registeredHandlers = handlers([id])
            assert.ok(registeredHandlers[0].responseHeaders, 'responseHeaders should be set')
            assert.equal(registeredHandlers[0].responseHeaders['X-Custom'], 'value', 'should copy headers')
        })
    })

    QUnit.module('registerMockjaxHandler - validation', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should throw error for invalid settings type', (assert) => {
            assert.throws(
                () => registerMockjaxHandler('not an object'),
                /Mock handler settings must be an object/,
                'should throw for string'
            )
        })

        it('should throw error for handler with no matching criteria', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({}),
                /must have at least one of/,
                'should throw for empty object'
            )
        })

        it('should throw error for invalid url type', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: 123 }),
                /url property must be a String or RegExp/,
                'should throw for numeric url'
            )
        })

        it('should throw error for invalid HTTP method', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ method: 'INVALID' }),
                /must be a valid HTTP method/,
                'should throw for invalid method'
            )
        })

        it('should throw error for invalid data type', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ data: 123 }),
                /data property must be a String, Function, or Object/,
                'should throw for numeric data'
            )
        })

        it('should throw error for invalid requestHeaders', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ requestHeaders: 'not an object' }),
                /requestHeaders property must be a plain object/,
                'should throw for string requestHeaders'
            )
        })

        it('should throw error for invalid status', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', status: 99 }),
                /status must be an integer between 100 and 599/,
                'should throw for status < 100'
            )
            
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', status: 600 }),
                /status must be an integer between 100 and 599/,
                'should throw for status >= 600'
            )
        })

        it('should throw error for invalid status array', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', status: [200, 999] }),
                /All statuses must be integers between 100 and 599/,
                'should throw for invalid status in array'
            )
        })

        it('should throw error for statusText that is not array or string', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', status: 200, statusText: 1 }),
                /statusText must be a string or array of strings if it is set/,
                'should throw for bad statusText'
            )
        })

        it('should throw error for statusText array without status array', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', status: 200, statusText: ['OK', 'Created'] }),
                /statusText property may only be an array if the status property is also an array/,
                'should throw for statusText array mismatch'
            )
        })

        it('should throw error for mismatched statusText array length', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', status: [200, 201], statusText: ['OK'] }),
                /statusText array must be the same size as the status array/,
                'should throw for different array lengths'
            )
        })

        it('should throw error for invalid responseTime', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', responseTime: -1 }),
                /responseTime must be a non-negative integer/,
                'should throw for negative responseTime'
            )
        })

        it('should throw error for responseTime array of length 1', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', responseTime: [100] }),
                /responseTime range must be an array of 2 non-negitve integers/,
                'should throw for single-element array'
            )
        })

        it('should throw error for responseTime array of length 3', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', responseTime: [1, 2, 3] }),
                /responseTime range must be an array of 2 non-negitve integers/,
                'should throw for single-element array'
            )
        })

        it('should throw error for responseTime array with negative first entry', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', responseTime: [-1, 1] }),
                /responseTime range must be an array of 2 non-negitve integers/,
                'should throw for single-element array'
            )
        })

        it('should throw error for responseTime array with negative second entry', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', responseTime: [1, -1] }),
                /responseTime range must be an array of 2 non-negitve integers/,
                'should throw for single-element array'
            )
        })

        it('should throw error for responseHeaders with non-string value', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', responseHeaders: { 'Content-Type': 123 } }),
                /responseHeaders property must be a plain object of string names and values/,
                'should throw for numeric value'
            )
        })

        it('should throw error for responseHeaders as array', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', responseHeaders: [{ 'Content-Type': 'text' }] }),
                /responseHeaders property must be a plain object of string names and values/,
                'should throw for numeric value'
            )
        })

        it('should throw error for requestHeaders with non-string value', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ requestHeaders: { 'X-Custom': 123 } }),
                /requestHeaders property must be a plain object of string names and values/,
                'should throw for numeric value in requestHeaders'
            )
        })

        it('should throw error for invalid namespace type', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', namespace: 123 }),
                /namespace must be a string/,
                'should throw for numeric namespace'
            )
        })

        it('should throw error for invalid contentType type', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', contentType: 123 }),
                /contentType must be a string/,
                'should throw for numeric contentType'
            )
        })

        it('should throw error for invalid response type', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', response: 'not a function' }),
                /response property must be a function/,
                'should throw for string response'
            )
        })

        it('should throw error for invalid responseXML type', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', responseXML: 123 }),
                /responseXML must be a string/,
                'should throw for numeric responseXML'
            )
        })

        it('should throw error for non-string proxy', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', proxy: 123 }),
                /proxy must be a string/,
                'should throw for numeric proxy'
            )
        })

        it('should throw error for invalid proxyMethod', (assert) => {
            assert.throws(
                () => registerMockjaxHandler({ url: '/test', proxyMethod: 'INVALID' }),
                /proxyMethod must be a valid HTTP method/,
                'should throw for invalid proxyMethod'
            )
        })
    })

    QUnit.module('mockAjaxCall - basic mocking', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should mock a basic call for a registered mock URL', (assert) => {
            const done = assert.async()
            assert.expect(5)
            const url = '/foo'
            const status = 201

            const id = registerMockjaxHandler({
                url,
                status
            })
            const handler = handlers([id])[0]
            assert.strictEqual(handler.fired, false, 'The mock handler is marked as not "fired" initially')

            const defer = mockAjaxCall('/foo')
            defer.always((xhr) => {
                assert.equal(xhr.status, status, 'The ajax call was mocked with the correct status code')
                assert.equal(mockedAjaxCalls().length, 1, 'The mocked call was retained')
                
                const handler = handlers([id])[0]
                assert.ok(handler, 'The mock handler is returned from handlers()')
                assert.strictEqual(handler.fired, true, 'The mock handler is marked as "fired"')
                done()
            })

            defer.resolveWith({}, [{ url, status }])
        })

        it('should mock a basic call for an object in first argument', (assert) => {
            const done = assert.async()
            registerMockjaxHandler({ url: '/foo', status: 201 })

            const defer = mockAjaxCall({ url: '/foo' })
            defer.always((xhr) => {
                assert.equal(xhr.status, 201, 'The ajax call was mocked with the correct status code')
                done()
            })
            defer.resolveWith({}, [{ url: '/foo', status: 201 }])
        })

        it('should not retain the mocked call with limit "false"', (assert) => {
            const done = assert.async()
            const url = '/foo'
            const status = 201

            getSettings().retainAjaxCalls = false

            registerMockjaxHandler({ url, status })
            const defer = mockAjaxCall('/foo')
            defer.always((xhr) => {
                assert.equal(xhr.status, status, 'The ajax call was mocked with the correct status code')
                assert.equal(mockedAjaxCalls().length, 0, 'The mocked call was NOT retained')
                
                resetSettings(true)
                done()
            })

            defer.resolveWith({}, [{ url, status }])
        })

        it('should retain the mocked call with limit "true"', (assert) => {
            const done = assert.async()
            const url = '/foo'
            const status = 201

            getSettings().retainAjaxCalls = true

            registerMockjaxHandler({ url, status })
            const defer = mockAjaxCall('/foo')
            defer.always((xhr) => {
                assert.equal(xhr.status, status, 'The ajax call was mocked with the correct status code')
                assert.equal(mockedAjaxCalls().length, 1, 'The mocked call was retained')
                
                resetSettings(true)
                done()
            })

            defer.resolveWith({}, [{ url, status }])
        })

        it('should retain the correct number of calls with limit set as number', (assert) => {
            const done = assert.async()
            const url = '/foo'

            getSettings().retainAjaxCalls = 2

            registerMockjaxHandler({ url, status: 200 })
            let defer = mockAjaxCall('/foo')
            defer.resolveWith({}, [{ url, status: 200 }])
            assert.equal(mockedAjaxCalls().length, 1, 'The first call was retained')
            defer = mockAjaxCall('/foobar')
            defer.resolveWith({}, [{ url, status: 404 }])
            assert.equal(unmockedAjaxCalls().length, 1, 'The second call was retained')
            defer = mockAjaxCall('/foo')
            defer.resolveWith({}, [{ url, status: 200 }])
            assert.equal(mockedAjaxCalls().length, 1, 'The third call was retained')
            assert.equal(unmockedAjaxCalls().length, 1, 'The second call was retained')

            resetSettings(true)

            done()
        })

        it('should fire onAfterComplete callback', (assert) => {
            const done = assert.async()

            let completeFired = false

            registerMockjaxHandler({
                url: '/foo',
                status: 200,
                onAfterComplete: (settings, handler) => {
                    assert.ok(completeFired, 'The original complete callback fired before onAfterComplete')
                    assert.strictEqual(settings.mocked, true, 'The onAfterComplete callbaack fired with settings object')
                    assert.equal(handler.status, 200, 'The onAfterComplete callbaack fired with handler object')
                    done()
                }
            })

            const defer = mockAjaxCall({
                url: '/foo',
                complete: () => {
                    completeFired = true
                }
            })
            defer.resolveWith({}, [{ url: '/foo', status: 200 }])
        })

        it('should throw error for unmocked request when throwUnmocked is true', (assert) => {
            getSettings().throwUnmocked = true
            
            assert.throws(
                () => mockAjaxCall('/api/unmocked'),
                /AJAX not mocked/,
                'should throw for unmocked request'
            )

            resetSettings(true)
        })
    })

    QUnit.module('clear (deprecated)', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should clear all handlers when called with no arguments', (assert) => {
            registerMockjaxHandler({ url: '/api/test1', responseText: 'test1' })
            registerMockjaxHandler({ url: '/api/test2', responseText: 'test2' })
            
            clear()
            
            assert.equal(handlers().length, 0, 'should clear all handlers')
        })

        it('should clear by ID', (assert) => {
            const id1 = registerMockjaxHandler({ url: '/api/test1', responseText: 'test1' })
            const id2 = registerMockjaxHandler({ url: '/api/test2', responseText: 'test2' })
            
            clear(id1)
            
            assert.equal(handlers().length, 1, 'should have 1 handler remaining')
            assert.equal(handlers([id2])[0].url, '/api/test2', 'should keep correct handler')
            
        })

        it('should clear by URL pattern', (assert) => {
            registerMockjaxHandler({ url: '/api/users', responseText: 'users' })
            registerMockjaxHandler({ url: '/api/posts', responseText: 'posts' })
            
            clear('/api/users')
            
            assert.equal(handlers().length, 1, 'should have 1 handler remaining')
        })
    })

    QUnit.module('clearAll', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should clear all handlers', (assert) => {
            registerMockjaxHandler({ url: '/api/test1', responseText: 'test1' })
            registerMockjaxHandler({ url: '/api/test2', responseText: 'test2' })
            registerMockjaxHandler({ url: '/api/test3', responseText: 'test3' })
            
            assert.equal(handlers().length, 3, 'should have 3 handlers')
            
            const clearCount = clearAll()
            
            assert.equal(clearCount, 3, 'should return proper count of cleared handlers')
            assert.equal(handlers().length, 0, 'should have no handlers')
        })

        it('should clear nothing when no handlers have been registered', (assert) => {
            assert.equal(handlers().length, 0, 'should have 0 handlers to start')
            
            const clearCount = clearAll()
            
            assert.equal(clearCount, 0, 'should return proper count of cleared handlers')
            assert.equal(handlers().length, 0, 'should have no handlers to end')
        })
    })

    QUnit.module('clearById', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should clear handler by ID', (assert) => {
            const id1 = registerMockjaxHandler({ url: '/api/test1', responseText: 'test1' })
            const id2 = registerMockjaxHandler({ url: '/api/test2', responseText: 'test2' })
            
            const clearCount = clearById(id1)
            
            assert.equal(clearCount, 1, 'should return proper count of cleared handlers')
            assert.equal(handlers().length, 1, 'should have 1 handler remaining')
            assert.equal(handlers([id2])[0].url, '/api/test2', 'should keep correct handler')
        })

        it('should handle invalid ID gracefully', (assert) => {
            registerMockjaxHandler({ url: '/api/test', responseText: 'test' })
            
            const clearCount = clearById('invalid-id')
            
            assert.equal(clearCount, 0, 'should return proper count of cleared handlers')
            assert.equal(handlers().length, 1, 'should still have 1 handler')
        })
    })

    QUnit.module('clearByUrl', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should clear handler by exact string URL match', (assert) => {
            registerMockjaxHandler({ url: '/api/users', responseText: 'users' })
            registerMockjaxHandler({ url: '/api/posts', responseText: 'posts' })
            
            const clearCount = clearByUrl('/api/users')
            
            assert.equal(clearCount, 1, 'should return proper count of cleared handlers')
            assert.equal(handlers().length, 1, 'should have 1 handler remaining')
            assert.equal(handlers()[0].url, '/api/posts', 'should keep correct handler')
        })

        it('should clear handler by RegExp pattern matching string URL', (assert) => {
            registerMockjaxHandler({ url: '/api/users', responseText: 'users' })
            registerMockjaxHandler({ url: '/api/posts', responseText: 'posts' })
            
            const clearCount = clearByUrl(/\/api\/users/)
            
            assert.equal(clearCount, 1, 'should return proper count of cleared handlers')
            assert.equal(handlers().length, 1, 'should have 1 handler remaining')
            assert.equal(handlers()[0].url, '/api/posts', 'should keep correct handler')
        })

        it('should clear handler by exact RegExp match', (assert) => {
            const pattern = /^\/api\/users\/\d+$/
            registerMockjaxHandler({ url: pattern, responseText: 'user' })
            registerMockjaxHandler({ url: '/api/posts', responseText: 'posts' })
            
            const clearCount = clearByUrl(/^\/api\/users\/\d+$/)
            
            assert.equal(clearCount, 1, 'should return proper count of cleared handlers')
            assert.equal(handlers().length, 1, 'should have 1 handler remaining')
            assert.equal(handlers()[0].url, '/api/posts', 'should keep correct handler')
        })

        it('should clear multiple handlers matching pattern', (assert) => {
            registerMockjaxHandler({ url: '/api/users', responseText: 'users' })
            registerMockjaxHandler({ url: '/api/users/123', responseText: 'user' })
            registerMockjaxHandler({ url: '/api/posts', responseText: 'posts' })
            
            const clearCount = clearByUrl(/\/api\/users/)
            
            assert.equal(clearCount, 2, 'should return proper count of cleared handlers')
            assert.equal(handlers().length, 1, 'should have 1 handler remaining')
            assert.equal(handlers()[0].url, '/api/posts', 'should keep correct handler')
        })

        it('should handle non-matching URL gracefully', (assert) => {
            registerMockjaxHandler({ url: '/api/test', responseText: 'test' })
            
            const clearCount = clearByUrl('/api/nonexistent')
            
            assert.equal(clearCount, 0, 'should return proper count of cleared handlers')
            assert.equal(handlers().length, 1, 'should still have 1 handler')
        })
    })

    QUnit.module('handlers', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should return all handlers when called with no arguments', (assert) => {
            registerMockjaxHandler({ url: '/api/test1', responseText: 'test1' })
            registerMockjaxHandler({ url: '/api/test2', responseText: 'test2' })
            
            const allHandlers = handlers()
            
            assert.equal(allHandlers.length, 2, 'should return 2 handlers')
        })

        it('should return specific handlers by ID array', (assert) => {
            const id1 = registerMockjaxHandler({ url: '/api/test1', responseText: 'test1' })
            const id2 = registerMockjaxHandler({ url: '/api/test2', responseText: 'test2' })
            
            const specificHandlers = handlers([id1])
            
            assert.equal(specificHandlers.length, 1, 'should return 1 handler')
            assert.equal(specificHandlers[0].url, '/api/test1', 'should return correct handler')
        })

        it('should return null for invalid IDs', (assert) => {
            registerMockjaxHandler({ url: '/api/test', responseText: 'test' })
            
            const result = handlers(['invalid-id'])
            
            assert.equal(result.length, 1, 'should return array with 1 element')
            assert.equal(result[0], null, 'should return null for invalid ID')
        })

        it('should return cloned handlers with clear method', (assert) => {
            const id = registerMockjaxHandler({ url: '/api/test', responseText: 'test' })
            
            const handlerList = handlers([id])
            
            assert.ok(typeof handlerList[0].clear === 'function', 'should have clear method')
            
            handlerList[0].clear()
            
            assert.equal(handlers().length, 0, 'clear method should work')
        })
    })

    QUnit.module('handler (deprecated)', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should return handler by ID', (assert) => {
            const id = registerMockjaxHandler({ url: '/api/test', responseText: 'test' })
            
            const mockHandler = handler(id)
            
            assert.ok(mockHandler, 'should return handler')
            assert.equal(mockHandler.url, '/api/test', 'should return correct handler')
        })

        it('should return null for invalid ID', (assert) => {
            const result = handler('invalid-id')
            
            assert.equal(result, null, 'should return null')
        })
    })

    QUnit.module('unfiredHandlers', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should return all handlers when none have fired', (assert) => {
            registerMockjaxHandler({ url: '/api/test1', responseText: 'test1' })
            registerMockjaxHandler({ url: '/api/test2', responseText: 'test2' })
            
            const unfired = unfiredHandlers()
            
            assert.equal(unfired.length, 2, 'should return all handlers')
        })

        it('should return handlers with clear method', (assert) => {
            registerMockjaxHandler({ url: '/api/test', responseText: 'test' })
            
            const unfired = unfiredHandlers()
            
            assert.ok(typeof unfired[0].clear === 'function', 'should have clear method')
        })
    })

    QUnit.module('mockedAjaxCalls', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should return empty array when no mocked calls', (assert) => {
            const mocked = mockedAjaxCalls()
            
            assert.equal(mocked.length, 0, 'should return empty array')
        })

        it('should return correct settings when calls have been mocked', (assert) => {
            const done = assert.async()
            const mockedCallSettings = [
                { url: '/foo-one', status: 200 },
                { url: '/foo-two', status: 201 },
                { url: '/foo-one', status: 204 }
            ]

            registerMockjaxHandler({
                url: '/foo-one'
            })
            registerMockjaxHandler({
                url: '/foo-two'
            })

            mockedCallSettings.forEach((call, i) => {
                const defer = mockAjaxCall(call.url)
                defer.resolveWith({}, [call])
            })
            const defer = mockAjaxCall('/foo-nope')
            defer.resolveWith({}, [{ url: '/foo-nope', status: 404 }])

            const mockedCalls = mockedAjaxCalls()
            assert.equal(mockedCalls.length, 3, 'mocked calls were retained')
            mockedCalls.forEach((settings, i) => {
                assert.equal(settings.url, mockedCallSettings[i].url, `The URL for mocked call index ${i} is correct`)
                assert.strictEqual(settings.mocked, true, `The settings for index ${i} show mocked=true`)
                assert.equal(typeof settings.timestamp, 'number', `The timestamp for mocked call index ${i} is a number`)
            })
            done()
        })
    })

    QUnit.module('unmockedAjaxCalls', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should return empty array when no calls made', (assert) => {
            const unmocked = unmockedAjaxCalls()
            
            assert.equal(unmocked.length, 0, 'should return empty array')
        })

        it('should return correct settings when calls have not been mocked', (assert) => {
            const done = assert.async()
            const unmockedCallURLs = [
                '/foo-nope',
                '/foo-bad',
                '/foo-nope'
            ]

            registerMockjaxHandler({
                url: '/foo-one'
            })

            unmockedCallURLs.forEach((url) => {
                const defer = mockAjaxCall(url)
                defer.resolveWith({}, [{ url, status: 404 }])
            })
            const defer = mockAjaxCall('/foo-one')
            defer.resolveWith({}, [{ url: '/foo-one', status: 200 }])

            const unmockedCalls = unmockedAjaxCalls()
            assert.equal(unmockedCalls.length, 3, 'unmocked calls were retained')
            unmockedCalls.forEach((settings, i) => {
                assert.equal(settings.url, unmockedCallURLs[i], `The URL for mocked call index ${i} is correct`)
                assert.notOk(settings.mocked, `The settings for index ${i} show not mocked`)
            })
            done()
        })
    })

    QUnit.module('clearRetainedAjaxCalls', (hooks) => {
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
        })

        it('should clear all retained ajax calls when called with no arguments', (assert) => {
            const done = assert.async()
            assert.expect(6)
            const mockedUrl = '/foo'
            const unmockedUrl = '/foobar'
            const status = 201

            registerMockjaxHandler({
                url: mockedUrl,
                status
            })

            assert.equal(handlers().length, 1, 'mock handler was registered')

            const defer = mockAjaxCall(mockedUrl)
            defer.always(() => {
                assert.equal(mockedAjaxCalls().length, 1, 'mocked call was retained')
                const defer2 = mockAjaxCall(unmockedUrl)
                defer2.always(() => {
                    assert.equal(unmockedAjaxCalls().length, 1, 'unmocked call was retained')
                    
                    const count = clearRetainedAjaxCalls()
                    assert.equal(count, 2, 'should return the correct count of removed calls')
                    assert.equal(mockedAjaxCalls().length, 0, 'mocked calls were cleared')
                    assert.equal(unmockedAjaxCalls().length, 0, 'unmocked calls were cleared')

                    done()
                })
                defer2.resolveWith({}, [{ url: unmockedUrl, status: 404 }])
            })

            defer.resolveWith({}, [{ url: mockedUrl, status }])
        })

        it('should only clear ajax calls matching mock handler IDs', (assert) => {
            const done = assert.async()
            const mockId = registerMockjaxHandler({ url: '/foo' })

            const defer = mockAjaxCall({ url: '/foo' })
            defer.always((xhr) => {
                assert.equal(xhr.status, 200, 'The first ajax call was mocked with the correct status code')
                const defer2 = mockAjaxCall({ url: '/foobar' })
                defer2.always(() => {
                    const count = clearRetainedAjaxCalls([mockId])
                    assert.strictEqual(count, 1, 'should return the correct count of removed calls')
                    assert.strictEqual(mockedAjaxCalls().length, 0, 'should have cleared mocked calls')
                    const unmockedCalls = unmockedAjaxCalls()
                    assert.equal(unmockedCalls.length, 1, 'there should be 1 unmocked ajax call retained')
                    assert.equal(unmockedCalls[0].url, '/foobar', 'the retained unmocked call should have the correct URL')

                    done()
                })
                defer2.resolveWith({}, [{ url: '/foobar', status: 404 }])
            })
            defer.resolveWith({}, [{ url: '/foo', status: 200 }])
        })

        it('should handle array of mixed good and bad handler IDs', (assert) => {
            const done = assert.async()
            const mockId = registerMockjaxHandler({ url: '/foo' })

            const defer = mockAjaxCall({ url: '/foo' })
            defer.always((xhr) => {
                assert.equal(xhr.status, 200, 'The first ajax call was mocked with the correct status code')
                const defer2 = mockAjaxCall({ url: '/foobar' })
                defer2.always(() => {
                    const count = clearRetainedAjaxCalls(['id2', mockId])
                    assert.strictEqual(count, 1, 'should return the correct count of removed calls')
                    assert.strictEqual(mockedAjaxCalls().length, 0, 'should have cleared mocked calls')
                    const unmockedCalls = unmockedAjaxCalls()
                    assert.equal(unmockedCalls.length, 1, 'there should be 1 unmocked ajax call retained')
                    assert.equal(unmockedCalls[0].url, '/foobar', 'the retained unmocked call should have the correct URL')

                    done()
                })
                defer2.resolveWith({}, [{ url: '/foobar', status: 404 }])
            })
            defer.resolveWith({}, [{ url: '/foo', status: 200 }])
        })

        it('should handle array of only bad handler IDs', (assert) => {
            const done = assert.async()
            const defer = mockAjaxCall({ url: '/foobar' })
            defer.always(() => {
                const count = clearRetainedAjaxCalls(['id1', 'id2'])
                assert.strictEqual(count, 0, 'should return the correct count of removed calls')
                assert.equal(unmockedAjaxCalls().length, 1, 'there should be 1 unmocked ajax call retained')

                done()
            })
            defer.resolveWith({}, [{ url: '/foobar', status: 404 }])
        })

        it('should clear nothing with no registered handlers', (assert) => {
            const count = clearRetainedAjaxCalls()
            assert.strictEqual(count, 0, 'should return the correct count of removed calls')
        })
    })

    QUnit.module('redirect handling', (hooks) => {
        hooks.beforeEach(() => {
            mockCreateMockXHR = sandbox.fake((handler) => {
                return createMockXHR(handler)
            })
            sandbox.replace.usingAccessor(xhrModule.mocks, 'createMockXHR', mockCreateMockXHR)
        })
        hooks.afterEach(() => {
            clearAll()
            clearRetainedAjaxCalls()
            sandbox.restore()
        })

        it('should redirect to mocked Location (mixed case) header with 301', (assert) => {
            const done = assert.async()

            registerMockjaxHandler({
                url: '/redirect-me',
                status: 301,
                responseHeaders: {
                    Location: '/foobar1'
                }
            })

            registerMockjaxHandler({
                url: '/foobar1',
                status: 201,
                responseText: 'redirected'
            })

            const defer = mockAjaxCall('/redirect-me')
            defer.resolve()
            defer.always((xhr) => {
                assert.equal(xhr.url, '/foobar1', 'URL is correct for redirect to Location header')
                assert.equal(xhr.status, 201, 'Status is correct from redirected Location')
                assert.equal(xhr.responseText, 'redirected', 'ResponseText is correct from redirected Location')
                done()
            })
        })

        it('should redirect to mocked location (lower case) header', (assert) => {
            const done = assert.async()

            registerMockjaxHandler({
                url: '/redirect-me',
                status: 301,
                responseHeaders: {
                    location: '/foobar2'
                }
            })

            registerMockjaxHandler({
                url: '/foobar2',
                status: 202,
                responseText: 'redirected'
            })

            const defer = mockAjaxCall('/redirect-me')
            defer.resolve()
            defer.always((xhr) => {
                assert.equal(xhr.url, '/foobar2', 'URL is correct for redirect to Location header')
                assert.equal(xhr.status, 202, 'Status is correct from redirected Location')
                assert.equal(xhr.responseText, 'redirected', 'ResponseText is correct from redirected Location')
                done()
            })
        })

        it('should redirect to mocked location header with 302', (assert) => {
            const done = assert.async()

            registerMockjaxHandler({
                url: '/redirect-me',
                status: 302,
                responseHeaders: {
                    location: '/foobar3'
                }
            })

            registerMockjaxHandler({
                url: '/foobar3',
                status: 203,
                responseText: 'redirected'
            })

            const defer = mockAjaxCall('/redirect-me')
            defer.resolve()
            defer.always((xhr) => {
                assert.equal(xhr.url, '/foobar3', 'URL is correct for redirect to Location header')
                assert.equal(xhr.status, 203, 'Status is correct from redirected Location')
                assert.equal(xhr.responseText, 'redirected', 'ResponseText is correct from redirected Location')
                done()
            })
        })

        it('should redirect to non-mocked Location header', (assert) => {
            const done = assert.async()

            registerMockjaxHandler({
                url: '/redirect-me',
                status: 301,
                responseHeaders: {
                    location: '/foobar-nope'
                }
            })

            registerMockjaxHandler({
                url: '/foobar',
                status: 205,
                responseText: 'redirected'
            })

            const defer = mockAjaxCall('/redirect-me')
            defer.resolve()
            defer.always((xhr) => {
                assert.equal(xhr.url, '/foobar-nope', 'URL is correct for redirect to Location header')
                assert.equal(xhr.status, 404, 'Status is correct from redirected Location')
                assert.equal(xhr.responseText, '', 'ResponseText is correct from redirected Location')
                done()
            })
        })

        it('should NOT redirect for POST request', (assert) => {
            const done = assert.async()

            registerMockjaxHandler({
                url: '/no-redirect',
                method: 'POST',
                status: 301,
                responseHeaders: {
                    Location: '/foobar-no-redirect'
                }
            })

            registerMockjaxHandler({
                url: '/foobar-no-redirect',
                status: 200,
                responseText: 'redirected'
            })

            const defer = mockAjaxCall('/no-redirect', { method: 'POST' })
            defer.resolve()
            defer.always((xhr) => {
                assert.equal(xhr.url, '/no-redirect', 'URL is correct for non-redirect on POST')
                assert.equal(xhr.status, 301, 'Status is correct for non-redirect on POST')
                assert.equal(xhr.responseText, '', 'ResponseText is correct for non-redirect on POST')
                done()
            })
        })
    })
})
