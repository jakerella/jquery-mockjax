/**
 * Handler matching logic for mockjax
 * @module matching
 */

/**
 * @typedef {import('./typedefs.mjs').HTTPMethod} HTTPMethod
 * @typedef {import('./typedefs.mjs').MockHandler} MockHandler
 * @typedef {import('./typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 */

import { getSettings } from './settings.mjs'

/**
 * Find a matching handler for an AJAX request
 * @param {MockHandler[]} handlers - Array of registered handlers
 * @param {JQueryAjaxSettings} requestSettings - jQuery AJAX request settings
 * @returns {MockHandler|null} Matching handler or null
 */
export function findMatchingHandler(handlers, requestSettings) {
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
 * @param {(String|RegExp|undefined)} handlerUrl - Handler URL pattern
 * @param {String} requestUrl - Request URL to match
 * @param {(String|null)} namespace - Namespace to prepend to handler URL
 * @returns {Boolean} True if URL matches
 */
export function matchUrl(handlerUrl, requestUrl, namespace) {
    if (!handlerUrl) {
        return true
    }

    if (handlerUrl instanceof RegExp) {
        let pattern = handlerUrl
        if (namespace) {
            namespace = namespace.replace(/(\/+)$/, '')
            const patternSource = handlerUrl.source.replace(/^\^?/, '^(?:' + namespace + ')\/?')
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
 * @param {(Function|String|Object|undefined)} handlerData - Handler data pattern
 * @param {(String|Object)} requestData - Request data to match
 * @returns {Boolean} True if data matches
 */
export function matchData(handlerData, requestData) {
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
 * @param {Object|undefined} handlerHeaders - Handler header requirements
 * @param {Object} requestHeaders - Request headers to match
 * @returns {Boolean} True if headers match
 */
export function matchHeaders(handlerHeaders, requestHeaders) {
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
 * @param {(HTTPMethod|undefined)} handlerMethod - Handler HTTP method
 * @param {String} requestMethod - Actual request HTTP method
 * @returns {Boolean} True if method matches
 */
export function matchMethod(handlerMethod, requestMethod) {
    return !handlerMethod || handlerMethod.toUpperCase() === requestMethod.toUpperCase()
}

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
