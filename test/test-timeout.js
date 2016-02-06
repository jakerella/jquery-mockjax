(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
	
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

		// always for jquery 1.8+
		(request.always || request.complete)(done);
	});

})(window.QUnit, window.jQuery);