(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
	
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