var mockjaxDefaults = $.extend({}, $.mockjaxSettings);

function noErrorCallbackExpected() {
	ok( false, 'Error callback executed');
}

// Speed up our tests
$.mockjaxSettings.responseTime = 0;

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
    
    $.mockjaxClear();
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
	
	$.mockjaxClear();
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
			equals(xhr.responseText, 'Hello world 2', 'Response Text matches');
			start();
		}
	});
	
	$.mockjaxClear();
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
			equals(text, 'test', 'Test handler responded');
		},
		error: noErrorCallbackExpected,
		complete: function() {
			$.mockjaxClear(id);
			
			// Reissue the request expecting the default handler
			$.ajax({
				url: '/test',
				success: function(text) {
					equals(text, 'default', 'Default handler responded');
				},
				error: noErrorCallbackExpected,
				complete: function(xhr) {
					equals(xhr.responseText, 'default', 'Default handler responded');
					
					$.mockjaxClear();
					start();
				}
			});
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
			equals(xhr.responseText, 'exact string', 'Exact string url match');
			start();
		}
	});
	
	$.mockjaxClear();
});
asyncTest('Wildcard match', 1, function() {
	$.mockjax({
		url: '/wildcard/string/*',
		responseText: 'wildcard string'
	});
		
	$.ajax({
		url: '/wildcard/string/123456',
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equals(xhr.responseText, 'wildcard string', 'Wildcard * string url match');
			start();
		}
	});
	
	$.mockjaxClear();
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
			equals(xhr.responseText, 'regex match', 'RegEx match');
			start();
		}
	});
	
	$.mockjaxClear();
});


// Test Data Types [Text, HTML, JSON, JSONP, Script and XML]
module('Data Types', {
	setup: function() {
		$.mockjax({
			url: '/text',
			contentType:  'text/plain',
			responseText: 'just text'
		});
		$.mockjax({
			url: '/html',
			contentType:  'text/html',
			responseText: '<div>String</div>'
		});
		$.mockjax({
			url: '/json',
			contentType:  'text/json',
			responseText: { "foo" : "bar", "baz" : { "car" : "far" } }
		});
		$.mockjax({
			url: '/jsonp',
			contentType: 'text/json',
			proxy: 'test_jsonp.js'
		});
		$.mockjax({
			url: '/script',
			contentType: 'text/plain',
			proxy: 'test_script.js'
		});
		
		$.mockjax({
			url: '/xml',
			contentType:  'text/xml',
			responseXML: '<document>String</document>'
		});
	},
	
	teardown: function() {
		$.mockjaxClear();
	}
});
// Text
asyncTest('Response returns text', function() {
	$.ajax({
		url: '/text',
		dataType: 'text',
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equals(xhr.getResponseHeader('Content-Type'), 'text/plain', 'Content type of text/plain');
			
			start();
		}
	});
});
asyncTest('Response returns html', function() {
	$.ajax({
		url: '/html',
		dataType: 'html',
		success: function(data) {
			equals(data, '<div>String</div>', 'HTML String matches');
		},
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equals(xhr.getResponseHeader('Content-Type'), 'text/html', 'Content type of text/html');
			start();
		}
	});
});
asyncTest('Response returns json', function() {
	$.ajax({
		url: '/json',
		dataType: 'json',
		success: function(json) {
			deepEqual(json, { "foo" : "bar", "baz" : { "car" : "far" } }, 'JSON Object matches');
		},
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equals(xhr.getResponseHeader('Content-Type'), 'text/json', 'Content type of text/json');
			start();
		}
	});
});
asyncTest('Response returns jsonp', function() {
	window.abcdef123456 = function(json) {
		ok( true, 'JSONP Callback executed');
		deepEqual(json, { "data" : "JSONP is cool" });
	};
	
	$.ajax({
		url: '/jsonp',
		jsonpCallback: 'abcdef123456',
		
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equals(xhr.getResponseHeader('Content-Type'), 'text/json', 'Content type of text/json');
			start();
		}
	});
});
asyncTest('Response executes script', function() {
	window.TEST_SCRIPT_VAR = 0;
	$.ajax({
		url: '/script',
		dataType: 'script',
		error: noErrorCallbackExpected,
		complete: function(xhr) {
			equals(window.TEST_SCRIPT_VAR, 1, 'Script executed');
			equals(xhr.getResponseHeader('Content-Type'), 'text/plain', 'Content type of text/plain');
			
			start();
		}
	});
});
asyncTest('Response returns parsed XML', function() {
	$.ajax({
		url: '/xml',
		dataType: 'xml',
		success: function(xmlDom) {
			ok( jQuery.isXMLDoc( xmlDom ), 'Data returned is an XML DOM');
		},
		error: noErrorCallbackExpected,
		complete: function(xhr, error) {
			ok(true, 'Error: ' + error);
			equals(xhr.getResponseHeader('Content-Type'), 'text/xml', 'Content type of text/xml');
			start();
		}
	});
});

module('Connection Simulation', {
	setup: function() {
		$.mockjax({
			url: '/delay',
			responseTime: 150
		});
		$.mockjax({
			url: '*',
			responseText: '',
			responseTime: 50
		});
	},
	teardown: function() {
		$.mockjaxClear();
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
			ok( ((new Date()) - ts) >= 150, 'Correct delay simulation');
			equals( executed, 1, 'Callback execution order correct');
			start();
		}
	});
	setTimeout(function() {
		ok( executed == 0, 'No premature callback execution');
		executed++;
	}, 30);
});


// TODO: SIMULATING HTTP RESPONSE STATUSES
// TODO: SETTING THE CONTENT-TYPE
// TODO: SETTING ADDITIONAL HTTP RESPONSE HEADERS
// TODO: FORCE SIMULATION OF SERVER TIMEOUTS
// TODO: DYNAMICALLY GENERATING MOCK DEFINITIONS
// TODO: DYNAMICALLY GENERATING MOCK RESPONSES
/*
var id = $.mockjax({
   ...
});
$.mockjaxClear(id);
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