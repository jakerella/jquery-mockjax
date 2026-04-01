
/**
 * @typedef {import('../../src/typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 * @typedef {import('../../src/typedefs.mjs').Deferred} Deferred
 * @typedef {import('../../src/typedefs.mjs').AsyncComplete} AsyncComplete
 * @typedef {import('../../src/typedefs.mjs').AnyType} AnyType
 */

/**
 * A mock DOMParser to be used in testing
 * @class
 */
export function MockDOMParser() {
    return {
        /**
         * Mock out parsing an XML string to an object
         * @param {string} xmlString A string of XML
         * @returns {object} The parsed XML document object (or <parsererror>Parse Error</parsererror>)
         */
        parseFromString: (xmlString) => {
            if (/parsererror/.test(xmlString)) {
                return {
                    namespaceURI: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
                    parsererror: 'There was a parser error'
                }
            } else if (/notxml/.test(xmlString)) {
                return {}
            } else {
                return {
                    namespaceURI: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
                    root: {
                        item: 'test'
                    }
                }
            }
        }
    }
}

export const MockCrypto = {
    counter: 0,
    randomUUID: function() {
        return '11111111-2222-3333-4444-' + String(++this.counter).padStart(12, '0')
    }
}

export function createMockXHR(handler={}) {
    return {
        url: handler.url || '',
        status: handler.status || 404,
        statusText: handler.statusText || 'fail',
        responseText: handler.responseText || '',
        readyState: 4,
        open: function open() {},
        send: function send() {},
        abort: function abort() {},
        setRequestHeader: function () {},
        getResponseHeader: function (name) {
            if (handler.responseHeaders && typeof handler.responseHeaders[name] !== 'undefined') {
                return handler.responseHeaders[name]
            }
        },
        getAllResponseHeaders: function () {
            return Object.entries(handler.responseHeaders || {})
                .map((entry) => {
                    return `${entry[0]}: ${entry[1]}`
                })
                .join('\n')
        }
    }
}

/**
 * A mock Deferred constructor for use in tests
 * @param {object} xhr The mock XHR used in the request
 * @returns {object} The jQuery mock Deferred object
 */
export function Deferred(xhr) {
    return {
        isResolved: false,
        _context: null,
        _data: null,
        _always: null,
        resolve: function() {
            this.resolveWith({}, [xhr])
        },
        /**
         * Creates a mock Deferred.resolveWith() for use in tests
         * @param {object} context The context to use for callbacks
         * @param {AnyType[]} args An array of the arguments to pass into the callbacks
         * @returns {boolean} Always returns true
         */
        resolveWith: function(context, args=[]) {
            this._data = args
            this._context = context || {}
            this.isResolved = true
            if (this._always) {
                this._always.call(this._context, ...this._data)
            }
        },

        /**
         * Creates a mock Deferred.always() for use in tests
         * @param {AsyncComplete} callback The function to call once the Deferred is complete (resolved or rejected)
         * @returns {void}
         */
        always: function (callback) {
            this._always = callback
            if (this.isResolved && this._always) {
                this._always.call(this._context, ...this._data)
            }
        }
    }
}


/**
 * For use in tests, we can reset the mock jQuery object to
 * its original values. Note that this function will have
 * no effect when a global "$" is available.
 * @returns {void}
 */
export function getJQueryMock() {
    const mockJQuery = function jQuery(selector, parent) {
        if (selector === 'parsererror') {
            if (/parsererror/.test(JSON.stringify(parent))) {
                return [JSON.stringify(parent)]
            } else {
                return []
            }
        } else {
            return makeNodeSelection(selector)
        }
    }
    mockJQuery.isMock = true
    mockJQuery.fn = { jquery: '4.0.0' }
    mockJQuery.ajax = ajax
    mockJQuery._ajax = ajax  // This replicates the "real" ajax being held during mockjax setup
    mockJQuery.ajaxSetup = ajaxSetup
    mockJQuery.globalEval = globalEval
    mockJQuery.isXMLDoc = isXMLDoc
    mockJQuery.Deferred = Deferred
    mockJQuery.event = { trigger }
    mockJQuery.active = 0

    return mockJQuery
}

/**
 * A mock implementation of jQuery's ajax method
 * @param {string} url The URL to go to
 * @param {JQueryAjaxSettings} settings The ajax settings
 * @returns {Deferred} The Deferred object to listen to for completion
 */
export function ajax(url, settings={}) {
    if (typeof url === 'object') {
        settings = url
    } else {
        settings.url = url
    }
    
    const xhr = (settings.xhr && settings.xhr()) || createMockXHR({ url: settings.url || '' })
    
    if (typeof settings.complete === 'function') {
        settings.complete(xhr)
    }

    return new Deferred(xhr)
}

/**
 * A mock $.ajaxSetup() for use in tests
 * @param {...JQueryAjaxSettings} settings The settings you want to override the defaults with
 * @returns {JQueryAjaxSettings} The compiled settings to use for an ajax() call
 */
function ajaxSetup(...settings) {
    let ajaxSettings = {
        // These are settings we care about in Mockjax that are returned from $.ajaxSetup()
        type: 'GET',
        global: true,
        async: true,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        jsonp: 'callback',
    }
    settings?.forEach(s => ajaxSettings = {...ajaxSettings, ...s})
    return ajaxSettings
}

/**
 * Creates a mock selection object a la $('selector')
 * @param {object} elem The selected element
 * @returns {boolean} Always returns true
 */
function makeNodeSelection(elem) {
    elem = (typeof elem === 'string') ? { type: elem } : elem
    return { 0: elem, trigger, text, length: 1 }
}

/**
 * A mock $.globalEval() for use in tests
 * @param {string} script The script to eval
 * @returns {boolean} Always returns true
 */
function globalEval(script) {
    global.scriptEval = script
}

/**
 * A mock $.isXMLDoc() for use in tests
 * @param {object} object A possible XML document
 * @returns {boolean} Always returns true
 */
function isXMLDoc(object) {
    return object && typeof object === 'object' && object.namespaceURI
}

/**
 * A mock $().trigger() for use in tests
 * @returns {boolean} Always returns true
 */
function trigger() {
    return true
}

/**
 * A mock $().text() for use in tests
 * @returns {boolean} Always returns true
 */
function text() {
    return (this && this[0]) ? JSON.stringify(this[0]) : '(empty)'
}
