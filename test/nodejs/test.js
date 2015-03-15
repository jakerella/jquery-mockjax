"use strict";

QUnit.module("jquery.mockjax used as a Node.js module");

// JQuery and mockjax are loaded asynchronously during the first test
var $, mockjax;

testDone(function () {
	// reset mockjax after each test
	$.mockjax.clear();
});

asyncTest("loads and returns the mockjax object", function () {
    // jQuery needs a DOM just to get loaded, even in the Node.js environment
    var jsDomEnv = require("jsdom").env;
    jsDomEnv("<html></html>", function (error, window) {
        if (error) {
            ok(false, "jsdom initialization failed");
            start();
        } else {
            // Load jQuery and jQuery Mockjax using their factories for the
            // window-less and document-less environments like Node.js
            $ = require("jquery")(window);
            ok($, "jQuery is loaded");
            mockjax = require("../../dist/jquery.mockjax")($);
            ok(mockjax, "mockjax is loaded");

            // Enable jQuery AJAX using a XMLHttpRequest implementation, which
            // can work as a drop-in replacement in Node.js
            var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
            ok(XMLHttpRequest, "XMLHttpRequest is loaded");
            $.support.cors = true;
            $.ajaxSettings.xhr = function () {
                return new XMLHttpRequest();
            };

            start();
        }
    });

});

test("sets the mockjax object to the jQuery object", function () {
    ok($.mockjax, "$.mockjax object is set");
});

test("returns the same object as it sets to $.mockjax", function () {
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
