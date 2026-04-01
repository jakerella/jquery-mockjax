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

import { realAjaxCall } from './core.mjs'
import { determineResponseTime } from './xhr.mjs'
import { getJQuery } from './lib.mjs'
import { getLogger } from './logger.mjs'

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
export function processJsonpMock(requestSettings, mockHandler, origSettings) {
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
            const result = executeJsonpRequest(requestSettings, mockHandler, origSettings)
            return result || true
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

    const jq = getJQuery()
    const callbackContext = origSettings?.context || requestSettings
    const deferred = jq.Deferred ? new jq.Deferred() : null

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
            type: mockHandler.proxyType,
            data: mockHandler.data,
            dataType:
                requestSettings.dataType === 'script' ? 'text/plain' : requestSettings.dataType,
            complete: function (xhr) {
                jq.globalEval(`(${xhr.responseText})`)
                completeJsonpCall(requestSettings, mockHandler, callbackContext, deferred)
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
    const jq = getJQuery()
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
    const jq = getJQuery()
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
