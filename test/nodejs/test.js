/* globals describe,beforeEach,afterEach,it */

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const assert = require('assert');

describe('Node module setup', function() {
    'use strict';
    
	let $, xhr, win;
	
	beforeEach(function(done) {
		win = (new JSDOM('<html></html>')).window;
		$ = require('jquery')(win);
		xhr = require('xmlhttprequest').XMLHttpRequest;
		$.support.cors = true;
		$.ajaxSettings.xhr = function () {
			/*jshint newcap:false*/
			return new xhr();
			/*jshint newcap:true*/
		};
		done();
	});
	
	describe('Mockjax Node Module Tests', function() {
	
		afterEach(function() {
			if ($ && $.mockjax) {
				$.mockjax.clear();
			}
		});
		
		
		it('should be loaded when required', function() {
			const mockjax = require('../../src/jquery.mockjax')($, win);
			assert.equal(typeof mockjax, 'function');
			assert.equal(typeof $.mockjax, 'function');
		});
		
		it('should mock a simple request using returned module', function(done) {
			const mockjax = require('../../src/jquery.mockjax')($, win);
			
			mockjax({
				url: '/resource',
				responseText: 'content'
			});

			$.ajax({
				url: '/resource',
				success: function(response) {
					assert.equal(response, 'content');
				},
				error: function () {
					assert(false);
				},
				complete: function () {
					done();
				}
			});
		});
		
		it('should mock a simple request using $.mockjax', function(done) {
			require('../../src/jquery.mockjax')($, win);
			
			$.mockjax({
				url: '/foo',
				responseText: 'bar'
			});

			$.ajax({
				url: '/foo',
				success: function(response) {
					assert.equal(response, 'bar');
				},
				error: function () {
					assert(false);
				},
				complete: function () {
					done();
				}
			});
		});
	});
});
