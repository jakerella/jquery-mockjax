(function(qunit, $) {
	'use strict';

	var t = qunit.test;

	/* -------------------- */
	qunit.module( 'Logging', {
	/* -------------------- */

		beforeEach: function() {
			$.mockjaxSettings.logging = 2;
		}
	});

	t('Default log handler', function(assert) {
		var done = assert.async();

		if ( !window ) {
			// We aren't running in a context with window available
			done();
			return;
		}

		var _oldLog = window.console.info;
		var msg = null;
		window.console.info = function ( message ) {
			msg = message;
		};
		$.mockjax({
			 url: '*'
		});
		$.ajax({
			url: '/console',
			type: 'GET',
			complete: function() {
				window.console.info = _oldLog;
				assert.ok(msg && msg.length, 'Default log handler was not called');
				done();
			}
		});
	});

	// t('Custom log handler', function(assert) {
	// 	var done = assert.async();
	//
	// 	var msg = null;
	// 	$.mockjaxSettings.log = function customLogger( mockHandler, requestSettings) {
	// 		msg = requestSettings.type.toUpperCase() + ': ' + requestSettings.url;
	// 	};
	// 	$.mockjax({
	// 		 url: '*'
	// 	});
	// 	$.ajax({
	// 		url: '/console',
	// 		type: 'GET',
	// 		complete: function() {
	// 			assert.equal(msg, 'GET: /console', 'Custom log handler was not called');
	// 			done();
	// 		}
	// 	});
	// });

	// t('Disable logging via `logging: false`', function(assert) {
	// 	var done = assert.async();
	//
	// 	if ( !window ) {
	// 		// We aren't running in a context with window available
	// 		done();
	// 		return;
	// 	}
	//
	// 	var _oldConsole = window.console;
	// 	var msg = null;
	// 	window.console = { log: function ( message ) {
	// 		msg = message;
	// 	}};
	//
	// 	var _oldLogging = $.mockjaxSettings.logging;
	//
	// 	// Even though this is the suite default, we force it to be off
	// 	$.mockjaxSettings.logging = false;
	//
	// 	$.mockjax({
	// 		url: '*'
	// 	});
	// 	$.ajax({
	// 		url: '/console',
	// 		complete: function() {
	// 			window.console = _oldConsole;
	// 			assert.equal(msg, null, 'Logging method incorrectly called');
	// 			$.mockjaxSettings.logging = _oldLogging;
	// 			done();
	// 		}
	// 	});
	// });
	//
	// t('Disable logging per mock via `logging: false`', function(assert) {
	// 	var done = assert.async();
	//
	// 	if ( !window ) {
	// 		// We aren't running in a context with window available
	// 		done();
	// 		return;
	// 	}
	//
	// 	var _oldConsole = window.console;
	// 	var msg = null;
	// 	window.console = { log: function ( message ) {
	// 		msg = message;
	// 	}};
	//
	// 	var _oldLogging = $.mockjaxSettings.logging;
	//
	// 	// Even though this is the suite default, we force it to be on
	// 	$.mockjaxSettings.logging = true;
	//
	// 	$.mockjax({
	// 		url: '*',
	// 		logging: false
	// 	});
	//
	// 	$.ajax({
	// 		url: '/console',
	// 		complete: function() {
	// 			window.console = _oldConsole;
	// 			assert.equal(msg, null, 'Logging method incorrectly called');
	// 			$.mockjaxSettings.logging = _oldLogging;
	// 			done();
	// 		}
	// 	});
	// });


})(window.QUnit, window.jQuery);
