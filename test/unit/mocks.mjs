
/**
 * @typedef {import('../../src/typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 * @typedef {import('../../src/typedefs.mjs').Deferred} Deferred
 * @typedef {import('../../src/typedefs.mjs').AsyncComplete} AsyncComplete
 */

/**
 * A mock DOMParser to be used in testing
 * @class
 */
export function MockDOMParser() {
    return {
        parseFromString: () => {
            return { namespaceURI: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul' }
        }
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
        data: null,
        _complete: null,
        resolve: function() {
            this.resolveWith(xhr)
        },
        /**
         * Creates a mock Deferred.resolveWith() for use in tests
         * @returns {boolean} Always returns true
         */
        resolveWith: function(data) {
            this.data = data
            this.isResolved = true
            if (this._complete) {
                this._complete(this.data)
            }
        },

        /**
         * Creates a mock Deferred.complete() for use in tests
         * @param {AsyncComplete} callback The function to call once the Deferred is complete
         * @returns {void}
         */
        complete: function (callback) {
            this._complete = callback
            if (this.isResolved && this._complete) {
                this._complete(this.data)
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
    const mockJQuery = function jQuery(selector) {
        if (selector === 'parseerror') {
            // see xhr.mjs -> parseXML
            return []
        } else {
            return makeNodeSelection()
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
    
    const xhr = (settings.xhr && settings.xhr()) || createMockXHR({ url: settings.url })
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
 * @returns {boolean} Always returns true
 */
function makeNodeSelection() {
    return { trigger, text, length: 1 }
}

/**
 * A mock $.globalEval() for use in tests
 * @returns {boolean} Always returns true
 */
function globalEval() {
    return true
}

/**
 * A mock $.isXMLDoc() for use in tests
 * @returns {boolean} Always returns true
 */
function isXMLDoc() {
    return true
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
    return 'text'
}