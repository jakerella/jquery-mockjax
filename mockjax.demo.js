
// Example of a getScript or dataType == 'script'
$.mockjax({
	url: 'example.com/foo',
	response: function() {
		// This method is executed when a script request comes in
	}
});



/*
 * This file contains the mock ajax requests
 */
$.mockjax({
	url: '/rest/search/store',
	contentType: 'text/json',
	responseText: {
		status: 'success',
		data: {
			paging: {
				current: 1,
				total: 5
			},
			results: [
				'product-001',
				'product-002',
				'product-003',
				'product-004'
			]
		}
	}
});