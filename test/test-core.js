(function(qunit, $) {
	'use strict';

	var t = qunit.test;

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
			},
			error: qunit.noErrorCallbackExpected,
			complete: done
		});
	});

	t('Intercept proxy calls for XML', function(assert) {
		$.mockjax({
			url: '/proxy',
			proxy: 'test_proxy.xml'
		});

		$.ajax({
			url: '/proxy',
			dataType: 'xml',
			async: false,
			success: function(doc) {
				assert.ok(doc, 'Proxy callback request succeeded');
				assert.strictEqual($(doc).find('foo').length, 1, 'Foo element exists in XML');
				assert.strictEqual($(doc).find('foo').text(), 'bar', 'XML content is correct');
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
				window.abcdef123456 = null;
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
			window.abcdef123456 = null;
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

	t('Inspecting $.mockjax.handlers() for type and length', function(assert) {
		assert.ok(Array.isArray($.mockjax.handlers()), 'The list of handlers is an array before any mocks');
		assert.strictEqual($.mockjax.handlers().length, 0, 'The list of handlers is empty before any mocks');

		$.mockjax({ url: '/foo', responseText: 'Hello Word' });

		assert.ok(Array.isArray($.mockjax.handlers()), 'The list of handlers is an array after adding a mock');
		assert.strictEqual($.mockjax.handlers().length, 1, 'The length of the list of handlers is correct after adding a mock');

		$.mockjax({ url: '/bar', responseText: 'Hello Word' });
		$.mockjax({ url: '/bat', responseText: 'Hello Word' });
		$.mockjax({ url: '/baz', responseText: 'Hello Word' });

		assert.ok(Array.isArray($.mockjax.handlers()), 'The list of handlers is an array after adding many mocks');
		assert.strictEqual($.mockjax.handlers().length, 4, 'The length of the list of handlers is correct after adding many mocks');
	});

	t('Testing $.mockjax.handlers() after clearing', function(assert) {
		$.mockjax({ url: '/foo', responseText: 'Hello Word' });
		$.mockjax({ url: '/bar', responseText: 'Hello Word' });
		$.mockjax({ url: '/bat', responseText: 'Hello Word' });
		$.mockjax({ url: '/baz', responseText: 'Hello Word' });

		assert.ok(Array.isArray($.mockjax.handlers()), 'The list of handlers is an array after adding mocks');
		assert.strictEqual($.mockjax.handlers().length, 4, 'The length of the list of handlers is correct after adding mocks');

		$.mockjax.clear(1);

		assert.ok(Array.isArray($.mockjax.handlers()), 'The list of handlers is an array after clearing mock');
		assert.strictEqual($.mockjax.handlers().length, 4, 'The length of the list of handlers is correct after clearing mock');
		assert.strictEqual($.mockjax.handlers()[0].url, '/foo', 'The first handler is correct after clearing');
		assert.strictEqual($.mockjax.handlers()[1], null, 'The cleared handler is correct after clearing');
		assert.strictEqual($.mockjax.handlers()[3].url, '/baz', 'The last handler is correct after clearing');
	});


	t('Inspecting $.mockjax() with multiple mocks argument', function(assert) {
		var done = assert.async();
		var handlers = $.mockjax([
			{ url: '/response-callback', responseText: 'First' },
			{ url: '/response-callback', responseText: 'Second' }
		]);

		assert.equal(handlers.length, 2, 'Not enough mocks')

		var callCount = 2;
		$.ajax({
			url: '/response-callback',
			complete: function() {
				callCount--;
				if (callCount === 0) {
					done();
				}
			}
		});
		$.ajax({
			url: '/response-callback',
			complete: function() {
				callCount--;
				if (callCount === 0) {
					done();
				}
			}
		});
	});

	t('Inspecting $.mockjax() with empty multiple mocks argument', function(assert) {
		var done = assert.async();
		var handlers = $.mockjax([]);

		assert.equal(handlers.length, 0)

		$.ajax({
			url: '/response-callback',
			error: function() {
				done();
			}
		});
	});

	t('Inspecting $.mockjax() with null in multiple mocks argument', function(assert) {
		var done = assert.async();
		var handlers = $.mockjax([ null ]);

		assert.equal(handlers.length, 1)

		$.ajax({
			url: '/response-callback',
			error: function() {
				done();
			}
		});
	});

	t('Inspecting $.mockjax() with multiple mocks argument and reset handler', function(assert) {
		var done = assert.async();
		var handlers = $.mockjax([
			{ url: '/rest', responseText: 'will be reset' }
		]);

		assert.equal(handlers.length, 1);
		$.mockjax.clear(handlers[0]);

		$.ajax({
			url: '/response-callback',
			error: function() {
				done();
			}
		});
	});

})(window.QUnit, window.jQuery);
