(function(qunit, $, sinon) {
	'use strict';

	var t = qunit.test;
	var winLogger;

	// Note: currently sinon cannot stub object methods in this manner in IE
	// See GH issue: https://github.com/sinonjs/sinon/issues/1009
	// As such, we'll be skipping the logger tests for IE currently
	if (/MSIE/.test(navigator.userAgent)) {
		qunit.module('Logging');
		
		t('UNABLE TO TEST LOGGER IN IE', function(assert) {
			assert.ok(true, 'Cannot stub console functions with Sinon, see https://github.com/sinonjs/sinon/issues/1009');
		});
		return;
	}

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

	t('Logging with high level', function(assert) {
		$.mockjaxSettings.logging = 4;
		$.mockjax._logger.debug({}, 'foobar');
		$.mockjax._logger.info({}, 'foobar');
		$.mockjax._logger.error({}, 'foobar');
		assert.ok(winLogger.debug.calledWith('foobar'), 'Log handler 4 was not called for debug');
		assert.ok(winLogger.info.calledWith('foobar'), 'Log handler 4 was not called for info');
		assert.ok(winLogger.error.calledWith('foobar'), 'Log handler 4 was not called for error');
	});

	t('Logging with low level', function(assert) {
		$.mockjaxSettings.logging = 0;
		$.mockjax._logger.debug({}, 'foobar');
		$.mockjax._logger.debug({ logging: 4 }, 'foobar');
		$.mockjax._logger.info({}, 'foobar');
		$.mockjax._logger.error({}, 'foobar');
		assert.strictEqual(winLogger.debug.callCount, 1, 'Log handler 0 was called too much for debug');
		assert.strictEqual(winLogger.info.callCount, 0, 'Log handler 0 was called for info');
		assert.ok(winLogger.error.calledWith('foobar'), 'Log handler 4 was not called for error');
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

				$.mockjax._logger.warn({}, 'foo');
				assert.strictEqual(winLogger.warn.callCount, 1, 'General log not called when disabled per mock');

				done();
			}
		});
	});


})(window.QUnit, window.jQuery, window.sinon);
