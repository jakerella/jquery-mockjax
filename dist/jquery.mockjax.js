/*!
 * jQuery Mockjax v3.0.0 - https://github.com/jakerella/jquery-mockjax
 * Build Date: 2026-03-12
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

// UNUSED EXPORTS: clear, clearAll, clearById, clearByUrl, clearRetainedAjaxCalls, default, getLogger, getSettings, handler, handlers, mockedAjaxCalls, mockjax, resetSettings, unfiredHandlers, unmockedAjaxCalls, validateSettings

;// ./src/settings.mjs
/**
 * Global mockjax settings with default values
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
    proxyType: 'GET',
    lastModified: null,
    etag: 'IJF@H#@923uf8023hFO@I#H#',
    headers: null, // Deprecated
    responseHeaders: {},
    matchInRegistrationOrder: true,
    followRedirects: true,
}

/**
 * Get all current global Mockjax settings
 * @returns {MockjaxSettings} The global mockjax settings
 */
function getSettings() {
    return $.mockjaxSettings || { ...DEFAULTS }
}

/**
 * Reset global Mockjax settings to their defaults
 * @returns {MockjaxSettings} The (reset) global mockjax settings
 */
function resetSettings() {
    $.mockjaxSettings = { ...DEFAULTS }
    return $.mockjaxSettings
}

/**
 * Validates that all global Mockjax settings are valid types
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
                (m) => typeof settings.logger[m] !== 'function',
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

    if (settings.proxyType !== null && typeof settings.proxyType !== 'string') {
        messages.push('The proxyType setting must be a string or null')
    }

    if (settings.lastModified !== null && typeof settings.lastModified !== 'string') {
        messages.push('The lastModified setting must be a date string or null')
    }

    if (settings.etag !== null && typeof settings.etag !== 'string') {
        messages.push('The etag setting must be a string or null')
    }

    const headersErrMessage =
        'If no null, the responseHeaders must be a simple object of string keys and values'
    if (typeof settings.responseHeaders === 'object' && settings.responseHeaders !== null) {
        const badHeaders = Object.keys(settings.responseHeaders).filter(
            (k) => typeof k !== 'string' || typeof settings.responseHeaders[k] !== 'string',
        )
        if (badHeaders.length) {
            messages.push(headersErrMessage)
        }
    } else if (typeof settings.responseHeaders !== null) {
        messages.push(headersErrMessage)
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
 * @module logger
 */



const DEFAULT_LOG_LEVEL = 2
const DEFAULT_LOG_LEVEL_METHODS = ['error', 'warn', 'info', 'log', 'debug']

class Logger {
    #level = DEFAULT_LOG_LEVEL
    #methods = DEFAULT_LOG_LEVEL_METHODS
    constructor(level, methods) {
        this.#level = level
        this.#methods = methods
        this.#methods.forEach((m) => {
            this[m] = function (...args) {
                return this.#writeLog(m, ...args)
            }
        })
    }

    #writeLog(level, ...elements) {
        if (this.#methods.indexOf(level) > this.#level) {
            return
        }
        window.console[level](...elements)
    }
}

/**
 * This will return the current logger implementation from $.mockjaxSettings
 * or a no-op version if that setting is null or otherwise not implemented
 * @returns {{[key: string]: import('./typedefs.mjs').LogMethod}} The current logger implementation
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
        settings.logger = new Logger(level, DEFAULT_LOG_LEVEL_METHODS)
    }
    return settings.logger
}

;// ./src/utils.mjs
/**
 * Utility functions for mockjax
 * @module utils
 */

/**
 * Generate a UUID using the Web Crypto API
 * @returns {string} RFC 4122 compliant UUID
 * @throws {Error} If crypto.randomUUID() is not available
 */
function generateUUID() {
    if (!crypto || typeof crypto.randomUUID !== 'function') {
        throw new Error('crypto.randomUUID() is not available. This browser is not supported.')
    }
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
        /* can't clone functions, so we'll do this the harad way */
    }

    if (obj === null || typeof obj !== 'object') {
        return obj
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => deepClone(item))
    }

    const clone = {}
    for (const key in obj) {
        clone[key] = deepClone(obj[key])
    }

    return clone
}

