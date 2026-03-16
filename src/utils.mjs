/**
 * Utility functions for mockjax
 * @module utils
 */

/**
 * Generate a UUID using the Web Crypto API
 * @returns {string} RFC 4122 compliant UUID
 * @throws {Error} If crypto.randomUUID() is not available
 */
export function generateUUID() {
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
export function deepClone(obj) {
    try {
        const clone = structuredClone(obj)
        return clone
    } catch (_) {
        /* can't clone functions, so we'll do this the harad way */
    }

    if (obj === null || typeof obj !== 'object') {
        return obj
    }

    const clone = {}
    for (const key in obj) {
        clone[key] = deepClone(obj[key])
    }

    return clone
}
