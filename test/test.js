var mockjaxDefaults = $.extend({}, $.mockjaxSettings);

function noErrorCallbackExpected() {
	ok( false, 'Error callback executed');
}

function compareSemver(v1, v2, op) {
	var result = false,
		p1 = normalizeSemVer(v1),
		p2 = normalizeSemVer(v2);

	if (/^===?$/.test(op)) {
		result = semverEqual(p1, p2, 3);
	} else if (/^</.test(op)) {
		result = p1[0] < p2[0] || (semverEqual(p1, p2, 1) && p1[1] < p2[1]) || (semverEqual(p1, p2, 2) && p1[2] < p2[2]);
		if (!result && /^<=$/.test(op)) {
			result = semverEqual(p1, p2, 3);
		}
	} else if (/^>/.test(op)) {
		result = p1[0] > p2[0] || (semverEqual(p1, p2, 1) && p1[1] > p2[1]) || (semverEqual(p1, p2, 2) && p1[2] > p2[2]);
	}
	if (!result && /^[<>]=$/.test(op)) {
		result = semverEqual(p1, p2, 3);
	}
	return result;
}
function semverEqual(p1, p2, cnt) {
	var i, equal = true;
	for (i=0; i<cnt; ++i) {
		equal = equal && (p1[i] === p2[i]);
	}
	return equal;
}
function normalizeSemVer(v) {
	if (v.length < 1) { return "0.0.0"; }
	var p = v.toString().split('.');
	if (p.length < 2) { p[1] = "0"; }
	if (p.length < 3) { p[2] = "0"; }
	return [Number(p[0]), Number(p[1]), Number(p[2])];
}

// Speed up our tests
$.mockjaxSettings.responseTime = 0;
var defaultSettings = $.extend({}, $.mockjaxSettings);

QUnit.testDone(function() {
	// reset mockjax after each test
	$.mockjax.clear();
	$.mockjaxSettings = $.extend({}, defaultSettings);
});

module('Core');
test('Return XMLHttpRequest object from $.ajax', function() {
	$.mockjax({
		url: '/xmlhttprequest',
		responseText: "Hello Word"
	});

	var xhr = $.ajax({
		url: '/xmlhttprequest',
		complete: function() { }
	});
	xhr && xhr.abort && xhr.abort();

	ok(xhr, "XHR object is not null or undefined");
	if (jQuery.Deferred) {
		ok(xhr.done && xhr.fail, "Got Promise methods");
	}
});
asyncTest('Intercept and proxy (sub-ajax request)', function() {
	$.mockjax({
		url: '/proxy',
		proxy: 'test_proxy.json'
	});

	$.ajax({
		url: '/proxy',
		dataType: 'json',
		success: function(json) {
			ok(json && json.proxy, 'Proxy request succeeded');
		},
		error: noErrorCallbackExpected,
		complete: function() {
			start();
		}
	});
});

asyncTest('Proxy type specification', function() {
	$.mockjax({
		url: '/proxy',
		proxy: 'test_proxy.json',
		proxyType: 'GET'
	});

	$.ajax({
		url: '/proxy',
		error: noErrorCallbackExpected,
		dataType: 'json',
		success: function(json) {
			ok(json && json.proxy, 'Proxy request succeeded');
		},
		complete: function() {
			start();
		}
	});
});

asyncTest('Support 1.5 $.ajax(url, settings) signature.', function() {
	$.mockjax({
		url: '/resource',
		responseText: 'Hello Word'
	});

	$.ajax('/resource', {
		success: function(response) {
			equal(response, 'Hello Word');
		},
		error: noErrorCallbackExpected,
		complete: function() {
			start();
		}
	});
});

asyncTest('Dynamic response callback', function() {
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
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equal(xhr.responseText, 'Hello world 2', 'Response Text matches');
			start();
		}
	});
});

asyncTest('Dynamic asynchronous response callback', function() {
    $.mockjax({
        url: '/response-callback',
        responseText: 'original response',
        response: function(settings, done) {
        	var that = this;
            setTimeout(function() {
            	that.responseText = settings.data.response + ' 3';
            	done();
            }, 30);
        }
    });

    $.ajax({
        url: '/response-callback',
        dataType: 'text',
        data: {
            response: 'Hello world'
        },
        error: noErrorCallbackExpected,
        complete: function(xhr) {
            equal(xhr.responseText, 'Hello world 3', 'Response Text matches');
            start();
        }
    });
});

if (compareSemver($().jquery, "1.4", ">=")) {
	// The $.ajax() API changed in version 1.4 to include the third argument: xhr
	asyncTest('Success callback should have access to xhr object', function() {
		$.mockjax({
			url: '/response'
		});

		$.ajax({
			type: 'GET',
			url: '/response',
			success: function() {
				ok(arguments[2], 'there is a third argument to the success callback');
				ok(arguments[2] && arguments[2].status === 200, 'third argument appears to be an xhr object (proper status code)');
				start();
			},
			error: function() {
				ok(false, "should not result in error");
				start();
			}
		});
	});
}