;// ./src/matching.mjs
/**
 * Handler matching logic for mockjax
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
 * @param {MockHandler[]} handlers - Array of registered handlers
 * @param {JQueryAjaxSettings} requestSettings - jQuery AJAX request settings
 * @returns {MockHandler|null} Matching handler or null
 */
function findMatchingHandler(handlers, requestSettings) {
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

    if (handlerUrl instanceof RegExp) {
        let pattern = handlerUrl
        if (namespace) {
            namespace = namespace.replace(/(\/+)$/, '')
            const patternSource = handlerUrl.source.replace(/^\^?/, `^(?:${namespace})\/?`)
            pattern = new RegExp(patternSource, handlerUrl.flags)
        }
        return pattern.test(requestUrl)
    } else {
        let effectiveUrlPattern = String(handlerUrl)

        if (namespace) {
            effectiveUrlPattern = [
                namespace.replace(/(\/+)$/, ''),
                handlerUrl.replace(/^(\/+)/, ''),
            ].join('/')
        }

        if (effectiveUrlPattern.indexOf('*') < 0) {
            return effectiveUrlPattern === requestUrl
        } else {
            effectiveUrlPattern = effectiveUrlPattern
                .replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&')
                .replace(/\*/g, "[A-Za-z0-9\\-\\._~:\\/?#\\[\\]@!\\$&'()*+,;%=]+")
            return new RegExp(effectiveUrlPattern).test(requestUrl)
        }
    }
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

    if (typeof handlerData === 'function') {
        return handlerData(requestData)
    }

    if (handlerData === requestData) {
        return true
    }

    if (handlerData instanceof RegExp && typeof requestData === 'string') {
        return handlerData.test(requestData)
    }

    if (typeof handlerData === 'string') {
        return handlerData === requestData
    }

    let valid = true
    if (handlerData && typeof handlerData === 'object') {
        let requestDataObject = requestData
        if (typeof requestDataObject === 'string') {
            requestDataObject = getQueryParams(requestDataObject)
        }

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
    return valid
}

/**
 * Match request headers against handler header requirements
 * @param {?{[key: string]: string}} handlerHeaders - Handler header requirements
 * @param {?{[key: string]: string}} requestHeaders - Request headers to match
 * @returns {boolean} True if headers match
 */
function matchHeaders(handlerHeaders, requestHeaders) {
    if (!handlerHeaders) {
        return true
    }
    if (typeof handlerHeaders !== 'object') {
        return false
    }

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
            return false
        } else if (!lowercaseRequestHeaders[handlerHeaderNames[i].toLowerCase()]) {
            return false
        } else if (mockValue !== actualValue) {
            return false
        }
    }

    return true
}

/**
 * Match HTTP method (type) against handler type
 * @param {(HTTPMethod | undefined)} handlerMethod - Handler HTTP method
 * @param {string} requestMethod - Actual request HTTP method
 * @returns {boolean} True if method matches
 */
function matchMethod(handlerMethod, requestMethod) {
    return !handlerMethod || handlerMethod.toUpperCase() === requestMethod.toUpperCase()
}

/**
 * Parse the provided query string into a hash of name-value pairs,
 * including generating an array for duplicate query param names.
 * @param {string} queryString - A well formatted query string
 * @returns {{[key: string]: (string | string[])}} A hash of the query params
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

;// ./src/xhr.mjs
/**
 * Mock XHR object creation and response simulation
 * @module xhr
 */

/**
 * @typedef {import('./typedefs.mjs').MockHandler} MockHandler
 * @typedef {import('./typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 * @typedef {import('./typedefs.mjs').MockXHR} MockXHR
 */




const READYSTATE = {
    unsent: 0,
    opened: 1,
    headers: 2,
    loading: 3,
    done: 4,
}

/**
 * Create a mock XMLHttpRequest object
 * @param {MockHandler} mockHandler - Original mock handler configuration object
 * @param {JQueryAjaxSettings} requestSettings - jQuery AJAX request settings
 * @returns {MockXHR} Mock XHR object suitable for inserting into a jQuery.ajax() call
 */
