/*!
 * jQuery Mockjax v3.0.1 - https://github.com/jakerella/jquery-mockjax
 * Build Date: 2026-05-07
 * Copyright (c) 2026 Jordan Kasper and contributors, formerly appendTo
 * Licensed under the MIT license
 */
;(function(root, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		define(['jquery'], function($) { return factory($, root) })
	} else if (typeof exports === 'object') {
		module.exports = factory
	} else {
		return factory(root.jQuery || root.$, root)
	}
}(this, function($, window) {

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 781
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MY: () => (/* binding */ getCrypto),
/* harmony export */   ab: () => (/* binding */ getDOMParser),
/* harmony export */   vl: () => (/* binding */ getJQuery)
/* harmony export */ });
/* unused harmony export resetMocks */
/**
 * Methods to dynamically retrieve external libraries or global interfaces
 * @private
 * @module lib
 */

let mockJQuery = null
let mockDOMParser = null
let mockCrypto = null

/**
 * Retrieve the jQuery main object/function from the "global"
 * context (in a couple ways). In the dist build, the "$"
 * variable will exist from the UMD wrapper. This also allows
 * for dependency injection as necessary in our tests
 * @param {object} mockJQueryFn A mock jQuery function to use for testing
 * @returns {object} Either the real jQuery from the global scope or the Mock
 * @throws {Error} If jQuery not available
 */
function getJQuery(mockJQueryFn) {
    if (mockJQueryFn) {
        mockJQuery = mockJQueryFn
    }

    if (typeof $ !== 'undefined') {
        return $
    } else if (typeof jQuery !== 'undefined') {
        return jQuery
    } else if (mockJQuery) {
        return mockJQuery
    } else {
        throw new Error('jQuery not available!')
    }
}

/**
 * Get the DOMParser to use. This allows for injection
 * of a mock instance for use in tests.
 * @param {object} mockDOMParserObject A mock DOMParser for use in tests
 * @returns {object} Either the real DOMParser from the global scope or the Mock
 * @throws {Error} If DOMParser not available
 */
function getDOMParser(mockDOMParserObject) {
    if (mockDOMParserObject) {
        mockDOMParser = mockDOMParserObject
    }

    if (typeof DOMParser !== 'undefined') {
        return DOMParser
    } else if (mockDOMParser) {
        return mockDOMParser
    } else {
        throw new Error('DOMParser not available!')
    }
}

/**
 * Get the crypto library to use. This allows for injection
 * of a mock instance for use in tests.
 * @param {object} mockCryptoObject A mock crypto for use in tests
 * @returns {object} Either the real crypto from the global scope or the Mock
 * @throws {Error} If crypto not available
 */
function getCrypto(mockCryptoObject) {
    if (mockCryptoObject) {
        mockCrypto = mockCryptoObject
    }

    if (mockCrypto) {
        return mockCrypto
    } else {
        return crypto
    }
}

/**
 * Resets the mock library objects to null. Useful for testing
 * @returns {void}
 */
function resetMocks() {
    mockJQuery = null
    mockDOMParser = null
    mockCrypto = null
}


/***/ },

/***/ 667
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   G: () => (/* binding */ deepClone),
/* harmony export */   l: () => (/* binding */ generateUUID)
/* harmony export */ });
/* harmony import */ var _lib_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(781);
/**
 * Utility functions for mockjax
 * @private
 * @module utils
 */



/**
 * Generate a UUID using the Web Crypto API
 * @returns {string} RFC 4122 compliant UUID
 * @throws {Error} If crypto.randomUUID() is not available
 */
function generateUUID() {
    const crypto = (0,_lib_mjs__WEBPACK_IMPORTED_MODULE_0__/* .getCrypto */ .MY)()
    return crypto.randomUUID()
}

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
function deepClone(obj) {
    try {
        const clone = structuredClone(obj)
        return clone
    } catch (_) {
        /* can't clone functions, so we'll try this the hard way */
    }

    if (obj === null || typeof obj !== 'object') {
        return obj
    }

    const clone = {}
    for (const key in obj) {
        if (typeof obj[key] === 'function') {
            /* eslint-disable no-eval */
            eval(
                `const __mockjaxGlobal = (window || global); __mockjaxGlobal.__clonedMockjaxFn = ${obj[key].toString()};`
            )
            /* eslint-enable no-eval */
            const g = window || __webpack_require__.g
            clone[key] = g.__clonedMockjaxFn
            delete g.__clonedMockjaxFn
        } else {
            clone[key] = deepClone(obj[key])
        }
    }
    return clone
}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// UNUSED EXPORTS: clear, clearAll, clearById, clearByUrl, clearRetainedAjaxCalls, default, getLogger, getSettings, handler, handlers, init, mockedAjaxCalls, mockjax, resetSettings, unfiredHandlers, unmockedAjaxCalls, validateSettings

// EXTERNAL MODULE: ./src/lib.mjs
var lib = __webpack_require__(781);
;// ./src/settings.mjs
/**
 * Global mockjax settings with default values
 * @private
 * @module settings
 */

/**
 * @typedef {import('./typedefs.mjs').MockjaxSettings} MockjaxSettings
 */



const DEFAULTS = {
    logger: null,
    logging: null, // Deprecated
    logLevel: 2,
    namespace: null,
    status: 200,
    statusText: 'OK',
    responseTime: 500,
    isTimeout: false,
    throwUnmocked: false,
    retainAjaxCalls: -1,
    contentType: 'text/plain',
    response: null,
    responseText: '',
    responseXML: '',
    proxy: null,
    proxyType: null, // Deprecated
    proxyMethod: 'GET',
    lastModified: null,
    etag: 'IJF@H#@923uf8023hFO@I#H#',
    headers: null, // Deprecated
    responseHeaders: {},
    matchInRegistrationOrder: true,
    followRedirects: true
}

/**
 * Get all current global Mockjax settings
 * @public
 * @global
 * @function getSettings
 * @returns {MockjaxSettings} The global mockjax settings
 */
function _getSettings() {
    const jq = (0,lib/* getJQuery */.vl)()
    return jq.mockjaxSettings || { ...DEFAULTS }
}

// Support dependency injection
let getSettings = _getSettings
const mocks = {
    set getSettings(mock) {
        getSettings = mock
    },
    get getSettings() {
        return _getSettings
    }
}

/**
 * Reset global Mockjax settings to their defaults
 * @public
 * @global
 * @param {boolean} maintainLogger Whether or not to maintain the logger instance when resetting global settings
 * @returns {MockjaxSettings} The (reset) global mockjax settings
 */
function resetSettings(maintainLogger = false) {
    const jq = (0,lib/* getJQuery */.vl)()
    let logger = null
    if (maintainLogger === true) {
        logger = getSettings().logger
    }
    jq.mockjaxSettings = { ...DEFAULTS, logger }
    return jq.mockjaxSettings
}

/**
 * Validates that all global Mockjax settings are valid types
 * @public
 * @global
 * @returns {void}
 * @throws {TypeError}
 */