asyncTest('Dynamic response status callback', function() {
	$.mockjax({
		url: '/response-callback',
		response: function(settings) {
			this.status = 500;
			this.statusText = "Internal Server Error"
		}
	});

	$.ajax({
		url: '/response-callback',
		dataType: 'text',
		data: {
			response: 'Hello world'
		},
		error: function(){
			ok(true, "error callback was called");
		},
		complete: function(xhr) {
			equal(xhr.status, 500, 'Dynamically set response status matches');

			if( $.fn.jquery !== '1.5.2') {
				// This assertion fails in 1.5.2 due to this bug: http://bugs.jquery.com/ticket/9854
				// The statusText is being modified internally by jQuery in 1.5.2
				equal(xhr.statusText, "Internal Server Error", 'Dynamically set response statusText matches');
			}

			start();
		}
	});
});

asyncTest('Default Response Settings', function() {
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
			equal(xhr.status, 200, 'Response status matches default');

			if( $.fn.jquery !== '1.5.2') {
				// This assertion fails in 1.5.2 due to this bug: http://bugs.jquery.com/ticket/9854
				// The statusText is being modified internally by jQuery in 1.5.2
				equal(xhr.statusText, "OK", 'Response statusText matches default');
			}

			equal(xhr.responseText.length, 0, 'responseText length should be 0');
			equal(xhr.responseXml === undefined, true, 'responseXml should be undefined');
			start();
		}
	});
});

test('Remove mockjax definition by id', function() {
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

	stop();
	$.ajax({
		url: '/test',
		success: function(text) {
			equal(text, 'test', 'Test handler responded');
		},
		error: noErrorCallbackExpected,
		complete: function() {
			$.mockjax.clear(id);

			// Reissue the request expecting the default handler
			$.ajax({
				url: '/test',
				success: function(text) {
					equal(text, 'default', 'Default handler responded');
				},
				error: noErrorCallbackExpected,
				complete: function(xhr) {
					equal(xhr.responseText, 'default', 'Default handler responded');
					start();
				}
			});
		}
	});
});

asyncTest('Clearing mockjax removes all handlers', function() {
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
			equal('test1', text, 'First call is mocked');
		},
		error: noErrorCallbackExpected,
		complete: function() {
			$.mockjax.clear();

			$.ajax({
				async: true,
				type: 'GET',
				url: '/api/example/1',
				success: function() {
					ok( false, 'Call to first endpoint was mocked, but should not have been');
				},
				error: function(xhr) {
					equal(404, xhr.status, 'First mock cleared after clear()');

					$.ajax({
						async: true,
						type: 'GET',
						url: '/api/example/2',
						success: function() {
							ok( false, 'Call to second endpoint was mocked, but should not have been');
						},
						error: function(xhr) {
							equal(404, xhr.status, 'Second mock cleared after clear()');
							start();
						}
					});
				}
			});
		}
	});
});

test('Old version of clearing mock handlers works', function() {
	$.mockjax({
		url: '/api/example/1'
	});

	$.mockjaxClear();

	equal($.mockjax.handler(0), undefined, 'There are no mock handlers');
});

// asyncTest('Intercept log messages', function() {
//	 var msg = null;
//	 $.mockjaxSettings.log = function(inMsg, settings) {
//		 msg = inMsg;
//	 };
//	 $.mockjax({
//		 url: '*'
//	 });
//	 $.ajax({
//		 url: '/console',
//		 type: 'GET',
//		 complete: function() {
//			 equal(msg, 'MOCK GET: /console', 'Mock request logged to console');
//			 start();
//		 }
//	 });
// });
asyncTest('Disable console logging', function() {
	var msg = null;
	$.mockjaxSettings.console = false;
	$.mockjax({
		url: '*'
	});
	$.ajax({
		url: '/console',
		complete: function() {
			equal(msg, null, 'Mock request not logged');
			start();
		}
	});
});

asyncTest('Get mocked ajax calls - GET', function() {
	$.mockjax({
		url: '/api/example/*'
	});

	// GET
	$.ajax({
		async: false,
		type: 'GET',
		url: '/api/example/1',
		complete: function() {
			var actualCalls = $.mockjax.mockedAjaxCalls();
			equal(actualCalls.length, 1, 'mockjax call made');
			equal(actualCalls[0].type, 'GET', 'mockjax call has expected method');
			equal(actualCalls[0].url, '/api/example/1', 'mockjax call has expected url');
			start();
		}
	});
});

asyncTest('Test unmockedAjaxCalls returns the correct object when ajax call is not mocked and throwUnmocked is false', function() {
  $.mockjaxSettings.throwUnmocked = false;

	$.ajax({
		async: true,
		type: 'GET',
		url: '/api/example/1',
		complete: function() {
			var unmockedAjaxCalls = $.mockjax.unmockedAjaxCalls();
			equal(unmockedAjaxCalls.length, 1, 'Wrong number of unmocked ajax calls were returned');
			equal(unmockedAjaxCalls[0].url, '/api/example/1', 'unmockedAjaxcall has unexpected url');
			start();
		}
	});
});