function createMockXHR(mockHandler, requestSettings) {
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

    return {
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
                return allMockSettings.etag || ''
            } else if (header.toLowerCase() === 'content-type') {
                return allMockSettings.contentType || 'text/plain'
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
        },
    }
}

/**
 * Do the XHR send() and generate a mock response on the MockXHR object
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
        // We're proxying this request and loading in an external file instead
        realAjaxCall({
            global: false,
            url: mockHandler.proxy,
            type: mockHandler.proxyType || 'GET',
            data: mockHandler.data,
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
                        determineResponseTime(mockHandler.responseTime),
                    )
                }
            },
        })
    } else {
        if (requestSettings.async === false) {
            processRequest()
        } else {
            mockXHR.responseTimer = setTimeout(
                processRequest,
                determineResponseTime(mockHandler.responseTime),
            )
        }
    }
}

/**
 * Determine an appropriate response time for the mock request
 * @param {(number | number[2])} responseTime - The responseTime option from the mock handler
 * @returns {number} The response time to be used
 */
function determineResponseTime(responseTime) {
    if (Array.isArray(responseTime) && responseTime.length === 2) {
        const one = Math.max(0, Number(responseTime[0]))
        const two = Math.max(0, Number(responseTime[1]))
        const min = Math.min(one, two)
        const max = Math.max(one, two)
        return Math.floor(Math.random() * (max - min)) + min
    } else if (Number(responseTime)) {
        return Number(responseTime)
    }
    return getSettings().responseTime
}

/**
 * Mock the response by updating the MockXHR object for the request with various
 * response fields before passing control back to jQuery's onreadystatechange callback.
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
        mockXHR.status = Number(mockHandler.status) || getSettings().status || 200
    }

    if (Array.isArray(mockHandler.statusText) && statusIndex > -1) {
        mockXHR.statusText = mockHandler.statusText[statusIndex] || ''
    } else if (Array.isArray(mockHandler.statusText)) {
        mockXHR.statusText = mockHandler.statusText[0] || ''
    } else {
        mockXHR.statusText = String(mockHandler.statusText)
    }

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
 * @param {string} xml - The xml string to parse
 * @returns {object} The DOM XML object
 * @throws {TypeError}
 */
function parseXML(xml) {
    try {
        const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml')
        if ($.isXMLDoc(xmlDoc)) {
            const err = $('parsererror', xmlDoc)
            if (err.length === 1) {
                throw new TypeError(`Error: ${$(xmlDoc).text()}`)
            }
        } else {
            throw new TypeError('Unable to parse XML')
        }
        return xmlDoc
    } catch (err) {
        const msg = err.name === undefined ? err : `${err.name}: ${err.message}`
        $(document).trigger('xmlParseError', [msg])
        throw new TypeError(msg)
    }
}

;// ./src/jsonp.mjs
/**
 * JSONP mock handling module
 * @module jsonp
 */

/**
 * @typedef {import('./typedefs.mjs').MockHandler} MockHandler
 * @typedef {import('./typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 * @typedef {import('./typedefs.mjs').JSONPCallback} JSONPCallback
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
 * @returns {object | boolean | null} Deferred object, true for handled, or null for not handled
 */
function processJsonpMock(requestSettings, mockHandler, origSettings) {
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
            const result = executeJsonpRequest(requestSettings, mockHandler, origSettings)
            return result || true
        }
    }
    return null
}

/**
 * Append the required callback parameter to the request URL or data
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
            `=${callbackName}$1`,
        )
    }
    requestSettings.url = requestSettings.url.replace(CALLBACK_REGEX, `=${callbackName}$1`)

    window[callbackName] =
        window[callbackName] ||
        function () {
            onSuccess(requestSettings, callbackContext, mockHandler)
            onComplete(requestSettings, callbackContext)

            window[callbackName] = undefined
            try {
                delete window[callbackName]
            } catch (e) {
                /* Ignore errors, this may already be gone */
            }
        }

    requestSettings.jsonpCallback = callbackName
}

