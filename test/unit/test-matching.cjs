
const QUnit = require('qunit')
const it = QUnit.test

// Set up mock jQuery for settings to attach to
global.$ = {}

// Import the module to test
const { matchMethod } = require('../../src/matching.mjs')

/* ----------------- */
QUnit.module('Matching: matchMethod')
/* ----------------- */

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
    assert.ok(matchMethod(null, 'GET'), 'null mock method returns false')
    assert.ok(matchMethod(undefined, 'GET'), 'undefined mock method returns false')
    assert.ok(matchMethod('', 'GET'), 'empty string mock method returns false')
    assert.ok(matchMethod(0, 'GET'), 'zero mock method returns false')
})

it('should handle invalid arguments', (assert) => {
    assert.notOk(matchMethod({ foo: 'bar'}, 'GET'), 'non-string mock method returns false')
    assert.notOk(matchMethod('GET', null), 'null request method returns false')
    assert.notOk(matchMethod('GET', ''), 'empty string request method returns false')
})
