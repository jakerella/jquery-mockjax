/* globals describe,beforeEach,afterEach,it */

const path = require('path')
const fs = require('fs')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const assert = require('assert')

const metadata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json')).toString())
const jqVersions = Object.keys(metadata.peerDependencies)
const jqLibrary = jqVersions[jqVersions.length-2]

describe('Node module setup', function() {
	let $, xhr, win
	
	beforeEach(function(done) {
		win = (new JSDOM('<html></html>')).window
		$ = require(jqLibrary)(win)
		xhr = require('xmlhttprequest').XMLHttpRequest
		$.support.cors = true
		$.ajaxSettings.xhr = function () {
			return new xhr()
		}
		done()
	})
	
	describe('Mockjax Node Module Tests', function() {
	
		afterEach(function() {
			if ($ && $.mockjax) {
				$.mockjax.clearAll()
				$.mockjax.clearRetainedAjaxCalls()
			}
		})
		
		
		it('should be loaded when required', async function() {
			const mockjax = require(path.resolve(__dirname, '..', '..', 'dist', 'jquery.mockjax.js'))($, win)
			// const mockjaxFactory = await import(path.resolve(__dirname, '..', '..', 'dist', 'jquery.mockjax.js'))
			// console.log('IN TEST', mockjaxFactory)

			// const mockjax = mockjaxFactory($, win)
			assert.equal(typeof mockjax, 'function')
			assert.equal(typeof $.mockjax, 'function')
		})
		
		it('should mock a simple request using returned module', function(done) {
			const mockjax = require(path.resolve(__dirname, '..', '..', 'dist', 'jquery.mockjax.js'))($, win)
			
			mockjax({
				url: '/resource',
				responseText: 'content'
			})

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
			})
		})
		
		it('should mock a simple request using $.mockjax', function(done) {
			require(path.resolve(__dirname, '..', '..', 'dist', 'jquery.mockjax.js'))($, win)
			
			$.mockjax({
				url: '/foo',
				responseText: 'bar'
			})

			$.ajax({
				url: '/foo',
				success: function(response) {
					assert.equal(response, 'bar')
				},
				error: function () {
					assert(false)
				},
				complete: function () {
					done()
				}
			})
		})
	})
})
