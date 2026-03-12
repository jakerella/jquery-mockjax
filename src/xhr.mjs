/**
 * Mock XHR object creation and response simulation
 * @module xhr
 */

/**
 * @typedef {import('./typedefs.mjs').MockHandler} MockHandler
 * @typedef {import('./typedefs.mjs').JQueryAjaxSettings} JQueryAjaxSettings
 * @typedef {import('./typedefs.mjs').MockXHR} MockXHR
 */

import { getSettings } from './settings.mjs'
import { realAjaxCall } from './core.mjs'

const READYSTATE = {
    unsent: 0,
    opened: 1,
    headers: 2,
    loading: 3,
    done: 4,
}

/**
 * Create a mock XMLHttpRequest object
 * @param {MockHandler} mockHandler - Original mock handler configuration object
 * @param {JQueryAjaxSettings} requestSettings - jQuery AJAX request settings
 * @returns {MockXHR} Mock XHR object suitable for inserting into a jQuery.ajax() call
 */
export function createMockXHR(mockHandler, requestSettings) {
    const allMockSettings = { ...getSettings(), ...mockHandler }

    if (!allMockSettings.headers) {
        allMockSettings.headers = {}
    }
    if (!requestSettings.headers) {
        requestSettings.headers = {}
    }
    if (allMockSettings.contentType) {
        allMockSettings.headers['content-type'] = allMockSettings.contentType
    }

    return {
        status: -1,
        statusText: '',
        readyState: READYSTATE.unsent,
        open: function open() {
            this.readyState = READYSTATE.opened
        },
        send: function send() {
            sendXHR.call(this, allMockSettings, requestSettings)
        },
        abort: function abort() {
            clearTimeout(this.responseTimer)
        },
        setRequestHeader: function (header, value) {
            requestSettings.headers[header] = value
        },
        getResponseHeader: function (header) {
            // 'Last-modified', 'Etag', 'content-type' are all checked by jQuery
            if (allMockSettings.headers && allMockSettings.headers[header]) {
                return allMockSettings.headers[header]
            } else if (header.toLowerCase() === 'last-modified') {
                return allMockSettings.lastModified || new Date().toString()
            } else if (header.toLowerCase() === 'etag') {
                return allMockSettings.etag || ''
            } else if (header.toLowerCase() === 'content-type') {
                return allMockSettings.contentType || 'text/plain'
            }
        },
        getAllResponseHeaders: function () {
            // since jQuery 1.9 responseText type has to match contentType
            if (allMockSettings.contentType) {
                allMockSettings.headers['content-type'] = allMockSettings.contentType
            }
            return Object.entries(allMockSettings.headers)
                .map((entry) => {
                    return `${entry[0]}: ${entry[1]}`
                })
                .join('\n')
        },
    }
}

/**
 * Do the XHR send() and generate a mock response on the MockXHR object
 * @param {MockHandler} mockHandler - The mock handler being used
 * @param {JQueryAjaxSettings} requestSettings - The jQuery request settings for this ajax call
 * @returns {void}
 */
function sendXHR(mockHandler, requestSettings) {
    const mockXHR = this

    const processRequest = function () {
        mockXHR.readyState = READYSTATE.loading

        if (typeof mockHandler.response === 'function') {
            // With 2 named arguments in the response property, we assume an async callback
            if (mockHandler.response.length === 2) {
                mockHandler.response(requestSettings, () => {
                    generateResponse(mockXHR, mockHandler, requestSettings)
                })
                return
            } else {
                mockHandler.response(requestSettings)
            }
        }

        generateResponse(mockXHR, mockHandler, requestSettings)
    }

    if (typeof mockHandler.proxy === 'string' && mockHandler.proxy.length) {
        // We're proxying this request and loading in an external file instead
        realAjaxCall({
            global: false,
            url: mockHandler.proxy,
            type: mockHandler.proxyType || 'GET',
            data: mockHandler.data,
            async: false,
            // If the underlying (mocked) ajax request is doing a `script` call,
            // we need to get the script in plain text so it can be run by jQuery later
            dataType:
                requestSettings.dataType === 'script' ? 'text/plain' : requestSettings.dataType,
            complete: function (xhr) {
                // Fix for bug #105
                // jQuery will convert the text to XML for us, and if we use the actual responseXML here
                // then some other things don't happen, resulting in no data given to the 'success' cb
                mockHandler.responseXML = mockHandler.responseText = String(xhr.responseText)

                if (requestSettings.async === false) {
                    processRequest()
                } else {
                    this.responseTimer = setTimeout(
                        processRequest,
                        determineResponseTime(mockHandler.responseTime),
                    )
                }
            },
        })
    } else {
        if (requestSettings.async === false) {
            processRequest()
        } else {
            mockXHR.responseTimer = setTimeout(
                processRequest,
                determineResponseTime(mockHandler.responseTime),
            )
        }
    }
}

