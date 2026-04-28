/**
 * Global mockjax settings with default values
 * @private
 * @module settings
 */

/**
 * @typedef {import('./typedefs.mjs').MockjaxSettings} MockjaxSettings
 */

import { getJQuery } from './lib.mjs'

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
    const jq = getJQuery()
    return jq.mockjaxSettings || { ...DEFAULTS }
}

// Support dependency injection
export let getSettings = _getSettings
export const mocks = {
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
export function resetSettings(maintainLogger = false) {
    const jq = getJQuery()
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
export function validateSettings() {
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
