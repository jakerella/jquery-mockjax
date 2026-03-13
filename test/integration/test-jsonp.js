(function(qunit, $) {
	'use strict';

	var t = qunit.test

	/* ----------------- */
	qunit.module( 'Core' )
	/* ----------------- */

    t('Preserve context when set in jsonp ajax requet', function(assert) {
		var done = assert.async();

		$.mockjax({
				url: '/jsonp*',
				contentType: 'text/json',
				proxy: 'jsonp-script.js'
		});

		window.abcdef123456 = function() {};
		var cxt = {context: 'context'};

		$.ajax({
				url: '/jsonp?callback=?',
				jsonpCallback: 'abcdef123456',
				dataType: 'jsonp',
				error: qunit.noErrorCallbackExpected,
				context: cxt
		})
		.done(function() {
			assert.deepEqual(this, cxt, 'this is equal to context object');
			window.abcdef123456 = undefined;
			done();
		});
	});

	t('Validate this is the $.ajax object if context is not set', function(assert) {
		var done = assert.async();

		$.mockjax({
				url: '/jsonp*',
				contentType: 'text/json',
				proxy: 'jsonp-script.js'
		});

		window.abcdef123456 = function() {};

		$.ajax({
			url: '/jsonp?callback=?',
			jsonpCallback: 'abcdef123456',
			dataType: 'jsonp',
			error: qunit.noErrorCallbackExpected
		})
		.done(function() {
			assert.ok(this.jsonp, '\'this\' is the $.ajax object for this request.');
			window.abcdef123456 = null;
			done();
		});
	});

    t('Grouping deferred jsonp responses, if supported', function(assert) {
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

    t('Response returns jsonp', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/jsonp*',
			contentType: 'text/json',
			proxy: 'jsonp-script.js'
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

})(window.QUnit, window.jQuery)
