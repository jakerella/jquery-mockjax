/**
 * Global mockjax settings with default values
 * @module settings
 */

/**
 * @typedef {import('./typedefs.js').MockjaxSettings} MockjaxSettings
 */

const DEFAULTS = {
    logger: typeof window !== 'undefined' ? window.console : console,
    logging: 2,
    logLevelMethods: ['error', 'warn', 'info', 'log', 'debug'],
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
    proxyType: 'GET',
    lastModified: null,
    etag: 'IJF@H#@923uf8023hFO@I#H#',
    headers: null,
    responseHeaders: {},
    matchInRegistrationOrder: true,
    followRedirects: true
}

/**
 * 
 * @returns {MockjaxSettings}
 */
export function getSettings() {
    return $.mockjaxSettings || {...DEFAULTS}
}
