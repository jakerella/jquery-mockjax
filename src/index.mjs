/**
 * Mockjax - Mock AJAX requests for testing
 * @module mockjax
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

function init() {
    const jq = getJQuery()

    jq._ajax = jq.ajax
    jq.ajax = mockAjaxCall

    jq.mockjaxSettings = getSettings()
    jq.mockjax = registerMockjaxHandler
    jq.mockjax.getLogger = getLogger
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

if (typeof $ !== 'undefined') {
    init()
}
