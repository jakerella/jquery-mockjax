(function(qunit, $, sinon) {
	'use strict';

	var t = qunit.test
	var windowConsole = {}

	/* -------------------- */
	qunit.module( 'Logging', {
	/* -------------------- */

		beforeEach: function() {
			$.mockjax.resetSettings()
			windowConsole.debug = sinon.stub(window.console, 'debug')
			windowConsole.log = sinon.stub(window.console, 'log')
			windowConsole.info = sinon.stub(window.console, 'info')
			windowConsole.warn = sinon.stub(window.console, 'warn')
			windowConsole.error = sinon.stub(window.console, 'error')
		},
		afterEach: function() {
			window.console.debug.restore()
			window.console.log.restore()
			window.console.info.restore()
			window.console.warn.restore()
			window.console.error.restore()
		}
	});

	t('Default log handler is window.console and logs info message with level 2', function(assert) {
		$.mockjaxSettings.logLevel = 2
		const logger = $.mockjax.getLogger()

		logger.debug('foobar debug')
		logger.log('foobar log')
		logger.info('foobar info')
		logger.warn('foobar warn')
		logger.error('foobar error')

		assert.equal(windowConsole.debug.callCount, 0, 'Log handler should NOT call debug')
		assert.equal(windowConsole.log.callCount, 0, 'Log handler should NOT call log')
		assert.ok(windowConsole.info.calledWith('foobar info'), 'Log handler should call info')
		assert.ok(windowConsole.warn.calledWith('foobar warn'), 'Log handler should call warn')
		assert.ok(windowConsole.error.calledWith('foobar error'), 'Log handler should call error')
	});

	t('Logging with higher level', function(assert) {
		$.mockjaxSettings.logLevel = 3

		const logger = $.mockjax.getLogger()

		logger.debug('foobar debug')
		logger.log('foobar log')
		logger.info('foobar info')
		logger.warn('foobar warn')
		logger.error('foobar error')

		assert.equal(windowConsole.debug.callCount, 0, 'Log handler should NOT call debug')
		assert.ok(windowConsole.log.calledWith('foobar log'), 'Log handler should call log')
		assert.ok(windowConsole.info.calledWith('foobar info'), 'Log handler should call info')
		assert.ok(windowConsole.warn.calledWith('foobar warn'), 'Log handler should call warn')
		assert.ok(windowConsole.error.calledWith('foobar error'), 'Log handler should call error')
	});

	t('Logging with low level', function(assert) {
		$.mockjaxSettings.logLevel = 1

		const logger = $.mockjax.getLogger()

		logger.debug('foobar debug')
		logger.log('foobar log')
		logger.info('foobar info')
		logger.warn('foobar warn')
		logger.error('foobar error')
		assert.equal(windowConsole.debug.callCount, 0, 'Log handler should NOT call debug')
		assert.equal(windowConsole.log.callCount, 0, 'Log handler should NOT call log')
		assert.equal(windowConsole.info.callCount, 0, 'Log handler should NOT call info')
		assert.ok(windowConsole.warn.calledWith('foobar warn'), 'Log handler should call warn')
		assert.ok(windowConsole.error.calledWith('foobar error'), 'Log handler should call error')
	});

	t('Use deprecated logging level setting', function(assert) {
		$.mockjaxSettings.logLevel = null
		$.mockjaxSettings.logging = 3

		const logger = $.mockjax.getLogger()

		logger.debug('foobar debug')
		logger.log('foobar log')
		logger.info('foobar info')
		logger.warn('foobar warn')
		logger.error('foobar error')

		assert.equal(windowConsole.debug.callCount, 0, 'Log handler should NOT call debug')
		assert.ok(windowConsole.log.calledWith('foobar log'), 'Log handler should call log')
		assert.ok(windowConsole.info.calledWith('foobar info'), 'Log handler should call info')
		assert.ok(windowConsole.warn.calledWith('foobar warn'), 'Log handler should call warn')
		assert.ok(windowConsole.error.calledWith('foobar error'), 'Log handler should call error')
	});

	t('Disable logging via logLevel of -1', function(assert) {
		$.mockjaxSettings.logLevel = -1;

		const logger = $.mockjax.getLogger()

		logger.debug('foobar debug')
		logger.log('foobar log')
		logger.info('foobar info')
		logger.warn('foobar warn')
		logger.error('foobar error')
		assert.equal(windowConsole.debug.callCount, 0, 'Log handler should NOT call debug')
		assert.equal(windowConsole.log.callCount, 0, 'Log handler should NOT call log')
		assert.equal(windowConsole.info.callCount, 0, 'Log handler should NOT call info')
		assert.equal(windowConsole.warn.callCount, 0, 'Log handler should NOT call warn')
		assert.equal(windowConsole.error.callCount, 0, 'Log handler should NOT call error')
	});

	t('Logging with overly high level works', function(assert) {
		$.mockjaxSettings.logLevel = 99

		const logger = $.mockjax.getLogger()

		logger.debug('foobar debug')
		logger.log('foobar log')
		logger.info('foobar info')
		logger.warn('foobar warn')
		logger.error('foobar error')

		assert.ok(windowConsole.debug.calledWith('foobar debug'), 'Log handler should call debug')
		assert.ok(windowConsole.log.calledWith('foobar log'), 'Log handler should call log')
		assert.ok(windowConsole.info.calledWith('foobar info'), 'Log handler should call info')
		assert.ok(windowConsole.warn.calledWith('foobar warn'), 'Log handler should call warn')
		assert.ok(windowConsole.error.calledWith('foobar error'), 'Log handler should call error')
	});

	t('Disable logging via deprecated logging = false', function(assert) {
		$.mockjaxSettings.logLevel = null
		$.mockjaxSettings.logging = false;

		const logger = $.mockjax.getLogger()

		logger.debug('foobar debug')
		logger.log('foobar log')
		logger.info('foobar info')
		logger.warn('foobar warn')
		logger.error('foobar error')
		assert.equal(windowConsole.debug.callCount, 0, 'Log handler should NOT call debug')
		assert.equal(windowConsole.log.callCount, 0, 'Log handler should NOT call log')
		assert.equal(windowConsole.info.callCount, 0, 'Log handler should NOT call info')
		assert.equal(windowConsole.warn.callCount, 0, 'Log handler should NOT call warn')
		assert.equal(windowConsole.error.callCount, 0, 'Log handler should NOT call error')
	});

	t('Logging with custom logger implementation', function(assert) {
		$.mockjaxSettings.logger = {
			debug: sinon.stub(),
			log: sinon.stub(),
			info: sinon.stub(),
			warn: sinon.stub(),
			error: sinon.stub()
		}

		$.mockjax.validateSettings()

		const logger = $.mockjax.getLogger()

		logger.debug('foobar debug')
		logger.log('foobar log')
		logger.info('foobar info')
		logger.warn('foobar warn')
		logger.error('foobar error')

		assert.ok($.mockjaxSettings.logger.debug.calledWith('foobar debug'), 'Log handler should call debug')
		assert.ok($.mockjaxSettings.logger.log.calledWith('foobar log'), 'Log handler should call log')
		assert.ok($.mockjaxSettings.logger.info.calledWith('foobar info'), 'Log handler should call info')
		assert.ok($.mockjaxSettings.logger.warn.calledWith('foobar warn'), 'Log handler should call warn')
		assert.ok($.mockjaxSettings.logger.error.calledWith('foobar error'), 'Log handler should call error')
	});

	t('Bad custom logger fails validation', function(assert) {
		$.mockjaxSettings.logger = {
			info: sinon.stub(),
			warn: sinon.stub(),
			error: sinon.stub()
		}

		assert.throws(() => {
			$.mockjax.validateSettings()
		}, TypeError, 'Custom logger without all methods fails validation')
	});

})(window.QUnit, window.jQuery, window.sinon);
