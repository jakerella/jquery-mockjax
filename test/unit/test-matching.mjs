
import QUnit from 'qunit'
import { getSettings, resetSettings } from '../../src/settings.mjs'
import { getJQueryMock } from './mocks.mjs'
import { getJQuery } from '../../src/lib.mjs'
import { getLogger } from '../../src/logger.mjs'

// Initialize jQuery to the mock for this and any imported modules
getJQuery(getJQueryMock())

const it = QUnit.test

import {
    matchMethod,
    matchUrl,
    matchData,
    matchHeaders,
    findMatchingHandler
} from '../../src/matching.mjs'

QUnit.module('Matching', (hooks) => {
    hooks.before(() => {
        getLogger().disable()
    })

    QUnit.module('matchMethod', () => {

        it('should match when inputs match exactly', (assert) => {
            assert.ok(matchMethod('GET', 'GET'), 'exact method name matches')
        })

        it('should not match when inputs do not match at all', (assert) => {
            assert.notOk(matchMethod('GET', 'POST'), 'mismatched method names')
            assert.notOk(matchMethod('GET', 'post'), 'mismatched method names (mixed case)')
        })

        it('should match when inputs are in different case', (assert) => {
            assert.ok(matchMethod('GET', 'get'), 'different case method names match (cap -> no cap)')
            assert.ok(matchMethod('post', 'POST'), 'different case method names match (no cap -> cap)')
            assert.ok(matchMethod('gET', 'Get'), 'different case method names match (all mixed up)')
        })

        it('should match when mock method is falsy', (assert) => {
            assert.ok(matchMethod(null, 'GET'), 'null mock method returns true')
            assert.ok(matchMethod(undefined, 'GET'), 'undefined mock method returns true')
            assert.ok(matchMethod('', 'GET'), 'empty string mock method returns true')
            assert.ok(matchMethod(0, 'GET'), 'zero mock method returns true')
        })

        it('should handle invalid arguments', (assert) => {
            // matchMethod converts to string, so object becomes "[object Object]" which doesn't match "GET"
            assert.notOk(matchMethod({ foo: 'bar'}, 'GET'), 'non-string mock method converts to string and does not match')
            assert.notOk(matchMethod('GET', null), 'null request method returns false')
            assert.notOk(matchMethod('GET', ''), 'empty string request method returns false')
        })

        it('should match all standard HTTP methods', (assert) => {
            const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
            methods.forEach(method => {
                assert.ok(matchMethod(method, method), `${method} matches itself`)
                assert.ok(matchMethod(method.toLowerCase(), method), `${method} matches lowercase`)
            })
        })
    })

    QUnit.module('matchUrl', () => {

        // Positive cases - exact string matching
        it('should match exact string URLs', (assert) => {
            assert.ok(matchUrl('/api/users', '/api/users', null), 'exact URL matches')
            assert.ok(matchUrl('/api/users/123', '/api/users/123', null), 'exact URL with ID matches')
            assert.ok(matchUrl('', '', null), 'empty string URLs match')
        })

        it('should not match different string URLs', (assert) => {
            assert.notOk(matchUrl('/api/users', '/api/posts', null), 'different URLs do not match')
            assert.notOk(matchUrl('/api/users', '/api/users/123', null), 'URL with extra path does not match')
            assert.notOk(matchUrl('/api/users/', '/api/users', null), 'trailing slash matters')
        })

        // Wildcard matching
        it('should match wildcard URLs', (assert) => {
            assert.ok(matchUrl('/api/*', '/api/users', null), 'wildcard matches single segment')
            assert.ok(matchUrl('/api/*', '/api/users/123', null), 'wildcard matches multiple segments')
            assert.ok(matchUrl('/api/*/profile', '/api/users/profile', null), 'wildcard in middle matches')
            assert.ok(matchUrl('*/users', '/api/users', null), 'wildcard at start matches')
        })

        it('should match multiple wildcards', (assert) => {
            assert.ok(matchUrl('/api/*/posts/*', '/api/users/posts/123', null), 'multiple wildcards match')
            assert.ok(matchUrl('*/*', '/api/users', null), 'multiple wildcards match segments')
        })

        it('should handle special characters in wildcard URLs', (assert) => {
            assert.ok(matchUrl('/api/users?*', '/api/users?id=123', null), 'wildcard matches query string')
            assert.ok(matchUrl('/api/users#*', '/api/users#section', null), 'wildcard matches hash')
        })

        // RegExp matching
        it('should match RegExp URLs', (assert) => {
            assert.ok(matchUrl(/^\/api\/users$/, '/api/users', null), 'RegExp matches exact URL')
            assert.ok(matchUrl(/^\/api\/users\/\d+$/, '/api/users/123', null), 'RegExp matches with pattern')
            assert.ok(matchUrl(/\/api\//, '/api/users', null), 'RegExp matches partial URL')
        })

        it('should not match non-matching RegExp URLs', (assert) => {
            assert.notOk(matchUrl(/^\/api\/users$/, '/api/posts', null), 'RegExp does not match different URL')
            assert.notOk(matchUrl(/^\/api\/users\/\d+$/, '/api/users/abc', null), 'RegExp does not match invalid pattern')
        })

        it('should respect RegExp flags', (assert) => {
            assert.ok(matchUrl(/\/API\/USERS/i, '/api/users', null), 'case-insensitive RegExp matches')
            assert.notOk(matchUrl(/\/API\/USERS/, '/api/users', null), 'case-sensitive RegExp does not match')
        })

        // Namespace handling
        it('should prepend namespace to string URLs', (assert) => {
            assert.ok(matchUrl('/users', '/api/users', '/api'), 'namespace prepended to URL')
            assert.ok(matchUrl('users', '/api/users', '/api'), 'namespace prepended without leading slash')
            assert.ok(matchUrl('/users', '/api/v1/users', '/api/v1'), 'multi-segment namespace prepended')
        })

        it('should handle namespace with trailing slashes', (assert) => {
            assert.ok(matchUrl('/users', '/api/users', '/api/'), 'namespace with trailing slash')
            assert.ok(matchUrl('/users', '/api/users', '/api///'), 'namespace with multiple trailing slashes')
        })

        it('should prepend namespace to RegExp URLs', (assert) => {
            assert.ok(matchUrl(/\/users\/\d+/, '/api/users/123', '/api'), 'namespace prepended to RegExp')
            assert.ok(matchUrl(/^\/users/, '/api/users', '/api'), 'namespace prepended to anchored RegExp')
        })

        it('should handle null namespace', (assert) => {
            assert.ok(matchUrl('/api/users', '/api/users', null), 'null namespace does not affect matching')
        })

        it('should handle empty string namespace', (assert) => {
            assert.ok(matchUrl('/api/users', '/api/users', ''), 'empty namespace does not affect matching')
        })

        // Falsy handler URL
        it('should match when handler URL is falsy', (assert) => {
            assert.ok(matchUrl(null, '/any/url', null), 'null handler URL matches any request')
            assert.ok(matchUrl(undefined, '/any/url', null), 'undefined handler URL matches any request')
            assert.ok(matchUrl('', '/any/url', null), 'empty handler URL matches any request')
        })

        // Edge cases
        it('should handle URLs with query strings', (assert) => {
            assert.ok(matchUrl('/api/users?id=123', '/api/users?id=123', null), 'exact match with query string')
            assert.notOk(matchUrl('/api/users?id=123', '/api/users?id=456', null), 'different query strings do not match')
        })

        it('should handle URLs with fragments', (assert) => {
            assert.ok(matchUrl('/api/users#section', '/api/users#section', null), 'exact match with fragment')
        })

        it('should handle very long URLs', (assert) => {
            const longUrl = '/api/' + 'a'.repeat(1000)
            assert.ok(matchUrl(longUrl, longUrl, null), 'very long URLs match')
        })
    })

    QUnit.module('matchData', () => {

        // Undefined handler data
        it('should match when handler data is undefined', (assert) => {
            assert.ok(matchData(undefined, 'any data'), 'undefined handler data matches anything')
            assert.ok(matchData(undefined, { foo: 'bar' }), 'undefined handler data matches objects')
            assert.ok(matchData(undefined, null), 'undefined handler data matches null')
        })

        // Function matcher
        it('should use function to match data', (assert) => {
            const matcher = (data) => data && data.name === 'John'
            assert.ok(matchData(matcher, { name: 'John' }), 'function returns true for matching data')
            assert.notOk(matchData(matcher, { name: 'Jane' }), 'function returns false for non-matching data')
            assert.notOk(matchData(matcher, null), 'function returns false for null data')
        })

        // Exact equality
        it('should match when data is exactly equal', (assert) => {
            assert.ok(matchData('test', 'test'), 'exact string match')
            assert.ok(matchData(123, 123), 'exact number match')
            assert.ok(matchData(true, true), 'exact boolean match')
            assert.ok(matchData(null, null), 'exact null match')
        })

        // RegExp matching with string data
        it('should match string data with RegExp', (assert) => {
            assert.ok(matchData(/^test/, 'test123'), 'RegExp matches string')
            assert.ok(matchData(/\d+/, 'abc123'), 'RegExp matches pattern in string')
            assert.notOk(matchData(/^test/, 'abc'), 'RegExp does not match non-matching string')
        })

        it('should handle non-string data with RegExp', (assert) => {
            assert.notOk(matchData(/test/, { foo: 'test' }), 'RegExp with object data returns true (empty keys)')
            assert.notOk(matchData(/test/, 123), 'RegExp with number data returns true (empty keys)')
            assert.notOk(matchData(/test/, null), 'RegExp with null data returns true (empty keys)')
        })

        // String matching
        it('should match exact strings', (assert) => {
            assert.ok(matchData('name=John', 'name=John'), 'exact string match')
            assert.notOk(matchData('name=John', 'name=Jane'), 'different strings do not match')
        })

        // Object matching
        it('should match object data with all properties', (assert) => {
            assert.ok(matchData({ name: 'John' }, { name: 'John', age: 30 }), 'handler properties match subset')
            assert.ok(matchData({ name: 'John', age: 30 }, { name: 'John', age: 30 }), 'exact object match')
        })

        it('should not match when object properties differ', (assert) => {
            assert.notOk(matchData({ name: 'John' }, { name: 'Jane' }), 'different property values')
            assert.notOk(matchData({ name: 'John' }, { age: 30 }), 'missing required property')
        })

        it('should match object with RegExp property values', (assert) => {
            assert.ok(matchData({ name: /^John/ }, { name: 'John Doe' }), 'RegExp property matches')
            assert.notOk(matchData({ name: /^John/ }, { name: 'Jane Doe' }), 'RegExp property does not match')
        })

        it('should match object with array properties', (assert) => {
            assert.ok(matchData({ ids: [1, 2, 3] }, { ids: [1, 2, 3] }), 'exact array match')
            assert.ok(matchData({ ids: [1, 2] }, { ids: [2, 1] }), 'array contains all required values (same length)')
            assert.notOk(matchData({ ids: [1, 2, 3] }, { ids: [1, 2] }), 'array missing values (different length)')
            assert.notOk(matchData({ ids: [1, 2] }, { ids: [1, 2, 3] }), 'different array lengths do not match')
            assert.notOk(matchData({ ids: [1, 2] }, { ids: [3, 4] }), 'same array lengths with different values do not match')
        })

        it('should match data as top-level arrays', (assert) => {
            assert.ok(matchData([1, 2, 3], [1, 2, 3]), 'exact array match')
            assert.ok(matchData([1, 2], [2, 1]), 'array contains all required values (same length)')
            assert.notOk(matchData([1, 2, 3], [1, 2]), 'array missing values (different length)')
            assert.notOk(matchData([1, 2], [1, 2, 3]), 'different array lengths do not match')
            assert.notOk(matchData([1, 2], [3, 4]), 'same array lengths with different values do not match')
        })

        it('should match nested objects', (assert) => {
            assert.ok(
                matchData({ user: { name: 'John' } }, { user: { name: 'John', age: 30 } }),
                'nested object matches'
            )
            assert.notOk(
                matchData({ user: { name: 'John' } }, { user: { name: 'Jane' } }),
                'nested object does not match'
            )
        })

        it('should match object with function property values', (assert) => {
            const matcher = { age: (val) => val >= 18 }
            assert.ok(matchData(matcher, { age: 25 }), 'function property returns true')
            assert.notOk(matchData(matcher, { age: 15 }), 'function property returns false')
        })

        // Query string parsing
        it('should parse query string data', (assert) => {
            assert.ok(matchData({ name: 'John' }, 'name=John'), 'query string parsed and matched')
            assert.ok(matchData({ name: 'John', age: '30' }, 'name=John&age=30'), 'multiple params parsed')
        })

        it('should handle URL-encoded query strings', (assert) => {
            assert.ok(matchData({ name: 'John Doe' }, 'name=John+Doe'), 'plus sign decoded as space')
            assert.ok(matchData({ name: 'John Doe' }, 'name=John%20Doe'), 'percent encoding decoded')
        })

        it('should handle duplicate query parameters as arrays', (assert) => {
            assert.ok(matchData({ id: ['1', '2'] }, 'id=1&id=2'), 'duplicate params become array')
        })

        // Edge cases
        it('should handle empty objects', (assert) => {
            assert.ok(matchData({}, { name: 'John' }), 'empty handler object matches anything')
            assert.ok(matchData({}, {}), 'empty objects match')
        })

        it('should handle null and undefined in objects', (assert) => {
            assert.ok(matchData({ value: null }, { value: null }), 'null values match')
            assert.notOk(matchData({ value: 'test' }, { value: null }), 'null does not match string')
        })

        it('should handle deeply nested objects', (assert) => {
            const handler = { a: { b: { c: { d: 'value' } } } }
            const request = { a: { b: { c: { d: 'value', e: 'extra' } } } }
            assert.ok(matchData(handler, request), 'deeply nested objects match')
        })
    })

    QUnit.module('matchHeaders', () => {

        // Undefined/null handler headers
        it('should match when handler headers are falsy', (assert) => {
            assert.ok(matchHeaders(null, { 'Content-Type': 'application/json' }), 'null handler headers match')
            assert.ok(matchHeaders(undefined, { 'Content-Type': 'application/json' }), 'undefined handler headers match')
        })

        it('should not match when handler headers are not an object', (assert) => {
            assert.notOk(matchHeaders('not-an-object', {}), 'string handler headers do not match')
            assert.notOk(matchHeaders(123, {}), 'number handler headers do not match')
        })

        // Exact header matching
        it('should match when all handler headers are present', (assert) => {
            assert.ok(
                matchHeaders({ 'Content-Type': 'application/json' }, { 'Content-Type': 'application/json' }),
                'exact header match'
            )
            assert.ok(
                matchHeaders({ 'X-Custom': 'value' }, { 'X-Custom': 'value', 'Other': 'header' }),
                'handler headers subset of request headers'
            )
        })

        it('should not match when handler headers are missing', (assert) => {
            assert.notOk(
                matchHeaders({ 'Content-Type': 'application/json' }, {}),
                'missing required header'
            )
            assert.notOk(
                matchHeaders({ 'X-Custom': 'value' }, { 'Other': 'header' }),
                'different headers'
            )
        })

        // Case sensitivity
        it('should match header names case-insensitively', (assert) => {
            assert.ok(
                matchHeaders({ 'content-type': 'application/json' }, { 'Content-Type': 'application/json' }),
                'lowercase handler header matches capitalized request header'
            )
            assert.ok(
                matchHeaders({ 'Content-Type': 'application/json' }, { 'content-type': 'application/json' }),
                'capitalized handler header matches lowercase request header'
            )
            assert.ok(
                matchHeaders({ 'X-CUSTOM-HEADER': 'value' }, { 'x-custom-header': 'value' }),
                'uppercase handler header matches lowercase request header'
            )
        })

        it('should match header values case-sensitively', (assert) => {
            assert.ok(
                matchHeaders({ 'Content-Type': 'application/json' }, { 'Content-Type': 'application/json' }),
                'exact value match'
            )
            assert.notOk(
                matchHeaders({ 'Content-Type': 'application/json' }, { 'Content-Type': 'Application/JSON' }),
                'different case values do not match'
            )
        })

        // Multiple headers
        it('should match multiple headers', (assert) => {
            const handlerHeaders = {
                'Content-Type': 'application/json',
                'X-Custom': 'value',
                'Authorization': 'Bearer token'
            }
            const requestHeaders = {
                'Content-Type': 'application/json',
                'X-Custom': 'value',
                'Authorization': 'Bearer token',
                'Other': 'header'
            }
            assert.ok(matchHeaders(handlerHeaders, requestHeaders), 'all handler headers match')
        })

        it('should not match when any header is missing or different', (assert) => {
            const handlerHeaders = {
                'Content-Type': 'application/json',
                'X-Custom': 'value'
            }
            assert.notOk(
                matchHeaders(handlerHeaders, { 'Content-Type': 'application/json' }),
                'missing one required header'
            )
            assert.notOk(
                matchHeaders(handlerHeaders, { 'Content-Type': 'text/plain', 'X-Custom': 'value' }),
                'one header value differs'
            )
        })

        // Non-string header values
        it('should not match when handler header value is not a string', (assert) => {
            assert.notOk(
                matchHeaders({ 'X-Custom': 123 }, { 'X-Custom': '123' }),
                'number handler header value'
            )
            assert.notOk(
                matchHeaders({ 'X-Custom': null }, { 'X-Custom': 'value' }),
                'null handler header value'
            )
            assert.notOk(
                matchHeaders({ 'X-Custom': undefined }, { 'X-Custom': 'value' }),
                'undefined handler header value'
            )
        })

        // Null/undefined request headers
        it('should not match when request headers are null or undefined', (assert) => {
            assert.notOk(
                matchHeaders({ 'Content-Type': 'application/json' }, null),
                'null request headers'
            )
            assert.notOk(
                matchHeaders({ 'Content-Type': 'application/json' }, undefined),
                'undefined request headers'
            )
        })

        // Edge cases
        it('should handle empty handler headers object', (assert) => {
            assert.ok(matchHeaders({}, { 'Content-Type': 'application/json' }), 'empty handler headers match')
        })

        it('should handle headers with special characters', (assert) => {
            assert.ok(
                matchHeaders({ 'X-Custom-Header-123': 'value' }, { 'X-Custom-Header-123': 'value' }),
                'headers with numbers and hyphens'
            )
        })
    })

    QUnit.module('findMatchingHandler', (hooks) => {
        hooks.afterEach(() => {
            resetSettings(true)
        })

        // Basic matching
        it('should find matching handler', (assert) => {
            const handlers = [
                { url: '/api/users', method: 'GET' },
                { url: '/api/posts', method: 'GET' }
            ]
            const request = { url: '/api/users', method: 'GET' }
            const result = findMatchingHandler(handlers, request)
            assert.equal(result, handlers[0], 'returns first matching handler')
        })

        it('should return null when no handler matches', (assert) => {
            const handlers = [
                { url: '/api/users', method: 'GET' }
            ]
            const request = { url: '/api/posts', method: 'GET' }
            const result = findMatchingHandler(handlers, request)
            assert.equal(result, null, 'returns null for no match')
        })

        // Registration order
        it('should respect matchInRegistrationOrder setting', (assert) => {
            const handlers = [
                { url: '/api/users', method: 'GET', id: 1 },
                { url: '/api/users', method: 'GET', id: 2 }
            ]
            const request = { url: '/api/users', method: 'GET' }
            

            let result = findMatchingHandler(handlers, request)
            assert.equal(result.id, 1, 'returns first handler when matchInRegistrationOrder is true')
            
            getSettings().matchInRegistrationOrder = false

            result = findMatchingHandler(handlers, request)
            assert.equal(result.id, 2, 'returns last handler when matchInRegistrationOrder is false')
        })

        // Function handlers
        it('should handle function handlers', (assert) => {
            const functionHandler = (settings) => {
                if (settings.url === '/api/users') {
                    return { url: '/api/users', responseText: 'matched' }
                }
                return null
            }
            const handlers = [functionHandler]
            const request = { url: '/api/users', method: 'GET' }
            const result = findMatchingHandler(handlers, request)
            assert.ok(result !== null, 'function handler returns mock handler')
            assert.equal(result.responseText, 'matched', 'function handler returns correct data')
        })

        it('should skip function handlers that return null', (assert) => {
            const functionHandler = () => null
            const staticHandler = { url: '/api/users', method: 'GET' }
            const handlers = [functionHandler, staticHandler]
            const request = { url: '/api/users', method: 'GET' }
            const result = findMatchingHandler(handlers, request)
            assert.equal(result, staticHandler, 'skips null-returning function handler')
        })

        // Namespace handling
        it('should use global namespace', (assert) => {
            getSettings().namespace = '/api'

            const handlers = [{ url: '/users', method: 'GET' }]
            const request = { url: '/api/users', method: 'GET' }
            const result = findMatchingHandler(handlers, request)
            assert.equal(result, handlers[0], 'global namespace applied')
        })

        it('should use handler-specific namespace', (assert) => {
            getSettings().namespace = '/api'

            const handlers = [{ url: '/users', method: 'GET', namespace: '/v2' }]
            const request = { url: '/v2/users', method: 'GET' }
            const result = findMatchingHandler(handlers, request)
            assert.equal(result, handlers[0], 'handler namespace overrides global')
        })

        it('should handle null handler namespace', (assert) => {
            getSettings().namespace = '/api'

            const handlers = [{ url: '/users', method: 'GET', namespace: null }]
            const request = { url: '/users', method: 'GET' }
            const result = findMatchingHandler(handlers, request)
            assert.equal(result, handlers[0], 'null handler namespace ignores global')
        })

        // Multiple criteria matching (AND logic)
        it('should match all criteria with AND logic', (assert) => {
            const handlers = [{
                url: '/api/users',
                method: 'POST',
                data: { name: 'John' },
                requestHeaders: { 'Content-Type': 'application/json' }
            }]
            const request = {
                url: '/api/users',
                method: 'POST',
                data: { name: 'John', age: 30 },
                headers: { 'Content-Type': 'application/json' }
            }
            const result = findMatchingHandler(handlers, request)
            assert.equal(result, handlers[0], 'all criteria match')
        })

        it('should not match when any criterion fails', (assert) => {
            const handlers = [{
                url: '/api/users',
                method: 'POST',
                data: { name: 'John' }
            }]
            
            // Wrong URL
            let request = { url: '/api/posts', method: 'POST', data: { name: 'John' } }
            let result = findMatchingHandler(handlers, request)
            assert.equal(result, null, 'fails when URL does not match')
            
            // Wrong method
            request = { url: '/api/users', method: 'GET', data: { name: 'John' } }
            result = findMatchingHandler(handlers, request)
            assert.equal(result, null, 'fails when method does not match')
            
            // Wrong data
            request = { url: '/api/users', method: 'POST', data: { name: 'Jane' } }
            result = findMatchingHandler(handlers, request)
            assert.equal(result, null, 'fails when data does not match')
        })

        // Empty handlers array
        it('should return null for empty handlers array', (assert) => {
            const handlers = []
            const request = { url: '/api/users', method: 'GET' }
            const result = findMatchingHandler(handlers, request)
            assert.equal(result, null, 'returns null for empty array')
        })

        // Complex scenarios
        it('should find correct handler among many', (assert) => {
            const handlers = [
                { url: '/api/users', method: 'GET' },
                { url: '/api/users', method: 'POST' },
                { url: '/api/posts', method: 'GET' },
                { url: /\/api\/users\/\d+/, method: 'GET' }
            ]
            
            let request = { url: '/api/users', method: 'POST' }
            let result = findMatchingHandler(handlers, request)
            assert.equal(result, handlers[1], 'finds POST handler')
            
            request = { url: '/api/users/123', method: 'GET' }
            result = findMatchingHandler(handlers, request)
            assert.equal(result, handlers[3], 'finds RegExp handler')
        })

        it('should handle handlers with only some criteria', (assert) => {
            const handlers = [
                { url: '/api/users' }, // No method specified
                { method: 'POST' }, // No URL specified
                { data: { name: 'John' } } // Only data specified
            ]
            
            let request = { url: '/api/users', method: 'GET' }
            let result = findMatchingHandler(handlers, request)
            assert.equal(result, handlers[0], 'matches handler with only URL')
            
            request = { url: '/any/url', method: 'POST' }
            result = findMatchingHandler(handlers, request)
            assert.equal(result, handlers[1], 'matches handler with only method')
            
            request = { url: '/any/url', method: 'GET', data: { name: 'John', age: 30 } }
            result = findMatchingHandler(handlers, request)
            assert.equal(result, handlers[2], 'matches handler with only data')
        })
    })
})
