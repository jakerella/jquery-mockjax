/*!
 * MockJax - jQuery Plugin to Mock Ajax requests
 *
 * Version:  1.5.0pre
 * Released:
 * Home:   http://github.com/appendto/jquery-mockjax
 * Author:   Jonathan Sharp (http://jdsharp.com)
 * License:  MIT,GPL
 *
 * Copyright (c) 2011 appendTo LLC.
 * Dual licensed under the MIT or GPL licenses.
 * http://appendto.com/open-source-licenses
 */
(function($) {
	var _ajax = $.ajax,
		mockHandlers = [],
		CALLBACK_REGEX = /=\?(&|$)/, 
		jsc = (new Date()).getTime();

	function parseXML(xml) {
		if ( window['DOMParser'] == undefined && window.ActiveXObject ) {
			DOMParser = function() { };
			DOMParser.prototype.parseFromString = function( xmlString ) {
				var doc = new ActiveXObject('Microsoft.XMLDOM');
				doc.async = 'false';
				doc.loadXML( xmlString );
				return doc;
			};
		}

		try {
			var xmlDoc 	= ( new DOMParser() ).parseFromString( xml, 'text/xml' );
			if ( $.isXMLDoc( xmlDoc ) ) {
				var err = $('parsererror', xmlDoc);
				if ( err.length == 1 ) {
					throw('Error: ' + $(xmlDoc).text() );
				}
			} else {
				throw('Unable to parse XML');
			}
		} catch( e ) {
			var msg = ( e.name == undefined ? e : e.name + ': ' + e.message );
			$(document).trigger('xmlParseError', [ msg ]);
			return undefined;
		}
		return xmlDoc;
	}

	function trigger(s, type, args) {
		(s.context ? jQuery(s.context) : jQuery.event).trigger(type, args);
	}

	function isMockDataEqual( mock, live ) {
		var identical = false;
		// Test for situations where the data is a querystring (not an object)
		if (typeof live === 'string') {
			// Querystring may be a regex
			return $.isFunction( mock.test ) ? mock.test(live) : mock == live;
		}
		$.each(mock, function(k, v) {
			if ( live[k] === undefined ) {
				identical = false;
				return identical;
			} else {
				identical = true;
				if ( typeof live[k] == 'object' ) {
					return isMockDataEqual(mock[k], live[k]);
				} else {
					if ( $.isFunction( mock[k].test ) ) {
						identical = mock[k].test(live[k]);
					} else {
						identical = ( mock[k] == live[k] );
					}
					return identical;
				}
			}
		});

		return identical;
	}

	// Check the given handler should mock the given request
	function getMockForRequest( handler, s ) {
		// If the mock was registered with a function, let the function decide if we
		// want to mock this request
		if ( $.isFunction(handler) ) {
			return handler(s);
		}

		// Inspect the URL of the request and check if the mock handler's url
		// matches the url for this ajax request
		if ( $.isFunction(handler.url.test) ) {
			// The user provided a regex for the url, test it
			if ( !handler.url.test( s.url ) ) {
				return null;
			}
		} else {
			// Look for a simple wildcard '*' or a direct URL match
			var star = handler.url.indexOf('*');
			if (handler.url !== s.url && star === -1 || !new RegExp(handler.url.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&").replace('*', '.+')).test(s.url)) {
				return null;
			}
		}

		// Inspect the data submitted in the request (either POST body or GET query string)
		if ( handler.data && s.data ) {
			if ( !isMockDataEqual(handler.data, s.data) ) {
				// They're not identical, do not mock this request
				return null;
			}
		}
		// Inspect the request type
		if ( handler && handler.type && handler.type.toLowerCase() != s.type.toLowerCase() ) {
			// The request type doesn't match (GET vs. POST)
			return null;
		}

		return handler;
	}

	// If logging is enabled, log the mock to the console
	function logMock( m, s ) {
		var c = $.extend({}, $.mockjaxSettings, m);
		if ( c.log && $.isFunction(c.log) ) {
			c.log('MOCK ' + s.type.toUpperCase() + ': ' + s.url, $.extend({}, s));
		}
	}

	// Construct a mocked XHR Object
	function xhr(k, m, s, origSettings, mockHandlers) {
		// Extend with our default mockjax settings
		m = $.extend({}, $.mockjaxSettings, m);

		if (typeof m.headers === 'undefined') {
			m.headers = {};
		}
		if ( m.contentType ) {
			m.headers['content-type'] = m.contentType;
		}

		var mockXhr = {
			status: m.status,
			statusText: m.statusText,
			readyState: 1,
			open: function() { },
			send: function() {

				mockHandlers[k].fired = true;

				// This is a substitute for < 1.4 which lacks $.proxy
				var process = (function(that) {
					return function() {
						return (function() {
							// The request has returned
							this.status 		= m.status;
							this.statusText		= m.statusText;
							this.readyState 	= 4;

							// We have an executable function, call it to give
							// the mock handler a chance to update it's data
							if ( $.isFunction(m.response) ) {
								m.response(origSettings);
							}
							// Copy over our mock to our xhr object before passing control back to
							// jQuery's onreadystatechange callback
							if ( s.dataType == 'json' && ( typeof m.responseText == 'object' ) ) {
								this.responseText = JSON.stringify(m.responseText);
							} else if ( s.dataType == 'xml' ) {
								if ( typeof m.responseXML == 'string' ) {
									this.responseXML = parseXML(m.responseXML);
								} else {
									this.responseXML = m.responseXML;
								}
							} else {
								this.responseText = m.responseText;
							}
							if( typeof m.status == 'number' || typeof m.status == 'string' ) {
								this.status = m.status;
							}
							if( typeof m.statusText === "string") {
								this.statusText = m.statusText;
							}
							// jQuery < 1.4 doesn't have onreadystate change for xhr
							if ( $.isFunction(this.onreadystatechange) && !m.isTimeout ) {
								this.onreadystatechange( m.isTimeout ? 'timeout' : undefined );
							} else if ( m.isTimeout ) {
								if ( $.isFunction( $.handleError ) ) {
									// Fix for 1.3.2 timeout to keep success from firing.
									this.readyState = -1;
								}
								s.error( this, "timeout" );
								s.complete( this, "timeout" );
							}
						}).apply(that);
					};
				})(this);

				if ( m.proxy ) {
					// We're proxying this request and loading in an external file instead
					_ajax({
						global: false,
						url: m.proxy,
						type: m.proxyType,
						data: m.data,
						dataType: s.dataType === "script" ? "text/plain" : s.dataType,
						complete: function(xhr, txt) {
							m.responseXML = xhr.responseXML;
							m.responseText = xhr.responseText;
							m.status = xhr.status;
							m.statusText = xhr.statusText;
							this.responseTimer = setTimeout(process, m.responseTime || 0);
						}
					});
				} else {
					// type == 'POST' || 'GET' || 'DELETE'
					if ( s.async === false ) {
						// TODO: Blocking delay
						process();
					} else {
						this.responseTimer = setTimeout(process, m.responseTime || 50);
					}
				}
			},
			abort: function() {
				clearTimeout(this.responseTimer);
			},
			setRequestHeader: function(header, value) {
				m.headers[header] = value;
			},
			getResponseHeader: function(header) {
				// 'Last-modified', 'Etag', 'content-type' are all checked by jQuery
				if ( m.headers && m.headers[header] ) {
					// Return arbitrary headers
					return m.headers[header];
				} else if ( header.toLowerCase() == 'last-modified' ) {
					return m.lastModified || (new Date()).toString();
				} else if ( header.toLowerCase() == 'etag' ) {
					return m.etag || '';
				} else if ( header.toLowerCase() == 'content-type' ) {
					return m.contentType || 'text/plain';
				}
			},
			getAllResponseHeaders: function() {
				var headers = '';
				$.each(m.headers, function(k, v) {
					headers += k + ': ' + v + "\n";
				});
				return headers;
			}
		};

		// Return our mock xhr object
		return mockXhr;
	}

	function processJsonpMock( s, m, mock, origSettings ) {
		// Handle JSONP Parameter Callbacks, we need to replicate some of the jQuery core here
		// because there isn't an easy hook for the cross domain script tag of jsonp

		processJsonpUrl( s );

		s.dataType = "json";
		if(s.data && CALLBACK_REGEX.test(s.data) || CALLBACK_REGEX.test(s.url)) {
			createJsonpCallback(s, m);

			// We need to make sure
			// that a JSONP style response is executed properly

			var rurl = /^(\w+:)?\/\/([^\/?#]+)/,
				parts = rurl.exec( s.url ),
				remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);

			s.dataType = "script";
			if(s.type.toUpperCase() === "GET" && remote ) {
				return processJsonpRequest( s, m, mock, origSettings );
			}
		}
		return null;
	}

	// Append the required callback parameter to the end of the request URL, for a JSONP request
	function processJsonpUrl( s ) {
		if ( s.type.toUpperCase() === "GET" ) {
			if ( !CALLBACK_REGEX.test( s.url ) ) {
				s.url += (/\?/.test( s.url ) ? "&" : "?") + (s.jsonp || "callback") + "=?";
			}
		} else if ( !s.data || !CALLBACK_REGEX.test(s.data) ) {
			s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
		}
	}
	
	function processJsonpRequest( s, m, mock, origSettings ) {
		// Synthesize the mock request for adding a script tag
		var callbackContext = origSettings && origSettings.context || s;
		var newMock = mock;


		if ( m.response && $.isFunction(m.response) ) {
			m.response(origSettings);
		} else {

			if( typeof m.responseText === 'object' ) {
				$.globalEval( '(' + JSON.stringify( m.responseText ) + ')');
			} else {
				$.globalEval( '(' + m.responseText + ')');
			}
		}
		jsonpSuccess( s, m );
		jsonpComplete( s, m );
		if(jQuery.Deferred){
			newMock = new jQuery.Deferred();
			if(typeof m.responseText == "object"){
				newMock.resolve(m.responseText);
			}
			else{
				newMock.resolve(jQuery.parseJSON(m.responseText));
			}
		}
		return newMock;
	}


	// Create the required JSONP callback function for the request
	function createJsonpCallback( s, m ) {
		jsonp = s.jsonpCallback || ("jsonp" + jsc++);

		// Replace the =? sequence both in the query string and the data
		if ( s.data ) {
			s.data = (s.data + "").replace(CALLBACK_REGEX, "=" + jsonp + "$1");
		}

		s.url = s.url.replace(CALLBACK_REGEX, "=" + jsonp + "$1");


		// Handle JSONP-style loading
		window[ jsonp ] = window[ jsonp ] || function( tmp ) {
			data = tmp;
			jsonpSuccess( s, m );
			jsonpComplete( s, m );
			// Garbage collect
			window[ jsonp ] = undefined;

			try {
				delete window[ jsonp ];
			} catch(e) {}

			if ( head ) {
				head.removeChild( script );
			}
		};
	}

	function jsonpSuccess(s, m) {
		// If a local callback was specified, fire it and pass it the data
		if ( s.success ) {
			s.success.call( callbackContext, ( m.response ? m.response.toString() : m.responseText || ''), status, {} );
		}

		// Fire the global callback
		if ( s.global ) {
			trigger(s, "ajaxSuccess", [{}, s] );
		}
	}

	function jsonpComplete(s, m) {
		// Process result
		if ( s.complete ) {
			s.complete.call( callbackContext, {} , status );
		}

		// The request was completed
		if ( s.global ) {
			trigger( "ajaxComplete", [{}, s] );
		}

		// Handle the global AJAX counter
		if ( s.global && ! --jQuery.active ) {
			jQuery.event.trigger( "ajaxStop" );
		}
	}

	function handleAjax( url, origSettings ) {
		var mockRequest = false,
			s;

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			origSettings = url;
			url = undefined;
		} else {
			// work around to support 1.5 signature
			origSettings.url = url;
		}
		
		// Extend the original settings for the request
		s = jQuery.extend(true, {}, jQuery.ajaxSettings, origSettings);

		// Iterate over our mock handlers (in registration order) until we find
		// one that is willing to intercept the request
		//$.each(mockHandlers, function(k, v) {
		for(var k = 0; k < mockHandlers.length; k++) {
			if ( !mockHandlers[k] ) {
				continue;
			}
			var m = getMockForRequest( mockHandlers[k], s );
			if(!m) {
				// No valid mock found for this request
				continue;
			}

			// We found a valid mock
			mockRequest = true;

			// Handle console logging
			logMock( m, s );


			if ( s.dataType === "jsonp" ) {
				if ((mockRequest = processJsonpMock( s, m, mockRequest, origSettings ))) {
					break;
				}
			}


			//m.data = s.data;
			m.cache = s.cache;
			m.timeout = s.timeout;
			m.global = s.global;

			(function(k, m, s, origSettings, mockHandlers) {
				mockRequest = _ajax.call($, $.extend(true, {}, origSettings, {
					// Mock the XHR object
					xhr: function() { return xhr(k, m, s, origSettings, mockHandlers); }
				}));
			})(k, m, s, origSettings, mockHandlers);
			break;
		}

		// We don't have a mock request, trigger a normal request
		if ( !mockRequest ) {
			return _ajax.apply($, [origSettings]);
		} else {
			return mockRequest;
		}
	}


	// Public

	$.extend({
		ajax: handleAjax
	});

	$.mockjaxSettings = {
		//url:        null,
		//type:       'GET',
		log:          function(msg) {
						window['console'] && window.console.log && window.console.log(msg);
					  },
		status:       200,
		statusText:   "OK",
		responseTime: 500,
		sisTimeout:    false,
		contentType:  'text/plain',
		response:     '',
		responseText: '',
		responseXML:  '',
		proxy:        '',
		proxyType:    'GET',

		lastModified: null,
		etag:         '',
		headers: {
			etag: 'IJF@H#@923uf8023hFO@I#H#',
			'content-type' : 'text/plain'
		}
	};

	$.mockjax = function(settings) {
		var i = mockHandlers.length;
		mockHandlers[i] = settings;
		return i;
	};
	$.mockjaxClear = function(i) {
		if ( arguments.length == 1 ) {
			mockHandlers[i] = null;
		} else {
			mockHandlers = [];
		}
	};
	$.mockjax.handler = function(i) {
	  if ( arguments.length == 1 ) {
			return mockHandlers[i];
		}
	};
})(jQuery);