asyncTest('Test unmockedAjaxCalls are cleared when mockjax.clear is called', function() {
  $.mockjaxSettings.throwUnmocked = false;

	$.ajax({
		async: true,
		type: 'GET',
		url: '/api/example/1',
		complete: function() {
			equal($.mockjax.unmockedAjaxCalls().length, 1, 'Wrong number of unmocked ajax calls were returned');
			$.mockjax.clear();
			equal($.mockjax.unmockedAjaxCalls().length, 0, 'Unmocked ajax calls not removed by mockjax.clear');
			start();
		}
	});
});

asyncTest('Test unmockedAjaxCalls returns nothing when no unmocked ajax calls occur', function() {
	$.mockjax({
		url: '/api/example/1'
	});

	$.ajax({
		async: true,
		type: 'GET',
		url: '/api/example/1',
		complete: function() {
			var unmockedAjaxCalls = $.mockjax.unmockedAjaxCalls();
			equal(unmockedAjaxCalls.length, 0, 'No unmocked Ajax calls should have been returned');
			start();
		}
	});
});

asyncTest('Throw new error when throwUnmocked is set to true and unmocked ajax calls are fired', function() {
	$.mockjaxSettings.throwUnmocked = true;

	try {
		$.ajax({
			async: true,
			type: 'GET',
			url: '/api/example/1',
			complete: function() {
				ok(false, "Unmocked ajax request completed successfully and should have thrown an error.")
				start();
			}
		});
	}
	catch (e) {
		ok(e instanceof Error, "Error was not thrown with 'throwUnmocked' set to true and existing unmocked ajax request");
		start();
	}
});

asyncTest('Get unfired handlers', function() {
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
			equal(handlersNotFired.length, 1, 'all mocks were fired');
			equal(handlersNotFired[0].url, '/api/example/2', 'mockjax call has unexpected url');
			start();
		}
	});
});

asyncTest('Get unfired handlers after calling mockjax.clear', function() {
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
			equal(handlersNotFired.length, 1, 'all mocks were fired');
			equal(handlersNotFired[0].url, '/api/example/2', 'mockjax call has unexpected url');
			start();
		}
	});
});

asyncTest('Response settings correct using PUT method', function() {
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
			equal(xhr.status, 200, 'Response status matches default');

			equal(xhr.responseText, 'this was a PUT', 'responseText is correct');
			start();
		}
	});
});

asyncTest('Get mocked ajax calls - POST with data', function() {
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
			equal(actualCalls.length, 1, 'mockjax call made');
			equal(actualCalls[0].type, 'POST', 'mockjax call has expected method');
			equal(actualCalls[0].url, '/api/example/2', 'mockjax call has expected url');
			deepEqual(actualCalls[0].data, {a: 1}, 'mockjax call has expected data');
			start();
		}
	});
});

asyncTest('Get mocked ajax calls - JSONP', function() {
	$.mockjax({
		url: '/api/example/*',
		contentType: 'text/json',
		proxy: 'test_jsonp.js'
	});
	var callbackExecuted = false;
	window.abcdef123456 = function(json) {
		ok( true, 'JSONP Callback executed');
		callbackExecuted = true;
	};

	var ret = $.ajax({
		url: '/api/example/jsonp?callback=?',
		jsonpCallback: 'abcdef123456',
		dataType: 'jsonp',
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			var actualCalls = $.mockjax.mockedAjaxCalls();
			equal(actualCalls.length, 1, 'Mockjax call made');
			equal(actualCalls[0].url, '/api/example/jsonp?callback=abcdef123456', 'mockjax call has expected jsonp url');
			ok(callbackExecuted, 'The jsonp callback was executed');
			start();
		}
	});
});

test('multiple mockjax calls are made', function() {
	$.mockjax({
		url: '/api/example/*'
	});

	equal($.mockjax.mockedAjaxCalls().length, 0, 'Initially there are no saved ajax calls');

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

	equal($.mockjax.mockedAjaxCalls().length, 3, 'Afterwords there should be three saved ajax calls');
	var mockedUrls = $.map($.mockjax.mockedAjaxCalls(), function(ajaxOptions) { return ajaxOptions.url });
	deepEqual(mockedUrls, ['/api/example/1', '/api/example/2', '/api/example/jsonp?callback=foo123'], 'Mocked ajax calls are saved in execution order');
	$.mockjax.clear();
	equal($.mockjax.mockedAjaxCalls().length, 0, 'After clearing there are no saved ajax calls');
});

