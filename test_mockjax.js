module("mockjax", {
    teardown: function() {
        $.mockjaxClear();
    }
});
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

test("can mock a jsonp datatype", function() {
    stop();
    $.mockjax({
        url: '/myapi'
    });
    $.ajax({
        url: '/myapi',
        dataType: 'jsonp',
        complete: function() {
            start();
        }
    })
});
