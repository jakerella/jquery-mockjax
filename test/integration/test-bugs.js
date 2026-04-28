(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
	
	/* ------------------------------------ */
	qunit.module( 'Miscellaneous Bug Tests' );
	/* ------------------------------------ */
	
	t('Test bug fix for $.mockjaxSettings headers', function(assert) {
		var done = assert.async();
		
		$.mockjaxSettings.responseHeaders = {
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
				assert.deepEqual( $.mockjaxSettings.responseHeaders, {
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
			proxy: '../proxies/data-proxy.json'
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
				assert.deepEqual(data, expected, 'responseText is correct JSON object');
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
			proxy: '../proxies/jsonp-script.js'
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
				window.abcdef123456 = null;
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

    t('Bug #136: cross domain script requests - GET', function(assert) {
        var done = assert.async();
        
        $.mockjax({
            type: 'GET',
            url: 'http://crossdomain.test/somefile.js',
            responseText: '(window.mockjaxCrossDomain=true)'
        });
        
        $.ajax({
            type: 'GET',
            dataType: 'script',
            url: 'http://crossdomain.test/somefile.js',
            crossOrigin: 'anonymous',
            error: qunit.noErrorCallbackExpected,
            success: function() {
                assert.strictEqual(window.mockjaxCrossDomain, true, 'mockjax call for script was mocked');
            },
            complete: done
        });
    });
    
    t('Bug #136: cross domain script requests - POST', function(assert) {
        var done = assert.async();
        
        $.mockjax({
            type: 'POST',
            url: 'http://crossdomain.test/somefile.js',
            responseText: '(window.mockjaxCrossDomain=true)'
        });
        
        $.ajax({
            type: 'POST',
            dataType: 'script',
            url: 'http://crossdomain.test/somefile.js',
            crossOrigin: 'anonymous',
            error: qunit.noErrorCallbackExpected,
            success: function() {
                assert.strictEqual(window.mockjaxCrossDomain, true, 'mockjax call for script was mocked');
            },
            complete: done
        });
    });
    
	t('Bug #86: JSONP response treated as plain JSON when using jQuery-generated callback', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: 'http://foo.com/api/jsonp',
			contentType: 'application/javascript',
			responseText: { 'data' : 'JSONP is cool' }
		});
		
		$.ajax({
			url: 'http://foo.com/api/jsonp',
			dataType: 'jsonp',
			jsonp: 'callback',
			error: qunit.noErrorCallbackExpected,
			success: function(data) {
				assert.deepEqual(data, { 'data' : 'JSONP is cool' }, 'success gets correct data');
			},
			complete: function() {
				var actualCalls = $.mockjax.mockedAjaxCalls();
				assert.equal(actualCalls.length, 1, 'Mockjax call made');
				assert.equal(actualCalls[0].url, 'http://foo.com/api/jsonp', 'mockjax call has expected jsonp url');
				done();
			}
		});
	});

	t('Bug #86: JSONP response treated as plain JSON - string data', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: 'http://foo.com/api/jsonp',
			contentType: 'application/javascript',
			responseText: 'Testy Test'
		});
		
		$.ajax({
			url: 'http://foo.com/api/jsonp',
			dataType: 'jsonp',
			jsonp: 'callback',
			error: qunit.noErrorCallbackExpected,
			success: function(data) {
				assert.strictEqual(data, 'Testy Test', 'success gets correct data');
			},
			complete: function() {
				var actualCalls = $.mockjax.mockedAjaxCalls();
				assert.equal(actualCalls.length, 1, 'Mockjax call made');
				assert.equal(actualCalls[0].url, 'http://foo.com/api/jsonp', 'mockjax call has expected jsonp url');
				done();
			}
		});
	});
	
	t('Bug #86: JSONP response treated as plain JSON - numeric data', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: 'http://foo.com/api/jsonp',
			contentType: 'application/javascript',
			responseText: 42
		});
		
		$.ajax({
			url: 'http://foo.com/api/jsonp',
			dataType: 'jsonp',
			jsonp: 'callback',
			error: qunit.noErrorCallbackExpected,
			success: function(data) {
				assert.strictEqual(data, 42, 'success gets correct data');
			},
			complete: function() {
				var actualCalls = $.mockjax.mockedAjaxCalls();
				assert.equal(actualCalls.length, 1, 'Mockjax call made');
				assert.equal(actualCalls[0].url, 'http://foo.com/api/jsonp', 'mockjax call has expected jsonp url');
				done();
			}
		});
	});
    
    t('Bug #267: handle undefined url in first arg', function(assert) {
        var done = assert.async();
        
        $.mockjax({
            url: '/api/foo',
            contentType: 'application/json',
            responseText: { foo: 'bar' }
        });
        
        $.ajax(undefined, {
            url: '/api/foo',
            dataType: 'json',
            error: qunit.noErrorCallbackExpected,
            success: function(data) {
                assert.deepEqual(data, { foo: 'bar' }, 'success gets correct data');
            },
            complete: done
        });
    });

	t('Bug #374: Retained ajax calls removed on single mock clear', function(assert) {
		var done = assert.async();

		assert.equal($.mockjax.mockedAjaxCalls().length, 0, 'mocked calls starts at 0');
		assert.equal($.mockjax.unmockedAjaxCalls().length, 0, 'unmocked calls starts at 0');
		
		const handler1 = $.mockjax({
			url: '/retain-test-1',
			responseText: 'handler-1'
		});
		$.mockjax({
			url: '/retain-test-2',
			responseText: 'handler-2'
		});

		$.ajax({
			url: '/retain-test-1',
			async: false,
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'first response status matches');
				assert.equal(xhr.responseText, 'handler-1', 'first response text matches');
				assert.equal($.mockjax.mockedAjaxCalls().length, 1, 'first mocked call retained');
			}
		});

		$.ajax({
			url: '/retain-test-2',
			async: false,
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'second response status matches');
				assert.equal(xhr.responseText, 'handler-2', 'second response text matches');
				assert.equal($.mockjax.mockedAjaxCalls().length, 2, 'second mocked call retained');
			}
		});

		$.ajax({
			url: '/foo/bar',
			async: false,
			error: function(xhr) {
				assert.equal(xhr.status, 404, 'unmocked response status matches (404)');
			},
			complete: function(xhr) {
				assert.equal($.mockjax.unmockedAjaxCalls().length, 1, 'unmocked call retained');
			}
		});

		$.mockjax.clear(handler1);
		assert.equal($.mockjax.mockedAjaxCalls().length, 1, 'second mocked call retained after clear');
		assert.equal($.mockjax.unmockedAjaxCalls().length, 1, 'unmocked call retained after clear');
		done();
	});

	t('Bug #375: Namespaced regex url properties lose flags', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api'
		
		$.mockjax({
			url: /\/user\/foo/i,
			responseText: 'user api: foo'
		});

		$.ajax({
			url: '/api/user/foo',
			async: false,
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'lowercase path response status matches');
				assert.equal(xhr.responseText, 'user api: foo', 'lowercase path response text matches');
			}
		});

		$.ajax({
			url: '/api/user/FOO',
			async: false,
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'uppercase path response status matches');
				assert.equal(xhr.responseText, 'user api: foo', 'uppercase path response text matches');
			}
		});

		$.mockjaxSettings.namespace = null
		done();
	});
	
})(window.QUnit, window.jQuery);