/**
 * Check if the request is a remote JSONP request
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
 * @param {JQueryAjaxSettings} requestSettings - Request settings
 * @param {MockHandler} mockHandler - Mock handler configuration
 * @param {JQueryAjaxSettings} origSettings - Original request settings
 * @returns {object | null} jQuery Deferred object or null
 */
function executeJsonpRequest(requestSettings, mockHandler, origSettings) {
    const callbackContext = origSettings?.context || requestSettings
    const deferred = $.Deferred ? new $.Deferred() : null

    if (typeof mockHandler.response === 'function') {
        mockHandler.response(origSettings)
    } else if (typeof mockHandler.responseText === 'object') {
        $.globalEval(`(${JSON.stringify(mockHandler.responseText)})`)
    } else if (mockHandler.proxy) {
        realAjaxCall({
            global: false,
            url: mockHandler.proxy,
            type: mockHandler.proxyType,
            data: mockHandler.data,
            dataType:
                requestSettings.dataType === 'script' ? 'text/plain' : requestSettings.dataType,
            complete: function (xhr) {
                $.globalEval(`(${xhr.responseText})`)
                completeJsonpCall(requestSettings, mockHandler, callbackContext, deferred)
            },
        })
        return deferred
    } else {
        const responseValue =
            typeof mockHandler.responseText === 'string'
                ? `"${mockHandler.responseText}"`
                : mockHandler.responseText
        $.globalEval(`(${responseValue})`)
    }

    completeJsonpCall(requestSettings, mockHandler, callbackContext, deferred)
    return deferred
}

/**
 * Complete a JSONP call after the response is ready
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

            deferred.resolveWith(callbackContext, [json || mockHandler.responseText])
        }
    }, delay)
}

/**
 * Trigger success callbacks for JSONP request
 * @param {JQueryAjaxSettings} requestSettings - Request settings
 * @param {object} callbackContext - Context for callbacks
 * @param {MockHandler} mockHandler - Mock handler configuration
 * @returns {void}
 */
function triggerSuccess(requestSettings, callbackContext, mockHandler) {
    if (typeof requestSettings.success === 'function') {
        requestSettings.success.call(callbackContext, mockHandler.responseText || '', 'success', {})
    }

    if (requestSettings.global) {
        const eventTarget = requestSettings.context ? $(requestSettings.context) : $.event
        eventTarget.trigger('ajaxSuccess', [{}, requestSettings])
    }
}

/**
 * Trigger complete callbacks for JSONP request
 * @param {JQueryAjaxSettings} requestSettings - Request settings
 * @param {object} callbackContext - Context for callbacks
 * @returns {void}
 */
function triggerComplete(requestSettings, callbackContext) {
    if (typeof requestSettings.complete === 'function') {
        requestSettings.complete.call(
            callbackContext,
            { statusText: 'success', status: 200 },
            'success',
        )
    }

    if (requestSettings.global) {
        const eventTarget = requestSettings.context ? $(requestSettings.context) : $.event
        eventTarget.trigger('ajaxComplete', [{}, requestSettings])
    }

    // Handle the global AJAX counter
    if (requestSettings.global && $.active) {
        $.active--
        if ($.active === 0) {
            $.event.trigger('ajaxStop')
        }
    }
}

;// ./src/core.mjs
/**
 * Core mockjax API functions
 * @module core
 */

/**
 * @typedef {import('./typedefs.mjs').MockHandler} MockHandler
 * @typedef {import('./typedefs.mjs').DynamicMockHandler} DynamicMockHandler
 * @typedef {import('./typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 * @typedef {import('./typedefs.mjs').AjaxCallbackType} AjaxCallbackType
 * @typedef {import('./typedefs.mjs').AjaxCallback} AjaxCallback
 * @typedef {import('./typedefs.mjs').MockXHR} MockXHR
 */

// import { getLogger } from './logger.js'






// TODO: should this go in here??
const _ajax = $.ajax
$.extend({
    ajax: mockAjaxCall,
})

