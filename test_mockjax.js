module("mockjax");


test("should return xmlhttprequest object", function() {
    stop();
    $.mockjax({
        url: '/myapi',
        responseTest: "Hello Word"
    });
    var xhr = $.ajax({
        url: '/myapi',
        complete: function() {
            start();
        }
    });
    ok(xhr, "xhr object should not be null/undefined");
});


test("should trigger the wrapped complete callback", function() {
	stop();

	$.mockjax(function (request) {
		request._complete = request.complete;
		request.complete = function () {
			request.counter = 1;
			request._complete();
		}
		return request;
	});

	$.ajax({
		url: '/foo',
		complete: function () {
			this.counter++;

			equal(this.counter, 2);
			start();
		}
	});
});