/**
 * Determine an appropriate response time for the mock request
 * @param {(number | number[2])} responseTime - The responseTime option from the mock handler
 * @returns {number} The response time to be used
 */
export function determineResponseTime(responseTime) {
    if (Array.isArray(responseTime) && responseTime.length === 2) {
        const one = Math.max(0, Number(responseTime[0]))
        const two = Math.max(0, Number(responseTime[1]))
        const min = Math.min(one, two)
        const max = Math.max(one, two)
        return Math.floor(Math.random() * (max - min)) + min
    } else if (Number(responseTime)) {
        return Number(responseTime)
    }
    return getSettings().responseTime
}

/**
 * Mock the response by updating the MockXHR object for the request with various
 * response fields before passing control back to jQuery's onreadystatechange callback.
 * @param {MockXHR} mockXHR - The mock XmlHTTPRequest object to modify
 * @param {MockHandler} mockHandler - The mock handler
 * @param {JQueryAjaxSettings} requestSettings - The ajax settings
 * @returns {void}
 */
function generateResponse(mockXHR, mockHandler, requestSettings) {
    mockXHR.status = mockHandler.status
    mockXHR.statusText = mockHandler.statusText
    mockXHR.readyState = READYSTATE.done

    if (requestSettings.dataType === 'json' && typeof mockHandler.responseText === 'object') {
        mockXHR.responseText = JSON.stringify(mockHandler.responseText)
    } else if (requestSettings.dataType === 'xml') {
        if (typeof mockHandler.responseXML === 'string') {
            mockXHR.responseXML = parseXML(mockHandler.responseXML)
            //in jQuery 1.9.1+, responseXML is processed differently and relies on responseText
            mockXHR.responseText = mockHandler.responseXML
        } else {
            mockXHR.responseXML = mockHandler.responseXML
        }
    } else if (typeof mockHandler.responseText === 'object' && mockHandler.responseText !== null) {
        // since jQuery 1.9 responseText type has to match contentType
        mockHandler.contentType = 'application/json'
        mockXHR.responseText = JSON.stringify(mockHandler.responseText)
    } else {
        mockXHR.responseText = String(mockHandler.responseText)
    }

    let statusIndex = -1
    if (Array.isArray(mockHandler.status)) {
        // Random status code assignment in mock handler
        statusIndex = Math.floor(Math.random() * mockHandler.status.length)
        mockXHR.status = mockHandler.status[statusIndex]
    } else {
        mockXHR.status = Number(mockHandler.status) || getSettings().status || 200
    }

    if (Array.isArray(mockHandler.statusText) && statusIndex > -1) {
        mockXHR.statusText = mockHandler.statusText[statusIndex] || ''
    } else if (Array.isArray(mockHandler.statusText)) {
        mockXHR.statusText = mockHandler.statusText[0] || ''
    } else {
        mockXHR.statusText = String(mockHandler.statusText)
    }

    // jQuery 2.0 renamed onreadystatechange to onload
    const onReady = mockXHR.onload || mockXHR.onreadystatechange

    if (typeof onReady === 'function') {
        if (mockHandler.isTimeout) {
            mockXHR.status = -1
        }
        onReady.call(mockXHR, mockHandler.isTimeout ? 'timeout' : undefined)
    }
}

/**
 * Parse an XML string into a document
 * @param {string} xml - The xml string to parse
 * @returns {object} The DOM XML object
 * @throws {TypeError}
 */
function parseXML(xml) {
    try {
        const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml')
        if ($.isXMLDoc(xmlDoc)) {
            const err = $('parsererror', xmlDoc)
            if (err.length === 1) {
                throw new TypeError(`Error: ${$(xmlDoc).text()}`)
            }
        } else {
            throw new TypeError('Unable to parse XML')
        }
        return xmlDoc
    } catch (err) {
        const msg = err.name === undefined ? err : `${err.name}: ${err.message}`
        $(document).trigger('xmlParseError', [msg])
        throw new TypeError(msg)
    }
}
