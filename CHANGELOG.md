
## 2026-04-28 v3.0.0

* Final release of v3.0.0
* Updates to some dev dependencies and minor fixes to unit tests

## 2026-04-28 v3.0.0-rc1

* Migrated all source code to modern JavaScript syntax.
* Migrated to modern ES Modules and build system.
* All mock handlers now have a unique id (UUID) versus sequential integer matching place in registration array.
* `retainAjaxCalls` is now an integer that represents the number of ajax calls to retain (defaults to -1, meaning retain all); using a boolean is deprecated, but still supported.
* Added `followRedirects` global setting which defaults to `true` (which was the previous functionality). Change this to `false` to return `3XX` status codes from mock handlers and NOT follow them to their `Location` header.
* `statusText` can now be an array when `status` is an array to randomly select a `statusText` for the response.
* Added proper validation for all mock handler properties with more helpful error messages.
* Added `$.mockjax.clearAll()`, `$.mockjax.clearById()`, and `$.mockjax.clearByUrl()` methods to replace unclear `clear()` method (deprecated, but still supported).
* Added `$.mockjax.resetSettings()` method to reset global settings to defaults.
* Added `$.mockjax.validateSettings()` method to validate global Mockjax settings (throws `TypeError` if not valid).
* Changed `headers` in mock handler to `responseHeaders` to avoid confusion with `requestHeaders` mock handler matching property.
* Added full unit test suite in addition to existing integration tests and improved tests for Nodejs and RequireJS.
* Added code coverage tooling and minimums.
* Improved documentation of previously undocumented features and nuances as well as updated guidance for contributors.
* Added JSDoc blocks everywhere for better type checking during dev.
* Added code linting during build process for consistent style and to catch code issues early.

* **Deprecated settings and methods:**
    * **Version `1.x` of Mockjax is deprecated and will no longer be supported**
    * The `headers` property on mock handlers and in global settings is deprecated (use `responseHeaders` in the same way).
    * The `$.mockjax.handler(id)` method is deprecated (use `handlers([id])`).
    * The `$.mockjax.clear()` method is deprecated (use the appropriate `clearByXx()` method).
    * The `type` matching property on mock handlers is deprecated (use `method` in the same way).
    * The `proxyType` settings on both global settings and mock handlers is deprecated (use `proxyMethod` in the same way).
    * Boolean values for `retainAjaxCalls` are deprecated (use integer values, `-1` replicates deprecated `true` and `0` replicates deprecated `false`).
    * The `logging` setting is deprecated (use `logLevel` in the same way).

* **Potentially Breaking Changes:**
    * _**NOTE**: few of these are true breaking changes. We have kept the API almost entirely stable. That said, there were many changes in 3.x that **could** break your tests, especially if you were using workarounds or undocumented "features"._
    * The global `$.mockjaxSettings` are now validated when the first mock handler is registered, throwing a `TypeError` if any of the settings are invalid and not registering the handler.
    * Passing no matching properties when registering a new handler will result in `TypeError`.
    * A mock responseXML that is invalid will now throw a `TypeError` in addition to triggering the jQuery "xmlParseError" error on `$(document)`.
    * `$.mockjaxSettings.log` was removed (it was deprecated previously, use `logger` instead).
    * We now use UUIDs for handler IDs. If you were using the old integer IDs in a way that relied on them being sequentially numeric and matching the array of mock handler registrations, your code may break!
    * The default response headers no longer include "etag" or "content-type" unless necessary.
    * Mock data matching got more robust, which might break some mock handler matches.
    * The RegExp used for url wildcard matching ("/api/*") got a bit more specific in what constitutes a valid URL character, which might break some mock handler matches.
    * The `clear` and new `clearByXx()` methods now only clear out mocked ajax calls that match the cleared handlers (versus all mocked and unmocked calls as before). This could cause problems if you previously expected all retained mocked ajax calls to be removed when running `clear()`, and this may cause increased memory usage.
    * The `handlers()` method now deep clones each handler, which could have a performance impact if used to retrieve many handlers. It could also break your code if you modified mock handlers after registration.
    * When using a proxy, mockjax no longer uses the proxy request's status code for the mock response status if it was not set on the mock handler (will use the default: `200`).
    * The timing of the toggle for the "fired" boolean on a mock handler changed to reflect mocking of redirects, which may affect what `unfiredHandlers()` returns in some edge cases.
    * RegExp URL matching with namespaces changed to ensure group matching with `urlParams`, which may affect code that was working around this issue.
    * The mock handler no longer tracks the `cache`, `timeout`, or `global` properties from the original ajax settings object.
    * The default logger implementation now emulates console logging methods more closely. Additionally, mock handlers no longer have their own `logging` option for the log level (this was previously undocumented). This could break any custom logger implementations.
    * The `logLevelMethods` global setting was removed. All custom logger implementations must have standard `window.console` logging methods (`error`, `warn`, `info`, `log`, `debug`).
    * Checks for Regular Expressions in matching criteria now use `instanceof RegExp` instead of checking for a `test` method on the object. This may cause some mocks not to match if you were abusing this fact.
    * In jQuery 4.0.0 the team introduced a change that uses script tags in more situations, specifically with the `dataType` "script" and `dataType` "jsonp". Mockjax will add an arbitrary header ("X-Mockjax: true") for these types of requests to bypass the issue. See: https://jquery.com/upgrade-guide/4.0/#breaking-change-script-tags-now-used-for-all-async-requests

