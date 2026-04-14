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

	t('RegEx match with urlParams', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: /^\/api\/group\/(\d+)\/user\/(\w+)$/i,
			urlParams: ['group', 'user'],
			response: function (settings) {
				this.responseText = `group=${settings.urlParams.group} and user=${settings.urlParams.user}`
			}
		});

		$.ajax({
			url: '/api/group/1234/user/foobar',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.responseText, 'group=1234 and user=foobar', 'urlParams added to request settings');
				done();
			}
		});
	});

	t('match query data in GET request URL with wilcard', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '*?foo=bar'
		})
		
		$.ajax({
			url: '/api/query?foo=bar',
			success: function() {
				assert.ok(true, 'Successfully matched data');
			},
			error: qunit.noErrorCallbackExpected,
			complete: done
		});
	});

})(window.QUnit, window.jQuery);