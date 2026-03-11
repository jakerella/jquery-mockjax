
/**
 * Valid HTTP methods enum
 * @typedef HTTPMethod
 * @type {('GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'|'CONNECT'|'TRACE'|'PATCH')}
 */

/**
 * Valid XHR readyState enum
 * @typedef ReadyState
 * @type {(0|1|2|3|4)}
 */

/**
 * Valid Ajax callback method types
 * @typedef AjaxCallbackType
 * @type {('Success'|'Error'|'Complete')}
 */

/**
 * Global configuration object for mockjax
 * 
 * @typedef {Object} MockjaxSettings
 * @property {Object.<String, Function>} logger - Logger object
 * @property {Number} logging - Logging level
 * @property {String[]} logLevelMethods - Log level method names
 * @property {(String|null)} namespace - Global URL namespace
 * @property {Number} status - Default HTTP status code
 * @property {String} statusText - Default status text
 * @property {Number} responseTime - Default response time in ms
 * @property {Boolean} isTimeout - Default timeout flag
 * @property {Boolean} throwUnmocked - Throw error on unmocked requests
 * @property {Number} retainAjaxCalls - Number of AJAX calls to retain
 * @property {String} contentType - Default content type
 * @property {(Function|null)} response - Default response function
 * @property {*} responseText - Default response text
 * @property {(String|null)} responseXML - Default for XML responses
 * @property {(String|null)} proxy - Default proxy URL
 * @property {(String|null)} proxyType - Default proxy HTTP method
 * @property {String|null} lastModified - Default last modified header
 * @property {String} etag - Default etag header
 * @property {Object.<String, String>} headers - Deprecated, use responseHeaders
 * @property {Object.<String, String>} responseHeaders - Default response headers
 * @property {Boolean} matchInRegistrationOrder - Match handlers in registration order
 * @property {Boolean} followRedirects - Whether or not to follow 3XX status code redirects
 */

/**
 * Valid options for a jQuery Mockjax handler. Note that any missing
 * options for the Response will be pulled from $.mockjaxSettings.
 * One of (url, type, data, or requestHeaders) must be provided.
 * 
 * @typedef {Object} MockHandler
 * @property {?(String|RegExp)} url - The URL to match against
 * @property {?HTTPMethod} type - Deprecated, use method
 * @property {?HTTPMethod} method - The HTTP method to match against
 * @property {?(Function|String|Object)} data - The HTTP request data to match against
 * @property {?Object.<String, String>} requestHeaders - The HTTP request headers to match against
 * @property {?Number} status - The HTTP status code to return (100-599)
 * @property {?String} statusText - The HTTP status text to return
 * @property {?Number} responseTime - The response delay in milliseconds (non-negative)
 * @property {?String} contentType - The Content-Type header for the response
 * @property {?Function} response - A function to call for generating the HTTP Response
 * @property {*} responseText - The response text string to return; if an object, will become stringified JSON
 * @property {?String} proxy - The URL to proxy the request to
 * @property {?HTTPMethod} proxyType - The HTTP method to use for proxying
 * @property {?Object.<String, String>} responseHeaders - The HTTP response headers to return
 * @property {?String} namespace - The namespace to override $.mockjaxSettings
 * @property {String} lastModified - The date to use for the last modification for this request (used internally in jQuery)
 * @property {String} etag - Unique identifier referencing a specific version of the requested data (used internally by jQuery)
 * @property {?Function} onAfterSuccess - A callback fired after the $.ajax success method has been called
 * @property {?Function} onAfterError - A callback fired after the $.ajax error method has been called
 * @property {?Function} onAfterComplete - A callback fired after the $.ajax complete method has been called
 * @property {String} id - A UUID for this handler (auto-generated)
 * @property {Boolean} fired - Whether this handler has been used (auto-generated)
 * @property {Number} registeredAt - The timestamp when this handler was registered (auto-generated)
 */

/**
 * The current jQuery ajaxSettings (from version 4.0.0). Note that
 * there are many other properties and  callback methods not 
 * specified here, but supported by the framework.
 * https://api.jquery.com/jQuery.ajax/
 * 
 * Additionally, this object includes three Mockjax properties added on
 * (mocked, mockHandlerId, and a timestamp) for tracking mockjax operations.
 * 
 * @typedef {Object} JQueryAjaxSettings
 * @property {String} url - The location for the request (location.href)
 * @property {HTTPMethod} method - The HTTP Method ("GET")
 * @property {Boolean} async - Is the call asynchronous? (true)
 * @property {String} contentType - Standard contentType specification for request data ("application/x-www-form-urlencoded; charset=UTF-8")
 * @property {Number} timeout - The amount of time to wait before timeout (or 0 to never timeout, the default)
 * @property {(String|Array|Object)} data - String for query string or Object for body data fields (null)
 * @property {String} dataType - The data type for the call (i.e. script or jsonp) (null)
 * @property {?String} username - For basic HTTP auth (null)
 * @property {?String} password - For basic HTTP auth (null)
 * @property {Object.<String, String>} headers - Any request headers to send ({})
 * @property {?Boolean} mocked - Whether this ajax call was mocked
 * @property {?(String|null)} mockHandlerId - The ID of the mock handler used to mock this ajax call if it was mocked
 * @property {?Number} timestamp - The timestamp when this call was initiated
 */

/**
 * A mock of an XMLHttpRequest object that can be used to simulate
 * an ajax call inside of jQuery. Note that this does NOT implement
 * all methods of a real XHR object, so it should not be used 
 * outside of the Mockjax library!
 * 
 * @typedef {Object} MockXHR
 * @property {Number} status The mocked HTTP status code
 * @property {String} statusText The mocked HTTP status text
 * @property {ReadyState} readyState The state of the mock XHR
 * @property {Function} open For mocked calls this is a no-op function
 * @property {Function} send For mocked calls, this will execute a mocked XHR send and sets the "fired" property to true (takes no arguments)
 * @property {Function} abort For mocked calls, this will clear the timeout that has been set (takes no arguments)
 * @property {Function} setRequestHeader Sets a single mocked request header (accepts header and value as arguments)
 * @property {Function} getResponseHeader Retreives a single mocked header (accepts header name as argument)
 * @property {Function} getAllResponseHeaders Retrieves all mocked request headers as "name: value", separated by newlines (accepts no arguments)
 * @property {Number} responseTimer The ID of the timeout handler for this XHR
 */