## 2026-02-23 v2.7.0

* Updated tests to support for jQuery 4.0.0
* Note changes in v2.7.0-beta.0!

## 2024-09-09 v2.7.0-beta.0

* Support for jQuery 4.0.0-beta
* Removed deprecated calls to $.isArray() and $.isFunction()
* Updated cross-origin tests to use a safe domain
* Thanks to @jayaddison for the nudge and PR!

## 2024-02-17 v2.6.1

* Changed license from dual (MIT & GPL) to only be MIT
* Updated authorship to myself (creator of all v2 changes) and moved JD Sharp to contributor
* Massive (long needed) update to dev dependencies, and thus most of the test and build infrastructure
* NO source code changes, but the minified version will change due to dependency updates
* Remove support for IE 11 and requirejs
* Remove support for older versions of jQuery (supporting latest on each major branch)

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

* Added support for ignoring test files in the automated runs; this was necessary because Browserstack does something weird with the console and it causes the logging tests to timeout
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

## 2016-01-23 v2.1.0

* Removed unused testswarm files
* Added test step in build process for dist file
* Refactor tests to be easier to maintain and conform to current QUnit standards
* Added global URL namespace feature (thanks @danpaz)
* Added clearing of mocks by URL and regex (thanks @stas-vilchik)
* Use async setting for proxy data (thanks @udnisap)
* Update tests to jQuery 2.2.0 and fix for latest in jQuery git (thanks Simon and @gyoshev)
* Fixed #136: cross domain requests
* Updated contributing documentation to clearly state process for a release

## 2015-06-11 v2.0.1

* Fixed name in package.json for coordination among package management systems

## 2015-06-11 v2.0.0

* Fixed issue with isTimeout switch
* Reorganized codebase and implemented Grunt build process
* Implemented automated QUnit tests via Grunt and "shortcut" button in web tests
* Added JSHint task for catching issues earlier
* Implemented UMD pattern for use with require, browser, Node, etc
* Removed support for jQuery < 1.5.x
* Removed deprecated `$.mockjaxClear()` method in favor of `$.mockjax.clear()`
* Fixed numerous bugs (see issues for more info)
* Refactored tests a bit (needs a lot more)
* Added Travis CI for tests and Codacy for static code analysis

## 2015-04-08 v1.6.2

* Update jQuery library test versions on both 1.x and 2.x branches
* Remove duplicate "repositories" value in package.json (@wfortin)
* Remove undefined "head" variable in jsonp request mocking
* Added async `response` function ability
* Added ability to specify range for responseTime with random selection
* Reorganized documentation significantly

## 2014-10-29 v1.6.1

* Changed all references to appendTo to point to github.com/jakerella (new owner)
* removed unused testswarm files

## 2014-10-09 v1.6.0

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

## 2012-05-30 v1.5.2

* Added support for jQuery 1.8, 1.9, 2.0

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
