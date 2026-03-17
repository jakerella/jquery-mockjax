// TODO: add crypto

/**
 * @typedef {import('./typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 * @typedef {import('./typedefs.mjs').Deferred} Deferred
 * @typedef {import('./typedefs.mjs').AsyncComplete} AsyncComplete
 */

let mockJQuery = {}

/**
 * Retrieve the jQuery main object/function from the "global"
 * context (in a couple ways). In the dist build, the "$"
 * variable will exist from the UMD wrapper
 * @returns {object} The jQuery object/function
 */
export function getJQuery() {
    if (typeof $ !== 'undefined') {
        return $
    } else if (typeof jQuery !== 'undefined') {
        return jQuery
    } else {
        // If jQuery is not defined, we'll return a mock instance
        // for use in test cases
        return mockJQuery
    }
}

/**
 * Get the DOMParser to use
 * @returns {object} Either the real DOMParser from the global scope or the Mock
 */
export function getDOMParser() {
    if (typeof DOMParser !== 'undefined') {
        return DOMParser
    } else {
        return MockDOMParser
    }
}

/*******************************************/
/*  Mock implementations for use in tests  */
/*******************************************/

/**
 * A mock DOMParser to be used in testing
 * @class
 */
function MockDOMParser() {
    return {
        parseFromString: () => {
            return { namespaceURI: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul' }
        }
    }
}

/**
 * A mock implementation of jQuery's ajax method
 * @param {string} url The URL to go to
 * @param {JQueryAjaxSettings} settings The ajax settings
 * @returns {Deferred} The Deferred object to listen to for completion
 */
function ajax(url, settings) {
    return new Deferred(settings)
}

/**
 * A mock $.ajaxSetup() for use in tests
 * @param {JQueryAjaxSettings} settings The settings you want to override the defaults with
 * @returns {JQueryAjaxSettings} The compiled settings to use for an ajax() call
 */
function ajaxSetup(settings) {
    return {
        // These are settings we care about in Mockjax that are returned from $.ajaxSetup()
        type: 'GET',
        global: true,
        async: true,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        jsonp: 'callback',
        ...settings
    }
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

/**
 * Creates a mock selection object a la $('selector')
 * @returns {boolean} Always returns true
 */
function makeNodeSelection() {
    return { trigger, text, length: 1 }
}

/**
 * A mock Deferred constructor for use in tests
 * @param {JQueryAjaxSettings} settings The settings used for this deferred object
 * @returns {boolean} Always returns true
 */
function Deferred(settings) {
    return {
        /**
         * Creates a mock Deferred.resolveWith() for use in tests
         * @returns {boolean} Always returns true
         */
        resolveWith: () => {
            return true
        },

        /**
         * Creates a mock Deferred.complete() for use in tests
         * @param {AsyncComplete} callback The function to call once the Deferred is complete
         * @returns {void}
         */
        complete: (callback) => {
            callback({
                status: settings?.status || 200,
                responseText: settings?.responseText || 'success'
            })
        }
    }
}

resetJQueryMock()

/**
 * For use in tests, we can reset the mock jQuery object to
 * its original values. Note that this function will have
 * no effect when a global "$" is available.
 * @returns {void}
 */
export function resetJQueryMock() {
    mockJQuery = function jQuery(selector) {
        if (selector === 'parseerror') {
            // see xhr.mjs -> parseXML
            return []
        } else {
            return makeNodeSelection()
        }
    }
    mockJQuery.fn = { jquery: '4.0.0' }
    mockJQuery.ajax = ajax
    mockJQuery.ajaxSetup = ajaxSetup
    mockJQuery.globalEval = globalEval
    mockJQuery.isXMLDoc = isXMLDoc
    mockJQuery.Deferred = Deferred
    mockJQuery.event = { trigger }
    mockJQuery.active = 0
}