/**
 * Make a real $.ajax() call, ignoring any mock handling
 * @param {(string | JQueryAjaxSettings)} url - The request URL or ajax settings object
 * @param {?JQueryAjaxSettings} settings - Optionally pass in jQuery Ajax settings (can also be passed as the first argument)
 * @returns {MockXHR} The jQuery Ajax XHR object
 */
function realAjaxCall(url, settings) {
    return _ajax.apply($, [url, settings])
}

/**
 * Array of registered mock handlers
 * @type {Array[MockHandler]}
 */
const mockHandlers = []

/**
 * Hash of all handler objects by UUID
 * @type {{[key: string]: MockHandler}}
 */
const mockHandlerLookup = {}

/**
 * Array of AJAX call settings objects with a "mocked" switch
 * @type {Array.<JQueryAjaxSettings>}
 */
const retainedAjaxCalls = []

let settingsValidated = false

/**
 * Register a mock AJAX handler
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
    mockHhandler.id = generateUUID()
    mockHhandler.fired = false
    mockHhandler.registeredAt = Date.now()

    if (mockHhandler.headers && typeof mockHhandler.headers === 'object') {
        mockHhandler.responseHeaders = mockHhandler.headers
    }

    mockHandlers.push(mockHhandler)
    mockHandlerLookup[mockHhandler.id] = mockHhandler

    // TODO: update me
    // console.debug('Registered new handler:', {...handler})

    return mockHhandler.id
}

/**
 * Intercept an AJAX request, find matching handler, and construct the
 * mock request, if applicable. Note that this method matches the
 * signature of jQuery's `ajax` method, so the first argument can be
 * a URL _or_ the full ajax settings object.
 * @param {(string | JQueryAjaxSettings)} url - The request URL or ajax settings object
 * @param {?JQueryAjaxSettings} origSettings - Optionally pass in jQuery Ajax settings (can also be passed as the first argument)
 * @returns {MockXHR} The XHR object used in the request. Note that this will be the real jQuery jqXHR object if the call was not mocked
 */
function mockAjaxCall(url, origSettings) {
    let tempSettings = {}

    // If url is an object, simulate pre-1.5 signature
    if (typeof url === 'object') {
        tempSettings = url
    } else if (origSettings && typeof origSettings === 'object') {
        tempSettings = origSettings
        tempSettings.url = url || origSettings.url
    }

    // Extend the original settings for the request to include defaults
    const requestSettings = $.ajaxSetup({}, tempSettings)

    // Standardize HTTP method
    requestSettings.type = requestSettings.method || requestSettings.type
    requestSettings.method = requestSettings.type

    const mockHandler = findMatchingHandler(mockHandlers, requestSettings)

    requestSettings.mocked = mockHandler ? true : false
    requestSettings.mockHandlerId = mockHandler ? mockHandler.id : null

    retainAjaxCall(requestSettings)

    if (!mockHandler) {
        if (getSettings().throwUnmocked === true) {
            throw new Error(`AJAX not mocked: ${  requestSettings.url}`)
        } else {
            // Not mocked, trigger a normal ajax request
            return realAjaxCall(url, origSettings)
        }
    }

    mockHandler.fired = true

    // HTTP Redirect handling
    // TODO: make this work for other 300's and methods
    if (
        (mockHandler.status === 301 || mockHandler.status === 302) &&
        getSettings().followRedirects === true &&
        (mockHandler.responseHeaders.Location || mockHandler.responseHeaders.location) &&
        (requestSettings.method.toUpperCase() === 'GET' ||
            requestSettings.method.toUpperCase() === 'HEAD')
    ) {
        return redirectMockedRequest(mockHandler, requestSettings)
    }

    if (
        Number($.fn.jquery.split('.')[0]) > 3 &&
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

    // TODO: Do we need these in the mock handler?
    // mockHandler.cache = requestSettings.cache;
    // mockHandler.timeout = requestSettings.timeout;
    // mockHandler.global = requestSettings.global;

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
                requestSettings,
            )
        }
    })

    copyUrlParameters(mockHandler, requestSettings)

    // Now we call the real jQuery ajax() method, but with our own XHR
    return realAjaxCall({
        ...requestSettings,
        xhr: () => {
            return createMockXHR(mockHandler, requestSettings)
        },
    })
}

