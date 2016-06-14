(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
	
	/* ----------------------- */
	qunit.module( 'Data Types' );
	/* ----------------------- */
	
	t('Response returns text', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/text',
			contentType: 'text/plain',
			responseText: 'just text'
		});
		$.ajax({
			url: '/text',
			dataType: 'text',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/plain', 'Content type of text/plain');

				done();
			}
		});
	});
	
	t('Response returns html', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/html',
			contentType: 'text/html',
			responseText: '<div>String</div>'
		});
		$.ajax({
			url: '/html',
			dataType: 'html',
			success: function(data) {
				assert.equal(data, '<div>String</div>', 'HTML String matches');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/html', 'Content type of text/html');
				done();
			}
		});
	});
	
	t('Response returns json', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/json',
			contentType: 'text/json',
			responseText: { 'foo' : 'bar', 'baz' : { 'car' : 'far' } }
		});
		$.ajax({
			url: '/json',
			dataType: 'json',
			success: function(json) {
				assert.deepEqual(json, { 'foo' : 'bar', 'baz' : { 'car' : 'far' } }, 'JSON Object matches');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/json', 'Content type of text/json');
				done();
			}
		});
	});

	t('Response returns jsonp', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/jsonp*',
			contentType: 'text/json',
			proxy: 'test_jsonp.js'
		});
		window.abcdef123456 = function(json) {
			assert.ok( true, 'JSONP Callback executed');
			assert.deepEqual(json, { 'data' : 'JSONP is cool' });
		};

		$.ajax({
			url: '/jsonp?callback=?',
			jsonpCallback: 'abcdef123456',
			dataType: 'jsonp',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/json', 'Content type of text/json');
				window.abcdef123456 = null;
				done();
			}
		});
	});

	t('Response returns jsonp and return value from ajax is a promise if supported', function(assert) {
		var done = assert.async();
		
		window.rquery = /\?/;

		$.mockjax({
			url:'http://api*',
			responseText:{
				success:true,
				ids:[21327211]
			},
			dataType:'jsonp',
			contentType: 'text/json'
		});

		var promiseObject = $.ajax({
			url:'http://api.twitter.com/1/followers/ids.json?screen_name=test_twitter_user',
			dataType:'jsonp'
		});

		assert.ok(promiseObject.done && promiseObject.fail, 'Got Promise methods');
		promiseObject.then(function() {
			assert.ok(true, 'promise object then is executed');
			done();
		});
	});

	t('Response executes script', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/script',
			contentType: 'text/plain',
			proxy: 'test_script.js'
		});

		window.TEST_SCRIPT_VAR = 0;
		$.ajax({
			url: '/script',
			dataType: 'script',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(window.TEST_SCRIPT_VAR, 1, 'Script executed');
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/plain', 'Content type of text/plain');

				done();
			}
		});
	});
	
	t('Grouping deferred responses, if supported', function(assert) {
		var done = assert.async();
		
		window.rquery = /\?/;

		$.mockjax({
			url:'http://api*',
			responseText:{
				success:true,
				ids:[21327211]
			},
			dataType:'jsonp',
			contentType: 'text/json'
		});

		var req1 = $.ajax({
			url:'http://api.twitter.com/1/followers/ids.json?screen_name=test_twitter_user',
			dataType:'jsonp'
		});
		var req2 = $.ajax({
			url:'http://api.twitter.com/1/followers/ids.json?screen_name=test_twitter_user',
			dataType:'jsonp'
		});
		var req3 = $.ajax({
			url:'http://api.twitter.com/1/followers/ids.json?screen_name=test_twitter_user',
			dataType:'jsonp'
		});

		$.when(req1, req2, req3).done(function() {
			assert.ok(true, 'Successfully grouped deferred responses');
			done();
		});
	});
	
	t('Response returns parsed XML', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/xml',
			contentType: 'text/xml',
			responseXML: '<document>String</document>'
		});
		$.ajax({
			url: '/xml',
			dataType: 'xml',
			success: function(xmlDom) {
				assert.ok( $.isXMLDoc( xmlDom ), 'Data returned is an XML DOM');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr, error) {
				assert.ok(true, 'Error: ' + error);
				assert.equal(xhr.getResponseHeader('Content-Type'), 'text/xml', 'Content type of text/xml');
				done();
			}
		});
	});

})(window.QUnit, window.jQuery);
