(function(qunit, $) {
	'use strict';

	qunit.begin(function() {

		qunit.noErrorCallbackExpected = function noErrorCallbackExpected(xhr) {
			qunit.assert.ok(false, 'Error callback executed: ' + xhr.status, xhr.responseText);
		};

		// Speed up our tests
		$.mockjaxSettings.responseTime = 0;
		$.mockjaxSettings.logging = false;

		// Don't show log messages, but allow logging to work
		var noop = function() {};
		$.mockjaxSettings.logger = {
			debug: noop,
			log: noop,
			info: noop,
			warn: noop,
			error: noop
		};

		qunit.defaultMockjaxSettings = $.extend({}, $.mockjaxSettings);
	});

	qunit.testDone(function() {
		$.mockjax.clear();
		$.mockjaxSettings = $.extend({}, qunit.defaultMockjaxSettings);
	});

})(window.QUnit, window.jQuery);
