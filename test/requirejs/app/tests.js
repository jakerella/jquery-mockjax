
define(function (require) {
    window.$ = require('jquery')
    const mockjax = require('jquery.mockjax')
	// We don't do this because our headless runner injects stuff,
	// so we have to use a <script> tag for QUnit in the HTML head
    // window.QUnit = require('qunit')
	QUnit.defaultMockjaxSettings = {...$.mockjaxSettings}

    QUnit.module('Mockjax as RequireJS / AMD module', {
		teardown: () => {
			$.mockjax.clearAll()
			$.mockjax.clearRetainedAjaxCalls()
			$.mockjaxSettings = $.extend({}, QUnit.defaultMockjaxSettings)
		}
	})

    QUnit.test('mockjax exists and was required properly', function(assert) {
        assert.strictEqual(typeof(mockjax), 'function', 'mockjax local is a function')
        assert.strictEqual(typeof($.mockjax), 'function', '$.mockjax is a function')
        assert.strictEqual($.mockjax, mockjax, 'Local and jQuery version are the')
    })

    QUnit.test('Basic mock intercepts ajax call correctly', function(assert) {
        var done = assert.async()

        $.mockjax({
			url: '/api/resource',
			responseText: 'resource content'
		})

		$.ajax({
			url: '/api/resource',
			error: () => {
                assert.ok(false, 'Basic mock should not result in error')
            },
			success: function(data) {
				assert.equal(data, 'resource content', 'Basic url string match')
			},
			complete: function(xhr) {
				assert.equal(xhr.responseText, 'resource content', 'Basic url string match')
                assert.equal($.mockjax.mockedAjaxCalls().length, 1, 'One mock call is registered')
				done()
			}
		})
    })

    QUnit.test('Unmocked endpoint results in error', function(assert) {
        var done = assert.async()

        $.mockjax({
			url: '/api/resource',
			responseText: 'resource content'
		})

		$.ajax({
			url: '/api/foobar',
			error: (xhr) => {
                assert.equal(xhr.status, 404, 'Unmocked request results in 404')
            },
			success: () => {
				assert.ok(false, 'Unmocked request should not succeed')
			},
			complete: () => {
                assert.equal($.mockjax.unmockedAjaxCalls().length, 1, 'One unmocked call is registered')
				done()
			}
		})
    })

	// We've set these options, so we need to start ourselves...
	// QUnit.config.autostart = false
	// QUnit.config.noHeadlessStart = true
	QUnit.start()
})
