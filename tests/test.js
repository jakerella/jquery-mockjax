(function($) {
	$(function() {
		$.ajax({
			url: 'test.json',
			success: function(data) {
				$('ul').append('<li>test.json: completed (' + data.test + ')</li>');
			}
		});

		$.mockjax({
			url: 'test.json',
			contentType: 'text/json',
			responseText: { "test": "mock message" }
		});
		
		$.ajax({
			url: 'test.json',
			dataType: 'json',
			success: function(data) {
				$('ul').append('<li>test.json: completed (' + data.test + ')</li>');
			},
			error: function(xhr, status, error) {
				alert('error: ' + status + ' ' + error);
			},
			complete: function() {
			}
		});
		
		$.mockjax({
			url: 'http://google.com',
			responseText: 'alert("Hello world");'
		});
		
		$.mockjax({
			url: 'http://another-cross-domain.com',
			responseText: function() {
				alert("Get script mock");
			}
		});
		
		$.ajax({
			url: 'http://google.com',
			dataType: 'script',
			success: function(data) {
				$('ul').append('<li>script: completed (' + data.test + ')</li>');
			},
			error: function(xhr, status, error) {
				alert('error: ' + status + ' ' + error);
			},
			complete: function() {
			}
		});
	});
})(jQuery);
