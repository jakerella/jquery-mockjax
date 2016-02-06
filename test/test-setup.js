(function(qunit, $) {
	'use strict';
	
	qunit.begin(function() {
		
		qunit.noErrorCallbackExpected = function noErrorCallbackExpected(xhr) {
			qunit.assert.ok(false, 'Error callback executed: ' + xhr.status, xhr.responseText);
		};

		// Speed up our tests
		$.mockjaxSettings.responseTime = 0;
		$.mockjaxSettings.logging = false;
		qunit.defaultMockjaxSettings = $.extend({}, $.mockjaxSettings);
		
	});
	
	qunit.testDone(function() {
		$.mockjax.clear();
		$.mockjaxSettings = $.extend({}, qunit.defaultMockjaxSettings);
	});

})(window.QUnit, window.jQuery);