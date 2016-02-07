(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
	
	/* ---------------------------------- */
	qunit.module( 'Mock Handler Clearing' );
	/* ---------------------------------- */
	
	t('Remove mockjax definition by url', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/test',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '*',
			contentType: 'text/plain',
			responseText: 'default'
		});

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear('/test');

				// Reissue the request expecting the default handler
				$.ajax({
					url: '/test',
					success: function(text) {
						assert.equal(text, 'default', 'Default handler responded');
					},
					error: qunit.noErrorCallbackExpected,
					complete: function(xhr) {
						assert.equal(xhr.responseText, 'default', 'Default handler responded');
						done();
					}
				});
			}
		});
	});

	t('Remove mockjax definition by url (no default handler)', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/foobar',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.ajax({
			url: '/foobar',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear('/foobar');

				// Reissue the request expecting the error
				$.ajax({
					url: '/foobar',
					success: function() {
						assert.ok(false, 'The mock was not cleared by url');
					},
					error: function(xhr) {
						// Test against 0, might want to look at this more in depth
						assert.ok(404 === xhr.status || 0 === xhr.status, 'The mock was cleared by url');
						done();
					}
				});
			}
		});
	});

	t('Attempt to clear a non-existent but similar url', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/test',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '*',
			contentType: 'text/plain',
			responseText: 'default'
		});

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear('/tes');

				$.ajax({
					url: '/test',
					success: function(text) {
						assert.equal(text, 'test', 'Test handler responded');
					},
					error: qunit.noErrorCallbackExpected,
					complete: done
				});
			}
		});
	});

	t('Remove mockjax definition, but not a subpath', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/test',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '/test/foo',
			contentType: 'text/plain',
			responseText: 'foo'
		});

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear('/test');

				$.ajax({
					url: '/test/foo',
					success: function(text) {
						assert.equal(text, 'foo', 'Test handler responded');
					},
					error: qunit.noErrorCallbackExpected,
					complete: done
				});
			}
		});
	});

	t('Remove mockjax definition by RegExp', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/test',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '*',
			contentType: 'text/plain',
			responseText: 'default'
		});

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear(/test/);

				// Reissue the request expecting the default handler
				$.ajax({
					url: '/test',
					success: function(text) {
						assert.equal(text, 'default', 'Default handler responded');
					},
					error: qunit.noErrorCallbackExpected,
					complete: function(xhr) {
						assert.equal(xhr.responseText, 'default', 'Default handler responded');
						done();
					}
				});
			}
		});
	});

	t('Remove several mockjax definition by RegExp', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/test',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '/test1',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '/test/foo',
			contentType: 'text/plain',
			responseText: 'test'
		});

		$.mockjax({
			url: '*',
			contentType: 'text/plain',
			responseText: 'default'
		});

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear(/test/);

				// Reissue the request expecting the default handler
				$.ajax({
					url: '/test',
					success: function(text) {
						assert.equal(text, 'default', 'Default handler responded');
					},
					error: qunit.noErrorCallbackExpected,
					complete: function(xhr) {
						assert.equal(xhr.responseText, 'default', 'Default handler responded');
						done();
					}
				});
			}
		});
	});

	t('Remove mockjax definition by id', function(assert) {
		var done = assert.async();
		
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

		$.ajax({
			url: '/test',
			success: function(text) {
				assert.equal(text, 'test', 'Test handler responded');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear(id);

				// Reissue the request expecting the default handler
				$.ajax({
					url: '/test',
					success: function(text) {
						assert.equal(text, 'default', 'Default handler responded');
					},
					error: qunit.noErrorCallbackExpected,
					complete: function(xhr) {
						assert.equal(xhr.responseText, 'default', 'Default handler responded');
						done();
					}
				});
			}
		});
	});

	t('Clearing mockjax removes all handlers', function(assert) {
		var done = assert.async();
		
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
				assert.equal('test1', text, 'First call is mocked');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				$.mockjax.clear();

				$.ajax({
					async: true,
					type: 'GET',
					url: '/api/example/1',
					success: function() {
						assert.ok( false, 'Call to first endpoint was mocked, but should not have been');
					},
					error: function(xhr) {
						// Test against 0, might want to look at this more in depth
						assert.ok(404 === xhr.status || 0 === xhr.status, 'First mock cleared after clear()');

						$.ajax({
							async: true,
							type: 'GET',
							url: '/api/example/2',
							success: function() {
								assert.ok( false, 'Call to second endpoint was mocked, but should not have been');
							},
							error: function(xhr) {
								// Test against 0, might want to look at this more in depth
								assert.ok(404 === xhr.status || 0 === xhr.status, 'Second mock cleared after clear()');
								done();
							}
						});
					}
				});
			}
		});
	});
	
})(window.QUnit, window.jQuery);