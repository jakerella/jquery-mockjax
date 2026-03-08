/**
 * Mock JSONP request handling
 * @module jsonp
 */

/**
 * @typedef {import('./typedefs.js').MockHandler} MockHandler
 * @typedef {import('./typedefs.js').JQueryAjaxSettings} JQueryAjaxSettings
 */

import { getSettings } from './settings.js'

/**
 * 
 * @param {MockHandler} mockHandler 
 * @param {JQueryAjaxSettings} requestSettings 
 * @returns {(Deferred|null)}  Promise?
 */
export function processJsonpMock( mockHandler, requestSettings ) {
    
    // TODO: all of this...
    
    const newMock = new $.Deferred()

    return newMock
}