// These tests is only relevant in 1.5.2 and higher
if( jQuery.Deferred ) {
	asyncTest('Preserve context when set in jsonp ajax requet', function(){
		$.mockjax({
				url: '/jsonp*',
				contentType: 'text/json',
				proxy: 'test_jsonp.js'
		});

		window.abcdef123456 = function(json) {};
		var cxt = {context: 'context'};

		$.ajax({
				url: '/jsonp?callback=?',
				jsonpCallback: 'abcdef123456',
				dataType: 'jsonp',
				error: noErrorCallbackExpected,
				context: cxt})
			.done(function(){
				deepEqual(this, cxt, 'this is equal to context object');
				start();
			});
	});

	asyncTest('Validate this is the $.ajax object if context is not set', function(){
		$.mockjax({
				url: '/jsonp*',
				contentType: 'text/json',
				proxy: 'test_jsonp.js'
		});

		window.abcdef123456 = function(json) {};

		var ret = $.ajax({
				url: '/jsonp?callback=?',
				jsonpCallback: 'abcdef123456',
				dataType: 'jsonp',
				error: noErrorCallbackExpected
			})
			.done(function(){
				ok(this.jsonp, '\'this\' is the $.ajax object for this request.');
				start();
			});
		var settings = $.ajaxSettings;
	});
}

module('Request Property Inspection');
test('Inspecting $.mockjax.handler(id) after request has fired', function() {
  var ID = $.mockjax({
	url: '/mockjax_properties',
	responseText: "Hello Word"
  });

  var xhr = $.ajax({
	  url: '/mockjax_properties',
	  complete: function() {}
  });

  ok($.mockjax.handler(ID).fired, "Sets the mock's fired property to true");
});

module('Type Matching');
asyncTest('Case-insensitive matching for request types', function() {
	$.mockjax({
		url: '/case_insensitive_match',
		type: 'GET',
		responseText: 'uppercase type response'
	});

	$.ajax({
		url: '/case_insensitive_match',
		type: 'get',
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equal(xhr.responseText, 'uppercase type response', 'Request matched regardless of case');
			start();
		}
	});
});

module('URL Matching');
asyncTest('Exact string', function() {
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
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equal(xhr.responseText, 'exact string', 'Exact string url match');
			start();
		}
	});
});
test('Wildcard match', 5, function() {
	function mock(mockUrl, url, response) {
		$.mockjax({
			url: mockUrl,
			responseText: response
		});
		$.ajax({
			async: false,
			url: url,
			error: noErrorCallbackExpected,
			complete: function(xhr) {
				equal(xhr.responseText, response);
			}
		});
	}
	mock('/wildcard*w', '/wildcard/123456/w', 'w');
	mock('/wildcard*x', '/wildcard/123456/x', 'x');
	mock('*y', '/wildcard/123456/y', 'y');
	mock('z*', 'z/wildcard/123456', 'z');
	mock('/wildcard*aa/second/*/nice', '/wildcard/123456/aa/second/9991231/nice', 'aa');
});
asyncTest('RegEx match', 1, function() {
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
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equal(xhr.responseText, 'regex match', 'RegEx match');
			start();
		}
	});
});

module('Request Data Matching');
asyncTest('Incorrect data matching on request', 1, function() {
	$.mockjax({
		url: '/response-callback',
		data: {
			foo: 'bar'
		}
	});

	$.ajax({
		url: '/response-callback',
		error: function() { ok(true, "Error called on bad mock/data matching"); },
		data: {
			bar: 'baz'
		},
		success: function(json) {
			ok( false, "Success should not be called" );
		},
		complete: function(xhr) {
			start();
		}
	});
});

asyncTest('Correct data matching on request', 1, function() {
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
		error: noErrorCallbackExpected,
		data: {
			foo: 'bar'
		},
		success: function(json) {
			ok( true, "Successfully matched data" );
		},
		complete: function(xhr) {
			start();
		}
	});
});

asyncTest('Correct data matching on request - request can have additional properties', 1, function() {
  $.mockjax({
	url: '/response-callback',
	data: {
	  foo: 'bar'
	}
  });

  $.ajax({
	url: '/response-callback',
	error: function() { ok( false, "Error called on bad mock/data matching"); },
	data: {
	  foo: 'bar',
	  bar: 'baz'
	},
	success: function(json) {
	  ok( true, "Success should not be called" );
	},
	complete: function(xhr) {
	  start();
	}
  });
});

// Related issue #80
asyncTest('Correct data matching on request with empty object literals', 1, function() {
	$.mockjax({
		url: '/response-callback',
		contentType: 'text/json',
		data: {},
		responseText: {}
	});

	$.ajax({
		url: '/response-callback',
		error: noErrorCallbackExpected,
		data: {},
		success: function(json) {
			ok( true, "Successfully matched data" );
		},
		complete: function(xhr) {
			start();
		}
	});
});

asyncTest('Correct matching on request without data and mocks with and without data but same url', 1, function() {
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
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equal(xhr.responseText, 'correct match', 'Matched with correct mock');
			start();
		}
	});
});

// Related issue #68
asyncTest('Incorrect data matching on request with arrays', 1, function() {
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
			ok( true, "Error callback fired" );
		},
		data: {
			values: [1,2,3]
		},
		success: function(json) {
			ok( false, "Success callback fired" );
		},
		complete: function(xhr) {
			start();
		}
	});
});