function validateSettings() {
    const settings = getSettings()

    const messages = []

    if (
        settings.logger &&
        (typeof settings.logger !== 'object' ||
            ['error', 'warn', 'info', 'log', 'debug'].filter(
                (m) => typeof settings.logger[m] !== 'function'
            ).length)
    ) {
        messages.push('The logger must be an object with standard window.console logging methods')
    }

    if (!Number.isInteger(settings.logLevel) && !Number.isInteger(settings.logging)) {
        messages.push(`The logLevel setting must be an integer`)
    }

    if (settings.namespace !== null && typeof settings.namespace !== 'string') {
        messages.push('The namespace setting must be a string or null')
    }

    const statusErrMessage =
        'The status setting must be a number between 100 and 599 or an array of such numbers'
    if (Array.isArray(settings.status)) {
        const invalidStatuses = settings.status.filter((s) => {
            return !Number.isInteger(s) || s < 100 || s > 599
        })
        if (invalidStatuses.length) {
            messages.push(statusErrMessage)
        }
    } else if (
        !Number.isInteger(settings.status) ||
        settings.status < 100 ||
        settings.status > 599
    ) {
        messages.push(statusErrMessage)
    }

    if (typeof settings.statusText !== 'string') {
        messages.push('The statusText setting must be a string')
    }

    if (!Number.isInteger(settings.responseTime) || settings.responseTime < 0) {
        messages.push('The responseTime setting must be a non-negative integer')
    }

    if (typeof settings.isTimeout !== 'boolean') {
        messages.push('The isTimeout setting must be a boolean')
    }

    if (typeof settings.throwUnmocked !== 'boolean') {
        messages.push('The throwUnmocked setting must be a boolean')
    }

    if (!Number.isInteger(settings.retainAjaxCalls)) {
        messages.push('The retainAjaxCalls setting must be an integer (-1 to retain all calls)')
    }

    if (
        typeof settings.contentType !== 'string' ||
        !/^[a-z0-9\.\-+]+\/[a-z0-9\.\-+]+/i.test(settings.contentType)
    ) {
        messages.push('The contentType setting must be a valid minetype string')
    }

    if (settings.response !== null && typeof settings.response !== 'function') {
        messages.push('The response setting must be a function or null')
    }

    if (settings.responseText === null || typeof settings.responseText === 'undefined') {
        messages.push('The responseText setting must be set')
    }

    if (settings.responseXML !== null && typeof settings.responseXML !== 'string') {
        messages.push('The responseXML setting must be a string or null')
    }

    if (settings.proxy !== null && typeof settings.proxy !== 'string') {
        messages.push('The proxy setting must be a string or null')
    }

    if (
        typeof settings.proxyType !== 'undefined' &&
        settings.proxyType !== null &&
        typeof settings.proxyType !== 'string'
    ) {
        messages.push('The proxyType setting must be a string or null')
    }
    if (settings.proxyMethod !== null && typeof settings.proxyMethod !== 'string') {
        messages.push('The proxyMethod setting must be a string or null')
    } else if (
        settings.proxyType &&
        settings.proxyMethod &&
        settings.proxyMethod !== settings.proxyType
    ) {
        messages.push('The proxyType setting should not be used if proxyMethod is set')
    }

    if (settings.lastModified !== null && typeof settings.lastModified !== 'string') {
        messages.push('The lastModified setting must be a date string or null')
    }

    if (settings.etag !== null && typeof settings.etag !== 'string') {
        messages.push('The etag setting must be a string or null')
    }

    let headersErrMessage =
        'If not null, the responseHeaders must be a simple object of string keys and values'
    if (typeof settings.responseHeaders === 'object' && settings.responseHeaders !== null) {
        const badHeaders = Object.keys(settings.responseHeaders).filter(
            (k) => typeof k !== 'string' || typeof settings.responseHeaders[k] !== 'string'
        )
        if (badHeaders.length) {
            messages.push(headersErrMessage)
        }
    } else if (typeof settings.responseHeaders !== null) {
        messages.push(headersErrMessage)
    } else if (settings.headers) {
        headersErrMessage =
            'If not null, the headers must be a simple object of string keys and values'
        if (typeof settings.headers === 'object' && settings.headers !== null) {
            const badHeaders = Object.keys(settings.headers).filter(
                (k) => typeof k !== 'string' || typeof settings.headers[k] !== 'string'
            )
            if (badHeaders.length) {
                messages.push(headersErrMessage)
            }
        } else if (typeof settings.headers !== null) {
            messages.push(headersErrMessage)
        }
    }

    if (typeof settings.matchInRegistrationOrder !== 'boolean') {
        messages.push('The matchInRegistrationOrder setting must be a boolean')
    }

    if (typeof settings.followRedirects !== 'boolean') {
        messages.push('The followRedirects setting must be a boolean')
    }

    if (messages.length) {
        throw new TypeError(messages.join('\n'))
    }
}

;// ./src/logger.mjs
/**
 * A basic logger for the Mockjax library
 * @private
 * @module logger
 */

/**
 * @typedef {import('./typedefs.mjs').LogMethod} LogMethod
 */



const DEFAULT_LOG_LEVEL = 2

class Logger {
    #disabled = false
    #level = DEFAULT_LOG_LEVEL
    #methods = ['error', 'warn', 'info', 'log', 'debug']
    constructor(level) {
        this.#level = level || DEFAULT_LOG_LEVEL
        this.#methods.forEach((m) => {
            this[m] = function (...args) {
                return this.#writeLog(m, ...args)
            }
        })
    }

    disable() {
        this.#disabled = true
    }
    enable() {
        this.#disabled = false
    }
    isDisabled() {
        return this.#disabled
    }

    getLevel() {
        return this.#level
    }

    #writeLog(level, ...elements) {
        if (this.#disabled || this.#methods.indexOf(level) > this.#level) {
            return
        }
        const root = typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g : window
        root.console[level](...elements)
    }
}

/* eslint-disable jsdoc/check-types */
/**
 * This will return the current logger implementation from $.mockjaxSettings
 * or a no-op version if that setting is null or otherwise not implemented
 * @returns {Object.<string, LogMethod>} The current logger implementation
 */
function getLogger() {
    const settings = getSettings()
    if (!settings.logger) {
        let level = DEFAULT_LOG_LEVEL
        if (typeof settings.logLevel === 'number') {
            level = settings.logLevel
        } else if (typeof settings.logging === 'number') {
            level = settings.logging
        } else if (settings.logging === false) {
            level = -1
        }
        settings.logger = new Logger(level)
    }
    return settings.logger
}
/* eslint-enable jsdoc/check-types */

// EXTERNAL MODULE: ./src/utils.mjs
var utils = __webpack_require__(667);
;// ./src/matching.mjs
/**
 * Handler matching logic for mockjax
 * @private
 * @module matching
 */

/**
 * @typedef {import('./typedefs.mjs').HTTPMethod} HTTPMethod
 * @typedef {import('./typedefs.mjs').MockHandler} MockHandler
 * @typedef {import('./typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 * @typedef {import('./typedefs.mjs').DataMatcher} DataMatcher
 * @typedef {import('./typedefs.mjs').RequestData} RequestData
 */




/**
 * Find a matching handler for an AJAX request
 * @alias matching.findMatchingHandler
 * @function findMatchingHandler
 * @param {MockHandler[]} handlers - Array of registered handlers
 * @param {JQueryAjaxSettings} requestSettings - jQuery AJAX request settings
 * @returns {MockHandler|null} Matching handler or null
 */
function _findMatchingHandler(handlers, requestSettings) {
    const matchOrder = getSettings().matchInRegistrationOrder
    const startIndex = matchOrder ? 0 : handlers.length - 1
    const endIndex = matchOrder ? handlers.length : -1
    const step = matchOrder ? 1 : -1

    for (let i = startIndex; i !== endIndex; i += step) {
        const handler = handlers[i]

        if (typeof handler === 'function') {
            const mockHandler = handler(requestSettings)
            if (mockHandler) {
                return mockHandler
            } else {
                continue
            }
        }

        // Determine namespace
        const namespace =
            handler.namespace !== undefined ? handler.namespace : getSettings().namespace

        // Match all criteria (AND logic)
        if (
            matchUrl(handler.url, requestSettings.url, namespace) &&
            matchMethod(handler.method, requestSettings.method) &&
            matchData(handler.data, requestSettings.data) &&
            matchHeaders(handler.requestHeaders, requestSettings.headers)
        ) {
            return handler
        }
    }

    return null
}

// Support dependency injection
let findMatchingHandler = _findMatchingHandler
const matching_mocks = {
    set findMatchingHandler(mock) {
        findMatchingHandler = mock
    },
    get findMatchingHandler() {
        return _findMatchingHandler
    }
}

/**
 * Match a request URL against a handler URL pattern
 * @param {?(string | RegExp)} handlerUrl - Handler URL pattern
 * @param {string} requestUrl - Request URL to match
 * @param {(string | null)} namespace - Namespace to prepend to handler URL
 * @returns {boolean} True if URL matches
 */
function matchUrl(handlerUrl, requestUrl, namespace) {
    if (!handlerUrl) {
        return true
    }

    let result = false
    if (handlerUrl instanceof RegExp) {
        let pattern = handlerUrl
        if (namespace) {
            namespace = namespace.replace(/(\/+)$/, '')
            const patternSource = handlerUrl.source.replace(/^\^?/, `^(?:${namespace})\/?`)
            pattern = new RegExp(patternSource, handlerUrl.flags)
        }
        result = pattern.test(requestUrl)
    } else {
        let effectiveUrlPattern = String(handlerUrl)

        if (namespace) {
            effectiveUrlPattern = [
                namespace.replace(/(\/+)$/, ''),
                handlerUrl.replace(/^(\/+)/, '')
            ].join('/')
        }

        if (effectiveUrlPattern.indexOf('*') < 0) {
            result = effectiveUrlPattern === requestUrl
        } else {
            effectiveUrlPattern = effectiveUrlPattern
                .replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&')
                .replace(/\*/g, "[A-Za-z0-9\\-\\._~:\\/?#\\[\\]@!\\$&'()*+,;%=]+")
            result = new RegExp(effectiveUrlPattern).test(requestUrl)
        }
    }

    if (result) {
        getLogger().debug(`Mock handler matched URL of request.`, namespace, handlerUrl, requestUrl)
    }
    return result
}

