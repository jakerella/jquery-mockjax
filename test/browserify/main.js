'use strict';

var jquery = require('../../lib/jquery-3.4.1.js');
var mockjax = require('../../src/jquery.mockjax')(jquery, window);

mockjax({
    url: '/resource',
    responseText: 'content'
});

/* jshint unused:false */
function getResource(cb) {
    jquery.ajax({
        url: '/resource',
        success: cb,
        error: cb
    });
}
/* jshint unused:true */


// These are just here so that my tests can hit the *same* jQuery instance
// that Mockjax is on as well as the `getResource()` function above.
// You would NOT need this in your own code.
window.jQuery = jquery;
window.getResource = getResource;
