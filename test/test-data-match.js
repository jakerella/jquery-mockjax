(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
	
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

	t('Multiple data matching requests with data function', function(assert) {
		var done = assert.async();

		$.mockjax({
			url: '/response-callback',
			data: function(data) {
				return (data.answer === 'yes');
			},
			responseText: {'yes?': 'yes'}
		});
		$.mockjax({
			url: '/response-callback',
			data: function(data) {
				return (data.answer === 'yes');
			},
			responseText: {'yes?': 'yes'}
		});

		var callCount = 2;
		$.ajax({
			url: '/response-callback',
			data: {
                answer: 'yes'
            },
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
		var notMatched = false;
		$.ajax({
			url: '/response-callback',
			data: {
				answer: 'no'
			},
			error: function() {
				notMatched = true;
			},
			complete: function() {
				callCount--;
				assert.ok( notMatched , 'correct data function' );

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
	
	t('Bug #123: match data in query format', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/api/query',
			data: {
				foo: 'bar'
			},
			responseText: { foo: 'bar' }
		});
		
		$.ajax({
			url: '/api/query',
			data: 'foo=bar',
			success: function() {
				assert.ok(true, 'Successfully matched data');
			},
			error: qunit.noErrorCallbackExpected,
			complete: done
		});
	});
	
	t('Bug #123: match data in query format (two params)', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/api/query',
			data: {
				foo: 'bar',
				bat: 'baz'
			},
			responseText: { foo: 'bar' }
		});
		
		$.ajax({
			url: '/api/query',
			data: 'foo=bar&bat=baz',
			success: function() {
				assert.ok(true, 'Successfully matched data');
			},
			error: qunit.noErrorCallbackExpected,
			complete: done
		});
	});
	
	t('Bug #123: don\'t match data in query format when not matching', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/api/query',
			data: {
				foo: 'bar',
				bat: 'baz'
			},
			responseText: { foo: 'bar' }
		});
		
		$.ajax({
			url: '/api/query',
			data: 'foo=bar&bat=boo',
			success: function() {
				assert.ok(false, 'Should not have mocked request');
			},
			error: function() {
				assert.ok(true, 'Correctly failed to match mock');
			},
			complete: done
		});
	});
	
	t('Bug #123: match data in query format (array of params)', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/api/query',
			data: {
				foo: ['bar', 'bat', 'baz']
			},
			responseText: { foo: 'bar' }
		});
		
		$.ajax({
			url: '/api/query',
			data: 'foo=bar&foo=bat&foo=baz',
			success: function() {
				assert.ok(true, 'Successfully matched data');
			},
			error: qunit.noErrorCallbackExpected,
			complete: done
		});
	});

})(window.QUnit, window.jQuery);