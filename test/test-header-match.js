(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
    
	/* ----------------------------- */
	qunit.module( 'Headers Matching' );
	/* ----------------------------- */
	
	t('Not equal headers', function(assert) {
		var done = assert.async();
		var mockedAjaxCallsBefore = $.mockjax.mockedAjaxCalls().length;
		
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
				assert.equal($.mockjax.mockedAjaxCalls().length, mockedAjaxCallsBefore, 'No mocked Ajax calls should have been returned');
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
			success: function(data) {
				assert.equal(data, 'Exact headers', 'Exact headers keys and values');
			},
			complete: done
		});
	});

	t('Exact headers with no URL', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			requestHeaders: {
				Authorization: '12345'
			},
			responseText: 'Exact headers'
		});

		$.ajax({
			url: '/some/resource',
			error: qunit.noErrorCallbackExpected,
			headers: {
				Authorization: '12345'
			},
			success: function(data) {
				assert.equal(data, 'Exact headers', 'Exact headers keys and values');
			},
			complete: done
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
			success: function(data) {
				assert.equal(data, 'Exact multiple headers', 'Exact headers keys and values');
			},
			complete: done
		});
	});

})(window.QUnit, window.jQuery);