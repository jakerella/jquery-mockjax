/**
 * Mockjax - Mock AJAX requests for testing
 * @module mockjax
 */

import {
    getSettings,
    resetSettings,
    validateSettings
} from './settings.js'
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
    clearRetainedAjaxCalls
} from './core.js'

// Export public API
export {
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
    validateSettings
}

// Default export
export default {
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
    validateSettings
}

$.mockjaxSettings = getSettings()
$.mockjax = registerMockjaxHandler
$.mockjax.resetSettings = resetSettings
$.mockjax.validateSettings = validateSettings
$.mockjax.clear = clear
$.mockjax.clearById = clearById
$.mockjax.clearByUrl = clearByUrl
$.mockjax.clearAll = clearAll
$.mockjax.handler = handler
$.mockjax.handlers = handlers
$.mockjax.unfiredHandlers = unfiredHandlers
$.mockjax.mockedAjaxCalls = mockedAjaxCalls
$.mockjax.unmockedAjaxCalls = unmockedAjaxCalls
$.mockjax.clearRetainedAjaxCalls = clearRetainedAjaxCalls