asyncTest('Correct data matching on request with arrays', 1, function() {
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
	error: function(xhr, status) {
	  ok( false, "Error callback fired" );
	},
	data: {
	  values: [1,2,3]
	},
	success: function(json) {
	  ok( true, "Success callback fired" );
	},
	complete: function(xhr) {
	  start();
	}
  });
});


asyncTest('Multiple data matching requests', function() {
	$.mockjax({
		url: '/response-callback',
		contentType: 'text/json',
		data: {
			remote: {
				test: function(data) {
					return data !== "hello";
				}
			}
		},
		responseText: { "yes?": "no" }
	});
	$.mockjax({
		url: '/response-callback',
		contentType: 'text/json',
		data: {
			remote: {
				test: function(data) {
					return data == "hello";
				}
			}
		},
		responseText: { "yes?": "yes" }
	});

	$.ajax({
		url: '/response-callback',
		error: function(resp) { ok(true, "Expected error"); },
		dataType: 'json',
		data: {
			remote: "h"
		},
		success: function(resp) {
			deepEqual( resp, {"yes?": "no"}, "correct mock hander" );
		},
		complete: function(xhr) {
			start();
		}
	});
	stop();
	$.ajax({
		url: '/response-callback',
		error: function(resp) {
			noErrorCallbackExpected();
		},
		data: {
			remote: "hello"
		},
		dataType: 'json',
		success: function(resp) {
			deepEqual( resp, {"yes?": "yes"}, "correct mock hander" );
		},
		complete: function(xhr) {
			start();
		}
	});
});

// Test to prove issue #106
asyncTest('Null matching on request', 1, function() {
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
		error: noErrorCallbackExpected,
		data: {
			foo: 'bar',
			bar: null
		},
		success: function(json) {
			ok( true, "Successfully matched data that contained null values" );
		},
		complete: function(xhr) {
			start();
		}
	});
});

// Test Data Types [Text, HTML, JSON, JSONP, Script and XML]
module('Data Types');
// Text
asyncTest('Response returns text', function() {
	$.mockjax({
		url: '/text',
		contentType:  'text/plain',
		responseText: 'just text'
	});
	$.ajax({
		url: '/text',
		dataType: 'text',
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equal(xhr.getResponseHeader('Content-Type'), 'text/plain', 'Content type of text/plain');

			start();
		}
	});
});
asyncTest('Response returns html', function() {
	$.mockjax({
		url: '/html',
		contentType:  'text/html',
		responseText: '<div>String</div>'
	});
	$.ajax({
		url: '/html',
		dataType: 'html',
		success: function(data) {
			equal(data, '<div>String</div>', 'HTML String matches');
		},
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equal(xhr.getResponseHeader('Content-Type'), 'text/html', 'Content type of text/html');
			start();
		}
	});
});
asyncTest('Response returns json', function() {
	$.mockjax({
		url: '/json',
		contentType:  'text/json',
		responseText: { "foo" : "bar", "baz" : { "car" : "far" } }
	});
	$.ajax({
		url: '/json',
		dataType: 'json',
		success: function(json) {
			deepEqual(json, { "foo" : "bar", "baz" : { "car" : "far" } }, 'JSON Object matches');
		},
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equal(xhr.getResponseHeader('Content-Type'), 'text/json', 'Content type of text/json');
			start();
		}
	});
});

asyncTest('Response returns jsonp', 3, function() {
	$.mockjax({
		url: '/jsonp*',
		contentType: 'text/json',
		proxy: 'test_jsonp.js'
	});
	window.abcdef123456 = function(json) {
		ok( true, 'JSONP Callback executed');
		deepEqual(json, { "data" : "JSONP is cool" });
	};

	var ret = $.ajax({
		url: '/jsonp?callback=?',
		jsonpCallback: 'abcdef123456',
		dataType: 'jsonp',
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equal(xhr.getResponseHeader('Content-Type'), 'text/json', 'Content type of text/json');
			start();
		}
	});
});


asyncTest('Response returns jsonp and return value from ajax is a promise if supported', function() {
	window.rquery =  /\?/;

	$.mockjax({
		url:"http://api*",
		responseText:{
			success:true,
			ids:[21327211]
		},
		dataType:"jsonp",
		contentType: 'text/json'
	});

	var promiseObject = $.ajax({
		url:"http://api.twitter.com/1/followers/ids.json?screen_name=test_twitter_user",
		dataType:"jsonp"
	});

	if (jQuery.Deferred) {
		ok(promiseObject.done && promiseObject.fail, "Got Promise methods");
		promiseObject.then(function(){
			ok(true, "promise object then is executed");
		});
	} else {
		ok(true, "No deferred support, passing as succesful");
	}

	start();
});

