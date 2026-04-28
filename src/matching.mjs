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

import { getSettings } from './settings.mjs'
import { getLogger } from './logger.mjs'

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
export let findMatchingHandler = _findMatchingHandler
export const mocks = {
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
export function matchUrl(handlerUrl, requestUrl, namespace) {
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
export function matchData(handlerData, requestData) {
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
export function matchHeaders(handlerHeaders, requestHeaders) {
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
export function matchMethod(handlerMethod, requestMethod) {
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
