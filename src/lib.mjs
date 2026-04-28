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
export function getJQuery(mockJQueryFn) {
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
export function getDOMParser(mockDOMParserObject) {
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
export function getCrypto(mockCryptoObject) {
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
export function resetMocks() {
    mockJQuery = null
    mockDOMParser = null
    mockCrypto = null
}
