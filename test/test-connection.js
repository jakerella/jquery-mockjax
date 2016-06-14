(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
	
	/* -------------------------------- */
	qunit.module( 'Connection Simulation', {
	/* -------------------------------- */
		beforeEach: function() {
			this.variableDelayMin = 100;
			this.variableDelayMax = 300;
			this.processingDuration = 30;

			$.mockjax({
				url: '/delay',
				responseTime: 150
			});
			
			$.mockjax({
				url: 'http://foobar.com/jsonp-delay?callback=?',
				contentType: 'text/json',
				proxy: 'test_jsonp.js',
				responseTime: 150,
				responseText: '{}'
			});
			
			$.mockjax({
				url: '/variable-delay',
				responseTime: [this.variableDelayMin, this.variableDelayMax]
			});

			$.mockjax({
				url: '/proxy',
				proxy: 'test_proxy.json',
				responseTime: 50
			});
			
			$.mockjax({
				url: '*',
				responseText: '',
				responseTime: 50
			});
		}
	});
	
	t('Async test', function(assert) {
		var done = assert.async();
		
		var order = [];
		$.ajax({
			async: true,
			url: '/',
			success: function() {
				order.push('b');
			},
			error: qunit.noErrorCallbackExpected,
			complete: function() {
				assert.deepEqual(order, ['a', 'b'], 'Order of execution correct, 2');
				done();
			}
		});
		order.push('a');
		assert.deepEqual(order, ['a'], 'Order of execution correct, 1');
	});
	
	t('Sync test', function(assert) {
		var order = [];
		$.ajax({
			async: false,
			url: '/',
			success: function() {
				order.push('b');
				assert.deepEqual(order, ['b'], 'Order of execution correct, 1');
			},
			error: qunit.noErrorCallbackExpected
		});
		order.push('a');
		assert.deepEqual(order, ['b', 'a'], 'Order of execution correct, 2');
	});
	
	t('Response time simulation and latency', function(assert) {
		var done = assert.async();
		
		var executed = 0, ts = new Date();
		$.ajax({
			url: '/delay',
			complete: function() {
				var delay = ((new Date()) - ts);
				// check against 140ms to allow for browser variance
				assert.ok( delay >= 140, 'Correct delay simulation (' + delay + ')' );
				assert.strictEqual( executed, 1, 'Callback execution order correct');
				done();
			}
		});
		setTimeout(function() {
			assert.strictEqual( executed, 0, 'No premature callback execution');
			executed++;
		}, 30);
	});
	
	t('Response time with jsonp', function(assert) {
		var done = assert.async();
		
		var executed = false, ts = new Date();

		window.abcdef123456 = function() {};

		$.ajax({
			url: 'http://foobar.com/jsonp-delay?callback=?',
			dataType: 'jsonp',
			complete: function() {
				var delay = ((new Date()) - ts);
				// check against 140ms to allow for browser variance
				assert.ok( delay >= 140, 'Correct delay simulation (' + delay + ')' );
				assert.ok( executed, 'Callback execution order correct');
				window.abcdef123456 = null;
				done();
			}
		});

		setTimeout(function() {
			assert.ok( executed === false, 'No premature callback execution');
			executed = true;
		}, 30);
	});

	t('Response time with jsonp deferred response', function(assert) {
		var done = assert.async();
		var executed = false, ts = new Date();

		window.abcdef123456 = function() {};

		$.ajax({
			url: 'http://foobar.com/jsonp-delay?callback=?',
			dataType: 'jsonp'
		}).done(function() {
            var delay = ((new Date()) - ts);
            // check against 140ms to allow for browser variance
            assert.ok( delay >= 140, 'Correct delay simulation (' + delay + ')' );
            assert.ok( executed, 'Callback execution order correct');
            window.abcdef123456 = null;
            done();
		});

		setTimeout(function() {
			assert.ok( executed === false, 'No premature callback execution');
			executed = true;
		}, 30);
	});

	t('Response time with min and max values', function (assert) {
		var done = assert.async();
		
		var executed = 0,
			that = this,
			ts = new Date();
		$.ajax({
			url: '/variable-delay',
			complete: function () {
				var delay = ((new Date()) - ts);
				assert.ok(delay >= that.variableDelayMin, 'Variable delay greater than min; delay was ' + delay);
				assert.ok(delay <= (that.variableDelayMax + that.processingDuration), 'Variable delay less than max; delay was ' + delay);
				assert.equal(executed, 1, 'Callback execution order correct');
				done();
			}
		});
		setTimeout(function () {
			assert.strictEqual(executed, 0, 'No premature callback execution');
			executed++;
		}, 30);
	});

	t('Proxy asynchronous response time', function (assert) {
		var done = assert.async();
		var executed = false, ts = new Date();

		$.ajax({
			url: '/proxy',
			type: 'json',
			success: function () {
				var delay = ((new Date()) - ts);
				assert.ok( delay >= 50, 'Correct delay simulation (' + delay + ')' );
				assert.strictEqual(executed, false, 'No premature callback execution');
				executed = true;
				done();
			},
			error: qunit.noErrorCallbackExpected
		});
		setTimeout(function () {
			assert.strictEqual(executed, false, 'No premature callback execution');
		}, 30);

	});
    
})(window.QUnit, window.jQuery);
