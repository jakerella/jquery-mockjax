(function(qunit, $, sinon) {
	'use strict';

	var t = qunit.test;
	var winLogger;

	/* -------------------- */
	qunit.module( 'Logging', {
	/* -------------------- */

		beforeEach: function() {
			winLogger = {
				debug: sinon.stub(console, 'debug'),
				log: sinon.stub(console, 'log'),
				info: sinon.stub(console, 'info'),
				warn: sinon.stub(console, 'warn'),
				error: sinon.stub(console, 'error')
			};
			$.mockjaxSettings.logger = winLogger;
			$.mockjaxSettings.logging = 2;
		},
		afterEach: function() {
			winLogger.debug.restore();
			winLogger.log.restore();
			winLogger.info.restore();
			winLogger.warn.restore();
			winLogger.error.restore();
		}
	});

	t('Default log handler (window.console)', function(assert) {
		var done = assert.async();

		$.mockjax({
			 url: '*'
		});
		$.ajax({
			url: '/console',
			type: 'GET',
			complete: function() {
				assert.ok(winLogger.info.calledWith('MOCK GET: /console'), 'Default log handler was not called');
				done();
			}
		});
	});

	t('Custom (deprecated) log handler', function(assert) {
		var done = assert.async();

		var msg = null;
		$.mockjaxSettings.log = function customLogger( mockHandler, requestSettings) {
			msg = mockHandler.url + ' - ' + requestSettings.type.toUpperCase() + ': ' + requestSettings.url;
		};
		$.mockjax({
			 url: '*'
		});
		$.ajax({
			url: '/console',
			type: 'GET',
			complete: function() {
				assert.equal(msg, '* - GET: /console', 'Custom log handler was not called');
				done();
			}
		});
	});

	t('Disable logging via `logging: false`', function(assert) {
		var done = assert.async();

		$.mockjaxSettings.logging = false;

		$.mockjax({
			url: '*'
		});
		$.ajax({
			url: '/console',
			complete: function() {
				assert.strictEqual(winLogger.info.callCount, 0, 'Log called when disabled');

				$.mockjax._logger.debug({}, 'foo');
				assert.strictEqual(winLogger.debug.callCount, 0, 'Log called when disabled');

				done();
			}
		});
	});

	t('Disable logging per mock via `logging: false`', function(assert) {
		var done = assert.async();

		$.mockjax({
			url: '*',
			logging: false
		});

		$.ajax({
			url: '/console',
			complete: function() {
				assert.strictEqual(winLogger.info.callCount, 0, 'Log called when disabled');

				$.mockjax._logger.debug({}, 'foo');
				assert.strictEqual(winLogger.debug.callCount, 1, 'General log not called when disabled per mock');

				done();
			}
		});
	});


})(window.QUnit, window.jQuery, window.sinon);