asyncTest('Response executes script', function() {
	$.mockjax({
		url: '/script',
		contentType: 'text/plain',
		proxy: 'test_script.js'
	});

	window.TEST_SCRIPT_VAR = 0;
	$.ajax({
		url: '/script',
		dataType: 'script',
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equal(window.TEST_SCRIPT_VAR, 1, 'Script executed');
			equal(xhr.getResponseHeader('Content-Type'), 'text/plain', 'Content type of text/plain');

			start();
		}
	});
});
asyncTest('Grouping deferred responses, if supported', function() {
	window.rquery =  /\?/;

	$.mockjax({
		url:"http://api*",
		responseText:{
			success:true,
			ids:[21327211]
		},
		dataType:"jsonp",
		contentType: 'text/json'
	});

	var req1 = $.ajax({
		url:"http://api.twitter.com/1/followers/ids.json?screen_name=test_twitter_user",
		dataType:"jsonp"
	});
	var req2 = $.ajax({
		url:"http://api.twitter.com/1/followers/ids.json?screen_name=test_twitter_user",
		dataType:"jsonp"
	});
	var req3 = $.ajax({
		url:"http://api.twitter.com/1/followers/ids.json?screen_name=test_twitter_user",
		dataType:"jsonp"
	});

	if (jQuery.Deferred) {
		$.when(req1, req2, req3).done(function(a, b, c) {
			ok(true, "Successfully grouped deferred responses");
		});
	} else {
		ok(true, "No deferred support, passing as succesful");
	}

	start();
});
asyncTest('Response returns parsed XML', function() {
	$.mockjax({
		url: '/xml',
		contentType:  'text/xml',
		responseXML: '<document>String</document>'
	});
	$.ajax({
		url: '/xml',
		dataType: 'xml',
		success: function(xmlDom) {
			ok( jQuery.isXMLDoc( xmlDom ), 'Data returned is an XML DOM');
		},
		error: noErrorCallbackExpected,
		complete: function(xhr, error) {
			ok(true, 'Error: ' + error);
			equal(xhr.getResponseHeader('Content-Type'), 'text/xml', 'Content type of text/xml');
			start();
		}
	});
});

module('Connection Simulation', {
	setup: function() {
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
			responseText: "{}"
		});
		$.mockjax({
			url: '/variable-delay',
			responseTime: [this.variableDelayMin, this.variableDelayMax]
		});
		$.mockjax({
			url: '*',
			responseText: '',
			responseTime: 50
		});
	}
});
asyncTest('Async test', function() {
	var order = [];
	$.ajax({
		async: true,
		url: '/',
		success: function() {
			order.push('b');
		},
		error: noErrorCallbackExpected,
		complete: function() {
			deepEqual(order, ['a', 'b'], 'Order of execution correct, 2');
			start();
		}
	});
	order.push('a');
	deepEqual(order, ['a'], 'Order of execution correct, 1');
});
test('Sync test', function() {
	var order = [];
	$.ajax({
		async: false,
		url: '/',
		success: function() {
			order.push('b');
			deepEqual(order, ['b'], 'Order of execution correct, 1');
		},
		error: noErrorCallbackExpected
	});
	order.push('a');
	deepEqual(order, ['b', 'a'], 'Order of execution correct, 2');
});
asyncTest('Response time simulation and latency', function() {
	var executed = 0, ts = new Date();
	$.ajax({
		url: '/delay',
		complete: function() {
			var delay = ((new Date()) - ts);
			ok( delay >= 150, 'Correct delay simulation (' + delay + ')' );
			equal( executed, 1, 'Callback execution order correct');
			start();
		}
	});
	setTimeout(function() {
		ok( executed == 0, 'No premature callback execution');
		executed++;
	}, 30);
});
asyncTest('Response time with jsonp', function() {
	var executed = false, ts = new Date();

	$.ajax({
		url: 'http://foobar.com/jsonp-delay?callback=?',
		dataType: 'jsonp',
		complete: function() {
			var delay = ((new Date()) - ts);
			ok( delay >= 150, 'Correct delay simulation (' + delay + ')' );
			ok( executed, 'Callback execution order correct');
			start();
		}
	});

	setTimeout(function() {
		ok( executed === false, 'No premature callback execution');
		executed = true;
	}, 30);
});

asyncTest('Response time with min and max values', function () {
	var executed = 0,
		that = this,
		ts = new Date();
	$.ajax({
		url: '/variable-delay',
		complete: function () {
			var delay = ((new Date()) - ts);
			ok( delay >= that.variableDelayMin && delay <= (that.variableDelayMax + that.processingDuration), 'Variable delay within min and max, delay was ' + delay);
			equal( executed, 1, 'Callback execution order correct');
			start();
		}
	});
	setTimeout(function () {
		ok (executed == 0, 'No premature callback execution');
		executed++;
	}, 30);
});

