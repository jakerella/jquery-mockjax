
// TODO: add crypto

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

function MockDOMParser() {
    return {
        parseFromString: () => {
            return { namespaceURI: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul' }
        }
    }
}

function ajax() {
    mockJQuery.active++
    return new Promise((resolve, _) => {
        mockJQuery.active--
        resolve({ status: 200 })
    })
}
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
function globalEval() { return true }
function isXMLDoc() { return true }
function trigger() { return true }
function text() { return 'text' }
function makeNodeSelection() {
    return { trigger, text, length: 1 }
}
function Deferred() {
    return { resolveWith: () => { return true } }
}

let mockJQuery = {}
resetJQueryMock()

/**
 * For use in tests, we can reset the mock jQuery object to 
 * its original values. Note that this function will have 
 * no effect when a global "$" is available.
 * @returns {void}
 */
export function resetJQueryMock() {
    mockJQuery = function jQuery(selector) {
        if (selector === 'parseerror') {  // see xhr.mjs -> parseXML
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
