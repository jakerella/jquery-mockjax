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
					if ( !( m.url && ( m.url == '*' || m.url == s.url ) ) ) {
						m = null;
					}
				}

				if ( m ) {
					mock = true;
					// Test if we are going to create a script tag (if so, intercept & mock)
					if ( s.dataType === "script" && type === "GET" && remote ) {
						// Synthesize the mock request for adding a script tag
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
									alert('setRequestHeader intercept called!');
								},
								getResponseHeader: function() {
									// 'Last-modified', 'Etag', 'content-type'
									if ( header == 'Last-modified' ) {
										return m.lastModified || '';
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
