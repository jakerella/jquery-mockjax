$.mockjaxSettings = {
	responseTime: 650
};

$.mockjax({
	url: '/some/url',
	responseTime: 1500
});

$.mockjax({
	url: '/another/url'
});

$.mockjax({
	url: '*',
});