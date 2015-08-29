/* globals define,QUnit */

define(['jquery', 'jquery.mockjax'], function ($, mockjax) {
    'use strict';

    QUnit.module('jquery.mockjax used as AMD module');

    QUnit.test('returns the mockjax object', function(assert) {
        assert.ok(mockjax, 'mockjax object is returned');
    });

    QUnit.test('sets the mockjax object to the jQuery object', function(assert) {
        assert.ok($.mockjax, '$.mockjax object is set');
    });

    QUnit.test('returns the same object as it sets to $.mockjax', function(assert) {
        assert.strictEqual(mockjax, $.mockjax, 'returned mockjax object is the same as $.mockjax object');
    });

    QUnit.test('mocks a simple request', function (assert) {
        var done = assert.async();
        
        $.mockjax({
            url: '/resource',
            responseText: 'content'
        });

        $.ajax({
            url: '/resource',
            success: function(response) {
                assert.equal(response, 'content');
            },
            error: function () {
                assert.ok(false, 'error callback executed');
            },
            complete: done
        });
    });
});