/**
 * Match request data against handler data pattern
 * @param {?DataMatcher} handlerData - Handler data pattern
 * @param {(string | RequestData)} requestData - Request data to match
 * @returns {boolean} True if data matches
 */
function matchData(handlerData, requestData) {
    if (typeof handlerData === 'undefined') {
        return true
    }

    let valid = false

    if (typeof handlerData === 'function') {
        valid = handlerData(requestData)
    } else if (handlerData === requestData) {
        valid = true
    } else if (handlerData instanceof RegExp) {
        valid = handlerData.test(String(requestData))
    } else if (typeof handlerData === 'string') {
        valid = handlerData === requestData
    } else if (Array.isArray(handlerData)) {
        if (!Array.isArray(requestData) || handlerData.length !== requestData.length) {
            valid = false
        } else {
            valid = !handlerData.filter((v) => !requestData.includes(v)).length
        }
    } else if (handlerData && typeof handlerData === 'object') {
        let requestDataObject = requestData
        if (typeof requestDataObject === 'string') {
            requestDataObject = getQueryParams(requestDataObject)
        }

        valid = true
        const keys = Object.keys(handlerData)
        for (let i = 0, l = keys.length; i < l; ++i) {
            const mockValue = handlerData[keys[i]]
            const actualValue = requestDataObject && requestDataObject[keys[i]]
            if (actualValue === undefined) {
                valid = false
            } else if (mockValue instanceof RegExp && typeof actualValue === 'string') {
                valid = valid && mockValue.test(actualValue)
            } else if (
                Array.isArray(mockValue) &&
                Array.isArray(actualValue) &&
                mockValue.length === actualValue.length
            ) {
                valid = valid && !mockValue.filter((v) => !actualValue.includes(v)).length
            } else if (typeof mockValue === 'object' && typeof actualValue === 'object') {
                valid = valid && matchData(mockValue, actualValue)
            } else if (typeof mockValue === 'function') {
                valid = valid && mockValue(actualValue)
            } else if (mockValue !== actualValue) {
                valid = false
            }
        }
    }

    if (valid) {
        getLogger().debug(`Mock handler matched data of request.`, handlerData, requestData)
    }
    return valid
}

/**
 * Match request headers against handler header requirements
 * @param {?Object.<string, string>} handlerHeaders - Handler header requirements
 * @param {?Object.<string, string>} requestHeaders - Request headers to match
 * @returns {boolean} True if headers match
 */
function matchHeaders(handlerHeaders, requestHeaders) {
    if (!handlerHeaders) {
        return true
    }
    if (typeof handlerHeaders !== 'object') {
        return false
    }

    let result = true

    const lowercaseRequestHeaders = {}
    Object.keys(requestHeaders || {}).forEach((name) => {
        lowercaseRequestHeaders[name.toLowerCase()] = name
    })
    const handlerHeaderNames = Object.keys(handlerHeaders)

    for (let i = 0, l = handlerHeaderNames.length; i < l; ++i) {
        const mockValue = handlerHeaders[handlerHeaderNames[i]]
        const actualValue =
            requestHeaders &&
            requestHeaders[lowercaseRequestHeaders[handlerHeaderNames[i].toLowerCase()]]
        if (typeof mockValue !== 'string') {
            result = false
        } else if (!lowercaseRequestHeaders[handlerHeaderNames[i].toLowerCase()]) {
            result = false
        } else if (mockValue !== actualValue) {
            result = false
        }
    }

    if (result) {
        getLogger().debug(
            `Mock handler matched headers of request.`,
            handlerHeaders,
            requestHeaders
        )
    }
    return result
}

/**
 * Match HTTP method (type) against handler type
 * @param {(HTTPMethod | undefined)} handlerMethod - Handler HTTP method
 * @param {string} requestMethod - Actual request HTTP method
 * @returns {boolean} True if method matches
 */
function matchMethod(handlerMethod, requestMethod) {
    const result =
        !handlerMethod ||
        String(handlerMethod).toUpperCase() === String(requestMethod).toUpperCase()

    if (result) {
        getLogger().debug(`Mock handler matched method of request.`, handlerMethod, requestMethod)
    }
    return result
}

/* eslint-disable jsdoc/check-types */
/**
 * Parse the provided query string into a hash of name-value pairs,
 * including generating an array for duplicate query param names.
 * @private
 * @param {string} queryString - A well formatted query string
 * @returns {Object.<string, (string | string[])>} A hash of the query params
 */
function getQueryParams(queryString) {
    const params = {}
    String(queryString)
        .split(/&/)
        .map((p) => {
            return decodeURIComponent(p.replace(/\+/g, ' ')).split(/=/)
        })
        .forEach((param) => {
            if (params[param[0]]) {
                // this is an array query param (more than one entry in query)
                if (!Array.isArray(params[param[0]])) {
                    params[param[0]] = [params[param[0]]]
                }
                params[param[0]].push(param[1])
            } else {
                params[param[0]] = param[1]
            }
        })

    return params
}
/* eslint-enable jsdoc/check-types */

;// ./src/xhr.mjs
/**
 * Mock XHR object creation and response simulation
 * @private
 * @module xhr
 */

/**
 * @typedef {import('./typedefs.mjs').MockHandler} MockHandler
 * @typedef {import('./typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 * @typedef {import('./typedefs.mjs').MockXHR} MockXHR
 */






const READYSTATE = { unsent: 0, opened: 1, headers: 2, loading: 3, done: 4 }

/**
 * Create a mock XMLHttpRequest object
 * @alias xhr.createMockXHR
 * @function createMockXHR
 * @param {MockHandler} mockHandler - Original mock handler configuration object
 * @param {JQueryAjaxSettings} requestSettings - jQuery AJAX request settings
 * @returns {MockXHR} Mock XHR object suitable for inserting into a jQuery.ajax() call
 */
function _createMockXHR(mockHandler, requestSettings) {
    const allMockSettings = { ...getSettings(), ...mockHandler }

    if (!allMockSettings.headers) {
        allMockSettings.headers = {}
    }
    if (!requestSettings.headers) {
        requestSettings.headers = {}
    }
    if (allMockSettings.contentType) {
        allMockSettings.headers['content-type'] = allMockSettings.contentType
    }

    const mockXHR = {
        status: -1,
        statusText: '',
        readyState: READYSTATE.unsent,
        open: function open() {
            this.readyState = READYSTATE.opened
        },
        send: function send() {
            sendXHR.call(this, allMockSettings, requestSettings)
        },
        abort: function abort() {
            clearTimeout(this.responseTimer)
        },
        setRequestHeader: function (header, value) {
            requestSettings.headers[header] = value
        },
        getResponseHeader: function (header) {
            // 'Last-modified', 'Etag', 'content-type' are all checked by jQuery
            if (allMockSettings.headers && allMockSettings.headers[header]) {
                return allMockSettings.headers[header]
            } else if (header.toLowerCase() === 'last-modified') {
                return allMockSettings.lastModified || new Date().toString()
            } else if (header.toLowerCase() === 'etag') {
                return String(allMockSettings.etag)
            } else if (header.toLowerCase() === 'content-type') {
                return allMockSettings.contentType
            }
        },
        getAllResponseHeaders: function () {
            // since jQuery 1.9 responseText type has to match contentType
            if (allMockSettings.contentType) {
                allMockSettings.headers['content-type'] = allMockSettings.contentType
            }
            return Object.entries(allMockSettings.headers)
                .map((entry) => {
                    return `${entry[0]}: ${entry[1]}`
                })
                .join('\n')
        }
    }

    getLogger().debug(`Generated mock XHR for mocked request to ${requestSettings.url}`, mockXHR)
    return mockXHR
}

// Support dependency injection
let createMockXHR = _createMockXHR
const xhr_mocks = {
    set createMockXHR(mock) {
        createMockXHR = mock
    },
    get createMockXHR() {
        return _createMockXHR
    }
}

