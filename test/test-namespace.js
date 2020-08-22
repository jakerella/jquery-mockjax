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

	t('url (RegExp) should be namespaced via global mockjax settings', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: /^myservice$/
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
	t('should be able to override global namespace per-mock (RegExp)', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: /^myservice$/,
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

	t('should not mock a non-matching (RegExp) url within a namespace', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: /^myservice$/,
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

	t('should handle multiple mocks in a row within a namespace (RegExp)', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: /^one$/,
		});

		$.mockjax({
			url: /^two$/,
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

	t('should handle pattern without "^" start character (RegExp)', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: /one|two/,
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

	t('should pass the correct url to the response settings (RegExp)', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: /^myservice$/,
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

	t('should handle extra slashes (RegExp)', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1/';

		$.mockjax({
			url: /^\/myservice$/,
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

	t('should handle missing slashes (RegExp)', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: /^myservice$/,
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

	t('should pass url to response settings using http://', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = 'http://localhost:4000';

		$.mockjax({
			url: 'myservice',
			response: function(settings) {
				assert.equal(settings.url, 'http://localhost:4000/myservice');
			}
		});

		$.ajax({
			url: 'http://localhost:4000/myservice',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				done();
			}
		});
	});

	t('should pass (RegExp) url to response settings using http://', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = 'http://localhost:4000';

		$.mockjax({
			url: /^myservice$/,
			response: function(settings) {
				assert.equal(settings.url, 'http://localhost:4000/myservice');
			}
		});

		$.ajax({
			url: 'http://localhost:4000/myservice',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				done();
			}
		});
	});

	t('should pass http:// url with trailing / to response', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = 'http://localhost/';

		$.mockjax({
			url: '/myservice',
			response: function(settings) {
				assert.equal(settings.url, 'http://localhost/myservice');
			}
		});

		$.ajax({
			url: 'http://localhost/myservice',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				done();
			}
		});
	});

	t('should pass http:// (RegExp) url with trailing / to response', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = 'http://localhost/';

		$.mockjax({
			url: /^\/myservice$/,
			response: function(settings) {
				assert.equal(settings.url, 'http://localhost/myservice');
			}
		});

		$.ajax({
			url: 'http://localhost/myservice',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				done();
			}
		});
	});

	t('should handle the same mock multiple times in a namespace', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: 'one'
		});

		$.ajax({
			url: '/api/v1/one',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				$.ajax({
					url: '/api/v1/one',
					error: qunit.noErrorCallbackExpected,
					complete: function(xhr) {
						assert.equal(xhr.status, 200, 'Response was successful');
						done();
					}
				});
			}
		});
	});

	t('should handle the same mock multiple times in a namespace (RegExp)', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: /^one$/,
		});

		$.ajax({
			url: '/api/v1/one',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				$.ajax({
					url: '/api/v1/one',
					error: qunit.noErrorCallbackExpected,
					complete: function(xhr) {
						assert.equal(xhr.status, 200, 'Response was successful');
						done();
					}
				});
			}
		});
	});

	t('should be able to declare no namespace on individual mock', function(assert) {

		var done = assert.async();
		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: 'one'
		});

		$.mockjax({
			url: '/two',
			namespace: null
		});

		$.ajax({
			url: '/api/v1/one',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
			}
		});

		$.ajax({
			url: '/two',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				done();
			}
		});
	});

	t('should be able to declare no namespace on individual mock (RegExp)', function(assert) {

		var done = assert.async();
		$.mockjaxSettings.namespace = '/api/v1';

		$.mockjax({
			url: /^one$/,
		});

		$.mockjax({
			url: /^\/two$/,
			namespace: null
		});

		$.ajax({
			url: '/api/v1/one',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
			}
		});

		$.ajax({
			url: '/two',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.status, 200, 'Response was successful');
				done();
			}
		});
	});

})(window.QUnit, window.jQuery);
