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

import { getLogger } from './logger.mjs'
import { getSettings, validateSettings } from './settings.mjs'
import { generateUUID, deepClone } from './utils.mjs'
import { findMatchingHandler } from './matching.mjs'
import { processJsonpMock } from './jsonp.mjs'
import { createMockXHR } from './xhr.mjs'
import { getJQuery } from './lib.mjs'

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
export function realAjaxCall(url, settings) {
    const jq = getJQuery()
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
export function registerMockjaxHandler(options) {
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
export function mockAjaxCall(url, origSettings) {
    const jq = getJQuery()

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
export function clear(mechanism) {
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
export function clearAll() {
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
export function clearById(id) {
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
export function clearByUrl(urlOrPattern) {
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
export function handlers(ids) {
    if (!ids) {
        return mockHandlers.map((h) => {
            const cloned = deepClone(h)
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
        const cloned = deepClone(mockHandler)
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
export function handler(id) {
    getLogger().warn('The handler(id) method is deprecated. Use handlers([id]) instead.')
    return handlers([id])[0]
}

/**
 * Get unfired mock handlers
 * @global
 * @returns {MockHandler[]} Array of unfired mock handlers
 */
export function unfiredHandlers() {
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
 * @global
 * @returns {JQueryAjaxSettings[]} Array of mocked AJAX calls
 */
export function mockedAjaxCalls() {
    return retainedAjaxCalls.filter((call) => call.mocked)
}

/**
 * Get all unmocked AJAX call records
 * @global
 * @returns {JQueryAjaxSettings[]} Array of unmocked AJAX calls
 */
export function unmockedAjaxCalls() {
    return retainedAjaxCalls.filter((call) => !call.mocked)
}

/**
 * Clear all retained AJAX call records
 * @global
 * @param {?string[]} mockHandlerIds - An optional array of mock handler IDs to restrict clearing of retained ajax calls
 * @returns {number} The number of cleared ajax call settings
 */
export function clearRetainedAjaxCalls(mockHandlerIds) {
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

    const redirectSettings = getJQuery().ajaxSetup({}, requestSettings)
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
