/**
 * Attach - Attaches the Mockjax methods to jQuery
 * @private
 * @module attach
 */

/**
 * @typedef {import('./typedefs.mjs').Mockjax} Mockjax
 */

import { getJQuery } from './lib.mjs'
import { getSettings, resetSettings, validateSettings } from './settings.mjs'
import { getLogger } from './logger.mjs'
import {
    registerMockjaxHandler,
    clear,
    clearById,
    clearByUrl,
    clearAll,
    handler,
    handlers,
    unfiredHandlers,
    mockedAjaxCalls,
    unmockedAjaxCalls,
    clearRetainedAjaxCalls,
    mockAjaxCall
} from './core.mjs'

// Export public API
export {
    init,
    registerMockjaxHandler as mockjax,
    clear,
    clearById,
    clearByUrl,
    clearAll,
    handler,
    handlers,
    unfiredHandlers,
    mockedAjaxCalls,
    unmockedAjaxCalls,
    clearRetainedAjaxCalls,
    getSettings,
    resetSettings,
    validateSettings,
    getLogger
}

// Default export
export default {
    init,
    mockjax: registerMockjaxHandler,
    clear,
    clearById,
    clearByUrl,
    clearAll,
    handler,
    handlers,
    unfiredHandlers,
    mockedAjaxCalls,
    unmockedAjaxCalls,
    clearRetainedAjaxCalls,
    getSettings,
    resetSettings,
    validateSettings,
    getLogger
}

/**
 * A simple function to attach the mockjax object to jQuery along
 * with the full public API. This initialization will also switch
 * the default jQuery.ajax() method with our own mock implementation.
 * NOTE: this method is called automatically when "$" is available
 * globally, there is no need to call it outside of importing it
 * directly (such as for tests).
 * @returns {Mockjax} Mockjax The main mockjax function/object
 */
function init() {
    getLogger().info('Initializing Mockjax and adding methods to jQuery')
    const jq = getJQuery()

    jq._ajax = jq.ajax
    jq.ajax = mockAjaxCall

    jq.mockjaxSettings = getSettings()
    jq.mockjax = registerMockjaxHandler
    jq.mockjax.getLogger = getLogger
    jq.mockjax.getSettings = getSettings
    jq.mockjax.resetSettings = resetSettings
    jq.mockjax.validateSettings = validateSettings
    jq.mockjax.clear = clear
    jq.mockjax.clearById = clearById
    jq.mockjax.clearByUrl = clearByUrl
    jq.mockjax.clearAll = clearAll
    jq.mockjax.handler = handler
    jq.mockjax.handlers = handlers
    jq.mockjax.unfiredHandlers = unfiredHandlers
    jq.mockjax.mockedAjaxCalls = mockedAjaxCalls
    jq.mockjax.unmockedAjaxCalls = unmockedAjaxCalls
    jq.mockjax.clearRetainedAjaxCalls = clearRetainedAjaxCalls

    return jq.mockjax
}

// We can't test this properly in a unit test because we can't
// re-import the module after it's been imported. That means we
// can't inject our own global.$ before loading.
/* c8 ignore start */
if (typeof $ !== 'undefined') {
    init()
}
/* c8 ignore stop */