/**
 * Do the XHR send() and generate a mock response on the MockXHR object
 * @private
 * @param {MockHandler} mockHandler - The mock handler being used
 * @param {JQueryAjaxSettings} requestSettings - The jQuery request settings for this ajax call
 * @returns {void}
 */
function sendXHR(mockHandler, requestSettings) {
    const mockXHR = this

    const processRequest = function () {
        mockXHR.readyState = READYSTATE.loading

        if (typeof mockHandler.response === 'function') {
            // With 2 named arguments in the response property, we assume an async callback
            if (mockHandler.response.length === 2) {
                mockHandler.response(requestSettings, () => {
                    generateResponse(mockXHR, mockHandler, requestSettings)
                })
                return
            } else {
                mockHandler.response(requestSettings)
            }
        }

        generateResponse(mockXHR, mockHandler, requestSettings)
    }

    if (typeof mockHandler.proxy === 'string' && mockHandler.proxy.length) {
        getLogger().debug(
            `Sending proxy ajax request for mock data to ${mockHandler.proxy}`,
            mockHandler,
            requestSettings
        )

        realAjaxCall({
            global: false,
            url: mockHandler.proxy,
            type: mockHandler.proxyMethod || mockHandler.proxyType || 'GET',
            data: mockHandler.data,
            xhr: requestSettings.xhr || null,
            async: false,
            // If the underlying (mocked) ajax request is doing a `script` call,
            // we need to get the script in plain text so it can be run by jQuery later
            dataType:
                requestSettings.dataType === 'script' ? 'text/plain' : requestSettings.dataType,
            complete: function (xhr) {
                // Fix for bug #105
                // jQuery will convert the text to XML for us, and if we use the actual responseXML here
                // then some other things don't happen, resulting in no data given to the 'success' cb
                mockHandler.responseXML = mockHandler.responseText = String(xhr.responseText)

                if (requestSettings.async === false) {
                    processRequest()
                } else {
                    this.responseTimer = setTimeout(
                        processRequest,
                        determineResponseTime(mockHandler.responseTime)
                    )
                }
            }
        })
    } else {
        if (requestSettings.async === false) {
            processRequest()
        } else {
            mockXHR.responseTimer = setTimeout(
                processRequest,
                determineResponseTime(mockHandler.responseTime)
            )
        }
    }
}

/**
 * Determine an appropriate response time for the mock request
 * @param {(number | number[])} responseTime - The responseTime option from the mock handler, if an array, must be length 2 (min, max)
 * @returns {number} The response time to be used
 */
function determineResponseTime(responseTime) {
    let actualResponseTime = getSettings().responseTime

    if (Array.isArray(responseTime) && responseTime.length === 2) {
        const one = Math.max(0, Number(responseTime[0]))
        const two = Math.max(0, Number(responseTime[1]))
        const min = Math.min(one, two)
        const max = Math.max(one, two)
        actualResponseTime = Math.floor(Math.random() * (max - min)) + min
    } else if (Number(responseTime)) {
        actualResponseTime = Number(responseTime)
    }

    getLogger().debug(`Response time for request will be: ${actualResponseTime}`)
    return actualResponseTime
}

/**
 * Mock the response by updating the MockXHR object for the request with various
 * response fields before passing control back to jQuery's onreadystatechange callback.
 * @private
 * @param {MockXHR} mockXHR - The mock XmlHTTPRequest object to modify
 * @param {MockHandler} mockHandler - The mock handler
 * @param {JQueryAjaxSettings} requestSettings - The ajax settings
 * @returns {void}
 */
function generateResponse(mockXHR, mockHandler, requestSettings) {
    mockXHR.status = mockHandler.status
    mockXHR.statusText = mockHandler.statusText
    mockXHR.readyState = READYSTATE.done

    if (requestSettings.dataType === 'json' && typeof mockHandler.responseText === 'object') {
        mockXHR.responseText = JSON.stringify(mockHandler.responseText)
    } else if (requestSettings.dataType === 'xml') {
        if (typeof mockHandler.responseXML === 'string') {
            mockXHR.responseXML = parseXML(mockHandler.responseXML)
            //in jQuery 1.9.1+, responseXML is processed differently and relies on responseText
            mockXHR.responseText = mockHandler.responseXML
        } else {
            mockXHR.responseXML = mockHandler.responseXML
        }
    } else if (typeof mockHandler.responseText === 'object' && mockHandler.responseText !== null) {
        // since jQuery 1.9 responseText type has to match contentType
        mockHandler.contentType = 'application/json'
        mockXHR.responseText = JSON.stringify(mockHandler.responseText)
    } else {
        mockXHR.responseText = String(mockHandler.responseText)
    }

    let statusIndex = -1
    if (Array.isArray(mockHandler.status)) {
        // Random status code assignment in mock handler
        statusIndex = Math.floor(Math.random() * mockHandler.status.length)
        mockXHR.status = mockHandler.status[statusIndex]
    } else {
        mockXHR.status = Number(mockHandler.status) || getSettings().status
    }

    if (Array.isArray(mockHandler.statusText) && statusIndex > -1) {
        mockXHR.statusText = mockHandler.statusText[statusIndex] || ''
    } else if (Array.isArray(mockHandler.statusText)) {
        mockXHR.statusText = mockHandler.statusText[0] || ''
    } else {
        mockXHR.statusText = String(mockHandler.statusText)
    }

    getLogger().debug(`Mock response generated for request to ${requestSettings.url}`, mockXHR)

    // jQuery 2.0 renamed onreadystatechange to onload
    const onReady = mockXHR.onload || mockXHR.onreadystatechange

    if (typeof onReady === 'function') {
        if (mockHandler.isTimeout) {
            mockXHR.status = -1
        }
        onReady.call(mockXHR, mockHandler.isTimeout ? 'timeout' : undefined)
    }
}

/**
 * Parse an XML string into a document
 * @private
 * @param {string} xml - The xml string to parse
 * @returns {object} The DOM XML object
 * @throws {TypeError}
 */
function parseXML(xml) {
    const jq = (0,lib/* getJQuery */.vl)()
    const DocumentParser = (0,lib/* getDOMParser */.ab)()
    try {
        const xmlDoc = new DocumentParser().parseFromString(xml, 'text/xml')
        if (jq.isXMLDoc(xmlDoc)) {
            const err = jq('parsererror', xmlDoc)
            if (err.length === 1) {
                throw new TypeError(`Error: ${jq(xmlDoc).text()}`)
            }
        } else {
            throw new TypeError('Unable to parse XML')
        }
        return xmlDoc
    } catch (err) {
        const msg = `${err.name}: ${err.message}`
        jq(document).trigger('xmlParseError', [msg])
        throw new TypeError(msg)
    }
}

;// ./src/jsonp.mjs
/**
 * JSONP mock handling module
 * @private
 * @module jsonp
 */

/**
 * @typedef {import('./typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 * @typedef {import('./typedefs.mjs').MockHandler} MockHandler
 * @typedef {import('./typedefs.mjs').JSONPCallback} JSONPCallback
 * @typedef {import('./typedefs.mjs').Deferred} Deferred
 */






