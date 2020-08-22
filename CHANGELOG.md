## 2020-08-22 v2.6.0
    * Removed support for IE 9 & 10
    * Removed unused config for code climate
    * Updated dev dependencies to fix browserstack and local test run issues
    * Added support for regex url matching when using a namespace (thanks @gregid)

## 2020-03-30 v2.5.1
    * Fixed issue with capitalization of the "content-type" header
    * Added newer version of jQuery for testing
    * Fixed issue where we were not running one subset of tests

## 2018-07-29 v2.5.0
    * Added support for ignoring test files in the automated runs; this was necessary
      because Browserstack does something weird with the console and it causes
      the logging tests to timeout
    * Fixed Browserstack automated runs by ignoring logging tests
    * Added an option to reverse the mock handler priority order (thanks @addepar-andy)

## 2018-06-17 v2.4.0
    * Added support for an array of status codes in mocked response (thanks @reinrl)
    * Updated broken Codacy badge
    * Added jQuery 3.3.1 to test suite
    * Switched to using Chrome headless (with puppeteer) for all tests
    * No longer testing in Opera, and added Edge to the browser test list

## 2018-01-07 v2.3.0
    * Added new `handlers()` method
    * Add basic support for 301 and 302 status codes with auto-redirection
    * Fix up some README issues

## 2016-09-15 v2.2.2
    * Minor bug fixes having to do with namespacing (thanks @tomeara)
    * Improvement to testing CLI commands

## 2016-09-15 v2.2.1
    * Add tests for jQuery 3.x
    * Add tests for Browserify usage and documentation on that subject
    * Updated dependencies for webpack, etc usage (thanks @hotoo)
    * Updated keywords to be picked up by jQuery plugin registry

## 2016-06-08 v2.2.0
    * Fix bower dependency on jQuery to allow any supported version
    * Allow developer to indicate that ajax calls should _not_ be retained (thanks @suchipi)
    * Fix to allow responseTime to work with deferred jsonp
    * Updated to test on latest jQuery versions
    * Added JSDoc3 blocks to public API methods
    * Refactored logging: now has levels, easier to overwrite, more messages
    * Added ability for `data` matching to be a function (thanks @koorgoo)
    * Added ability to pass in array of mocks in addition to singles (thanks again @koorgoo)

## 2016-02-07 v2.1.1
	* Reorganize test cases into separate files for ease of maintenance and testing
	* Fix #86: JSONP return data treated as JSON
	* Added jQuery 1.12.0 to test quite
	* Fix #105: Using XML files as proxies
	* Fix #267: Handle undefined URL argument correctly
	* Fix #123: Handle query string formatted data option

## 2016-01-23
    * Updated to version 2.1.0
    * Removed unused testswarm files
    * Added test step in build process for dist file
    * Refactor tests to be easier to maintain and conform to current QUnit standards
    * Added global URL namespace feature (thanks @danpaz)
    * Added clearing of mocks by URL and regex (thanks @stas-vilchik)
    * Use async setting for proxy data (thanks @udnisap)
    * Update tests to jQuery 2.2.0 and fix for latest in jQuery git (thanks Simon and @gyoshev)
    * Fixed #136: cross domain requests
    * Updated contributing documentation to clearly state process for a release

## 2015-06-11
    * Updated to version 2.0.1
    * Fixed name in package.json for coordination among package management systems

## 2015-06-11
    * Updated to version 2.0.0
    * Fixed issue with isTimeout switch

## 2015-05-03
    * Updated to version 2.0.0-beta
    * Reorganized codebase and implemented Grunt build process
    * Implemented automated QUnit tests via Grunt and "shortcut" button in web tests
    * Added JSHint task for catching issues earlier
    * Implemented UMD pattern for use with require, browser, Node, etc
    * Removesd support for jQuery < 1.5.x
    * Removed deprecated `$.mockjaxClear()` method in favor of `$.mockjax.clear()`
    * Fixed numerous bugs (see issues for more info)
    * Refactored tests a bit (needs a lot more)
    * Added Travis CI for tests and Codacy for static code analysis

## 2015-04-08
    * Updated to version 1.6.2
    * Update jQuery library test versions on both 1.x and 2.x branches
    * Remove duplicate "repositories" value in package.json (@wfortin)
    * Remove undefined "head" variable in jsonp request mocking
    * Added async `response` function ability
    * Added ability to specify range for responseTime with random selection
    * Reorganized documentation significantly

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
