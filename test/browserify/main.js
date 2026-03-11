'use strict';

const jquery = require('jquery');
const mockjax = require('../../src/jquery.mockjax')(jquery, window);

mockjax({
    url: '/resource',
    responseText: 'content'
});

function getResource(cb) {
    jquery.ajax({
        url: '/resource',
        success: cb,
        error: cb
    });
}


// These are just here so that my tests can hit the *same* jQuery instance
// that Mockjax is on as well as the `getResource()` function above.
// You would NOT need this in your own code.
window.jQuery = window.$ = jquery;
window.getResource = getResource;
