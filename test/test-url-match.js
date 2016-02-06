(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
	
	/* ------------------------- */
	qunit.module( 'URL Matching' );
	/* ------------------------- */
	
	t('Exact string', function(assert) {
		var done = assert.async();
		
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
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.responseText, 'exact string', 'Exact string url match');
				done();
			}
		});
	});
	
	t('Wildcard match', function(assert) {
		function mock(mockUrl, url, response) {
			$.mockjax({
				url: mockUrl,
				responseText: response
			});
			$.ajax({
				async: false,
				url: url,
				error: qunit.noErrorCallbackExpected,
				complete: function(xhr) {
					assert.equal(xhr.responseText, response);
				}
			});
		}
		mock('/wildcard*w', '/wildcard/123456/w', 'w');
		mock('/wildcard*x', '/wildcard/123456/x', 'x');
		mock('*y', '/wildcard/123456/y', 'y');
		mock('z*', 'z/wildcard/123456', 'z');
		mock('/wildcard*aa/second/*/nice', '/wildcard/123456/aa/second/9991231/nice', 'aa');
	});
	
	t('RegEx match', function(assert) {
		var done = assert.async();
		
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
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.responseText, 'regex match', 'RegEx match');
				done();
			}
		});
	});

})(window.QUnit, window.jQuery);