const CALLBACK_REGEX = /=\?(&|$)/
const URL_PROTOCOL_REGEX = /^(\w+:)?\/\/([^\/?#]+)/

// Counter for generating unique JSONP callback names
let jsonpCallbackCounter = Date.now()

/**
 * Process a JSONP mock request
 * @param {JQueryAjaxSettings} requestSettings - Request settings to process
 * @param {MockHandler} mockHandler - Mock handler configuration
 * @param {JQueryAjaxSettings} origSettings - Original request settings
 * @returns {Deferred | boolean | null} Deferred object or true if handled, or null if not handled
 */
function processJsonpMock(requestSettings, mockHandler, origSettings) {
    getLogger().log(``)

    appendCallbackParameter(requestSettings)

    requestSettings.dataType = 'json'

    if (
        CALLBACK_REGEX.test(requestSettings.url) ||
        (requestSettings.data && CALLBACK_REGEX.test(requestSettings.data))
    ) {
        createCallback(requestSettings, mockHandler, origSettings, triggerSuccess, triggerComplete)

        requestSettings.dataType = 'script'

        if (
            requestSettings.method.toUpperCase() === 'GET' &&
            isRemoteRequest(requestSettings.url)
        ) {
            return executeJsonpRequest(requestSettings, mockHandler, origSettings)
        }
    }
    return null
}

/**
 * Append the required callback parameter to the request URL or data
 * @private
 * @param {JQueryAjaxSettings} requestSettings - Request settings to modify
 */
function appendCallbackParameter(requestSettings) {
    const callbackParam = requestSettings.jsonp || 'callback'

    if (requestSettings.method.toUpperCase() === 'GET') {
        if (!CALLBACK_REGEX.test(requestSettings.url)) {
            const separator = /\?/.test(requestSettings.url) ? '&' : '?'
            requestSettings.url += `${separator}${callbackParam}=?`
        }
    } else if (!requestSettings.data || !CALLBACK_REGEX.test(requestSettings.data)) {
        const prefix = requestSettings.data ? `${requestSettings.data}&` : ''
        requestSettings.data = `${prefix}${callbackParam}=?`
    }
}

/**
 * Create and register a JSONP callback function
 * @private
 * @param {JQueryAjaxSettings} requestSettings - Request settings to modify
 * @param {MockHandler} mockHandler - Mock handler configuration
 * @param {JQueryAjaxSettings} origSettings - Original request settings
 * @param {JSONPCallback} onSuccess - Success callback
 * @param {JSONPCallback} onComplete - Complete callback
 * @returns {void}
 */
function createCallback(requestSettings, mockHandler, origSettings, onSuccess, onComplete) {
    const callbackContext = origSettings?.context || requestSettings.context || requestSettings
    let callbackName = `jsonp${jsonpCallbackCounter++}`
    if (typeof requestSettings.jsonpCallback === 'string') {
        callbackName = requestSettings.jsonpCallback
    }

    if (requestSettings.data) {
        requestSettings.data = String(requestSettings.data).replace(
            CALLBACK_REGEX,
            `=${callbackName}$1`
        )
    }
    requestSettings.url = requestSettings.url.replace(CALLBACK_REGEX, `=${callbackName}$1`)

    window[callbackName] =
        window[callbackName] ||
        function () {
            onSuccess(requestSettings, callbackContext, mockHandler)
            onComplete(requestSettings, callbackContext)
            delete window[callbackName]
        }

    requestSettings.jsonpCallback = callbackName
}

/**
 * Check if the request is a remote JSONP request
 * @private
 * @param {string} url - Request URL
 * @returns {boolean} True if remote JSONP request
 */
function isRemoteRequest(url) {
    const parts = URL_PROTOCOL_REGEX.exec(url)
    return !!(
        parts &&
        ((parts[1] && parts[1] !== window.location.protocol) || parts[2] !== window.location.host)
    )
}

/**
 * Execute a JSONP request with the mock handler
 * @private
 * @param {JQueryAjaxSettings} requestSettings - Request settings
 * @param {MockHandler} mockHandler - Mock handler configuration
 * @param {JQueryAjaxSettings} origSettings - Original request settings
 * @returns {object | null} jQuery Deferred object or null
 */
function executeJsonpRequest(requestSettings, mockHandler, origSettings) {
    getLogger().log('Performing JSONP request', mockHandler, requestSettings, origSettings)

    const jq = (0,lib/* getJQuery */.vl)()
    const callbackContext = origSettings?.context || requestSettings
    const deferred = new jq.Deferred()

    if (typeof mockHandler.response === 'function') {
        getLogger().debug(`Calling dynamic "response" function for JSONP mock handler`, mockHandler)
        mockHandler.response(origSettings)
    } else if (typeof mockHandler.responseText === 'object') {
        getLogger().debug(`Performing eval on JSONP mock responseText object`, mockHandler)
        jq.globalEval(`(${JSON.stringify(mockHandler.responseText)})`)
    } else if (mockHandler.proxy) {
        getLogger().debug(`Performing JSONP proxy request to:  ${mockHandler.proxy}`, mockHandler)
        realAjaxCall({
            global: false,
            url: mockHandler.proxy,
            method: mockHandler.proxyMethod || mockHandler.proxyType || 'GET',
            data: mockHandler.data || null,
            xhr: requestSettings.xhr || null,
            dataType:
                requestSettings.dataType === 'script' ? 'text/plain' : requestSettings.dataType,
            complete: function (xhr) {
                jq.globalEval(`(${xhr.responseText})`)
                completeJsonpCall(
                    requestSettings,
                    { ...mockHandler, responseText: xhr.responseText },
                    callbackContext,
                    deferred
                )
            }
        })
        return deferred
    } else {
        getLogger().debug(`Performing eval on JSONP mock responseText string`, mockHandler)
        const responseValue =
            typeof mockHandler.responseText === 'string'
                ? `"${mockHandler.responseText}"`
                : mockHandler.responseText
        jq.globalEval(`(${responseValue})`)
    }

    completeJsonpCall(requestSettings, mockHandler, callbackContext, deferred)
    return deferred
}

/**
 * Complete a JSONP call after the response is ready
 * @private
 * @param {JQueryAjaxSettings} requestSettings - Request settings
 * @param {MockHandler} mockHandler - Mock handler configuration
 * @param {object} callbackContext - Context for callbacks
 * @param {object | null} deferred - jQuery Deferred object (if available)
 * @returns {void}
 */
function completeJsonpCall(requestSettings, mockHandler, callbackContext, deferred) {
    const delay = determineResponseTime(mockHandler.responseTime)

    setTimeout(() => {
        triggerSuccess(requestSettings, callbackContext, mockHandler)
        triggerComplete(requestSettings, callbackContext)

        if (deferred) {
            let json = null
            try {
                json = JSON.parse(mockHandler.responseText)
            } catch (err) {
                /* we're okay if this fails, just send back the raw responseText */
            }

            getLogger().debug(
                `Resolving JSONP Deferred object with response`,
                json || mockHandler.responseText
            )
            deferred.resolveWith(callbackContext, [json || mockHandler.responseText])
        }
    }, delay)
}

/**
 * Trigger success callbacks for JSONP request
 * @private
 * @param {JQueryAjaxSettings} requestSettings - Request settings
 * @param {object} callbackContext - Context for callbacks
 * @param {MockHandler} mockHandler - Mock handler configuration
 * @returns {void}
 */
function triggerSuccess(requestSettings, callbackContext, mockHandler) {
    const jq = (0,lib/* getJQuery */.vl)()
    if (typeof requestSettings.success === 'function') {
        requestSettings.success.call(callbackContext, mockHandler.responseText || '', 'success', {})
    }

    if (requestSettings.global) {
        const eventTarget = requestSettings.context ? jq(requestSettings.context) : jq.event
        eventTarget.trigger('ajaxSuccess', [{}, requestSettings])
    }
}

/**
 * Trigger complete callbacks for JSONP request
 * @private
 * @param {JQueryAjaxSettings} requestSettings - Request settings
 * @param {object} callbackContext - Context for callbacks
 * @returns {void}
 */
function triggerComplete(requestSettings, callbackContext) {
    const jq = (0,lib/* getJQuery */.vl)()
    if (typeof requestSettings.complete === 'function') {
        requestSettings.complete.call(
            callbackContext,
            { statusText: 'success', status: 200 },
            'success'
        )
    }

    if (requestSettings.global) {
        const eventTarget = requestSettings.context ? jq(requestSettings.context) : jq.event
        eventTarget.trigger('ajaxComplete', [{}, requestSettings])
    }

    // Handle the global AJAX counter
    if (requestSettings.global && jq.active) {
        jq.active--
        if (jq.active === 0) {
            jq.event.trigger('ajaxStop')
        }
    }
}

;// ./src/core.mjs
/**
 * Core mockjax API functions
 * @private
 * @module core
 */

/**
 * @typedef {import('./typedefs.mjs').MockHandler} MockHandler
 * @typedef {import('./typedefs.mjs').DynamicMockHandler} DynamicMockHandler
 * @typedef {import('./typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 * @typedef {import('./typedefs.mjs').AjaxCallbackType} AjaxCallbackType
 * @typedef {import('./typedefs.mjs').AjaxCallback} AjaxCallback
 * @typedef {import('./typedefs.mjs').jqXHR} jqXHR
 */









/**
 * Array of registered mock handlers
 * @private
 * @type {MockHandler[]}
 */
const mockHandlers = []

/* eslint-disable jsdoc/check-types */
/**
 * Hash of all handler objects by UUID
 * @private
 * @type {Object.<string, MockHandler>}
 */
/* eslint-enable jsdoc/check-types */
const mockHandlerLookup = {}

/**
 * Array of AJAX call settings objects with a "mocked" switch
 * @private
 * @type {Array.<JQueryAjaxSettings>}
 */
const retainedAjaxCalls = []

let settingsValidated = false

/**
 * Make a real jquery ajax() call, ignoring any mock handling
 * @private
 * @param {(string | JQueryAjaxSettings)} url - The request URL or ajax settings object
 * @param {?JQueryAjaxSettings} settings - Optionally pass in jQuery Ajax settings (can also be passed as the first argument)
 * @returns {jqXHR} The jQuery Ajax XHR object
 */
function realAjaxCall(url, settings) {
    const jq = (0,lib/* getJQuery */.vl)()
    getLogger().debug(`Calling jQuery ajax method on ${url}`)
    return jq._ajax.apply(jq, [url, settings])
}

/**
 * Register a mock AJAX handler
 * @alias "$.mockjax"
 * @global
 * @param {(MockHandler | MockHandler[] | DynamicMockHandler)} options - Mock handler options, array of options, or a function that will return options
 * @returns {(string | string[])} Handler ID(s) generated
 * @throws {TypeError} If settings are invalid
 */
function registerMockjaxHandler(options) {
    // We only do this once per load of Mockjax (the the first handler is registered)
    if (!settingsValidated) {
        validateSettings()
        settingsValidated = true
    }

    options = options || {}

    if (Array.isArray(options)) {
        return options.map((handlerSettings) => registerMockjaxHandler(handlerSettings))
    }

    if (typeof options === 'object') {
        options.method = options.method || options.type
        options.responseHeaders
    }

    // Validate options
    validateHandlerOptions(options)

    // Create handler object
    const mockHhandler = typeof options === 'function' ? options : { ...options }
    mockHhandler.id = (0,utils/* generateUUID */.l)()
    mockHhandler.fired = false
    mockHhandler.registeredAt = Date.now()

    if (mockHhandler.headers && typeof mockHhandler.headers === 'object') {
        mockHhandler.responseHeaders = mockHhandler.headers
    }

    mockHandlers.push(mockHhandler)
    mockHandlerLookup[mockHhandler.id] = mockHhandler

    getLogger().info('Registered new mock handler:', mockHhandler)

    return mockHhandler.id
}

/**
 * Intercept an AJAX request, find matching handler, and construct the
 * mock request, if applicable. Note that this method matches the
 * signature of jQuery's `ajax` method, so the first argument can be
 * a URL _or_ the full ajax settings object.
 * @private
 * @param {(string | JQueryAjaxSettings)} url - The request URL or ajax settings object
 * @param {?JQueryAjaxSettings} origSettings - Optionally pass in jQuery Ajax settings (can also be passed as the first argument)
 * @returns {jqXHR} The jqXHR object used in the request. Note that this will be the real jQuery jqXHR object if the call was not mocked
 */
function mockAjaxCall(url, origSettings) {
    const jq = (0,lib/* getJQuery */.vl)()

    let tempSettings = {}

    // If url is an object, simulate pre-1.5 signature
    if (typeof url === 'object') {
        tempSettings = url
    } else if (origSettings && typeof origSettings === 'object') {
        tempSettings = origSettings
        tempSettings.url = url || origSettings.url
    } else {
        tempSettings.url = url
    }

    // Extend the original settings for the request to include defaults
    const requestSettings = jq.ajaxSetup({}, tempSettings)

    // Standardize HTTP method
    requestSettings.type = requestSettings.method || requestSettings.type
    requestSettings.method = requestSettings.type

    getLogger().debug('Ajax call intercepted:', requestSettings.url, origSettings)

    const mockHandler = findMatchingHandler(mockHandlers, requestSettings)

    requestSettings.mocked = mockHandler ? true : false
    requestSettings.mockHandlerId = mockHandler ? mockHandler.id : null

    retainAjaxCall(requestSettings)

    if (!mockHandler) {
        getLogger().debug('No mock handler matched to request', requestSettings)
        if (getSettings().throwUnmocked === true) {
            throw new Error(`AJAX not mocked: ${requestSettings.url}`)
        } else {
            // Not mocked, trigger a normal ajax request
            return realAjaxCall(url, origSettings)
        }
    }

    mockHandler.fired = true

    // HTTP Redirect handling
    if (
        (mockHandler.status === 301 || mockHandler.status === 302) &&
        getSettings().followRedirects === true &&
        (mockHandler.responseHeaders.Location || mockHandler.responseHeaders.location) &&
        (requestSettings.method.toUpperCase() === 'GET' ||
            requestSettings.method.toUpperCase() === 'HEAD')
    ) {
        return redirectMockedRequest(mockHandler, requestSettings)
    }

    getLogger().info(
        `Mocking ${requestSettings.method.toUpperCase()} call to ${requestSettings.url}`,
        mockHandler,
        requestSettings
    )

    if (
        Number(jq.fn.jquery.split('.')[0]) > 3 &&
        (requestSettings.dataType?.toUpperCase() === 'JSONP' ||
            requestSettings.dataType?.toUpperCase() === 'SCRIPT') &&
        !Object.keys(requestSettings.headers || {}).length
    ) {
        // In Jquery 4.0.0 they introduced a change that uses <script> tags in more situations,
        // specifically with the `dataType` "script" and `dataType` "jsonp".
        // Adding any header seems to bypass that, so we'll tack one on in these situations.
        // https://jquery.com/upgrade-guide/4.0/#breaking-change-script-tags-now-used-for-all-async-requests
        // https://github.com/jquery/jquery/commit/68b4ec59c8f290d680e9db4bc980655660817dd1
        requestSettings.headers = { 'X-mockjax': 'true' }
    }

    if (requestSettings.dataType?.toUpperCase() === 'JSONP') {
        const mockRequest = processJsonpMock(requestSettings, mockHandler, origSettings)
        if (mockRequest) {
            return mockRequest
        }
    }

    // We are mocking, so there will be no cross domain request, however, jQuery
    // aggressively pursues this if the domains don't match, so we need to
    // explicitly disallow it. (See #136)
    requestSettings.crossDomain = false

    // In the case of a timeout, we need to ensure an actual jQuery timeout
    // (That is, our reponse won't) return faster than the timeout setting.
    if (mockHandler.isTimeout === true) {
        if (mockHandler.responseTime > 1) {
            requestSettings.timeout = mockHandler.responseTime - 1
        } else {
            mockHandler.responseTime = 2
            requestSettings.timeout = 1
        }
    }

    const that = this
    ;['Success', 'Error', 'Complete'].forEach((action) => {
        if (typeof mockHandler[`onAfter${action}`] === 'function') {
            requestSettings[action.toLowerCase()] = overrideCallback(
                that,
                action,
                mockHandler,
                requestSettings
            )
        }
    })

    copyUrlParameters(mockHandler, requestSettings)

    // Now we call the real jQuery ajax() method, but with our own XHR
    return realAjaxCall({
        ...requestSettings,
        xhr: () => {
            return createMockXHR(mockHandler, requestSettings)
        }
    })
}

/**
 * Clear mock handler(s) by handler ID, RegExp, or String pattern
 * @deprecated Use clearAll(), clearById(id), or clearByUrl(url)
 * @global
 * @param {string|RegExp} [mechanism] - Handler ID, URL string, or URL RegExp
 * @returns {void}
 */
function clear(mechanism) {
    getLogger().warn(
        'The clear() method is deprecated. Use clearAll(), clearById(), or clearByUrl() instead.'
    )

    // Clear all handlers
    if (mechanism === undefined) {
        return clearAll()
    }

    // Clear by handler ID
    if (mockHandlerLookup[mechanism]) {
        return clearById(mechanism)
    }

    return clearByUrl(mechanism)
}

/**
 * Clear all mock handler(s)
 * @global
 * @returns {null} The number of cleared mock handlers
 */
function clearAll() {
    mockHandlers.length = 0
    const removed = Object.keys(mockHandlerLookup)
    for (const id in mockHandlerLookup) {
        delete mockHandlerLookup[id]
    }
    clearRetainedAjaxCalls(removed)
    getLogger().log(`Cleared all ${removed.length} mock handlers and retained mocked ajax calls.`)
    return removed.length
}

/**
 * Clear mock handler(s) by handler ID
 * @global
 * @param {string} [id] - Handler ID (UUID)
 * @returns {number} The number of cleared mock handlers (either 0 or 1, in this case)
 */
function clearById(id) {
    if (mockHandlerLookup[id]) {
        delete mockHandlerLookup[id]
        const index = mockHandlers.findIndex((h) => h.id === id)
        if (index !== -1) {
            mockHandlers.splice(index, 1)
            clearRetainedAjaxCalls([id])
        }
        getLogger().log(`Cleared mock handler ${id} and retained mocked ajax calls.`)
        return 1
    }
    return 0
}

/**
 * Clear mock handler(s) by URL String (exact match) or RegExp pattern
 * If the handler's url property is a RegExp, you can pass in a RegExp
 * that matches exactly (according to RegExp.toString())
 * @global
 * @param {string|RegExp} [urlOrPattern] - A string url path or url regexp
 * @returns {number} The number of cleared mock handlers
 */
function clearByUrl(urlOrPattern) {
    const removed = []
    for (let i = mockHandlers.length - 1; i > -1; --i) {
        if (
            urlOrPattern instanceof RegExp &&
            mockHandlers[i].url instanceof RegExp &&
            urlOrPattern.toString() === mockHandlers[i].url.toString()
        ) {
            removed.push(mockHandlers[i].id)
            mockHandlers.splice(i, 1)
        } else if (typeof mockHandlers[i].url === 'string') {
            if (urlOrPattern instanceof RegExp && urlOrPattern.test(mockHandlers[i].url)) {
                removed.push(mockHandlers[i].id)
                mockHandlers.splice(i, 1)
            } else if (typeof urlOrPattern === 'string' && urlOrPattern === mockHandlers[i].url) {
                removed.push(mockHandlers[i].id)
                mockHandlers.splice(i, 1)
            }
        }
    }
    removed.forEach((handlerId) => delete mockHandlerLookup[handlerId])
    clearRetainedAjaxCalls(removed)
    getLogger().log(
        `Cleared ${removed.length} mock handlers by URL and retained mocked ajax calls.`
    )
    return removed.length
}

/**
 * Get registered mock handlers by ID(s)
 * @global
 * @param {string[]} [ids] - Optional Array of handler IDs, or undefined for all
 * @returns {MockHandler[]} Array of handlers (null for invalid IDs)
 */
function handlers(ids) {
    if (!ids) {
        return mockHandlers.map((h) => {
            const cloned = (0,utils/* deepClone */.G)(h)
            cloned.clear = function () {
                return clearById(this.id)
            }
            return cloned
        })
    }

    return ids.map((id) => {
        const mockHandler = mockHandlerLookup[id]
        if (!mockHandler) {
            return null
        }
        const cloned = (0,utils/* deepClone */.G)(mockHandler)
        cloned.clear = function () {
            return clearById(this.id)
        }
        return cloned
    })
}

/**
 * Get a single mock handler by ID (deprecated)
 * @deprecated Use handlers([id]) instead
 * @global
 * @param {string} id - Handler ID
 * @returns {(MockHandler|null)} Handler or null
 */
function handler(id) {
    getLogger().warn('The handler(id) method is deprecated. Use handlers([id]) instead.')
    return handlers([id])[0]
}

/**
 * Get unfired mock handlers
 * @global
 * @returns {MockHandler[]} Array of unfired mock handlers
 */
function unfiredHandlers() {
    return mockHandlers
        .filter((h) => !h.fired)
        .map((h) => {
            const cloned = (0,utils/* deepClone */.G)(h)
            cloned.clear = function () {
                clearById(this.id)
            }
            return cloned
        })
}

/**
 * Get all mocked AJAX call records
 * @global
 * @returns {JQueryAjaxSettings[]} Array of mocked AJAX calls
 */
function mockedAjaxCalls() {
    return retainedAjaxCalls.filter((call) => call.mocked)
}

/**
 * Get all unmocked AJAX call records
 * @global
 * @returns {JQueryAjaxSettings[]} Array of unmocked AJAX calls
 */
function unmockedAjaxCalls() {
    return retainedAjaxCalls.filter((call) => !call.mocked)
}

/**
 * Clear all retained AJAX call records
 * @global
 * @param {?string[]} mockHandlerIds - An optional array of mock handler IDs to restrict clearing of retained ajax calls
 * @returns {number} The number of cleared ajax call settings
 */
function clearRetainedAjaxCalls(mockHandlerIds) {
    let removeCount = 0
    if (!mockHandlerIds) {
        removeCount = retainedAjaxCalls.length
        retainedAjaxCalls.length = 0
    } else {
        for (let i = retainedAjaxCalls.length - 1; i > -1; --i) {
            const call = retainedAjaxCalls[i]
            if (call.mocked === true && mockHandlerIds.includes(call.mockHandlerId)) {
                removeCount++
                retainedAjaxCalls.splice(i, 1)
            }
        }
    }
    getLogger().log(`Cleared ${removeCount} retained ajax calls.`)
    return removeCount
}

/**************************************/
/*         INTERNAL HELPERS           */
/**************************************/

/**
 * Validate mock handler settings
 * @private
 * @param {MockHandler} settings - Mock handler settings
 * @throws {TypeError} If settings are invalid
 * @returns {void}
 */
function validateHandlerOptions(settings) {
    if (typeof settings === 'function') {
        return
    }

    if (!settings || typeof settings !== 'object') {
        throw new TypeError('Mock handler settings must be an object.')
    }

    const messages = []

    if (!settings.url && !settings.data && !settings.requestHeaders && !settings.method) {
        messages.push(
            'A mock handler must have at least one of: url, data, requestHeaders, or method to match against.'
        )
    }

    if (settings.url && typeof settings.url !== 'string' && !(settings.url instanceof RegExp)) {
        messages.push('The url property must be a String or RegExp if it is set.')
    }

    if (
        settings.method &&
        !['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE', 'PATCH'].includes(
            settings.method.toUpperCase()
        )
    ) {
        messages.push('The method property must be a valid HTTP method if it is set.')
    }

    if (
        settings.data &&
        typeof settings.data !== 'string' &&
        typeof settings.data !== 'function' &&
        typeof settings.data !== 'object'
    ) {
        messages.push('The data property must be a String, Function, or Object if it is set.')
    }

    if (
        settings.requestHeaders &&
        (typeof settings.requestHeaders !== 'object' || Array.isArray(settings.requestHeaders))
    ) {
        messages.push(
            'The requestHeaders property must be a plain object of string names and values if it is set.'
        )
    } else {
        for (const key in settings.requestHeaders) {
            if (typeof key !== 'string' || typeof settings.requestHeaders[key] !== 'string') {
                messages.push(
                    'The requestHeaders property must be a plain object of string names and values if it is set.'
                )
                break
            }
        }
    }

    if (settings.namespace && typeof settings.namespace !== 'string') {
        messages.push('The namespace must be a string if it is set.')
    }

    if (settings.status !== undefined) {
        if (Array.isArray(settings.status)) {
            const invalidStatuses = settings.status.filter((s) => {
                return !Number.isInteger(s) || s < 100 || s > 599
            })
            if (invalidStatuses.length) {
                messages.push('All statuses must be integers between 100 and 599.')
            }
        } else if (
            !Number.isInteger(settings.status) ||
            settings.status < 100 ||
            settings.status > 599
        ) {
            messages.push('The status must be an integer between 100 and 599.')
        }
    }

    if (settings.statusText !== undefined) {
        if (Array.isArray(settings.statusText)) {
            if (!Array.isArray(settings.status)) {
                messages.push(
                    'The statusText property may only be an array if the status property is also an array.'
                )
            } else if (settings.statusText.length !== settings.status.length) {
                messages.push('The statusText array must be the same size as the status array.')
            }
        } else if (typeof settings.statusText !== 'string') {
            messages.push('The statusText must be a string or array of strings if it is set.')
        }
    }

    if (settings.responseTime !== undefined) {
        if (Array.isArray(settings.responseTime)) {
            if (
                settings.responseTime.length !== 2 ||
                !Number.isInteger(settings.responseTime[0]) ||
                settings.responseTime[0] < 0 ||
                !Number.isInteger(settings.responseTime[1]) ||
                settings.responseTime[1] < 0
            ) {
                messages.push(
                    'A responseTime range must be an array of 2 non-negitve integers ([min, max])'
                )
            }
        } else if (!Number.isInteger(settings.responseTime) || settings.responseTime < 0) {
            messages.push('The responseTime must be a non-negative integer if it is set.')
        }
    }

    if (settings.contentType !== undefined && typeof settings.contentType !== 'string') {
        messages.push('The contentType must be a string if it is set.')
    }

    if (settings.response && typeof settings.response !== 'function') {
        messages.push('The response property must be a function, string, or object if it is set.')
    }

    if (settings.responseXML && typeof settings.responseXML !== 'string') {
        messages.push('The responseXML must be a string if it is set.')
    }

    if (settings.proxy !== undefined && typeof settings.proxy !== 'string') {
        messages.push('The proxy must be a string if it is set.')
    }

    if (
        settings.proxyMethod !== undefined &&
        !['get', 'post', 'put', 'delete'].includes(String(settings.proxyMethod).toLowerCase())
    ) {
        messages.push('The proxyMethod must be a valid HTTP method if it is set.')
    } else if (
        settings.proxyType !== undefined &&
        !['get', 'post', 'put', 'delete'].includes(String(settings.proxyType).toLowerCase())
    ) {
        messages.push('The proxyType must be a valid HTTP method if it is set.')
    }

    if (
        settings.responseHeaders &&
        (typeof settings.responseHeaders !== 'object' || Array.isArray(settings.responseHeaders))
    ) {
        messages.push(
            'The responseHeaders property must be a plain object of string names and values if it is set.'
        )
    } else {
        for (const key in settings.responseHeaders) {
            if (typeof settings.responseHeaders[key] !== 'string') {
                messages.push(
                    'The responseHeaders property must be a plain object of string names and values if it is set.'
                )
                break
            }
        }
    }

    if (messages.length) {
        throw new TypeError(messages.join(' '))
    }
}

/**
 * Retain an AJAX call settings object and enforce retention limit
 * @private
 * @param {JQueryAjaxSettings} ajaxSettings - original jQuery Ajax call settings; note that this should already have the `mocked` and `mockHandlerId` properties set!
 * @returns {void}
 */
function retainAjaxCall(ajaxSettings) {
    let limit = getSettings().retainAjaxCalls

    if (limit === true) {
        limit = -1
    } else if (limit === false) {
        limit = 0
    }

    if (limit === 0) {
        return
    }

    const settings = { ...ajaxSettings, timestamp: Date.now() }
    retainedAjaxCalls.push(settings)
    getLogger().debug(`Retained ${ajaxSettings.mocked ? 'mocked ' : ''}ajax call.`, settings)

    if (limit > 0) {
        while (retainedAjaxCalls.length > limit) {
            const removed = retainedAjaxCalls.shift()
            getLogger().debug(
                `Removed oldest retained ajax call per "retainAjaxCalls" limit setting.`,
                removed
            )
        }
    }
}

/**
 * Generic function to override callback methods for use with ajax
 * callback options (onAfterSuccess, onAfterError, onAfterComplete)
 * @private
 * @param {object} context The original context that the callback should execute in (the value of `this`)
 * @param {AjaxCallbackType} action - The current event/action (success, error, complete)
 * @param {MockHandler} mockHandler - The mock handler for this request
 * @param {JQueryAjaxSettings} requestSettings - The request settings for this ajax call
 * @returns {AjaxCallback} The callback to be used after the ajax call
 */
function overrideCallback(context, action, mockHandler, requestSettings) {
    const origCallback = requestSettings[action.toLowerCase()]
    return (...args) => {
        if (typeof origCallback === 'function') {
            origCallback.apply(context || {}, args)
        }
        mockHandler[`onAfter${action}`](...[requestSettings, mockHandler, ...args])
    }
}

/**
 * Redirect the mocked request to the location in the mock handler's headers
 * @private
 * @param {MockHandler} mockHandler - The mock handler for this request
 * @param {JQueryAjaxSettings} requestSettings - The request settings for this ajax call
 * @returns {jqXHR} - The new jqXHR object for the redirection
 */
function redirectMockedRequest(mockHandler, requestSettings) {
    const newUrl = mockHandler.responseHeaders.Location || mockHandler.responseHeaders.location

    const redirectSettings = (0,lib/* getJQuery */.vl)().ajaxSetup({}, requestSettings)
    redirectSettings.url = newUrl
    redirectSettings.headers = { Referer: requestSettings.url }

    // Revert mockjax tracking for redirect
    redirectSettings.mocked = false
    redirectSettings.mockHandlerId = null
    redirectSettings.timestamp = null

    getLogger().log(
        `Following mock redirect from ${requestSettings.url} to ${newUrl}`,
        mockHandler,
        requestSettings,
        redirectSettings
    )

    return mockAjaxCall(newUrl, redirectSettings)
}

/**
 * Copies URL parameter values captured by a regular expression
 * during URL matching into the requestSettings `urlParams` property.
 * @private
 * @param {MockHandler} mockHandler - The mock handler for this request
 * @param {JQueryAjaxSettings} requestSettings - The request settings for this ajax call
 * @returns {void}
 */
function copyUrlParameters(mockHandler, requestSettings) {
    if (!(mockHandler.url instanceof RegExp)) {
        return
    }

    if (!Array.isArray(mockHandler.urlParams) || !mockHandler.urlParams.length) {
        return
    }

    const captures = mockHandler.url.exec(requestSettings.url)
    if (!captures) {
        return
    }

    captures.shift()

    const max = Math.min(captures.length, mockHandler.urlParams.length)
    const urlParams = {}
    for (let i = 0; i < max; ++i) {
        urlParams[mockHandler.urlParams[i]] = captures[i]
    }
    requestSettings.urlParams = urlParams

    getLogger().debug(
        `Added ${Object.keys(urlParams).length} urlParams to requestSettings from path.`,
        mockHandler.url,
        requestSettings.url,
        urlParams
    )
}

;// ./src/attach.mjs
/**
 * Attach - Attaches the Mockjax methods to jQuery
 * @private
 * @module attach
 */

/**
 * @typedef {import('./typedefs.mjs').Mockjax} Mockjax
 */






// Export public API


// Default export
/* harmony default export */ const attach = ({
    init,
    mockjax: registerMockjaxHandler,
    clear: clear,
    clearById: clearById,
    clearByUrl: clearByUrl,
    clearAll: clearAll,
    handler: handler,
    handlers: handlers,
    unfiredHandlers: unfiredHandlers,
    mockedAjaxCalls: mockedAjaxCalls,
    unmockedAjaxCalls: unmockedAjaxCalls,
    clearRetainedAjaxCalls: clearRetainedAjaxCalls,
    getSettings: getSettings,
    resetSettings: resetSettings,
    validateSettings: validateSettings,
    getLogger: getLogger
});

/**
 * A simple function to attach the mockjax object to jQuery along
 * with the full public API. This initialization will also switch
 * the default jQuery.ajax() method with our own mock implementation.
 * NOTE: this method is called automatically when "$" is available
 * globally, there is no need to call it outside of importing it
 * directly (such as for tests).
 * @returns {Mockjax} Mockjax The main mockjax function/object
 */
function init() {
    getLogger().info('Initializing Mockjax and adding methods to jQuery')
    const jq = (0,lib/* getJQuery */.vl)()

    jq._ajax = jq.ajax
    jq.ajax = mockAjaxCall

    jq.mockjaxSettings = getSettings()
    jq.mockjax = registerMockjaxHandler
    jq.mockjax.getLogger = getLogger
    jq.mockjax.getSettings = getSettings
    jq.mockjax.resetSettings = resetSettings
    jq.mockjax.validateSettings = validateSettings
    jq.mockjax.clear = clear
    jq.mockjax.clearById = clearById
    jq.mockjax.clearByUrl = clearByUrl
    jq.mockjax.clearAll = clearAll
    jq.mockjax.handler = handler
    jq.mockjax.handlers = handlers
    jq.mockjax.unfiredHandlers = unfiredHandlers
    jq.mockjax.mockedAjaxCalls = mockedAjaxCalls
    jq.mockjax.unmockedAjaxCalls = unmockedAjaxCalls
    jq.mockjax.clearRetainedAjaxCalls = clearRetainedAjaxCalls

    return jq.mockjax
}

// We can't test this properly in a unit test because we can't
// re-import the module after it's been imported. That means we
// can't inject our own global.$ before loading.
/* c8 ignore start */
if (typeof $ !== 'undefined') {
    init()
}
/* c8 ignore stop */

/******/ })()
;
return $.mockjax;}))