module('Headers');
asyncTest('headers can be inspected via setRequestHeader()', function() {
	expect(1);

	$(document).ajaxSend(function(event, xhr, ajaxSettings) {
		xhr.setRequestHeader('X-CSRFToken', '<this is a token>');
	});

	$.mockjax( function ( requestSettings ) {
		if ( "/inspect-headers" == requestSettings.url ) {
			return {
				response: function(origSettings) {
					if (typeof requestSettings.headers['X-Csrftoken'] !== 'undefined') {
						key = 'X-Csrftoken';  // bugs in jquery 1.5
					} else {
						key = 'X-CSRFToken';
					}
					equal(requestSettings.headers[key], '<this is a token>');
					this.responseText = {};
				}
			};
		}
	});

	$.ajax({
		url: '/inspect-headers',
		complete: function() {
			start();
		}
	});
});


// SIMULATING HTTP RESPONSE STATUSES
asyncTest('Response status callback', function() {
	$.mockjax({
		url: '/response-callback',
		status: 403
	});

	$.ajax({
		url: '/response-callback',
		error: function(){ ok(true, "error callback was called"); },
		complete: function(xhr) {
			equal(xhr.status, 403, 'response status matches');
			start();
		}
	});
});
// SETTING THE CONTENT-TYPE
asyncTest('Setting the content-type', function() {
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
		error: function(){ ok(false, "error callback was called"); },
		success: function(json) {
			deepEqual(json, { "foo" : "bar" }, 'JSON Object matches');
		},
		complete: function(xhr) {
			equal(xhr.getResponseHeader('Content-Type'), 'text/json', 'Content type of json');
			start();
		}
	});
});
// SETTING ADDITIONAL HTTP RESPONSE HEADERS
asyncTest('Setting additional HTTP response headers', function() {
	$.mockjax({
		url: '/response-callback',
		headers: {
			'X-Must-Exist': 'yes'
		},
		responseText: 'done'
	});

	$.ajax({
		url: '/response-callback',
		error: function(){ ok(false, "error callback was called"); },
		success: function(response) {
			equal( response, "done", "Response text matches" );
		},
		complete: function(xhr) {
			equal( xhr.getResponseHeader( "X-Must-Exist" ), "yes", "Header matches" );
			start();
		}
	});
});

asyncTest('Testing that request headers do not overwrite response headers', function() {
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
				equal(xhr && xhr.getResponseHeader('prop'), 'response', 'response header should be correct');
			} else {
				equal(returnedXhr.getResponseHeader('prop'), 'response', 'response header should be correct');
			}
			start();
		},
		error: function() {
			ok(false, "should not result in error");
			start();
		}
	});
});

// FORCE SIMULATION OF SERVER TIMEOUTS
asyncTest('Forcing timeout', function() {
	$.mockjax({
		url: '/response-callback',
		responseText: 'done',
		isTimeout: true
	});

	$.ajax({
		url: '/response-callback',
		error: function(xhr, textStatus, errorThrown ) {
			equal( textStatus, "timeout", "Text status is equal to timeout" );
			ok( errorThrown !== "OK", "errorThrown is undefined or timeout, not OK" );
			ok(true, "error callback was called");
		},
		success: function(response) {
			ok(false, "should not be be successful");
		},
		complete: function(xhr) {
			start();
		}
	});
});

// FORCE SIMULATION OF SERVER TIMEOUTS WITH PROMISES

if(jQuery.Deferred) {
	asyncTest('Forcing timeout with Promises', function() {
		$.mockjax({
			url: '/response-callback',
			isTimeout: true
		});

		var request = $.ajax({
			url: '/response-callback'
		});

		request.done(function(xhr) {
			ok(false, "Should not be successful");
		});

		request.fail(function(response) {
			ok(true, "error callback was called");
		});

		request.complete(function(xhr) {
			start();
		});
	});
}
// DYNAMICALLY GENERATING MOCK DEFINITIONS
asyncTest('Dynamic mock definition', function() {
	$.mockjax( function( settings ) {
		var service = settings.url.match(/\/users\/(.*)$/);
		if ( service ) {
			return {
				proxy: 'test_proxy.json'
			}
		}
	});

	$.ajax({
		url: '/users/test',
		dataType: 'json',
		error: noErrorCallbackExpected,
		success: function(json) {
			ok(json && json.proxy, 'Proxy request succeeded');
		},
		complete: function(xhr) {
			start();
		}
	});
});
// DYNAMICALLY GENERATING MOCK RESPONSES
asyncTest('Dynamic mock response generation', function() {
	$.mockjax({
		url: '/response-callback',
		response: function( settings ) {
			this.responseText = { currentTime: 'now: ' + new Date() };
		}
	});

	$.ajax({
		url: '/response-callback',
		dataType: 'json',
		error: noErrorCallbackExpected,
		success: function(json) {
			equal( typeof json.currentTime, 'string', 'Dynamic response succeeded');
		},
		complete: function(xhr) {
			start();
		}
	});
});


module( 'BugFixes' );
asyncTest( 'Test bug fix for $.mockjaxSettings', function() {
	$.mockjaxSettings.headers = {
		"content-type": "text/plain",
		etag: "IJF@H#@923uf8023hFO@I#H#"
	};

	$.mockjax({
	  url: '/get/property',
	  type: 'GET',
	  response: function(settings) {
		this.responseText = { foo: "bar" };
	  }
	});

	$.ajax({
		url: '/get/property',
		success: function(data) {
			deepEqual( $.mockjaxSettings.headers, {
				"content-type": "text/plain",
				etag: "IJF@H#@923uf8023hFO@I#H#"
			}, "Should not change the default headers.");
		},
		complete: function() {
			start();
		}
	});
});

