import QUnit from 'qunit'
import { getJQueryMock, MockCrypto, MockDOMParser } from './mocks.mjs'
import { getCrypto, getDOMParser, getJQuery, resetMocks } from '../../src/lib.mjs'

const it = QUnit.test

QUnit.module('Lib', (hooks) => {
    hooks.beforeEach(() => {
        resetMocks()
    })

    hooks.after(() => {
        // Reset mocks for use in other test modules
        getCrypto(MockCrypto)
        getDOMParser(MockDOMParser)
        getJQuery(getJQueryMock())
    })

    QUnit.module('resetMocks', () => {
        it('should reset mocks when asked', (assert) => {
            getCrypto(MockCrypto)
            getDOMParser(MockDOMParser)
            getJQuery(getJQueryMock())

            resetMocks()

            assert.throws(
                () => {
                    getDOMParser()
                },
                /DOMParser not available/,
                'Error thrown when mock DOMParser reset'
            )
            assert.throws(
                () => {
                    getJQuery()
                },
                /jQuery not available/,
                'Error thrown when mock jQuery reset'
            )
            const inUseCrpto = getCrypto()
            assert.equal(typeof inUseCrpto.counter, 'undefined', 'Crypto is not mock after reset')
        })
    })

    QUnit.module('DOMParser Library', () => {

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
            const xmlDoc = parser.parseFromString()
            assert.equal(xmlDoc.namespaceURI, 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'The parsed document should have a namespace URI')
        })

        it('should throw when DOMParser not available', (assert) => {
            assert.throws(
                () => {
                    getDOMParser()
                },
                /DOMParser not available/,
                'Error thrown when DOMParser not available'
            )
        })
    })

    QUnit.module('crypto Library', () => {
        it('should return a mock crypto library when provided', (assert) => {
            const inUseCrypto = getCrypto(MockCrypto)
            assert.equal(typeof inUseCrypto.counter, 'number', 'The mock crypto should have a numeric counter')
            assert.equal(typeof inUseCrypto.randomUUID, 'function', 'The mock crypto should have a randomUUID function')
        })

        it('should generate an incremental UUID each time', (assert) => {
            const inUseCrypto = getCrypto(MockCrypto)
            assert.strictEqual(inUseCrypto.counter, 0, 'The mock crypto counter shaould start at 0')
            assert.equal(inUseCrypto.randomUUID(), '11111111-2222-3333-4444-000000000001', 'The mock crypto randomUUID method should return an incremented UUID')
            assert.equal(inUseCrypto.randomUUID(), '11111111-2222-3333-4444-000000000002', 'The mock crypto randomUUID method should return a second incremented UUID')
        })
    })

    QUnit.module('jQuery Library', () => {

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

        it('should throw when jQuery not available', (assert) => {
            assert.throws(
                () => {
                    getJQuery()
                },
                /jQuery not available/,
                'Error thrown when jQuery not available'
            )
        })
    })
})
