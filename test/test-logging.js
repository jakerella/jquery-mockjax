(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
	
	/* -------------------- */
	qunit.module( 'Logging' );
	/* -------------------- */
	
	t('Default log handler', function(assert) {
		var done = assert.async();
		
		if ( !window ) {
			// We aren't running in a context with window available
			done();
			return;
		}

		var _oldConsole = window.console;
		var msg = null;
		window.console = { log: function ( message ) {
			msg = message;
		}};
		var _oldLogging = $.mockjaxSettings.logging;
		$.mockjaxSettings.logging = true;
		$.mockjax({
			 url: '*'
		});
		$.ajax({
			url: '/console',
			type: 'GET',
			complete: function() {
				window.console = _oldConsole;
				assert.equal(msg, 'MOCK GET: /console', 'Default log handler was not called');
				$.mockjaxSettings.logging = _oldLogging;
				done();
			}
		});
	});

	t('Custom log handler', function(assert) {
		var done = assert.async();
		
		var msg = null;
		var _oldLog = $.mockjaxSettings.log;
		$.mockjaxSettings.log = function( mockHandler, requestSettings) {
			msg = requestSettings.type.toUpperCase() + ': ' + requestSettings.url;
		};
		$.mockjax({
			 url: '*'
		});
		$.ajax({
			url: '/console',
			type: 'GET',
			complete: function() {
				assert.equal(msg, 'GET: /console', 'Custom log handler was not called');
				$.mockjaxSettings.log = _oldLog;
				done();
			}
		});
	});

	t('Disable logging via `logging: false`', function(assert) {
		var done = assert.async();
		
		if ( !window ) {
			// We aren't running in a context with window available
			done();
			return;
		}

		var _oldConsole = window.console;
		var msg = null;
		window.console = { log: function ( message ) {
			msg = message;
		}};

		var _oldLogging = $.mockjaxSettings.logging;

		// Even though this is the suite default, we force it to be off
		$.mockjaxSettings.logging = false;

		$.mockjax({
			url: '*'
		});
		$.ajax({
			url: '/console',
			complete: function() {
				window.console = _oldConsole;
				assert.equal(msg, null, 'Logging method incorrectly called');
				$.mockjaxSettings.logging = _oldLogging;
				done();
			}
		});
	});

	t('Disable logging per mock via `logging: false`', function(assert) {
		var done = assert.async();
		
		if ( !window ) {
			// We aren't running in a context with window available
			done();
			return;
		}

		var _oldConsole = window.console;
		var msg = null;
		window.console = { log: function ( message ) {
			msg = message;
		}};

		var _oldLogging = $.mockjaxSettings.logging;

		// Even though this is the suite default, we force it to be on
		$.mockjaxSettings.logging = true;

		$.mockjax({
			url: '*',
			logging: false
		});

		$.ajax({
			url: '/console',
			complete: function() {
				window.console = _oldConsole;
				assert.equal(msg, null, 'Logging method incorrectly called');
				$.mockjaxSettings.logging = _oldLogging;
				done();
			}
		});
	});

	t('Inspecting $.mockjax.handler(id) after request has fired', function(assert) {
		var ID = $.mockjax({
			url: '/mockjax_properties',
			responseText: 'Hello Word'
		});

		$.ajax({
			url: '/mockjax_properties',
			complete: function() {}
		});

		assert.ok($.mockjax.handler(ID).fired, 'Sets the mock\'s fired property to true');
	});

	t('Case-insensitive matching for request types', function(assert) {
		var done = assert.async();
		
		$.mockjax({
			url: '/case_insensitive_match',
			type: 'GET',
			responseText: 'uppercase type response'
		});

		$.ajax({
			url: '/case_insensitive_match',
			type: 'get',
			error: qunit.noErrorCallbackExpected,
			complete: function(xhr) {
				assert.equal(xhr.responseText, 'uppercase type response', 'Request matched regardless of case');
				done();
			}
		});
	});

})(window.QUnit, window.jQuery);