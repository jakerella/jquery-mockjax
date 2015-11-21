(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
	
	qunit.begin(function() {
		
		qunit.noErrorCallbackExpected = function noErrorCallbackExpected() {
			qunit.assert.ok(false, 'Error callback executed');
		};

		// Speed up our tests
		$.mockjaxSettings.responseTime = 0;
		$.mockjaxSettings.logging = false;
		qunit.defaultMockjaxSettings = $.extend({}, $.mockjaxSettings);
		
	});
	
	qunit.testDone(function() {
		$.mockjax.clear();
		$.mockjaxSettings = $.extend({}, qunit.defaultMockjaxSettings);
	});


	/* ----------------- */
	qunit.module( 'Core' );
	/* ----------------- */
	
	t('Return XMLHttpRequest object from $.ajax', function(assert) {
		$.mockjax({
			url: '/xmlhttprequest',
			responseText: 'Hello Word'
		});

		var xhr = $.ajax({
			url: '/xmlhttprequest',
			complete: function() { }
		});
		if (xhr && xhr.abort) {
			xhr.abort();
		}

		assert.ok(xhr, 'XHR object is not null or undefined');
		assert.ok(xhr.done && xhr.fail, 'Got Promise methods');
	});

	t('Intercept synchronized proxy calls and return synchronously', function(assert) {
		$.mockjax({
			url: '/proxy',
			proxy: 'test_proxy.json'
		});

		$.ajax({
			url: '/proxy',
			dataType: 'json',
			async: false,
			success: function(json) {
				assert.ok(json && json.proxy, 'Proxy callback request succeeded');
			},
			error: qunit.noErrorCallbackExpected
		});
	});

	t('Intercept asynchronized proxy calls', function(assert) {
		var done = assert.async();
		$.mockjax({
			url: '/proxy',
			proxy: 'test_proxy.json'
		});

		$.ajax({
			url: '/proxy',
			dataType: 'json',
			success: function(json) {
				assert.ok(json && json.proxy, 'Proxy callback request succeeded');
				done();
			},
			error: qunit.noErrorCallbackExpected
		});
	});

	t('Intercept and proxy (sub-ajax request)', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/proxy',
			proxy: 'test_proxy.json'
		});

		$.ajax({
			url: '/proxy',
			dataType: 'json',
			success: function(json) {
				assert.ok(json && json.proxy, 'Proxy request succeeded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: done
		});
	});

	t('Proxy type specification', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/proxy',
			proxy: 'test_proxy.json',
			proxyType: 'GET'
		});

		$.ajax({
			url: '/proxy',
			error: qunit.noErrorCallbackExpected,
			dataType: 'json',
			success: function(json) {
				assert.ok(json && json.proxy, 'Proxy request succeeded');
			},
			complete: done
		});
	});

	t('Support 1.5 $.ajax(url, settings) signature.', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/resource',
			responseText: 'Hello World'
		});

		$.ajax('/resource', {
			success: function(response) {
				assert.equal(response, 'Hello World');
			},
			error: qunit.noErrorCallbackExpected,
			complete: done
		});
	});

	t('Dynamic response callback', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			response: function(settings) {
				this.responseText = settings.data.response + ' 2';
			}
		});

		$.ajax({
			url: '/response-callback',
			dataType: 'text',
			data: {
				response: 'Hello world'
			},
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.responseText, 'Hello world 2', 'Response Text matches');
				done();
			}
		});
	});

	t('Dynamic asynchronous response callback', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			responseText: 'original response',
			response: function(settings, resDone) {
				var that = this;
				setTimeout(function() {
					that.responseText = settings.data.response + ' 3';
					resDone();
				}, 30);
			}
		});

		$.ajax({
			url: '/response-callback',
			dataType: 'text',
			data: {
				response: 'Hello world'
			},
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.responseText, 'Hello world 3', 'Response Text matches');
				done();
			}
		});
	});

	if (qunit.compareSemver($().jquery, '1.4', '>=')) {
		// The $.ajax() API changed in version 1.4 to include the third argument: xhr
		t('Success callback should have access to xhr object', function(assert) {
			var done = assert.async();
			
			$.mockjax({
				url: '/response'
			});

			$.ajax({
				type: 'GET',
				url: '/response',
				success: function() {
					assert.ok(arguments[2], 'there is a third argument to the success callback');
					assert.ok(arguments[2] && arguments[2].status === 200, 'third argument has proper status code');
					done();
				},
				error: function() {
					assert.ok(false, 'should not result in error');
					done();
				}
			});
		});
	}

	t('Dynamic response status callback', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			response: function() {
				this.status = 500;
				this.statusText = 'Internal Server Error';
			}
		});

		$.ajax({
			url: '/response-callback',
			dataType: 'text',
			data: {
				response: 'Hello world'
			},
			error: function() {
				assert.ok(true, 'error callback was called');
			},
			complete: function(xhr) {
				assert.equal(xhr.status, 500, 'Dynamically set response status matches');

				if( $.fn.jquery !== '1.5.2') {
					// This assertion fails in 1.5.2 due to this bug: http://bugs.jquery.com/ticket/9854
					// The statusText is being modified internally by jQuery in 1.5.2
					assert.equal(xhr.statusText, 'Internal Server Error', 'Dynamically set response statusText matches');
				}

				done();
			}
		});
	});

	t('Default Response Settings', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback'
		});

		$.ajax({
			url: '/response-callback',
			dataType: 'text',
			data: {
				response: ''
			},
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response status matches default');

				if( $.fn.jquery !== '1.5.2') {
					// This assertion fails in 1.5.2 due to this bug: http://bugs.jquery.com/ticket/9854
					// The statusText is being modified internally by jQuery in 1.5.2
					assert.equal(xhr.statusText, 'OK', 'Response statusText matches default');
				}

				assert.equal(xhr.responseText.length, 0, 'responseText length should be 0');
				assert.equal(xhr.responseXml === undefined, true, 'responseXml should be undefined');
				done();
			}
		});
	});

	t('Get mocked ajax calls - GET', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/api/example/*'
		});

		$.ajax({
			async: false,
			type: 'GET',
			url: '/api/example/1',
			complete: function() {
				var actualCalls = $.mockjax.mockedAjaxCalls();
				assert.equal(actualCalls.length, 1, 'mockjax call made');
				assert.equal(actualCalls[0].type, 'GET', 'mockjax call has expected method');
				assert.equal(actualCalls[0].url, '/api/example/1', 'mockjax call has expected url');
				done();
			}
		});
	});

	t('Test unmockedAjaxCalls returns the correct object when ajax call is not mocked and throwUnmocked is false', function(assert) {
		var done = assert.async();
		
		$.mockjaxSettings.throwUnmocked = false;

		$.ajax({
			async: true,
			type: 'GET',
			url: '/api/example/1',
			complete: function() {
				var unmockedAjaxCalls = $.mockjax.unmockedAjaxCalls();
				assert.equal(unmockedAjaxCalls.length, 1, 'Wrong number of unmocked ajax calls were returned');
				assert.equal(unmockedAjaxCalls[0].url, '/api/example/1', 'unmockedAjaxcall has unexpected url');
				done();
			}
		});
	});

	t('Test unmockedAjaxCalls are cleared when mockjax.clear is called', function(assert) {
		var done = assert.async();
		
		$.mockjaxSettings.throwUnmocked = false;

		$.ajax({
			async: true,
			type: 'GET',
			url: '/api/example/1',
			complete: function() {
				assert.equal($.mockjax.unmockedAjaxCalls().length, 1, 'Wrong number of unmocked ajax calls were returned');
				$.mockjax.clear();
				assert.equal($.mockjax.unmockedAjaxCalls().length, 0, 'Unmocked ajax calls not removed by mockjax.clear');
				done();
			}
		});
	});

	t('Test unmockedAjaxCalls returns nothing when no unmocked ajax calls occur', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/api/example/1'
		});

		$.ajax({
			async: true,
			type: 'GET',
			url: '/api/example/1',
			complete: function() {
				var unmockedAjaxCalls = $.mockjax.unmockedAjaxCalls();
				assert.equal(unmockedAjaxCalls.length, 0, 'No unmocked Ajax calls should have been returned');
				done();
			}
		});
	});

	t('Throw new error when throwUnmocked is set to true and unmocked ajax calls are fired', function(assert) {
		var done = assert.async();
		
		$.mockjaxSettings.throwUnmocked = true;

		try {
			$.ajax({
				async: true,
				type: 'GET',
				url: '/api/example/1',
				complete: function() {
					assert.ok(false, 'Unmocked ajax request completed successfully and should have thrown an error.');
					done();
				}
			});
		}
		catch (e) {
			assert.ok(e instanceof Error, 'Error was not thrown with "throwUnmocked" set to true and existing unmocked ajax request');
			done();
		}
	});

	t('Get unfired handlers', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/api/example/1'
		});
		$.mockjax({
			url: '/api/example/2'
		});

		$.ajax({
			async: false,
			type: 'GET',
			url: '/api/example/1',
			complete: function() {
				var handlersNotFired = $.mockjax.unfiredHandlers();
				assert.equal(handlersNotFired.length, 1, 'all mocks were fired');
				assert.equal(handlersNotFired[0].url, '/api/example/2', 'mockjax call has unexpected url');
				done();
			}
		});
	});

	t('Get unfired handlers after calling mockjax.clear', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/api/example/1'
		});
		$.mockjax({
			url: '/api/example/2'
		});
		$.mockjax({
			url: '/api/example/3'
		});

		$.ajax({
			async: false,
			type: 'GET',
			url: '/api/example/1',
			complete: function() {
				$.mockjax.clear(2);
				var handlersNotFired = $.mockjax.unfiredHandlers();
				assert.equal(handlersNotFired.length, 1, 'all mocks were fired');
				assert.equal(handlersNotFired[0].url, '/api/example/2', 'mockjax call has unexpected url');
				done();
			}
		});
	});

	t('Response settings correct using PUT method', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/put-request',
			type: 'PUT',
			responseText: 'this was a PUT'
		});

		$.ajax({
			url: '/put-request',
			type: 'PUT',
			dataType: 'text',
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response status matches default');

				assert.equal(xhr.responseText, 'this was a PUT', 'responseText is correct');
				done();
			}
		});
	});

	t('Get mocked ajax calls - POST with data', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/api/example/*'
		});

		$.ajax({
			async: false,
			type: 'POST',
			url: '/api/example/2',
			data: {a: 1},
			complete: function() {
				var actualCalls = $.mockjax.mockedAjaxCalls();
				assert.equal(actualCalls.length, 1, 'mockjax call made');
				assert.equal(actualCalls[0].type, 'POST', 'mockjax call has expected method');
				assert.equal(actualCalls[0].url, '/api/example/2', 'mockjax call has expected url');
				assert.deepEqual(actualCalls[0].data, {a: 1}, 'mockjax call has expected data');
				done();
			}
		});
	});

	t('Get mocked ajax calls - JSONP', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/api/example/*',
			contentType: 'text/json',
			proxy: 'test_jsonp.js'
		});
		var callbackExecuted = false;
		window.abcdef123456 = function() {
			assert.ok(true, 'JSONP Callback executed');
			callbackExecuted = true;
		};

		$.ajax({
			url: '/api/example/jsonp?callback=?',
			jsonpCallback: 'abcdef123456',
			dataType: 'jsonp',
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				var actualCalls = $.mockjax.mockedAjaxCalls();
				assert.equal(actualCalls.length, 1, 'Mockjax call made');
				assert.equal(actualCalls[0].url, '/api/example/jsonp?callback=abcdef123456', 'mockjax call has expected jsonp url');
				assert.ok(callbackExecuted, 'The jsonp callback was executed');
				done();
			}
		});
	});

	t('multiple mockjax calls are made', function(assert) {
		$.mockjax({
			url: '/api/example/*'
		});

		assert.equal($.mockjax.mockedAjaxCalls().length, 0, 'Initially there are no saved ajax calls');

		$.ajax({
			async: false,
			type: 'GET',
			url: '/api/example/1'
		});
		$.ajax({
			async: false,
			type: 'GET',
			url: '/api/example/2'
		});
		$.ajax({
			async: false,
			url: '/api/example/jsonp?callback=?',
			jsonpCallback: 'foo123',
			dataType: 'jsonp'
		});

		assert.equal($.mockjax.mockedAjaxCalls().length, 3, 'Afterwords there should be three saved ajax calls');
		
		var mockedUrls = $.map($.mockjax.mockedAjaxCalls(), function(ajaxOptions) {
			return ajaxOptions.url;
		});
		
		assert.deepEqual(mockedUrls, [
			'/api/example/1',
			'/api/example/2',
			'/api/example/jsonp?callback=foo123'
		], 'Mocked ajax calls are saved in execution order');
		
		$.mockjax.clear();
		
		assert.equal($.mockjax.mockedAjaxCalls().length, 0, 'After clearing there are no saved ajax calls');
	});

	t('Preserve context when set in jsonp ajax requet', function(assert) {
		var done = assert.async();
		
		$.mockjax({
				url: '/jsonp*',
				contentType: 'text/json',
				proxy: 'test_jsonp.js'
		});

		window.abcdef123456 = function() {};
		var cxt = {context: 'context'};

		$.ajax({
				url: '/jsonp?callback=?',
				jsonpCallback: 'abcdef123456',
				dataType: 'jsonp',
				error: qunit.noErrorCallbackExpected,
				context: cxt})
			.done(function() {
				assert.deepEqual(this, cxt, 'this is equal to context object');
				done();
			});
	});

	t('Validate this is the $.ajax object if context is not set', function(assert) {
		var done = assert.async();
		
		$.mockjax({
				url: '/jsonp*',
				contentType: 'text/json',
				proxy: 'test_jsonp.js'
		});

		window.abcdef123456 = function() {};

		$.ajax({
			url: '/jsonp?callback=?',
			jsonpCallback: 'abcdef123456',
			dataType: 'jsonp',
			error: qunit.noErrorCallbackExpected
		})
		.done(function() {
			assert.ok(this.jsonp, '\'this\' is the $.ajax object for this request.');
			done();
		});
	});
	
	t('Dynamic mock definition', function(assert) {
		var done = assert.async();
		
		$.mockjax( function( settings ) {
			var service = settings.url.match(/\/users\/(.*)$/);
			if (service) {
				return {
					proxy: 'test_proxy.json'
				};
			}
		});

		$.ajax({
			url: '/users/test',
			dataType: 'json',
			error: qunit.noErrorCallbackExpected,
			success: function(json) {
				assert.ok(json && json.proxy, 'Proxy request succeeded');
			},
			complete: done
		});
	});

	t('Dynamic mock response generation', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			response: function() {
				this.responseText = { currentTime: 'now: ' + new Date() };
			}
		});

		$.ajax({
			url: '/response-callback',
			dataType: 'json',
			error: qunit.noErrorCallbackExpected,
			success: function(json) {
				assert.equal(typeof json.currentTime, 'string', 'Dynamic response succeeded');
			},
			complete: done
		});
	});
	
	
	/* ---------------------------------- */
	qunit.module( 'Mock Handler Clearing' );
	/* ---------------------------------- */
	
	t('Remove mockjax definition by url', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/test',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '*',
			contentType: 'text/plain',
			responseText: 'default'
		});

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear('/test');

				// Reissue the request expecting the default handler
				$.ajax({
					url: '/test',
					success: function(text) {
						assert.equal(text, 'default', 'Default handler responded');
					},
					error: qunit.noErrorCallbackExpected,
					complete: function(xhr) {
						assert.equal(xhr.responseText, 'default', 'Default handler responded');
						done();
					}
				});
			}
		});
	});

	t('Remove mockjax definition by url (no default handler)', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/test',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear('/test');

				// Reissue the request expecting the error
				$.ajax({
					url: '/test',
					success: function() {
						assert.ok(false, 'The mock was not cleared by url');
					},
					error: function(xhr) {
						// Test against 0, might want to look at this more in depth
						assert.ok(404 === xhr.status || 0 === xhr.status, 'The mock was cleared by url');
						done();
					}
				});
			}
		});
	});

	t('Attempt to clear a non-existent but similar url', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/test',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '*',
			contentType: 'text/plain',
			responseText: 'default'
		});

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear('/tes');

				$.ajax({
					url: '/test',
					success: function(text) {
						assert.equal(text, 'test', 'Test handler responded');
						done();
					},
					error: qunit.noErrorCallbackExpected
				});
			}
		});
	});

	t('Remove mockjax definition, but not a subpath', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/test',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '/test/foo',
			contentType: 'text/plain',
			responseText: 'foo'
		});

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear('/test');

				$.ajax({
					url: '/test/foo',
					success: function(text) {
						assert.equal(text, 'foo', 'Test handler responded');
						done();
					},
					error: qunit.noErrorCallbackExpected
				});
			}
		});
	});

	t('Remove mockjax definition by RegExp', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/test',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '*',
			contentType: 'text/plain',
			responseText: 'default'
		});

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear(/test/);

				// Reissue the request expecting the default handler
				$.ajax({
					url: '/test',
					success: function(text) {
						assert.equal(text, 'default', 'Default handler responded');
					},
					error: qunit.noErrorCallbackExpected,
					complete: function(xhr) {
						assert.equal(xhr.responseText, 'default', 'Default handler responded');
						done();
					}
				});
			}
		});
	});

	t('Remove several mockjax definition by RegExp', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/test',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '/test1',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '/test/foo',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '*',
			contentType: 'text/plain',
			responseText: 'default'
		});

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear(/test/);

				// Reissue the request expecting the default handler
				$.ajax({
					url: '/test',
					success: function(text) {
						assert.equal(text, 'default', 'Default handler responded');
					},
					error: qunit.noErrorCallbackExpected,
					complete: function(xhr) {
						assert.equal(xhr.responseText, 'default', 'Default handler responded');
						done();
					}
				});
			}
		});
	});

	t('Remove mockjax definition by id', function(assert) {
		var done = assert.async();
		
		var id = $.mockjax({
			url: '/test',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '*',
			contentType: 'text/plain',
			responseText: 'default'
		});

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear(id);

				// Reissue the request expecting the default handler
				$.ajax({
					url: '/test',
					success: function(text) {
						assert.equal(text, 'default', 'Default handler responded');
					},
					error: qunit.noErrorCallbackExpected,
					complete: function(xhr) {
						assert.equal(xhr.responseText, 'default', 'Default handler responded');
						done();
					}
				});
			}
		});
	});

	t('Clearing mockjax removes all handlers', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/api/example/1',
			responseText: 'test1'
		});
		$.mockjax({
			url: '/api/example/2',
			responseText: 'test2'
		});

		$.ajax({
			async: true,
			type: 'GET',
			url: '/api/example/1',
			success: function(text) {
				assert.equal('test1', text, 'First call is mocked');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear();

				$.ajax({
					async: true,
					type: 'GET',
					url: '/api/example/1',
					success: function() {
						assert.ok( false, 'Call to first endpoint was mocked, but should not have been');
					},
					error: function(xhr) {
						// Test against 0, might want to look at this more in depth
						assert.ok(404 === xhr.status || 0 === xhr.status, 'First mock cleared after clear()');

						$.ajax({
							async: true,
							type: 'GET',
							url: '/api/example/2',
							success: function() {
								assert.ok( false, 'Call to second endpoint was mocked, but should not have been');
							},
							error: function(xhr) {
								// Test against 0, might want to look at this more in depth
								assert.ok(404 === xhr.status || 0 === xhr.status, 'Second mock cleared after clear()');
								done();
							}
						});
					}
				});
			}
		});
	});
	

	/* -------------------- */
	qunit.module( 'Logging' );
	/* -------------------- */
	
	t('Default log handler', function(assert) {
		var done = assert.async();
		
		if ( !window ) {
			// We aren't running in a context with window available
			done();
			return;
		}

		var _oldConsole = window.console;
		var msg = null;
		window.console = { log: function ( message ) {
			msg = message;
		}};
		var _oldLogging = $.mockjaxSettings.logging;
		$.mockjaxSettings.logging = true;
		$.mockjax({
			 url: '*'
		});
		$.ajax({
			url: '/console',
			type: 'GET',
			complete: function() {
				window.console = _oldConsole;
				assert.equal(msg, 'MOCK GET: /console', 'Default log handler was not called');
				$.mockjaxSettings.logging = _oldLogging;
				done();
			}
		});
	});

	t('Custom log handler', function(assert) {
		var done = assert.async();
		
		var msg = null;
		var _oldLog = $.mockjaxSettings.log;
		$.mockjaxSettings.log = function( mockHandler, requestSettings) {
			msg = requestSettings.type.toUpperCase() + ': ' + requestSettings.url;
		};
		$.mockjax({
			 url: '*'
		});
		$.ajax({
			url: '/console',
			type: 'GET',
			complete: function() {
				assert.equal(msg, 'GET: /console', 'Custom log handler was not called');
				$.mockjaxSettings.log = _oldLog;
				done();
			}
		});
	});

	t('Disable logging via `logging: false`', function(assert) {
		var done = assert.async();
		
		if ( !window ) {
			// We aren't running in a context with window available
			done();
			return;
		}

		var _oldConsole = window.console;
		var msg = null;
		window.console = { log: function ( message ) {
			msg = message;
		}};

		var _oldLogging = $.mockjaxSettings.logging;

		// Even though this is the suite default, we force it to be off
		$.mockjaxSettings.logging = false;

		$.mockjax({
			url: '*'
		});
		$.ajax({
			url: '/console',
			complete: function() {
				window.console = _oldConsole;
				assert.equal(msg, null, 'Logging method incorrectly called');
				$.mockjaxSettings.logging = _oldLogging;
				done();
			}
		});
	});

	t('Disable logging per mock via `logging: false`', function(assert) {
		var done = assert.async();
		
		if ( !window ) {
			// We aren't running in a context with window available
			done();
			return;
		}

		var _oldConsole = window.console;
		var msg = null;
		window.console = { log: function ( message ) {
			msg = message;
		}};

		var _oldLogging = $.mockjaxSettings.logging;

		// Even though this is the suite default, we force it to be on
		$.mockjaxSettings.logging = true;

		$.mockjax({
			url: '*',
			logging: false
		});

		$.ajax({
			url: '/console',
			complete: function() {
				window.console = _oldConsole;
				assert.equal(msg, null, 'Logging method incorrectly called');
				$.mockjaxSettings.logging = _oldLogging;
				done();
			}
		});
	});

	t('Inspecting $.mockjax.handler(id) after request has fired', function(assert) {
		var ID = $.mockjax({
			url: '/mockjax_properties',
			responseText: 'Hello Word'
		});

		$.ajax({
			url: '/mockjax_properties',
			complete: function() {}
		});

		assert.ok($.mockjax.handler(ID).fired, 'Sets the mock\'s fired property to true');
	});

	t('Case-insensitive matching for request types', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/case_insensitive_match',
			type: 'GET',
			responseText: 'uppercase type response'
		});

		$.ajax({
			url: '/case_insensitive_match',
			type: 'get',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.responseText, 'uppercase type response', 'Request matched regardless of case');
				done();
			}
		});
	});

	
	/* ----------------------------- */
	qunit.module( 'Headers Matching' );
	/* ----------------------------- */
	
	t('Not equal headers', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/exact/string',
			requestHeaders: {
				Authorization: '12345'
			},
			responseText: 'Exact headers'
		});

		$.ajax({
			url: '/exact/string',
			error: function() { assert.ok(true, 'Error called on bad request headers matching'); },
			success: function() { assert.ok(false, 'Success should not be called'); },
			complete: function() {
				var mockedAjaxCalls = $.mockjax.mockedAjaxCalls();
				assert.equal(mockedAjaxCalls.length, 0, 'No mocked Ajax calls should have been returned');
				done();
			}
		});
	});
	
	t('Not equal headers values', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/exact/string',
			requestHeaders: {
				Authorization: '12345'
			},
			responseText: 'Exact headers'
		});

		$.ajax({
			url: '/exact/string',
			headers: {
				Authorization: '6789'
			},
			error: function() { assert.ok(true, 'Error called on bad request headers matching'); },
			success: function() { assert.ok(false, 'Success should not be called'); },
			complete: function() {
				var mockedAjaxCalls = $.mockjax.mockedAjaxCalls();
				assert.equal(mockedAjaxCalls.length, 0, 'No mocked Ajax calls should have been returned');
				done();
			}
		});
	});
	
	t('Not equal multiple headers', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/exact/string',
			requestHeaders: {
				Authorization: '12345',
				MyHeader: 'hello'
			},
			responseText: 'Exact headers'
		});

		$.ajax({
			url: '/exact/string',
			headers: {
				Authorization: '12345'
			},
			error: function() { assert.ok(true, 'Error called on bad request headers matching'); },
			success: function() { assert.ok(false, 'Success should not be called'); },
			complete: function() {
				var mockedAjaxCalls = $.mockjax.mockedAjaxCalls();
				assert.equal(mockedAjaxCalls.length, 0, 'No mocked Ajax calls should have been returned');
				done();
			}
		});
	});
	
	t('Exact headers keys and values', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/exact/string',
			requestHeaders: {
				Authorization: '12345'
			},
			responseText: 'Exact headers'
		});

		$.ajax({
			url: '/exact/string',
			error: qunit.noErrorCallbackExpected,
			headers: {
				Authorization: '12345'
			},
			complete: function(xhr) {
				var mockedAjaxCalls = $.mockjax.mockedAjaxCalls();
				assert.equal(mockedAjaxCalls.length, 1, 'A mocked Ajax calls should have been returned');
				assert.equal(xhr.responseText, 'Exact headers', 'Exact headers keys and values');
				done();
			}
		});
	});
	
	t('Exact multiple headers keys and values', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/exact/string',
			requestHeaders: {
				Authorization: '12345',
				MyHeader: 'hello'
			},
			responseText: 'Exact multiple headers'
		});

		$.ajax({
			url: '/exact/string',
			error: qunit.noErrorCallbackExpected,
			headers: {
				Authorization: '12345',
				MyHeader: 'hello'
			},
			complete: function(xhr) {
				var mockedAjaxCalls = $.mockjax.mockedAjaxCalls();
				assert.equal(mockedAjaxCalls.length, 1, 'A mocked Ajax calls should have been returned');
				assert.equal(xhr.responseText, 'Exact multiple headers', 'Exact headers keys and values');
				done();
			}
		});
	});

	
	/* ------------------------- */
	qunit.module( 'URL Matching' );
	/* ------------------------- */
	
	t('Exact string', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/exact/string',
			responseText: 'exact string'
		});
		$.mockjax({
			url: '*',
			responseText: 'catch all'
		});

		$.ajax({
			url: '/exact/string',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.responseText, 'exact string', 'Exact string url match');
				done();
			}
		});
	});
	
	t('Wildcard match', function(assert) {
		function mock(mockUrl, url, response) {
			$.mockjax({
				url: mockUrl,
				responseText: response
			});
			$.ajax({
				async: false,
				url: url,
				error: qunit.noErrorCallbackExpected,
				complete: function(xhr) {
					assert.equal(xhr.responseText, response);
				}
			});
		}
		mock('/wildcard*w', '/wildcard/123456/w', 'w');
		mock('/wildcard*x', '/wildcard/123456/x', 'x');
		mock('*y', '/wildcard/123456/y', 'y');
		mock('z*', 'z/wildcard/123456', 'z');
		mock('/wildcard*aa/second/*/nice', '/wildcard/123456/aa/second/9991231/nice', 'aa');
	});
	
	t('RegEx match', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: /^\/regex-([0-9]+)/i,
			responseText: 'regex match'
		});
		$.mockjax({
			url: '*',
			responseText: 'catch all'
		});

		$.ajax({
			url: '/regex-123456',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.responseText, 'regex match', 'RegEx match');
				done();
			}
		});
	});


	/* ---------------------------------- */
	qunit.module( 'Request Data Matching' );
	/* ---------------------------------- */
	
	t('Incorrect data matching on request', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			data: {
				foo: 'bar'
			}
		});

		$.ajax({
			url: '/response-callback',
			error: function() { assert.ok(true, 'Error called on bad mock/data matching'); },
			data: {
				bar: 'baz'
			},
			success: function() {
				assert.ok( false, 'Success should not be called' );
			},
			complete: done
		});
	});

	t('Correct data matching on request', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			contentType: 'text/json',
			data: {
				foo: 'bar'
			},
			responseText: {}
		});

		$.ajax({
			url: '/response-callback',
			error: qunit.noErrorCallbackExpected,
			data: {
				foo: 'bar'
			},
			success: function() {
				assert.ok( true, 'Successfully matched data' );
			},
			complete: done
		});
	});

	t('Correct data matching on request - request can have additional properties', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			data: {
				foo: 'bar'
			}
		});

		$.ajax({
			url: '/response-callback',
			error: qunit.noErrorCallbackExpected,
			data: {
				foo: 'bar',
				bar: 'baz'
			},
			success: function() {
				assert.ok(true, 'Success should not be called');
			},
			complete: done
		});
	});

	t('Bug #80: Correct data matching on request with empty object literals', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			contentType: 'text/json',
			data: {},
			responseText: {}
		});

		$.ajax({
			url: '/response-callback',
			error: qunit.noErrorCallbackExpected,
			data: {},
			success: function() {
				assert.ok( true, 'Successfully matched data' );
			},
			complete: done
		});
	});

	t('Correct matching on request without data and mocks with and without data but same url', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			data: {
				foo: 'bar'
			},
			responseText: 'false match'
		});
		$.mockjax({
			url: '/response-callback',
			responseText: 'correct match'
		});
		$.mockjax({
			url: '/response-callback',
			data: {
				bar: 'foo'
			},
			responseText: 'another false match'
		});

		$.ajax({
			url: '/response-callback',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.responseText, 'correct match', 'Matched with correct mock');
				done();
			}
		});
	});

	// Related issue #68
	t('Bug #68: Incorrect data matching on request with arrays', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			contentType: 'text/json',
			data: {
				values: []
			}
		});

		$.ajax({
			url: '/response-callback',
			error: function() {
				assert.ok( true, 'Error callback fired' );
			},
			data: {
				values: [1,2,3]
			},
			success: function() {
				assert.ok( false, 'Success callback fired' );
			},
			complete: done
		});
	});

	t('Correct data matching on request with arrays', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			contentType: 'text/json',
			data: {
				values: [1,2,3]
			},
			responseText: {}
		});

		$.ajax({
			url: '/response-callback',
			error: qunit.noErrorCallbackExpected,
			data: {
				values: [1,2,3]
			},
			success: function() {
				assert.ok(true, 'Success callback fired');
			},
			complete: done
		});
	});


	t('Multiple data matching requests', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			contentType: 'text/json',
			data: {
				remote: {
					test: function(data) {
						return data !== 'hello';
					}
				}
			},
			responseText: { 'yes?': 'no' }
		});
		$.mockjax({
			url: '/response-callback',
			contentType: 'text/json',
			data: {
				remote: {
					test: function(data) {
						return data === 'hello';
					}
				}
			},
			responseText: { 'yes?': 'yes' }
		});

		var callCount = 2;
		$.ajax({
			url: '/response-callback',
			error: qunit.noErrorCallbackExpected,
			dataType: 'json',
			data: {
				remote: 'h'
			},
			success: function(resp) {
				assert.deepEqual( resp, {'yes?': 'no'}, 'correct mock hander' );
			},
			complete: function() {
				callCount--;
				
				if (callCount <= 0) {
					done();
				}
			}
		});
		$.ajax({
			url: '/response-callback',
			error: qunit.noErrorCallbackExpected,
			data: {
				remote: 'hello'
			},
			dataType: 'json',
			success: function(resp) {
				assert.deepEqual( resp, {'yes?': 'yes'}, 'correct mock hander' );
			},
			complete: function() {
				callCount--;
				
				if (callCount <= 0) {
					done();
				}
			}
		});
	});

	t('Bug #106: Null matching on request', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			contentType: 'text/json',
			data: {
				foo: 'bar',
				bar: null
			},
			responseText: {}
		});

		$.ajax({
			url: '/response-callback',
			error: qunit.noErrorCallbackExpected,
			data: {
				foo: 'bar',
				bar: null
			},
			success: function() {
				assert.ok( true, 'Successfully matched data that contained null values' );
			},
			complete: done
		});
	});


	/* ----------------------- */
	qunit.module( 'Data Types' );
	/* ----------------------- */
	
	t('Response returns text', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/text',
			contentType: 'text/plain',
			responseText: 'just text'
		});
		$.ajax({
			url: '/text',
			dataType: 'text',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/plain', 'Content type of text/plain');

				done();
			}
		});
	});
	
	t('Response returns html', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/html',
			contentType: 'text/html',
			responseText: '<div>String</div>'
		});
		$.ajax({
			url: '/html',
			dataType: 'html',
			success: function(data) {
				assert.equal(data, '<div>String</div>', 'HTML String matches');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/html', 'Content type of text/html');
				done();
			}
		});
	});
	
	t('Response returns json', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/json',
			contentType: 'text/json',
			responseText: { 'foo' : 'bar', 'baz' : { 'car' : 'far' } }
		});
		$.ajax({
			url: '/json',
			dataType: 'json',
			success: function(json) {
				assert.deepEqual(json, { 'foo' : 'bar', 'baz' : { 'car' : 'far' } }, 'JSON Object matches');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/json', 'Content type of text/json');
				done();
			}
		});
	});

	t('Response returns jsonp', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/jsonp*',
			contentType: 'text/json',
			proxy: 'test_jsonp.js'
		});
		window.abcdef123456 = function(json) {
			assert.ok( true, 'JSONP Callback executed');
			assert.deepEqual(json, { 'data' : 'JSONP is cool' });
		};

		$.ajax({
			url: '/jsonp?callback=?',
			jsonpCallback: 'abcdef123456',
			dataType: 'jsonp',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/json', 'Content type of text/json');
				done();
			}
		});
	});

	t('Response returns jsonp and return value from ajax is a promise if supported', function(assert) {
		var done = assert.async();
		
		window.rquery = /\?/;

		$.mockjax({
			url:'http://api*',
			responseText:{
				success:true,
				ids:[21327211]
			},
			dataType:'jsonp',
			contentType: 'text/json'
		});

		var promiseObject = $.ajax({
			url:'http://api.twitter.com/1/followers/ids.json?screen_name=test_twitter_user',
			dataType:'jsonp'
		});

		assert.ok(promiseObject.done && promiseObject.fail, 'Got Promise methods');
		promiseObject.then(function() {
			assert.ok(true, 'promise object then is executed');
		});

		done();
	});

	t('Response executes script', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/script',
			contentType: 'text/plain',
			proxy: 'test_script.js'
		});

		window.TEST_SCRIPT_VAR = 0;
		$.ajax({
			url: '/script',
			dataType: 'script',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(window.TEST_SCRIPT_VAR, 1, 'Script executed');
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/plain', 'Content type of text/plain');

				done();
			}
		});
	});
	
	t('Grouping deferred responses, if supported', function(assert) {
		var done = assert.async();
		
		window.rquery = /\?/;

		$.mockjax({
			url:'http://api*',
			responseText:{
				success:true,
				ids:[21327211]
			},
			dataType:'jsonp',
			contentType: 'text/json'
		});

		var req1 = $.ajax({
			url:'http://api.twitter.com/1/followers/ids.json?screen_name=test_twitter_user',
			dataType:'jsonp'
		});
		var req2 = $.ajax({
			url:'http://api.twitter.com/1/followers/ids.json?screen_name=test_twitter_user',
			dataType:'jsonp'
		});
		var req3 = $.ajax({
			url:'http://api.twitter.com/1/followers/ids.json?screen_name=test_twitter_user',
			dataType:'jsonp'
		});

		$.when(req1, req2, req3).done(function() {
			assert.ok(true, 'Successfully grouped deferred responses');
		});

		done();
	});
	
	t('Response returns parsed XML', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/xml',
			contentType: 'text/xml',
			responseXML: '<document>String</document>'
		});
		$.ajax({
			url: '/xml',
			dataType: 'xml',
			success: function(xmlDom) {
				assert.ok( $.isXMLDoc( xmlDom ), 'Data returned is an XML DOM');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr, error) {
				assert.ok(true, 'Error: ' + error);
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/xml', 'Content type of text/xml');
				done();
			}
		});
	});

	
	/* -------------------------------- */
	qunit.module( 'Connection Simulation', {
	/* -------------------------------- */
		beforeEach: function() {
			this.variableDelayMin = 100;
			this.variableDelayMax = 300;
			this.processingDuration = 30;

			$.mockjax({
				url: '/delay',
				responseTime: 150
			});
			
			$.mockjax({
				url: 'http://foobar.com/jsonp-delay?callback=?',
				contentType: 'text/json',
				proxy: 'test_jsonp.js',
				responseTime: 150,
				responseText: '{}'
			});
			
			$.mockjax({
				url: '/variable-delay',
				responseTime: [this.variableDelayMin, this.variableDelayMax]
			});

			$.mockjax({
				url: '/proxy',
				proxy: 'test_proxy.json',
				responseTime: 50
			});
			
			$.mockjax({
				url: '*',
				responseText: '',
				responseTime: 50
			});
		}
	});
	
	t('Async test', function(assert) {
		var done = assert.async();
		
		var order = [];
		$.ajax({
			async: true,
			url: '/',
			success: function() {
				order.push('b');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				assert.deepEqual(order, ['a', 'b'], 'Order of execution correct, 2');
				done();
			}
		});
		order.push('a');
		assert.deepEqual(order, ['a'], 'Order of execution correct, 1');
	});
	
	t('Sync test', function(assert) {
		var order = [];
		$.ajax({
			async: false,
			url: '/',
			success: function() {
				order.push('b');
				assert.deepEqual(order, ['b'], 'Order of execution correct, 1');
			},
			error: qunit.noErrorCallbackExpected
		});
		order.push('a');
		assert.deepEqual(order, ['b', 'a'], 'Order of execution correct, 2');
	});
	
	t('Response time simulation and latency', function(assert) {
		var done = assert.async();
		
		var executed = 0, ts = new Date();
		$.ajax({
			url: '/delay',
			complete: function() {
				var delay = ((new Date()) - ts);
				assert.ok( delay >= 150, 'Correct delay simulation (' + delay + ')' );
				assert.strictEqual( executed, 1, 'Callback execution order correct');
				done();
			}
		});
		setTimeout(function() {
			assert.strictEqual( executed, 0, 'No premature callback execution');
			executed++;
		}, 30);
	});
	
	t('Response time with jsonp', function(assert) {
		var done = assert.async();
		
		var executed = false, ts = new Date();

		$.ajax({
			url: 'http://foobar.com/jsonp-delay?callback=?',
			dataType: 'jsonp',
			complete: function() {
				var delay = ((new Date()) - ts);
				assert.ok( delay >= 150, 'Correct delay simulation (' + delay + ')' );
				assert.ok( executed, 'Callback execution order correct');
				done();
			}
		});

		setTimeout(function() {
			assert.ok( executed === false, 'No premature callback execution');
			executed = true;
		}, 30);
	});

	t('Response time with min and max values', function (assert) {
		var done = assert.async();
		
		var executed = 0,
			that = this,
			ts = new Date();
		$.ajax({
			url: '/variable-delay',
			complete: function () {
				var delay = ((new Date()) - ts);
				assert.ok(delay >= that.variableDelayMin, 'Variable delay greater than min; delay was ' + delay);
				assert.ok(delay <= (that.variableDelayMax + that.processingDuration), 'Variable delay less than max; delay was ' + delay);
				assert.equal(executed, 1, 'Callback execution order correct');
				done();
			}
		});
		setTimeout(function () {
			assert.strictEqual(executed, 0, 'No premature callback execution');
			executed++;
		}, 30);
	});

	t('Proxy asynchronous response time', function (assert) {
		var done = assert.async();
		var executed = false, ts = new Date();

		$.ajax({
			url: '/proxy',
			type: 'json',
			success: function () {
				var delay = ((new Date()) - ts);
				assert.ok( delay >= 50, 'Correct delay simulation (' + delay + ')' );
				assert.strictEqual(executed, false, 'No premature callback execution');
				executed = true;
				done();
			},
			error: qunit.noErrorCallbackExpected
		});
		setTimeout(function () {
			assert.strictEqual(executed, false, 'No premature callback execution');
		}, 30);

	});
	/* -------------------- */
	qunit.module( 'Headers' );
	/* -------------------- */
	
	t('headers can be inspected via setRequestHeader()', function(assert) {
		var done = assert.async();
		
		assert.expect(1);

		$(document).ajaxSend(function(event, xhr) {
			xhr.setRequestHeader('X-CSRFToken', '<this is a token>');
		});

		$.mockjax( function ( requestSettings ) {
			var key;
			
			if ('/inspect-headers' === requestSettings.url) {
				return {
					response: function() {
						if (typeof requestSettings.headers['X-Csrftoken'] !== 'undefined') {
							key = 'X-Csrftoken';  // bugs in jquery 1.5
						} else {
							key = 'X-CSRFToken';
						}
						assert.equal(requestSettings.headers[key], '<this is a token>');
						this.responseText = {};
					}
				};
			}
		});

		$.ajax({
			url: '/inspect-headers',
			complete: done
		});
	});

	t('Response status callback', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			status: 403
		});

		$.ajax({
			url: '/response-callback',
			success: function() {
				assert.ok(false, 'Success handler should not have been called');
			},
			complete: function(xhr) {
				assert.equal(xhr.status, 403, 'response status matches');
				done();
			}
		});
	});
	
	t('Setting the content-type', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			contentType: 'text/json',
			responseText: {
				foo: 'bar'
			}
		});

		$.ajax({
			url: '/response-callback',
			dataType: 'json',
			error: qunit.noErrorCallbackExpected,
			success: function(json) {
				assert.deepEqual(json, { 'foo' : 'bar' }, 'JSON Object matches');
			},
			complete: function(xhr) {
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/json', 'Content type of json');
				done();
			}
		});
	});
	
	t('Setting additional HTTP response headers', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			headers: {
				'X-Must-Exist': 'yes'
			},
			responseText: 'done'
		});

		$.ajax({
			url: '/response-callback',
			error: qunit.noErrorCallbackExpected,
			success: function(response) {
				assert.equal( response, 'done', 'Response text matches' );
			},
			complete: function(xhr) {
				assert.equal(xhr.getResponseHeader( 'X-Must-Exist' ), 'yes', 'Header matches');
				done();
			}
		});
	});

	t('Testing that request headers do not overwrite response headers', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/restful/fortune',
			headers : {
				prop: 'response'
			}
		});

		var returnedXhr = $.ajax({
			type: 'GET',
			url: '/restful/fortune',
			headers : {
				prop : 'request'
			},
			success: function(res, status, xhr) {
				if (xhr) {
					assert.equal(xhr && xhr.getResponseHeader('prop'), 'response', 'response header should be correct');
				} else {
					assert.equal(returnedXhr.getResponseHeader('prop'), 'response', 'response header should be correct');
				}
			},
			error: qunit.noErrorCallbackExpected,
			complete: done
		});
	});
	
	
	/* --------------------- */
	qunit.module( 'Timeouts' );
	/* --------------------- */

	t('Forcing timeout', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			responseText: 'done',
			isTimeout: true
		});

		$.ajax({
			url: '/response-callback',
			error: function(xhr, textStatus, errorThrown ) {
				assert.equal( textStatus, 'timeout', 'Text status is equal to timeout' );
				assert.ok( errorThrown !== 'OK', 'errorThrown is undefined or timeout, not OK' );
				assert.ok(true, 'error callback was called');
			},
			success: function() {
				assert.ok(false, 'should not be be successful');
			},
			complete: done
		});
	});

	t('Forcing timeout with Promises', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			isTimeout: true
		});

		var request = $.ajax({
			url: '/response-callback'
		});

		request.done(function() {
			assert.ok(false, 'Should not be successful');
		});

		request.fail(function() {
			assert.ok(true, 'error callback was called');
		});

		request.complete(done);
	});


	/* ------------------------------------ */
	qunit.module( 'Miscellaneous Bug Tests' );
	/* ------------------------------------ */
	
	t('Test bug fix for $.mockjaxSettings', function(assert) {
		var done = assert.async();
		
		$.mockjaxSettings.headers = {
			'content-type': 'text/plain',
			etag: 'IJF@H#@923uf8023hFO@I#H#'
		};

		$.mockjax({
			url: '/get/property',
			type: 'GET',
			response: function() {
				this.responseText = { foo: 'bar' };
			}
		});

		$.ajax({
			url: '/get/property',
			success: function() {
				assert.deepEqual( $.mockjaxSettings.headers, {
					'content-type': 'text/plain',
					etag: 'IJF@H#@923uf8023hFO@I#H#'
				}, 'Should not change the default headers.');
			},
			complete: done
		});
	});

	t('Preserve responseText inside a response function when using jsonp and a success callback', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: 'http://some/fake/jsonp/endpoint',
			// The following line works...
			// responseText: [{ 'data' : 'JSONP is cool' }]
			// But doesn't not work when setting this.responseText in response
			response: function() {
				this.responseText = [{ 'data' : 'JSONP is cool' }];
			}
		});

		$.ajax({
			url: 'http://some/fake/jsonp/endpoint',
			dataType: 'jsonp',
			success: function(data) {
				assert.deepEqual(data, [{ 'data' : 'JSONP is cool' }]);
				done();
			}
		});
	});

	t('Custom status when using proxy', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/response-callback',
			status: 409,
			proxy: 'test_proxy.json'
		});

		$.ajax({
			url: '/response-callback',
			error: function() { assert.ok(true, 'error callback was called'); },
			success: function() {
				assert.ok( false, 'Success should not be called' );
			},
			complete: function(xhr) {
				assert.equal(xhr.status, 409, 'response status matches');
				done();
			}
		});
	});

	t('Call onAfterSuccess after success has been called', function(assert) {
		var done = assert.async();
		
		var onAfterSuccessCalled = false;
		var successCalled = false;
		$.mockjax({
			url: '/response-callback',
			onAfterSuccess: function() {
				onAfterSuccessCalled = true;
				assert.equal(successCalled, true, 'success was not yet called');
			}
		});

		$.ajax({
			url: '/response-callback',
			success: function() {
				successCalled = true;
			}
		});

		setTimeout(function() {
			assert.equal(onAfterSuccessCalled, true, 'onAfterSuccess was not called');
			done(); 
		}, 100);
	});

	t('Call onAfterError after error has been called', function(assert) {
		var done = assert.async();
		
		var onAfterErrorCalled = false;
		var errorCalled = false;
		$.mockjax({
			url: '/response-callback-bad',
			status: 500,
			onAfterError: function() {
				onAfterErrorCalled = true;
				assert.equal(errorCalled, true, 'error was not yet called');
			}
		});

		$.ajax({
			url: '/response-callback-bad',
			error: function() {
				errorCalled = true;
			}
		});

		setTimeout(function() {
			assert.equal(onAfterErrorCalled, true, 'onAfterError was not called');
			done(); 
		}, 100);
	});

	t('Call onAfterComplete after complete has been called', function(assert) {
    	var done = assert.async();
    	
    	var onAfterCompleteCalled = false;
    	var completeCalled = false;
    	$.mockjax({
    		url: '/response-callback',
    		onAfterComplete: function() {
    			onAfterCompleteCalled = true;
    			assert.equal(completeCalled, true, 'complete was not yet called');
    		}
    	});

    	$.ajax({
    		url: '/response-callback',
    		complete: function() {
    			completeCalled = true;
    		}
    	});

    	setTimeout(function() {
    		assert.equal(onAfterCompleteCalled, true, 'onAfterComplete was not called');
    		done(); 
    	}, 100);
    });

	t('Bug #95: undefined responseText on success', function(assert) {
		assert.expect(2);

		var expected = { status: 'success', fortune: 'Are you a turtle?' };

		$.mockjax({
			url: 'test/something',
			responseText: { status: 'success', fortune: 'Are you a turtle?' }
		});

		$.ajax({
			type: 'GET',
			url: 'test/something',
			async: false,
			success: function(data) {
				// Before jQuery 1.5 the response is a stringified version of the 
				// json data unless the 'dataType' option is set to "json"
				var expectedResult = expected;
				if (qunit.compareSemver($().jquery, '1.5', '<')) {
					expectedResult = JSON.stringify(expected);
				}
				assert.deepEqual(data, expectedResult, 'responseText is correct JSON object');
			}
		});

		$.ajax({
			type: 'GET',
			url: 'test/something',
			dataType: 'json',
			async: false,
			success: function(data) {
				assert.deepEqual(data, expected, 'responseText is correct JSON object');
			}
		});
	});

	t('alias type to method', function(assert) {
		var done = assert.async();
		
		$.mockjax(function(settings) {
			if (settings.url === '/get/property') {
				assert.equal(settings.type, settings.method);

				return {
					responseText: { status: 'success', fortune: 'Are you a ninja?' }
				};
			}

			return false;
		});

		$.ajax({
			url: '/get/property',
			type: 'GET',
			complete: function() {
				$.ajax({
					url: '/get/property',
					method: 'POST',
					complete: done
				});
			}
		});
	});

	t('Bug #26: jsonp mock fails with remote URL and proxy', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: 'http://example.com/jsonp*',
			contentType: 'text/json',
			proxy: 'test_jsonp.js'
		});
		var callbackExecuted = false;
		window.abcdef123456 = function(json) {
			callbackExecuted = true;
			assert.deepEqual(json, { 'data' : 'JSONP is cool' }, 'The proxied data is correct');
		};

		$.ajax({
			url: 'http://example.com/jsonp?callback=?',
			jsonpCallback: 'abcdef123456',
			dataType: 'jsonp',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.ok(callbackExecuted, 'The jsonp callback was executed');
				assert.equal(xhr.statusText, 'success', 'Response was successful');
				done();
			}
		});
	});

	t('Bug #254: subsequent timeouts', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/timeout-check',
			responseTime: 20,
			isTimeout: true,
			responseText: 'foobar'
		});
		
		$.ajax({
			url: '/timeout-check',
			error: function(xhr, textStatus, errorThrown ) {
				assert.equal( textStatus, 'timeout', 'Text status on call #1 is equal to timeout' );
				assert.ok( errorThrown !== 'OK', 'errorThrown is not "OK" on call #1' );
			},
			success: function() {
				assert.ok(false, 'call #1 should not be successful');
			},
			complete: function() {
				// do a second call and ensure we still timeout
				$.ajax({
					url: '/timeout-check',
					error: function(xhr, textStatus, errorThrown ) {
						assert.equal( textStatus, 'timeout', 'Text status on call #2 is equal to timeout' );
						assert.ok( errorThrown !== 'OK', 'errorThrown is not "OK" on call #2' );
					},
					success: function() {
						assert.ok(false, 'call #2 should not be be successful');
					},
					complete: done
				});
			}
		});
	});

	
	/* -------------------- */
	qunit.module('namespace');
	/* -------------------- */
	
	t('url should be namespaced via global mockjax settings', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: 'myservice'
		});

		$.ajax({
			url: '/api/v1/myservice',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				done();
			}
		});
	});

	t('should be able to override global namespace per-mock', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: 'myservice',
			namespace: '/api/v2'
		});

		$.ajax({
			url: '/api/v2/myservice',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				$.ajax({
					url: '/api/v1/myservice',
					error: function() {
						assert.ok(true, 'error callback was called');
						done();
					}
				});
			}
			});
	});

	t('should not mock a non-matching url within a namespace', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: 'myservice'
		});

		$.ajax({
			url: '/api/v1/yourservice',
			success: function() {
				assert.ok(false, 'call should not be successful');
			},
			error: function() {
				assert.ok(true, 'error callback was called');
				done();
			}
		});
	});

	t('should handle multiple mocks in a row within a namespace', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: 'one'
		});

		$.mockjax({
			url: 'two'
		});

		$.ajax({
			url: '/api/v1/one',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				$.ajax({
					url: '/api/v1/two',
					complete: function(xhr) {
						assert.equal(xhr.status, 200, 'Response was successful');
						done();
					}
				});
			}
		});
	});

	t('should pass the correct url to the response settings', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: 'myservice',
			response: function(settings) {
				assert.equal(settings.url, '/api/v1/myservice');
			}
		});

		$.ajax({
			url: '/api/v1/myservice',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				done();
			}
		});
	});

	t('should handle extra slashes', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1/';

		$.mockjax({
			url: '/myservice'
		});

		$.ajax({
			url: '/api/v1/myservice',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				done();
			}
		});
	});

	t('should handle missing slashes', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: 'myservice'
		});

		$.ajax({
			url: '/api/v1/myservice',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				done();
			}
		});
	});

})(window.QUnit, window.jQuery);