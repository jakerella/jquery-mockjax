/*!
 * MockJax - Mock for Ajax requests
 *
 * Version: 1.0
 * Released: 2010-04-26
 * Source: http://labs.appendto.com/jquery-plugins/mockjax
 * Author: Jonathan Sharp (http://jdsharp.com)
 * License: MIT,GPL
 * 
 * Copyright (c) 2010 appendTo LLC.
 * Dual licensed under the MIT and GPL licenses.
 * http://appendto.com/open-source-licenses
 */
(function($) {
	var _ajax = $.ajax,
		mockHandlers = [];

	$.extend({
		ajax: function(origSettings) {
			var s = jQuery.extend(true, {}, jQuery.ajaxSettings, origSettings);
			var mock = false;
			$.each(mockHandlers, function(k, v) {
				var m = null;
				if ( $.isFunction(mockHandlers[k]) ) {
					m = mockHandlers[k](s);
				} else {
					m = mockHandlers[k];
					var star = m.url.indexOf('*');
					if ( ( m.url != '*' && m.url != s.url && star == -1 ) ||
						 ( star > -1 && m.url.substr(0, star) != s.url.substr(0, star) ) ) {
						 //alert('null: ' + m.url + ' ' + s.url);
						 m = null;
					}
				}
				if ( m ) {
					if ( console && console.log ) {
						console.log('MOCK GET: ' + s.url);
					}
					mock = true;
					
					
					// Handle JSONP Parameter Callbacks
					if ( s.dataType === "jsonp" ) {
						if ( type === "GET" ) {
							if ( !jsre.test( s.url ) ) {
								s.url += (rquery.test( s.url ) ? "&" : "?") + (s.jsonp || "callback") + "=?";
							}
						} else if ( !s.data || !jsre.test(s.data) ) {
							s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
						}
						s.dataType = "json";
					}
			
					// Build temporary JSONP function
					var jsre = /=\?(&|$)/;
					if ( s.dataType === "json" && (s.data && jsre.test(s.data) || jsre.test(s.url)) ) {
						jsonp = s.jsonpCallback || ("jsonp" + jsc++);
			
						// Replace the =? sequence both in the query string and the data
						if ( s.data ) {
							s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
						}
			
						s.url = s.url.replace(jsre, "=" + jsonp + "$1");
			
						// We need to make sure
						// that a JSONP style response is executed properly
						s.dataType = "script";
			
						// Handle JSONP-style loading
						window[ jsonp ] = window[ jsonp ] || function( tmp ) {
							data = tmp;
							success();
							complete();
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
					
					var rurl = /^(\w+:)?\/\/([^\/?#]+)/,
						parts = rurl.exec( s.url ),
						remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);
					
					// Test if we are going to create a script tag (if so, intercept & mock)
					if ( s.dataType === "script" && s.type === "GET" && remote ) {
						// Synthesize the mock request for adding a script tag
						var callbackContext = origSettings && origSettings.context || s;
						
						function success() {
							// If a local callback was specified, fire it and pass it the data
							if ( s.success ) {
								s.success.call( callbackContext, (m.response ? m.response.toString() : m.responseText || ''), status, {} );
							}
				
							// Fire the global callback
							if ( s.global ) {
								trigger( "ajaxSuccess", [{}, s] );
							}
						}
				
						function complete() {
							// Process result
							if ( s.complete ) {
								s.complete.call( callbackContext, {} , status);
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
						
						function trigger(type, args) {
							(s.context ? jQuery(s.context) : jQuery.event).trigger(type, args);
						}
						
						if ( m.response && $.isFunction(m.response) ) {
							m.response();
						} else {
							$.globalEval(m.responseText);
						}
						success();
						complete();
						return false;
					}
					_ajax.call($, $.extend(true, {}, origSettings, {
						xhr: function() {
							// Extend with our default mockjax settings
							m = $.extend({}, $.mockjaxSettings, m);
							// Return our mock xhr object
							return {
								status: m.status,
								readyState: 1,
								open: function() {
								},
								send: function() {
									// type == 'POST' || 'GET' || 'DELETE'
									// TODO: check for synchonous execution
									this.responseTimer = setTimeout($.proxy(function() {
										// The request has returned
										this.status 		= m.status;
										this.readyState 	= 4;
										
										if ( s.dataType == 'json' && ( typeof m.responseText == 'object' ) ) {
											this.responseText = JSON.stringify(m.responseText);
										} else if ( s.dataType == 'xml' ) {
											this.responseXML = m.responseXML;
										} else {
											this.responseText = m.responseText;
										}
										this.onreadystatechange( m.isTimeout ? 'timeout' : undefined );
									}, this), m.responseTime || 50);
								},
								abort: function() {
									clearTimeout(this.responseTimer);
								},
								setRequestHeader: function() {
									//TODO: Store set request header
								},
								getResponseHeader: function(header) {
									// 'Last-modified', 'Etag', 'content-type'
									if ( header == 'Last-modified' ) {
										return m.lastModified || (new Date()).toString();
									} else if ( header == 'Etag' ) {
										return m.etag || '';
									} else if ( header == 'content-type' ) {
										return m.contentType || 'text/plain';
									}
								}
							};
						}
					}));

					return false;
				}
			});
			if ( !mock ) {
				return _ajax.apply($, arguments);
			}
		}
	});

	$.mockjaxSettings = {
		url: 			null,
		type: 			'GET',
		status: 		200,
		responseTime: 	500,
		contentType: 	'text/plain',
		etag: 			'',
		response: 		''
	};

	$.mockjax = function(settings) {
		mockHandlers.push( settings );
	};
})(jQuery);
