(function(qunit, $) {
	'use strict';

	qunit.begin(function() {

		qunit.noErrorCallbackExpected = function noErrorCallbackExpected(xhr) {
			qunit.assert.ok(false, 'Error callback executed: ' + xhr.status, xhr.responseText);
		};

		// Speed up our tests
		$.mockjaxSettings.responseTime = 0;
		
		// TODO: change this if you want more logging on test runs!
		$.mockjaxSettings.logging = 1;

		if (!$.mockjaxSettings.logging) {
			// Don't show log messages, but allow logging to work
			var noop = function() {};
			$.mockjaxSettings.logger = {
				debug: noop,
				log: noop,
				info: noop,
				warn: noop,
				error: noop
			};
		}
		
		qunit.defaultMockjaxSettings = $.extend({}, $.mockjaxSettings)
	});

	qunit.testDone(function() {
		$.mockjax.clearAll()
		$.mockjax.clearRetainedAjaxCalls()
		// For some reason, calling resetSettings() causes every test
		// to take about 10x as long to run...
		// $.mockjax.resetSettings()
		$.mockjaxSettings = $.extend({}, qunit.defaultMockjaxSettings)
	});

})(window.QUnit, window.jQuery);
