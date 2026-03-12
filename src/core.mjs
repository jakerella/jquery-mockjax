/**
 * Core mockjax API functions
 * @module core
 */

/**
 * @typedef {import('./typedefs.mjs').MockHandler} MockHandler
 * @typedef {import('./typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 * @typedef {import('./typedefs.mjs').AjaxCallbackType} AjaxCallbackType
 * @typedef {import('./typedefs.mjs').MockXHR} MockXHR
 */

// import { getLogger } from './logger.js'
import { getSettings, validateSettings } from './settings.mjs'
import { generateUUID, deepClone } from './utils.mjs'
import { findMatchingHandler } from './matching.mjs'
import { processJsonpMock } from './jsonp.mjs'
import { createMockXHR } from './xhr.mjs'

// TODO: should this go in here??
const _ajax = $.ajax
$.extend({
    ajax: mockAjaxCall,
})
// getLogger().debug('Mockjax startup')

/**
 * Make a real $.ajax() call, ignoring any mock handling
 *
 * @param {(String|jQuery.ajaxSettings)} url - The request URL or ajax settings object
 * @param {?jQuery.ajaxSettings} settings - Optionally pass in jQuery Ajax settings (can also be passed as the first argument)
 * @returns {jqXHR} The jQuery Ajax XHR object
 */
export function realAjaxCall(url, settings) {
    return _ajax.apply($, [url, settings])
}

/**
 * Array of registered mock handlers
 * @type {Array[MockHandler]}
 */
const mockHandlers = []

/**
 * Hash of all handler objects by UUID
 * @type {Object.<String, MockHandler>}
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
 * @param {MockHandler|MockHandler[]|Function} options - Mock handler options, array of options, or a function that will return options
 * @returns {String|String[]>} Handler ID(s) generated
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
    const handler = typeof options === 'function' ? options : { ...options }
    handler.id = generateUUID()
    handler.fired = false
    handler.registeredAt = Date.now()

    if (handler.headers && typeof handler.headers === 'object') {
        handler.responseHeaders = handler.headers
    }

    // Register handler
    mockHandlers.push(handler)
    mockHandlerLookup[handler.id] = handler

    // TODO: update me
    // console.debug('Registered new handler:', {...handler})

    return handler.id
}

/**
 * Intercept an AJAX request, find matching handler, and construct the
 * mock request, if applicable. Note that this method matches the
 * signature of jQuery's `ajax` method, so the first argument can be
 * a URL _or_ the full ajax settings object.
 *
 * @param {(String|JQueryAjaxSettings)} url - The request URL or ajax settings object
 * @param {?JQueryAjaxSettings} origSettings - Optionally pass in jQuery Ajax settings (can also be passed as the first argument)
 * @returns {MockXHR} The XHR object used in the request. Note that this will be the real jQuery jqXHR object if the call was not mocked
 */
export function mockAjaxCall(url, origSettings) {
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
            throw new Error('AJAX not mocked: ' + requestSettings.url)
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
export function clear(idOrUrl) {
    console.warn(
        'The clear() method is deprecated. Use clearAll(), clearById(), or clearByUrl() instead.',
    )

    // Clear all handlers
    if (idOrUrl === undefined) {
        return clearAll()
    }

    // Clear by handler ID
    if (mockHandlerLookup[idOrUrl]) {
        return clearById(idOrUrl)
    }

    return clearByUrl(idOrUrl)
}

/**
 * Clear all mock handler(s)
 * @returns {void}
 */
export function clearAll() {
    mockHandlers.length = 0
    const removed = Object.keys(mockHandlerLookup)
    for (let id in mockHandlerLookup) {
        delete mockHandlerLookup[id]
    }
    clearRetainedAjaxCalls(removed)
}

/**
 * Clear mock handler(s) by handler ID
 * @param {string} [id] - Handler ID (UUID)
 * @returns {void}
 */
export function clearById(id) {
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
}

/**
 * Get registered mock handlers by ID(s)
 * @param {String[]} [ids] - Optional Array of handler IDs, or undefined for all
 * @returns {MockHandler[]} Array of handlers (null for invalid IDs)
 */
export function handlers(ids) {
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
        const handler = mockHandlerLookup[id]
        if (!handler) {
            return null
        }
        const cloned = deepClone(handler)
        cloned.clear = function () {
            clearById(this.id)
        }
        return cloned
    })
}

/**
 * Get a single mock handler by ID (deprecated)
 * @deprecated Use handlers([id]) instead
 * @param {String} id - Handler ID
 * @returns {(MockHandler|null)} Handler or null
 */
export function handler(id) {
    console.warn('The handler(id) method is deprecated. Use handlers([id]) instead.')
    return handlers([id])[0]
}

/**
 * Get unfired mock handlers
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
 * @returns {JQueryAjaxSettings[]} Array of mocked AJAX calls
 */
export function mockedAjaxCalls() {
    return retainedAjaxCalls.filter((call) => call.mocked)
}

/**
 * Get all unmocked AJAX call records
 * @returns {JQueryAjaxSettings[]} Array of unmocked AJAX calls
 */
export function unmockedAjaxCalls() {
    return retainedAjaxCalls.filter((call) => !call.mocked)
}

/**
 * Clear all retained AJAX call records
 * @param {?String[]} mockHandlerIds - An optional array of mock handler IDs to restrict clearing of retained ajax calls
 * @returns {void}
 */
export function clearRetainedAjaxCalls(mockHandlerIds) {
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
        for (let key in settings.requestHeaders) {
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
        for (let key in settings.responseHeaders) {
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
 *
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
 *
 * @param {Object} context The original context that the callback should execute in (the value of `this`)
 * @param {AjaxCallbackType} action
 * @param {MockHandler} mockHandler
 * @param {JQueryAjaxSettings} requestSettings
 * @returns {Function} The callback to be used after the ajax call
 */
function overrideCallback(context, action, mockHandler, requestSettings) {
    const origCallback = requestSettings[action.toLowerCase()]
    return function () {
        if (typeof origCallback === 'function') {
            origCallback.apply(context || {}, Array.from(arguments))
        }
        mockHandler['onAfter' + action](requestSettings)
    }
}

/**
 * Redirect the mocked request to the location in the mock handler's headers
 *
 * @param {MockHandler} mockHandler
 * @param {JQueryAjaxSettings} requestSettings
 * @returns {MockXHR}
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
 *
 * @param {MockHandler} mockHandler
 * @param {JQueryAjaxSettings} requestSettings
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
