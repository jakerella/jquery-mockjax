import QUnit from 'qunit'
import { getDOMParser, getJQuery, resetJQueryMock } from '../../src/lib.mjs'

const it = QUnit.test

QUnit.module('DOMParser Library')

it('should return a mock document parser when not present globally', (assert) => {
    const MockParser = getDOMParser()
    assert.equal(MockParser.name, 'MockDOMParser', 'The mock parser should be returned')
    assert.equal(typeof MockParser, 'function', 'The mock parser should be a function')
})

it('should return the global "DOMParser" object if present', (assert) => {
    global.DOMParser = function DOMParser() {}
    const Parser = getDOMParser()
    assert.equal(Parser.name, 'DOMParser', 'The global parser should be returned')
    delete global.DOMParser
})

it('should have a string parse method on it', (assert) => {
    const MockParser = getDOMParser()
    const parser = new MockParser()
    assert.equal(typeof parser.parseFromString, 'function', 'The constructed mock parser should have a parseFromString method')
    assert.deepEqual(parser.parseFromString(), { namespaceURI: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul' }, 'The parsed document should have a namespace URI')
})


QUnit.module('jQuery Library', {
    afterEach: () => {
        resetJQueryMock()
    }
})

it('should return the mock jQuery object when real jQuery is not available', (assert) => {
    const $ = getJQuery()
    assert.equal(typeof $, 'function', 'The mock jQuery object should be a function')
    assert.deepEqual($.fn, { jquery: '4.0.0' }, 'The jQuery version should be in the mock')
    assert.equal(typeof $.ajax, 'function', 'The ajax property should be a function')
    assert.equal($.ajax.name, 'ajax', 'The ajax method should be the mock version')
    assert.equal(typeof $.ajaxSetup, 'function', 'The ajaxSetup property should be a function')
    assert.equal(typeof $.globalEval, 'function', 'The globalEval property should be a function')
    assert.equal(typeof $.isXMLDoc, 'function', 'The isXMLDoc property should be a function')
    assert.equal(typeof $.Deferred, 'function', 'The Deferred property should be a function')
    assert.equal(typeof $.event, 'object', 'The event property should be an object')
    assert.equal(typeof $.event.trigger, 'function', 'The event property should have a trigger method')
    assert.strictEqual($.active, 0, 'The active property should be zero to start')

    assert.strictEqual(typeof $._ajax, 'undefined', 'The cached _ajax method should not exist yet')
})

it('should reset the mock jQuery object when called', (assert) => {
    let $ = getJQuery()
    $.ajax = function foo() {}
    $.mockjax = () => {}
    $ = getJQuery()
    assert.equal($.ajax.name, 'foo', 'The ajax method should be replaced with foo')
    assert.equal(typeof $.mockjax, 'function', 'The mockjax method should be added to the mock')
    resetJQueryMock()
    $ = getJQuery()
    assert.equal($.ajax.name, 'ajax', 'The ajax method should be the mock version after reset')
    assert.equal(typeof $.mockjax, 'undefined', 'The mockjax method should be removed after reset')
})

it('should return the global "$" object if present', (assert) => {
    global.$ = { foo: 'bar', bat: true }
    const $ = getJQuery()
    assert.deepEqual($, { foo: 'bar', bat: true }, 'getJQuery should return the global "$" object')
    delete global.$
})

it('should return the global "jQuery" object if present', (assert) => {
    global.jQuery = { other: 'field', baz: true }
    const $ = getJQuery()
    assert.deepEqual($, { other: 'field', baz: true }, 'getJQuery should return the global "jQuery" object')
    delete global.jQuery
})

it('should return a selection when called', async (assert) => {
    let $ = getJQuery()
    const selection = $('foo')
    assert.equal(typeof selection.trigger, 'function', 'The trigger method on the selection should be callable')
    assert.equal(typeof selection.text, 'function', 'The text method on the selection should be callable')
    assert.equal(selection.text(), 'text', 'The text method returns some text')
    assert.equal(selection.length, 1, 'The selection should have a length of 1')
})

it('should return no selection when called with parseerror', async (assert) => {
    let $ = getJQuery()
    const selection = $('parseerror')
    assert.equal(selection.length, 0, 'The selection should have a length of 0')
})

it('should have a callable ajax method', async (assert) => {
    const done = assert.async()

    let $ = getJQuery()
    const result = await $.ajax()
    assert.equal(result.status, 200, 'The ajax mock should return a promise with status code 200')
    done()
})

it('should have a callable ajaxSetup method that returns default values', async (assert) => {
    let $ = getJQuery()
    assert.deepEqual($.ajaxSetup(), {
        type: 'GET',
        global: true,
        async: true,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        jsonp: 'callback'
    }, 'The ajaxSetup method should return default values with no args')
})

it('should have a callable ajaxSetup method that returns altered values with args', async (assert) => {
    let $ = getJQuery()
    assert.deepEqual($.ajaxSetup({ type: 'POST' }), {
        type: 'POST',
        global: true,
        async: true,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        jsonp: 'callback'
    }, 'The ajaxSetup method should return default values with no args')
})

it('should have a callable globalEval method', async (assert) => {
    let $ = getJQuery()
    assert.ok($.globalEval(), 'The globalEval method should run')
})

it('should have a callable isXMLDoc method', async (assert) => {
    let $ = getJQuery()
    assert.ok($.isXMLDoc(), 'The isXMLDoc method should run')
})

it('should have an event object with a callable trigger method', async (assert) => {
    let $ = getJQuery()
    assert.equal(typeof $.event, 'object', 'The event property is an object')
    assert.ok($.event.trigger(), 'The event trigger method is callable')
})

it('should have a Deferred constructor', async (assert) => {
    let $ = getJQuery()
    const defer = new $.Deferred()
    assert.equal(typeof defer, 'object', 'The created deferred variable is an object')
    assert.ok(defer.resolveWith(), 'The deferred object has a resolveWith method that is callable')
})
