(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
    
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

})(window.QUnit, window.jQuery);