/**
 * Utility functions for mockjax
 * @private
 * @module utils
 */

import { getCrypto } from './lib.mjs'

/**
 * Generate a UUID using the Web Crypto API
 * @returns {string} RFC 4122 compliant UUID
 * @throws {Error} If crypto.randomUUID() is not available
 */
export function generateUUID() {
    const crypto = getCrypto()
    return crypto.randomUUID()
}

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export function deepClone(obj) {
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
            const g = window || global
            clone[key] = g.__clonedMockjaxFn
            delete g.__clonedMockjaxFn
        } else {
            clone[key] = deepClone(obj[key])
        }
    }
    return clone
}