/**
 * Clear mock handler(s) by handler ID, RegExp, or String pattern
 * @deprecated Use clearAll(), clearById(id), or clearByUrl(url)
 * @param {string|RegExp} [mechanism] - Handler ID, URL string, or URL RegExp
 * @returns {void}
 */
function clear(mechanism) {
    console.warn(
        'The clear() method is deprecated. Use clearAll(), clearById(), or clearByUrl() instead.',
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
 * @returns {void}
 */
function clearAll() {
    mockHandlers.length = 0
    const removed = Object.keys(mockHandlerLookup)
    for (const id in mockHandlerLookup) {
        delete mockHandlerLookup[id]
    }
    clearRetainedAjaxCalls(removed)
}

/**
 * Clear mock handler(s) by handler ID
 * @param {string} [id] - Handler ID (UUID)
 * @returns {void}
 */
function clearById(id) {
    if (mockHandlerLookup[id]) {
        delete mockHandlerLookup[id]
        const index = mockHandlers.findIndex((h) => h.id === id)
        if (index !== -1) {
            mockHandlers.splice(index, 1)
            clearRetainedAjaxCalls([id])
        }
    }
}

/**
 * Clear mock handler(s) by URL String (exact match) or RegExp pattern
 * If the handler's url property is a RegExp, you can pass in a RegExp
 * that matches exactly (according to RegExp.toString())
 * @param {string|RegExp} [urlOrPattern] - A string url path or url regexp
 * @returns {void}
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
}

/**
 * Get registered mock handlers by ID(s)
 * @param {string[]} [ids] - Optional Array of handler IDs, or undefined for all
 * @returns {MockHandler[]} Array of handlers (null for invalid IDs)
 */
function handlers(ids) {
    if (!ids) {
        return mockHandlers.map((h) => {
            const cloned = deepClone(h)
            cloned.clear = function () {
                clearById(this.id)
            }
            return cloned
        })
    }

    return ids.map((id) => {
        const mockHandler = mockHandlerLookup[id]
        if (!mockHandler) {
            return null
        }
        const cloned = deepClone(mockHandler)
        cloned.clear = function () {
            clearById(this.id)
        }
        return cloned
    })
}

/**
 * Get a single mock handler by ID (deprecated)
 * @deprecated Use handlers([id]) instead
 * @param {string} id - Handler ID
 * @returns {(MockHandler|null)} Handler or null
 */
function handler(id) {
    console.warn('The handler(id) method is deprecated. Use handlers([id]) instead.')
    return handlers([id])[0]
}

/**
 * Get unfired mock handlers
 * @returns {MockHandler[]} Array of unfired mock handlers
 */
function unfiredHandlers() {
    return mockHandlers
        .filter((h) => !h.fired)
        .map((h) => {
            const cloned = deepClone(h)
            cloned.clear = function () {
                clearById(this.id)
            }
            return cloned
        })
}

/**
 * Get all mocked AJAX call records
 * @returns {JQueryAjaxSettings[]} Array of mocked AJAX calls
 */
function mockedAjaxCalls() {
    return retainedAjaxCalls.filter((call) => call.mocked)
}

/**
 * Get all unmocked AJAX call records
 * @returns {JQueryAjaxSettings[]} Array of unmocked AJAX calls
 */
function unmockedAjaxCalls() {
    return retainedAjaxCalls.filter((call) => !call.mocked)
}

/**
 * Clear all retained AJAX call records
 * @param {?string[]} mockHandlerIds - An optional array of mock handler IDs to restrict clearing of retained ajax calls
 * @returns {void}
 */
function clearRetainedAjaxCalls(mockHandlerIds) {
    if (!mockHandlerIds) {
        retainedAjaxCalls.length = 0
    } else {
        for (let i = retainedAjaxCalls.length - 1; i > -1; --i) {
            const call = retainedAjaxCalls[i]
            if (call.mocked === true && mockHandlerIds.includes(call.mockHandlerId)) {
                retainedAjaxCalls.splice(i, 1)
            }
        }
    }
}

/**************************************/
/*         INTERNAL HELPERS           */
/**************************************/

/**
 * Validate mock handler settings
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
            'A mock handler must have at least one of: url, data, requestHeaders, or method to match against.',
        )
    }

    if (settings.url && typeof settings.url !== 'string' && !(settings.url instanceof RegExp)) {
        messages.push('The url property must be a String or RegExp if it is set.')
    }

    if (
        settings.method &&
        !['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE', 'PATCH'].includes(
            settings.method.toUpperCase(),
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
            'The requestHeaders property must be a plain object of string names and values if it is set.',
        )
    } else {
        for (const key in settings.requestHeaders) {
            if (typeof key !== 'string' || typeof settings.requestHeaders[key] !== 'string') {
                messages.push(
                    'The requestHeaders property must be a plain object of string names and values if it is set.',
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
                    'The statusText property may only be an array if the status property is also an array.',
                )
            } else if (settings.statusText.length !== settings.status.length) {
                messages.push('The statusText array must be the same size as the status array.')
            }
        } else if (typeof settings.statusText !== 'string') {
            messages.push('The statusText must be a string if it is set.')
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
                    'A responseTime range must be an array of 2 non-negitve integers ([min, max])',
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
            'The responseHeaders property must be a plain object of string names and values if it is set.',
        )
    } else {
        for (const key in settings.responseHeaders) {
            if (typeof key !== 'string' || typeof settings.responseHeaders[key] !== 'string') {
                messages.push(
                    'The responseHeaders property must be a plain object of string names and values if it is set.',
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

    retainedAjaxCalls.push({ ...ajaxSettings, timestamp: Date.now() })

    if (limit > 0) {
        while (retainedAjaxCalls.length > limit) {
            retainedAjaxCalls.shift()
        }
    }
}

/**
 * Generic function to override callback methods for use with ajax
 * callback options (onAfterSuccess, onAfterError, onAfterComplete)
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
        mockHandler[`onAfter${  action}`](requestSettings)
    }
}

/**
 * Redirect the mocked request to the location in the mock handler's headers
 * @param {MockHandler} mockHandler - The mock handler for this request
 * @param {JQueryAjaxSettings} requestSettings - The request settings for this ajax call
 * @returns {MockXHR} - The new MockXHR object for the redirection
 */
function redirectMockedRequest(mockHandler, requestSettings) {
    const newUrl = mockHandler.responseHeaders.Location || mockHandler.responseHeaders.location

    const redirectSettings = $.ajaxSetup({}, requestSettings)
    redirectSettings.url = newUrl
    redirectSettings.headers = {
        // TODO: do 300's keep original headers? (this is what is in the v2.7 codebase)
        Referer: requestSettings.url,
    }

    // Revert mockjax tracking for redirect
    redirectSettings.mocked = false
    redirectSettings.mockHandlerId = null
    redirectSettings.timestamp = null

    return mockAjaxCall(newUrl, redirectSettings)
}

/**
 * Copies URL parameter values captured by a regular expression
 * during URL matching into the requestSettings `urlParams` property.
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
}

;// ./src/index.mjs
/**
 * Mockjax - Mock AJAX requests for testing
 * @module mockjax
 */





// Export public API


// Default export
/* harmony default export */ const src = ({
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
    getLogger: getLogger,
});

$.mockjaxSettings = getSettings()
$.mockjax = registerMockjaxHandler
$.mockjax.getLogger = getLogger
$.mockjax.resetSettings = resetSettings
$.mockjax.validateSettings = validateSettings
$.mockjax.clear = clear
$.mockjax.clearById = clearById
$.mockjax.clearByUrl = clearByUrl
$.mockjax.clearAll = clearAll
$.mockjax.handler = handler
$.mockjax.handlers = handlers
$.mockjax.unfiredHandlers = unfiredHandlers
$.mockjax.mockedAjaxCalls = mockedAjaxCalls
$.mockjax.unmockedAjaxCalls = unmockedAjaxCalls
$.mockjax.clearRetainedAjaxCalls = clearRetainedAjaxCalls

/******/ })()
;
return $.mockjax;}))