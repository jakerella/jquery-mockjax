/* globals QUnit */

(function($) {
    'use strict';

    QUnit.module('jquery.mockjax used with Browserify');

    QUnit.test('mockjax function exists on jQuery', function(assert) {
        assert.strictEqual(typeof($.mockjax), 'function', '$.mockjax is a function');
    });

    QUnit.test('mock set in browserified module intercepts correctly', function(assert) {
        var done = assert.async();

        $.ajax({
            url: '/resource',
            success: function(response) {
                assert.equal(response, 'content');
            },
            error: function () {
                assert(false);
            },
            complete: function () {
                done();
            }
        });
    });

    QUnit.test('unmocked endpoint produces error', function(assert) {
        var done = assert.async();

        $.ajax({
            url: '/foobar',
            success: function() {
                assert(false);
            },
            error: function () {
                assert.ok(true);
            },
            complete: function () {
                done();
            }
        });
    });

    QUnit.test('function using ajax works correctly in browserified module', function(assert) {
        var done = assert.async();

        window.getResource(function(result) {
            assert.strictEqual(result, 'content');
            done();
        });
    });

})(window.jQuery);
