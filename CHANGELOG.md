## 2015-04-08
    * Updated to version 1.6.2
    * Update jQuery library test versions on both 1.x and 2.x branches
    * Remove duplicate "repositories" value in package.json (@wfortin)
    * Remove undefined "head" variable in jsonp request mocking

## 2014-10-29
    * Updated to version 1.6.1
    * Changed all references to appendTo to point to github.com/jakerella (new owner)
    * removed unused testswarm files

## 2014-10-09
    * Updated to version 1.6.0
    * Added `unfiredHandlers()` and `unmockedAjaxCalls()`
    * Numerous bug fixes and breaking tests
    * Internal method cleanup
    * Switched to throwing proper `Error` objects
    * Switched to tab indentation everywhere
    * Added `main` field to package.json
    * Fixed responseTime for jsonp and allowed for variable setting with array min/max
    * Added `onAfterXxxxx` callbacks
    * Updated `$.mockjaxClear()` to be `$.mockjax.clear()` with deprecation notice
    * Complete README documentation overhaul
    * Fixed issue with Async actions in response callback
    * Added "contributing" documentation

## 2014-08-14
    * Spelling corrections in README.md
    * Update to newest version of QUnit (JS & CSS) and fixes for doing so
    * Added further versions of jQuery to test with
    * Added some tests for various issues and split out some tests for atomicity
    * Fixed dataType check for JSONP (case insensitive)
    * ensure request `data` matching occurs when url is matched and no data matching is required

## 2013-09-28
	* Fixed issue with proxy data and status codes (Thanks [Andrew Goodale](https://github.com/newyankeecodeshop)!)
	* TODO: Update this file with all changes since previous version

## 2012-05-30
	* Updated to version 1.5.2
	* Added support for jQuery 1.8, 1.9, 2.0
	* TODO: Update this file with all changes since previous version

## 2011-03-25   Jonathan Sharp (http://jdsharp.com)
    * Updating jQuery 1.5rc1 to 1.5.1
	* Adding TestSwarm support

## 2011-02-03	Jonathan Sharp (http://jdsharp.com)
	* Added log setting to intercept or disable logging messages
	* Added proxyType setting to force request type when proxying a mock
	* Added 29 unit tests for jQuery 1.3 through 1.5
	* Fixed issue #4 - Compatibility with jQuery 1.3
	* Fixed issue #10 - Undefined contents
	* Fixed issue #15 - proxy setting request type
	* Fixed issue #16 - proxy setting request type
	* Fixed issue #17 - jsonp request handling
	* Fixed issue #18 - Unit test fail with jQuery 1.5
