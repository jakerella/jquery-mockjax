import QUnit from 'qunit'
import { getJQueryMock, MockDOMParser } from './mocks.mjs'
import { getDOMParser, getJQuery } from '../../src/lib.mjs'

const it = QUnit.test

QUnit.module('Lib: DOMParser Library')

it('should return a mock document parser when not present globally', (assert) => {
    const MockParser = getDOMParser(MockDOMParser)
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
    const MockParser = getDOMParser(MockDOMParser)
    const parser = new MockParser()
    assert.equal(typeof parser.parseFromString, 'function', 'The constructed mock parser should have a parseFromString method')
    assert.deepEqual(parser.parseFromString(), { namespaceURI: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul' }, 'The parsed document should have a namespace URI')
})


QUnit.module('Lib: jQuery Library')

it('should return the mock jQuery object when real jQuery is not available', (assert) => {
    const $ = getJQuery(getJQueryMock())
    assert.equal(typeof $, 'function', 'The mock jQuery object should be a function')
    assert.strictEqual($.isMock, true, 'The isMock property should be true')
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
})

it('should reset the mock jQuery object when called', (assert) => {
    let $ = getJQuery(getJQueryMock())
    $.ajax = function foo() {}
    $.mockjax = () => {}
    $ = getJQuery()
    assert.equal($.ajax.name, 'foo', 'The ajax method should be replaced with foo')
    assert.equal(typeof $.mockjax, 'function', 'The mockjax method should be added to the mock')
    $ = getJQuery(getJQueryMock())
    assert.equal($.ajax.name, 'ajax', 'The ajax method should be the mock version after reset')
    assert.equal(typeof $.mockjax, 'undefined', 'The mockjax method should be removed after reset')
})

it('should execute the Deferred complete callback for ajax calls', (assert) => {
    const done = assert.async()
    assert.expect(4)

    const $ = getJQuery()
    const deferred = $.ajax('/foo', {})
    assert.equal(typeof deferred.complete, 'function', 'The ajax method returns a Deferred object')
    deferred.complete((result) => {
        assert.equal(result.url, '/foo', 'The complete callback received the url')
        assert.equal(result.status, 200, 'The complete callback received 200 status')
        assert.equal(result.responseText, 'success', 'The complete callback received correct responseText')
        done()
    })
    deferred.resolveWith({
        url: '/foo',
        status: 200,
        responseText: 'success'
    })
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
    let $ = getJQuery(getJQueryMock())
    const selection = $('foo')
    assert.equal(typeof selection.trigger, 'function', 'The trigger method on the selection should be callable')
    assert.equal(typeof selection.text, 'function', 'The text method on the selection should be callable')
    assert.equal(selection.text(), 'text', 'The text method returns some text')
    assert.equal(selection.length, 1, 'The selection should have a length of 1')
})

it('should return no selection when called with parseerror', async (assert) => {
    let $ = getJQuery(getJQueryMock())
    const selection = $('parseerror')
    assert.equal(selection.length, 0, 'The selection should have a length of 0')
})

it('should have a callable ajax method that returns a Deferred object', async (assert) => {
    const done = assert.async()

    let $ = getJQuery(getJQueryMock())
    const deferred = $.ajax()
    assert.equal(typeof deferred, 'object', 'ajax should return a deferred object')
    assert.equal(typeof deferred.complete, 'function', 'The deferred object should have a complete method')
    deferred.complete((xhr) => {
        assert.equal(xhr.status, 200, 'The ajax mock should return a deferred that completes with status code 200')
        done()
    })
    deferred.resolveWith({ status: 200 })
})

it('should have a callable ajaxSetup method that returns default values', async (assert) => {
    let $ = getJQuery(getJQueryMock())
    assert.deepEqual($.ajaxSetup(), {
        type: 'GET',
        global: true,
        async: true,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        jsonp: 'callback'
    }, 'The ajaxSetup method should return default values with no args')
})

it('should have a callable ajaxSetup method that returns altered values with args', async (assert) => {
    let $ = getJQuery(getJQueryMock())
    assert.deepEqual($.ajaxSetup({ type: 'POST' }), {
        type: 'POST',
        global: true,
        async: true,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        jsonp: 'callback'
    }, 'The ajaxSetup method should return default values with no args')
})

it('should have a callable globalEval method', async (assert) => {
    let $ = getJQuery(getJQueryMock())
    assert.ok($.globalEval(), 'The globalEval method should run')
})

it('should have a callable isXMLDoc method', async (assert) => {
    let $ = getJQuery(getJQueryMock())
    assert.ok($.isXMLDoc(), 'The isXMLDoc method should run')
})

it('should have an event object with a callable trigger method', async (assert) => {
    let $ = getJQuery(getJQueryMock())
    assert.equal(typeof $.event, 'object', 'The event property is an object')
    assert.ok($.event.trigger(), 'The event trigger method is callable')
})

it('should have a Deferred constructor', async (assert) => {
    let $ = getJQuery(getJQueryMock())
    const defer = new $.Deferred()
    assert.equal(typeof defer, 'object', 'The created deferred variable is an object')
    assert.equal(typeof defer.resolveWith, 'function', 'The deferred object has a resolveWith method that is callable')
})
