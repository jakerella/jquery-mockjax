define(["jquery", "jquery.mockjax"], function ($, mockjax) {
    "use strict";

    module("jquery.mockjax used as AMD module");

    test("returns the mockjax object", function() {
        ok(mockjax, "mockjax object is returned");
    });

    test("sets the mockjax object to the jQuery object", function() {
        ok($.mockjax, "$.mockjax object is set");
    });

    test("returns the same object as it sets to $.mockjax", function() {
        ok(mockjax === $.mockjax, "returned mockjax object is the same as $.mockjax object");
    });

    asyncTest("mocks a simple request", function () {
        $.mockjax({
            url: "/resource",
            responseText: "content"
        });

        $.ajax({
            url: "/resource",
            success: function(response) {
                equal(response, "content");
            },
            error: function () {
                ok(false, "error callback executed");
            },
            complete: function () {
                start();
            }
        });
    });
});

