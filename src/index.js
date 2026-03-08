/**
 * Mockjax - Mock AJAX requests for testing
 * @module mockjax
 */

import { getSettings } from './settings.js'
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
    clearRetainedAjaxCalls
}

// Default export
// TODO: should this only be the "mockjax" method?
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
    clearRetainedAjaxCalls
}

$.mockjaxSettings = getSettings()
$.mockjax = registerMockjaxHandler
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