asyncTest("Preserve responseText inside a response function when using jsonp and a success callback", function(){
	$.mockjax({
		url: "http://some/fake/jsonp/endpoint",
		// The following line works...
		// responseText: [{ "data" : "JSONP is cool" }]
		// But doesn't not work when setting this.responseText in response
		response: function() {
			this.responseText = [{ "data" : "JSONP is cool" }];
		}
	});

	$.ajax({
		url: "http://some/fake/jsonp/endpoint",
		dataType: "jsonp",
		success: function(data) {
			deepEqual(data, [{ "data" : "JSONP is cool" }]);
			start();
		}
	});
});

asyncTest('Custom status when using proxy', function() {
	$.mockjax({
		url: '/response-callback',
		status: 409,
		proxy: 'test_proxy.json'
	});

	$.ajax({
		url: '/response-callback',
		error: function(){ ok(true, "error callback was called"); },
		success: function(json) {
			ok( false, "Success should not be called" );
		},
		complete: function(xhr) {
			equal(xhr.status, 409, 'response status matches');
			start();
		}
	});
});

asyncTest('Call onAfterSuccess after success has been called', function() {
	var onAfterSuccessCalled = false;
	var successCalled = false;
	$.mockjax({
		url: '/response-callback',
		onAfterSuccess: function() {
			onAfterSuccessCalled = true;
			equal(successCalled, true, 'success was not yet called');
		}
	});

	$.ajax({
		url: '/response-callback',
		success: function() {
			successCalled = true;
		}
	});

	setTimeout(function() {
		equal(onAfterSuccessCalled, true, 'onAfterSuccess was not called');
		start(); 
	}, 100);
});

asyncTest('Call onAfterError after error has been called', function() {
	var onAfterErrorCalled = false;
	var errorCalled = false;
	$.mockjax({
		url: '/response-callback-bad',
		status: 500,
		onAfterError: function() {
			onAfterErrorCalled = true;
			equal(errorCalled, true, 'error was not yet called');
		}
	});

	$.ajax({
		url: '/response-callback-bad',
		error: function() {
			errorCalled = true;
		}
	});

	setTimeout(function() {
		equal(onAfterErrorCalled, true, 'onAfterError was not called');
		start(); 
	}, 100);
});

asyncTest('Call onAfterComplete after complete has been called', function() {
	var onAfterCompleteCalled = false;
	var completeCalled = false;
	$.mockjax({
		url: '/response-callback',
		onAfterComplete: function() {
			onAfterCompleteCalled = true;
			equal(completeCalled, true, 'complete was not yet called');
		}
	});

	$.ajax({
		url: '/response-callback',
		complete: function() {
			completeCalled = true;
		}
	});

	setTimeout(function() {
		equal(onAfterCompleteCalled, true, 'onAfterComplete was not called');
		start(); 
	}, 100);
});

test('Test for bug #95: undefined responseText on success', function() {
	expect(2);

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
			if (compareSemver($().jquery, "1.5", "<")) {
				expectedResult = JSON.stringify(expected);
			}
			deepEqual(data, expectedResult, 'responseText is correct JSON object');
		}
	});

	$.ajax({
		type: 'GET',
		url: 'test/something',
		dataType: 'json',
		async: false,
		success: function(data) {
			deepEqual(data, expected, 'responseText is correct JSON object');
		}
	});
});


/*
var id = $.mockjax({
   ...
});
$.mockjax.clear(id);
*/

/*
(function($) {
	$(function() {
		$.ajax({
			url: 'test.json',
			success: function(data) {
				$('ul').append('<li>test.json: completed (' + data.test + ')</li>');
			}
		});

		$.mockjax({
			url: 'test.json',
			contentType: 'text/json',
			responseText: { "test": "mock message" }
		});

		$.ajax({
			url: 'test.json',
			dataType: 'json',
			success: function(data) {
				$('ul').append('<li>test.json: completed (' + data.test + ')</li>');
			},
			error: function(xhr, status, error) {
				alert('error: ' + status + ' ' + error);
			},
			complete: function() {
			}
		});

		$.mockjax({
			url: 'http://google.com',
			responseText: 'alert("Hello world");'
		});

		$.mockjax({
			url: 'http://another-cross-domain.com',
			responseText: function() {
				alert("Get script mock");
			}
		});

		$.ajax({
			url: 'http://google.com',
			dataType: 'script',
			success: function(data) {
				$('ul').append('<li>script: completed (' + data.test + ')</li>');
			},
			error: function(xhr, status, error) {
				alert('error: ' + status + ' ' + error);
			},
			complete: function() {
			}
		});
	});
})(jQuery);
*/
