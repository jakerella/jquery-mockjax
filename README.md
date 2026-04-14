# jQuery Mockjax: Ajax request mocking

jQuery Mockjax provides robust HTTP request & response mocking during front end testing for the $.ajax() method.

There are some **major breaking changes in v3**, so if you need an older version, please check the [v2.x](https://github.com/jakerella/jquery-mockjax/tree/v2.x) branch or the list of [releases](https://github.com/jakerella/jquery-mockjax/tags) in GitHub.

> Please note that this is a tool for **testing** your front end code without a server. It is not intended for use in a production environment!

## Your first mock

Include the `jquery.mockjax.js` file in your tests, then before your test cases, register your HTTP mocks. For example, if you have an API endpoint at `/api/products` that returns an array of products for sale, you could mock that out like so:

```javascript
$.mockjax({
  url: '/api/products',
  responseText: [
    { id: 13, name: 'rubber duck' },
    { id: 42, name: 'house plant' }
  ]
})
```

Now, when your test harness runs your source code and it in turn runs `$.ajax('/api/products')`, the mock response will be provided to your application instead of hitting a live server!


## Documentation Table of Contents

* [Basic Usage](#basic-usage)
  * [Core Principles](#basic-principles)
  * [Public API Methods](#public-api-methods)
  * [`MockHandler` Object](#mockhandler-object)
  * [Global Mockjax Settings](#global-mockjax-settings)
  * [`MockjaxRequestSettings` Object](#mockjaxrequestsettings-object)
* [Detailed Request Matching](#detailed-request-matching)
  * [Matching on the URL](#matching-on-the-url)
  * [Matching on the Data](#matching-on-the-data)
  * [Matching on the Request Headers](#matching-on-the-request-headers)
  * [Matching on the HTTP Method](#matching-on-the-http-method)
  * [Registering Multiple Handlers](#registering-multiple-handlers)
* [Detailed Response Definition](#detailed-response-definition)
  * [Inline Responses](#inline-responses)
  * [Using a Proxy](#using-a-proxy)
  * [Dynamic Response Functions](#dynamic-response-functions)
    * [Capturing URL parameters](#capturing-url-parameters)
* [Advanced Mocking Techniques](#advanced-mocking-techniques)
  * [Simulating Response Time and Latency](#simulating-response-time-and-latency)
  * [Simulating HTTP Response Statuses](#simulating-http-response-statuses)
  * [Setting Additional HTTP Response Headers](#setting-additional-http-response-headers)
  * [Dynamically Generating Mock Responses](#dynamically-generating-mock-responses)
  * [Forced Simulation of Server Timeouts](#forced-simulation-of-server-timeouts)
  * [Using Other Data Types](#using-other-data-types)
    * [Mocking JSONP](#mocking-jsonp)
  * [Performing Actions After Request Completion](#performing-actions-after-request-completion)
  * [Setting a Global URL Namespace](#setting-a-global-url-namespace)
  * [Globally Defining Match Order](#globally-defining-match-order)
  * [Managing Mockjax Data](#managing-mockjax-data)
* [Miscellaneous Information](#miscellaneous-information)
  * [About Mockjax and Its History](#about-mockjax-and-its-history)
  * [jQuery Version Support](#jquery-version-support)
  * [Browsers Tested](#browsers-tested)
  * [Using Mockjax in Other Ways](#using-mockjax-in-other-ways)
  * [Logging](#logging)
    * [Implement a custom logger](#implement-a-custom-logger)
  * [Release History](#release-history)
  * [License](#license)
  * [Contributing](#contributing)


## Basic Usage

### Core Principles

This library is intended to help test front end code by mocking out your back end server. So long as every HTTP request your front end code makes is via `$.ajax()`, you can mock out your entire back end using Mockjax.

We accomplish this by replacing the stock jQuery `ajax` method with our own version, intercepting every HTTP request and comparing it to the mock handlers you have registered beforehand. If there is a match, we send back your mock response instead of executing a real XMLHTTPRequest. Don't worry, we replicate all of the functionality of an ajax call, so your callbacks will all still execute as expected.

Let's say you have some code in your application that calls the back end to retrieve the current set of products for sale when someone clicks on a button.

```javascript
function getProducts() {
  $.ajax('/api/items', {
    dataType: 'json',
    error: (err) => { showErrorMessage(err) },
    success: (data) => {
      data.forEach(item => {
        $('ul.products').append(`<li id='item-${item.id}'>${item.name}</li>`)
      })
    }
  })
}
$('button.get-products').click(getProducts)
```

Now we want to test the `getProducts` function in isolation. The problem is we would need to spin up a whole API server just to test this out. Instead, our front end engineer can write a test themself using Mockjax to create a fake API server just for the test.

Let's assume they're using [QUnit](https://qunitjs.com/) as the testing framework. They could create the test like so:

```javascript
QUnit.test('Load products into page', function(assert) {
  const done = assert.async()

  $('ul.products').html('')

  $.mockjax({
    url: '/api/items',
    responseText: [{ id: 13, name: 'rubber duck' }, { id: 42, name: 'house plant' }],
    onAfterSuccess: () => {
      const items = $('ul.products li')
      assert.equal(items.length, 2, 'Both items were added')
      assert.equal(item[0].text(), 'rubber duck', 'The rubber duck is the first item')
      assert.equal(item[0].attr('id'), 'item-13', 'The rubber duck has the correct id attribute')
      done()
    }
  })

  getProducts()
})
```

In the code above, we first clear out any HTML elements inside the `<ul>` with the class of "products" so that we're starting from a clean slate. Then we create our mock handler. Notice that we set the `url`, which will match our `$.ajax()` call in the application code. We then set the `responseText` that we want to be returned. It's okay that it's an object, but we could also pass in a JSON string.

Next, we set our `onAfterSuccess` callback. This is where we will perform our test assertions. This callback will fire _after_ the `success` callback in our application source code, and with the same arguments. There are other ways to test this, for example, the `getProducts` function could return the Deferred object (a jQuery Promise) so that our test could hook into that.

Lastly, we call the `getProducts()` function to initiate our test. Note that we call QUnit's `done` callback inside the `onAfterSuccess` so that the test harness knows when the test is complete.

### Public API Methods

Mockjax has one primary interface: the `$.mockjax()` method which is added to the `window` object's jQuery instance automatically. In addition, Mockjax **overwrites `$.ajax()`** with its own version, so in essence, every time you call `$.ajax()` you are calling a Mockjax interface. There are a number of other public methods, all documented below.

Note that the main data types (and method options) are listed below the method descriptions.

`{UUID|Array<UUID>} $.mockjax({MockHandler|Function|Array<MockHandler|Function>} options)`

Registers one or more new mock ajax handlers and returns the handler's UUID. If an array is provided, an array of UUID's is returned. Note that at least one matching mechanism must be provided in the options (`url`, `method`, `requestHeaders`, or `data`) if you provide an object. If you provide a function, it will be called on every `$.ajax()` request and must return an object representing a `MockHandler` if a match occurs, and `null` if not.

See the [MockHandler](#MockHandler-object) section below for all options and properties of a Mockjax handler.

`{Array<MockHandler>} $.mockjax.handlers({?Array<string>} uuids)`

Returns an array of mock handler object _clones_ for the provided `UUIDs`, or _all_ mock handlers if no array is provided. Each one will have a `clear()` method on it for easy clean up. Note that since these are cloned objects, altering them will not change the operation of request mocking and response generation. If you want to alter a mock handler, first clear it using `$.mockjax.clearById()`, then register the new handler.

See the [MockHandler](#MockHandler-Object) section below for all options and properties of a Mockjax handler.

`DEPRECATED {MockHandler} $.mockjax.handler({string} uuid)`

Use `handlers([UUID])` instead. As of v3.x, this method is a passthrough to `handlers()` above.

`{number} $.mockjax.clearById({string} uuid)`

Unregisters a single mock handler matching the provided UUID. If the UUID is not that of an existing handler, then nothing happens. Returns the count of mock handlers cleared (in this case 0 or 1). This will also clear any retained ajax calls that have been mocked using this handler.

`{number} $.mockjax.clearByUrl({string|RegExp} url)`

Unregisters any mock handlers matching the provided URL. If the argument is a string, it will only match mock handlers that have a `url` property that exactly matches the argument. If the provided URL is a regular expression _and_ the mock handler `url` property is a regular expression, then this code will compare the String versions of those regular expressions to determine a match. If the provided URL is a regular expression and the mock handler `url` property is a string, this code will execute the provided RegExp on that mock handler's `url` property to determine a match. Returns the count of mock handlers cleared (which may be 0). This will also clear any retained ajax calls that have been mocked using this handler.

`{number} $.mockjax.clearAll()`

Unregisters **all** mock handlers and returns the count of mock handlers cleared. This will also clear any _mocked_, retained ajax calls (but will retain non-mocked ajax calls).

`DEPRECATED {number} $.mockjax.clear({?string | RegExp} mechanism)`

Use the appropriate `clearByXx()` method above. As of v3.x, this method will attempt to determine what to clear using the provided "mechanism" and call the appropriate method. If no mechanism is provided, this method will call `clearAll()`. If the mechanism matches one of the known mock handler IDs, that one handler will be cleared. Otherwise this method will assume this is a `clearByUrl()` and pass the argument through to that method.

`{Array<MockHandler>} $.mockjax.unfiredHandlers()`

Returns an array of mock handler object _clones_ that have **not** yet been matched to a live `$.ajax()` request. Each one will have a `clear()` method on it for easy clean up. Note that since these are cloned objects, altering them will not change the operation of request mocking and response generation.

See the [MockHandler](#MockHandler-object) section below for all options and properties of a Mockjax handler.

`{Array<MockjaxRequestSettings>} $.mockjax.mockedAjaxCalls()`

Returns an array of all ajax call settings that have been mocked by Mockjax. Each entry will be a `MockjaxRequestSettings` Object, which a wrapper around jQuery's [ajax settings object](https://api.jquery.com/jQuery.ajax/). Note that if the global `retainAjaxCalls` setting is set to a positive integer, only that many _total ajax calls_ (mocked or unmocked) will be retained, and Mockjax operates a first-in-first-out (FIFO) cache of these. If `retainAjaxCalls` is set to `0`, no calls will be retained and this method will always return an empty array.

See the [MockjaxRequestSettings](#MockjaxRequestSettings-Object) section below for more info.

`{Array<MockjaxRequestSettings>} $.mockjax.unmockedAjaxCalls()`

Returns an array of all ajax call settings that have **not been mocked** by Mockjax. Each entry will be a `MockjaxRequestSettings` Object, which a wrapper around jQuery's [ajax settings object](https://api.jquery.com/jQuery.ajax/). Note that if the global `retainAjaxCalls` setting is set to a positive integer, only that many _total ajax calls_ (mocked or unmocked) will be retained, and Mockjax operates a first-in-first-out (FIFO) cache of these. If `retainAjaxCalls` is set to `0`, no calls will be retained and this method will always return an empty array.

See the [MockjaxRequestSettings](#MockjaxRequestSettings-Object) section below for more info.

`{number} $.mockjax.clearRetainedAjaxCalls({?Array<string>} mockUUIDs)`

Remove any retained ajax calls that have been mocked by the provided mock handler UUIDs. If no array is provided, _all_ retained ajax calls will be removed. The number of removed ajax calls will be returned.

### `MockHandler` Object

This is the main object used to do request matching and provide response details for a mock. It also contains a few internal properties. Other than the internal properties at the bottom of this section, all of these are options that can be provided when registering a new mock handler.

#### Options Used for Matching (one or more must be provided)

If more than one of these is provided **all** of them must match to mock out an ajax request, but at least one is required. (Note that `namespace` does not match on its own.)

* `url {string | RegExp}` Specifies the url of requests to match to this mock. If it is a string and contains any asterisks (`*`), they will be treated as a wildcard for any valid URL characters. Note that this is NOT a full glob pattern, just a simple wildcard replacement. If it is a regular expression, it will be executed against the request URL.
* `namespace {string}` Acts as a prefix for request URLs during matching on this handler (and thus this only works in conjunction with a `url` matching property). This will override the global `namespace` setting for this handler only. Making this `null` will remove the global `namespace` for this handler only.
* `method {string}` Specify what HTTP method to match for this mock, case-insensitive.
* `type {string}` DEPRECATED, use `method` instead.
* `requestHeaders {Object<string, string}` Specifies request headers to match to an ajax request. A request with _more_ headers will still match this mock so long as all headers in the registered mock match. Note that header names are case-insensitive.
* `data {Object<string, *> | function}` Specifies data parameters to match to an ajax request. A request with _more_ data params will still match this mock so long as all data properties in the registered mock match. You can also pass in a function which will be executed when any request is made. The function will be given the ajax data and must return `true` or `false`.

#### Options Used for Response Simulation:

Note that any response options not provided here will be gathered from the global `mockjaxSettings` object as needed.

* `status {number | Array<number>}` An integer (or array of integers) between 100 and 599 that specifies the server HTTP status code to send back in the response. If an array, a random selection is made for each matching request.
* `statusText {string | Array<string>` Specifies the server response status description. If an array, the `status` property must also be an array of the same size and a corresponding `statusText` will be chosen when a random `status` is chosen.
* `responseText {string | object}` Specifies the text, or an object literal that will be "stringified", for the mock response.
* `responseXML {string | Document}` Specifies the mock XML response (as a string or Document node) for the request. Note that this is only used when the `dataType` for the ajax request is `xml`.
* `response {function}` A function to call to modify or generate the response properties. It will be sent 2 arguments: the request settings and a callback function. In addition, the context for the function (the value of `this`) will be the mock handler. This function **must execute the callback** provided after updating the mock handler with the appropriate response fields such as `status`, `responseText`, etc. Note that this function does not _override_ the other response properties. It provides the developer a chance to alter them based on the specific request settings.
* `responseHeaders {Object<string, string>}` Headers to be added to the simulated response for matched requests.
* `headers`: [Object] DEPRECATED Use `responseHeaders`
* `proxy {string}` Specifies a URL to a resource, the contents of which will be used as the `responseText` for the mocked request.
* `proxyMethod {string}` Specifies the HTTP method to use to retrieve the proxy data.
* `proxyType {string}` DEPRECATED USe `proxyMethod`
* `responseTime {number}` An integer that specifies a simulated network / server latency (in milliseconds). Setting this to `0` will minimize the simulated latency, but keep the call asynchronous. Note that this setting is _ignored_ for non-asynchronous calls - that is, calls where `async: false` is provided to `$.ajax()`.
* `isTimeout {boolean}` Determines whether or not the mock will force a timeout error on the ajax request.
* `contentType {string}` Specifies the content type for the response (otherwise this is automatically determined, if possible).
* `urlParams {Array<string>}` If provided - and the `url` property is a regular expression - matched group values from the expression will be assigned to an object called `urlParams` in the request settings with each property named by the strings in this array, and the values of those properties matching the group matches in the URL regular expression. This can be combined with a dynamic `response` function to change the response based on the URL path.
* `lastModified {String}` A date string specifying the mocked "last-modified" time for the request. This is used internally by jQuery to determine if the requested data is new since the last request, and thus caching.
* `etag {string}` Specifies a unique identifier referencing a specific version of the requested data. This is used internally by jQuery to determine if the requested data is new since the last request. (see [HTTP_ETag](http://en.wikipedia.org/wiki/HTTP_ETag))

#### Optional Callback Methods

Sometimes you need to perform assertions or other actions after the source code ajax request is complete, but in situations where the source code does not return a Promise or provide a callback argument. For these situations, you can use the callbacks below.

* `onAfterSuccess {function}` Will be called after the original ajax call's "success" callback has completed, and with the same arguments.
* `onAfterError {function}` Will be called after the original ajax call's "error" callback has completed, and with the same arguments.
* `onAfterComplete {function}` Will be called after the original ajax call's "complete" callback has completed, and with the same arguments.

#### Mockjax Properties and Methods

The following properties (and a method) are added by Mockjax. You should not alter them, but obviously may find them helpful.

* `id {string}` A UUID for this handler, auto-generated and assigned by Mockjax after registration.
* `fired {boolean}` Whether or not this handler has been matched to a real ajax call.
* `registeredAt {number}` The timestamp when this handler was registered with Mockjax.
* `clear {function}` When you call `handlers()` or `unfiredHandlers()` Mockjax will add this method to the returned (cloned) handler object so that you can clear that one handler easily.


### Global Mockjax Settings

The global Mockjax settings include all "response simulation" options from the [`MockHandler` object](#MockHandler-Object), plus some additional settings found below. For the response simulation settings, we only provide the default values, refer to the section above for descriptions. To overwrite a particular setting, you can call `$.mockjax.getSettings()` and then set the value directly. (Note that the `$.mockjaxSettings` object is still there, but should be avoided in favor of `getSettings()`.)

```javascript
$.getSettings().responseTime = 200  // overwriting the default global setting
```

#### Response Simulation Defaults

* `status` defaults to `200`
* `statusText` defaults to `"OK"`
* `responseTime` defaults to `500`
* `isTimeout` defaults to `false`
* `contentType` defaults to `"text/plain"`
* `response` defaults to `null`
* `responseText` defaults to `""`
* `responseXML` defaults to `""`
* `responseHeaders` defaults to `{}`
* `proxy` defaults to `null`
* `proxyMethod` defaults to `null`
* `lastModified` defaults to time of request
* `etag` defaults to `"IJF@H#@923uf8023hFO@I#H#"`

#### Other global settings

These settings affect the global operation of Mockjax. With the exception of `namespace`, none of them can be overridden by a single mock handler.

* `namespace {?string}` A global URL namespace which will prefix all mock handler URLs. (default: `null`)
* `throwUnmocked {boolean}` Should Mockjax throw an `Error` if an ajax request goes unmocked? (default: `false`)
* `retainAjaxCalls {number}` How many ajax call settings should be retained? (default: `-1`, or all of them)
* `matchInRegistrationOrder {boolean}` Essentially, should Mockjax select the first mock handler a request matches to? Switch this to `false` to reverse the order. (default: `true`)
* `followRedirects {boolean}` Should Mockjax follow 3XX status code redirects? (default: `true`)
* `logLevel {number}` How much to log to the console (default: `2`, set to `-1` to log nothing)
* `logger {Object<string, function>}` An object that has `debug`, `log`, `info`, `warn`, and `error` methods for handling log messages. 


### `MockjaxRequestSettings` Object

Whenever you receive the settings for the original ajax request, you will actually receive a Mockjax wrapper for those settings. This wrapper will have three additional properties on it (see below), but otherwise will be the same as [jQuery's ajax settings object](https://api.jquery.com/jQuery.ajax/).

* `mocked {boolean}` Whether or not this ajax call was mocked.
* `mockHandlerId {?string}` If this call was mocked, this will be the UUID of the matching mock handler, otherwise it will be `null`.
* `timestamp {number}` The timestamp when this ajax call was initiated.


## Detailed Request Matching

Mockjax can match requests using their URL, request data, HTTP method, or request headers - or any combination of these. The library is able to handle and parse `Text`, `HTML`, `JSON`, `JSONP`, `Script` and `XML` data types, allowing you to mock many different types of ajax calls. And there is always the dynamic request matching (and response generation) mechanism.

### Matching on the URL

```javascript
$.mockjax({
  url: "/api/foo/bar"
})
```

> Only matches the exact URL: "/api/foo/bar"

#### Using a Wildcard

Using the `*` as a wildcard will match any valid URL character:

```javascript
$.mockjax({
  url: "/api/user/*"
})
```

> Matches any URL path under "/api/user/" such as "/api/user/13" or "/api/user/13/edit" or "/api/user/jordan". It will NOT match the base path (before the wildcard): "/api/user/"

#### Using a Regular Expression

```javascript
$.mockjax({
  url: /^\/api\/(author|book)\/\d+$/i
})
```

> Matches "/api/author/42" or "/api/book/13" (or any other number)

### Matching on the Data

You can also match against the `data` option of the ajax call:

```javascript
$.mockjax({
  data: { action: "foo" }
})

$.ajax("/api", {
  method: "POST",
  data: { action: "foo" },
  ...
})
```

The mock above will match if all of the _mock_ data attributes exist. It doesn't matter if there are more data attributes in the actual request. For example:

```javascript
// This ajax call will still match the mock above
$.ajax("/api", {
  method: "POST",
  data: { user: 123, action: "foo", anotherField: "batbaz" },
  ...
})
```

For `GET` requests, the `data` attribute is converted to a query string, but Mockjax will work either way:

```javascript
$.mockjax({
  data: { foo: "bar", bat: "baz" }
})

$.ajax({
  url: '/api/query',
  data: 'foo=bar&bat=baz'  // Matched!
})
```

That said, if the query data in the ajax call is placed in the `url` directly, then the `data` option in the mock handler will not match it:

```javascript
$.mockjax({
  data: { foo: 'bar' }  // NO MATCH for ajax call below
})

$.ajax({
  url: '/api/query?foo=bar'
})
```

In order to match query data in the `url` of the ajax call, you need to use a URL matcher in your mock handler:

```javascript
$.mockjax({
  url: '/api/query?foo=bar'  // Will match
})
```

You could also use a wildcard to only match the query string:

```javascript
$.mockjax({
  url: '*?foo=bar'  // Will match
})
```

#### Using a Data Matcher Function

The data option may be a custom matching function returning `true` of `false` whether the data is expected or not:

```javascript
$.mockjax({
  data: function(data) {
    return data.foo === "bar" && Number.isInteger(data.count) && data.count > 0
  }
})
```

You can use the data function of the mock as a place for assertions. Return `true` and let a testing framework of choice do the rest:

```javascript
const expected = { foo: "bar", count: 3 }
$.mockjax({
  data: function (data) {
    assert.deepEqual(data, expected)  // QUnit example
    return true
  }
})
```

### Matching on the Request Headers

You can also match on the headers in the request:

```javascript
$.mockjax({
  requestHeaders: {
    Authorization: 'user-api-key'  // "authorization" also works here
  },
  responseText: 'You are authorized!'
})
```

Note that request headers must be simple objects with string keys and string values. Also, similar to the data matching option, only the headers specified in the _mock_ must match. Additional headers in the request may be present, but will be ignored.

> Request header **names** are treated as case-insensitive, but not the values!

### Matching on the HTTP Method

You can match ajax requests based on the HTTP method used as well, although you likely want to combine that with one of the other three methods (see below).

```javascript
$.mockjax({
  method: 'POST'
})
```

The mock handler above would match **all** HTTP `POST` requests (which likely isn't what you want to do).

### Matching on Multiple Elements

In many cases you will want to match on multiple aspects of the ajax call.

```javascript
// match only GET requests to URL "/api/user/13" (or similar URLs)
$.mockjax({
  url: /\/api\/user\/\d+/,
  method: 'GET'
})
```

```javascript
// match a POST request to URL "/api/user" when the username is "jakerella"
$.mockjax({
  url: '/api/user',
  method: 'POST',
  data: { username: "jakerella", name: "jordan", role: "maintainer" }
})
```

```javascript
// match DELETE requests to "/api/*" endpoints with a valid API key
$.mockjax({
  url: '/api/*',
  method: 'DELETE',
  requestHeaders: { Authorization: "my-api-key" }
})
```

### Registering Multiple Handlers

Since version 2.2 you can register several mock handlers at once by providing an array to the primary `$.mockjax([...])` method:

```javascript
const handlerUUIDs = $.mockjax([
  {url: '/api/users', method: 'GET', responseText: 'the user list...'},
  {url: '/api/user', method: 'POST', data: { ... }, responseText: 'a new user'}
])
```

## Detailed Response Definition

There are two many portions of a mock handler definition: the [matching criteria](#detailed-request-matching) (described above) and the response fields, described in this section. The two main options you will be dealing with are `responseText` and `responseXML`. These two fields tell Mockjax what to return when a request is matched. There are three different patterns for specifying the response: Inline, Proxy, and as a Function.

### Inline Responses

A simple text response might look like this:

```javascript
$.mockjax({
  url: "/api/time",
  method: "GET",
  responseText: "The time is one o'clock in the afternoon."
})
```

In other words, any time a `GET` ajax request is sent to "/api/time", Mockjax will intercept it and instead of calling the server, it will respond with the `responseText` string above. Your jQuery success handler would then receive that response and keep processing as if it had hit the server.

You can put JavaScript objects in the `responsetext` field (despite its name) and Mockjax will ensure it gets stringified and sent to the calling ajax code correctly:

```javascript
$.mockjax({
  url: "/restful/api",
  responseText: { "foo": "bar" }
})
```

The `responseXML` is similar: you can either pass in a string of XML text or an actual `Document` object. Mockjax will send it to your source code appropriately.

```javascript
$.mockjax({
  url: "/restful/api",
  responseXML: "<document><quote>Hello world!</quote></document>"
});
```

As you might imagine, if you have a significant amount of data being mocked, this process becomes unwieldy. So that brings us to the next pattern: the proxy.

### Using a Proxy

In the example below, Mockjax will intercept `GET` requests for "/api/users", retrieve the data from a live server running at: "/mocks/user-data.json", and return the contents of that file as if it came from "/api/users".

```javascript
$.mockjax({
  url: "/api/users",
  method: "GET",
  proxy: "/mocks/user-data.json"
})
```

The "/mocks/user-data.json file can have any valid JSON content you want, and allows you to separate and reuse that mock data.

It doesn't have to be a static file, either. In the example below, Mockjax will intercept `POST` requests to "/api/user" and then make a different POST request (presumably a live request) to a test server to get the mock data. Note that the `data` option in the mock 
handler here will get passed through to the proxy endpoint for you to use in determining what mock data to send back.

```javascript
$.mockjax({
  url: "/api/user",
  method: "POST",
  proxy: "https://mocks.testserver.local/user/data",
  proxyMethod: "POST",
  data: { username: "jakerella", name: "jordan", role: "maintainer" }
})
```

> Note: If you're testing your code with a poxy, you likely need to run a local web server for the tests. Simply loading `mocks/user-data.json` from the file system may result in the proxy file not being loaded correctly. We recommend using something like the [`http-server` npm module](https://www.npmjs.com/package/http-server).

### Dynamic Response Functions

In the final response pattern, we define a function as the `response` option on our mock handler. That function will receive the entire ajax settings object as its first argument and its context (the value of `this`) will be the mock handler. The function should set the `responseText` or `responseXML` property as needed (and any other response options).

```javascript
$.mockjax({
  url: "/api/user",
  method: "POST",
  data: { username: "jakerella", name: "jordan", role: "maintainer" },
  response: function(settings) {
    if (!settings.data.username) {
      this.status = 400
      this.responseText = { error: "Please provide a username" }
    } else {
      this.status = 201
      this.responseText = { id: "13", username: "jakerella" }
    }
  }
})
```

The default version of the `repsonse` function is synchronous; however, if you specify a second parameter, Mockjax will provide you an asynchronous callback function to execute when your response handler is done.

```javascript
$.mockjax({
  url: "/api/user",
  method: "POST",
  data: { username: "jakerella", name: "jordan", role: "maintainer" },
  response: function(settings, done) {
    const handler = this
    addMockUser(settings.username)
      .then((data) => {
        handler.status = 201
        handler.responseText = data
        done()
      })
  }
})
```

> Note that because the `response` function is given the mockHandler as its context, you **cannot use an arrow function** here. Arrow functions will not have `this` defined.

#### Capturing URL parameters

You easily capture named URL parameters for use in the `response` function versus having to extract that data yourself. To do so, use a regular expression for your URL matcher, and provide a `urlParams` array to indicate, ordinally, the names of the parameters that will be captured.

```javascript
$.mockjax({
  url: /\/user\/([\d]+)\/book\/(\w+)/,
  method: "GET",
  urlParams: ["authorID", "bookTitle"],
  response: async function (settings, done) {
    const authorData = await getAuthorData(settings.urlParams.authorID)
    const bookData = await getBookData(settings.urlParams.bookTitle)
    this.responseText = {
      author: authorData,
      book: bookData
    }
    done()
  }
})
```

## Advanced Mocking Techniques

### Simulating Response Time and Latency

Simulating network and server latency for a mock is as simple as adding a `responseTime` property to your mock definition:

```javascript
$.mockjax({
  url: "/api/time",
  responseTime: 750,
  responseText: "A delayed response"
})
```

You can also use a range for `responseTime` to randomize latency:

```javascript
$.mockjax({
  url: "/api/time",
  responseTime: [500, 1500],
  responseText: "A randomly delayed response"
})
```

### Simulating HTTP Response Statuses

As you;ve seen, you can simulate different response statuses other than 200 (the default for Mockjax) by simply adding a `status` property:

```javascript
$.mockjax({
  url: "/api/oops",
  status: 500,
  responseText: "There was an error"
})
```

But you can also provide an array of possible response statuses and have Mockjax randomly select one at the time of interception:

```javascript
$.mockjax({
  url: "/api/errors",
  status: [400, 401, 403, 404]
})

// Randomly fail (with a preference towards success)
$.mockjax({
  url: "/api/random",
  status: [200, 400, 200, 500, 200]
})
```

These forced error status codes will be handled just as if the server had returned the error. That is, the `error` callback on your `$.ajax()` call will get executed with the proper arguments.

### Setting Additional HTTP Response Headers

Additional HTTP Response Headers may be provided by setting key-value pairs in the `responseHeaders` option of the mock handler:

```javascript
$.mockjax({
  url: "/api/hello",
  responseText: "hello world",
  headers: {
    "X-Powered-By": "Mockjax"
  }
})
```

### Dynamically Generating Mock Definitions

If all of your ajax calls are based upon a complex URL schema, you can use Mockjax's dynamic mocking ability to specify whether or not to match any single request. Your function must either return a mock handler object with various response options filled in, or `null`. If you return `null`, Mockjax will keep processing other mock handlers looking for a match, or allow the ajax call to proceed if no match is found. Below is an example that rewrites ajax requests to "/api/data/" sub-paths to proxy to static mocks:

```javascript
$.mockjax(function(settings) {
  const [_, entity, id] = settings.url.match(/\/api\/data\/([^\/]+)\/?(\d+)?$/)
  if (settings.method.toLowerCase() === 'get') {
    if (id) {
      return { status: 200, proxy: `/mocks/${entity}.json` }
    } else {
      return { status: 200, proxy: `/mocks/${entity}-${id}.json` }
    }
  } else if (settings.method.toLowerCase() === 'delete' && id) {
    return { status: 200, responseText: { id, message: `${entity} was deleted` } }
  }
  return null
})
```

> Note that your mock definition handler function is passed in the original ajax request settings from jQuery, so you can match on the request data, headers, or any other component of the request.

### Forced Simulation of Server Timeouts

Because of the way Mockjax was implemented, it takes advantage of jQuery's internal timeout handling for requests. But if you'd like to force a timeout for a request you can do so by setting the `isTimeout` property to true:

```javascript
$.mockjax({
  url: '/api/timeout',
  responseTime: 1000,
  isTimeout: true
})
```

### Using Other Data Types

Many of the examples above mock out a `JSON` response. You can mock other data types as shown below.

```javascript
$.mockjax({
  url: "/some/xml",
  dataType: "xml",
  responseXML: "<document><say>Hello world XML</say></document>" // this could also be a proper Document object
})
```

```javascript
$.mockjax({
  url: "/some/webservice",
  dataType: "html",
  responseText: "<div>Hello there</div>"
})
```

#### Mocking JSONP

Although JSONP is not as popular as it used to be, there are many legacy applications that still use it. You can use Mockjax to mock out those requests. Let's assume you have a JSONP call that expects to hit a callback in the local window like this:

```javascript
window.__jsonpCallback = function(result) {
  console.log(result)
  // do something with the result
}
```

And your jQuery ajax call might look something like this:

```javascript
$.ajax({
  url: '/jsonp-service?callback=?',
  jsonpCallback: '__jsonpCallback',
  dataType: 'jsonp',
  ...
})
```

Then you could mock out that ajax call like so:

```javascript
$.mockjax({
  url: '/jsonp*',
  dataType:'jsonp',
  contentType: 'text/json',
  responseText:{
    success:true,
    id: 12345
  }
})
```

You could even hit a mock JSONP service using a proxy:

```javascript
$.mockjax({
  url: '/jsonp*',
  contentType: 'text/json',
  proxy: 'proxies/jsonp-script.js'
})
```

Then in your proxy JSONP script you would have:

```javascript
__jsonpCallback({ success: true, id: 12345 })
```

### Performing Actions After Request Completion

If you need to perform some actions after an ajax call has been mocked (and the source code as completed its callack), you can use one of the `onAfterSuccess`, `onAfterError`, and `onAfterComplete` options. For example, to fire a method when a request completes (either successfully or not):

```javascript
$.mockjax({
  url: "/api/end/point",
  onAfterComplete: (xhr) => {
    // do any required cleanup
  }
})
```

> These `onAfter` callbacks will receive the same arguments that the original callback in your source code would receive.

### Setting a Global URL Namespace

The namespace option in `$.mockjaxSettings` allows you to apply a prefix to all of your mock handler URLs. For example:

```javascript
$.mockjaxSettings.namespace = "/api/v1"
```

Now, the following mock handler will match "/api/v1/rest" and _not_ simply "/rest":

```javascript
$.mockjax({
  url: "/rest"
})
```

This works with RegExp `url` definitions as well. In the example below, the `^` in the regex, which normally defines the beginning of the string, will be replaced with the global namespace.

```javascript
$.mockjax({
  url: /^\/rest$/
})
```

The global namespace option can also be overwritten on any single mock handler:

```javascript
$.mockjax({
  url: "/user",  // This now matches "/user" only, NOT "/api/v1/user"
  namespace: null
})
```

> Note that the `namespace` prefix **does not apply to proxies**.

### Globally Defining Match Order

By default, Mockjax matches requests in registration order: Mockjax considers the handlers registered first before handlers registered last. To reverse this behavior:

```javascript
$.mockjaxSettings.matchInRegistrationOrder = false
```

Setting `matchInRegistrationOrder` to `false` lets you override previously defined handlers. Suppose you had:

```javascript
$.mockjax({
  url: "/api/greeting",
  responseText: "hello"
})
$.mockjax({
  url: "/api/greeting",
  responseText: "buhbye"
})
```

The default behavior is that Mockjax returns `"hello"`, but with `matchInRegistrationOrder`
set to `false`, Mockjax would return `"buhbye"`.

### Managing Mockjax Data

Mockjax holds onto a lot of data. It does this so that you can inspect it later during your tests. If you find things running slowly, or if you just want to clear things out between tests, you can clear both the mock handlers and the retained ajax calls.

Obviously Mockjax must hold onto the mock handlers in order to match ajax requests. By default, it also retains every ajax call made (whether the call was mocked or not). You can modify this with the `retainAjaxCalls` global setting. Setting this to `0` will cause no ajax calls to be retained at all. Setting it to a positive integer will limit the number of calls retained to that number (again, whether mocked or not).

You can clear all of the retained ajax calls using the `clearRetainedAjaxCalls()` method, which will return the count of cleared calls:

```javascript
const countRemoved = $.mockjax.clearRetainedAjaxCalls()
```

Alternatively, you can provide this method an array of handler UUIDs to restrict the removal of ajax calls to those that were mocked by the provided handlers.

```javascript
const handlerUUIDs = ['1', '2', '3']
const countRemoved = $.mockjax.clearRetainedAjaxCalls(handlerUUIDs)
// only ajax calls mocked by the handlerUUIDs are removed
```

If you need clear Mockjax handlers you've registered, there are a few methods for doing so...

```javascript
const countRemoved = $.mockjax.clearAll()
```

This will remove **all** registered mock handlers, but you can also remove a single handler by its UUID:

```javascript
const countRemoved = $.mockjax.clearById('1234') // will return 1 or 0
```

Lastly, you can clear mock handlers by the URL that it matches, using either a string or regular expression:

```javascript
$.mockjax({ url: "/api/foo", ... })
$.mockjax({ url: "/api/foobar", ... })

const countRemoved = $.mockjax.clearByUrl("/api/foo") // returns 1

$.mockjax({ url: "/api/foo", ... }) // re-adding it
$.mockjax({ url: "/api/user/foobar/edit", ... }) // and adding one more

const moreRemoved = $.mockjax.clearByUrl(/foo/) // returns 3 (one was already removed)
```


## Miscellaneous Information

### About Mockjax and Its History

Most backend developers are familiar with the concepts of [mocking objects](http://en.wikipedia.org/wiki/Mock_object) or stubbing in
methods for unit testing. For those not familiar with mocking, it's the simulation of an interface or API for testing or integration development purposes. Mocking with front-end development though is still quite new. Mockjax gives front end developers the ability to define ajax requests that should be mocked out, as well as how those requests should be responded to. These mocks can be extremely simple or quite complex, representing the entire request-response workflow.

This plugin was originally developed by appendTo in March 2010. That company closed in 2014 and the project was taken over by a former employee, [@jakerella](https://jordankasper.com).

### jQuery Version Support

We strive to ensure that Mockjax is tested on the furthest patch version of all minor versions of jQuery (1.x.y through 3.x.y). In other words, we don't test  1.12.1, but rather 1.12.4 (the furthest patch version on the 1.x line). The QUnit tests in the `/test/integrsation` directory include links to each version of jQuery tested in the header so you can try it yourself.

> Note that even though jQuery 1.x and 2.x are deprecated, we still support them in Mockjax.

### Browsers Tested

We use [BrowserStack](https://www.browserstack.com)'s awesome open source collaboration to test Mockjax in real browsers and real Operating Systems using VMs on their platform. We run all of our tests on the current versions of the major browsers below before publishing a release:

* Edge
* Firefox
* Chrome
* Safari

### Using Mockjax in Other Ways

You can use Mockjax as a Node module or with RequireJS... and presumably in  other ways as well. We have tests for Node (CommonJS) and RequireJS. When using Mockjax as a Node module, **you must provide the module with the jQuery library and a `window` object**. Here is a simplified example:

```javascript
const jquery = require('jquery')
const window = (new JSDOM('<html></html>')).window
const { jQueryFactory } = require('jquery4/factory')
window.jQuery = jQueryFactory(window)
const mockjax = require('jquery-mockjax')(jquery, window)

mockjax({
    url: '/resource',
    responseText: { foo: 'bar' }
})

jquery.ajax({
    url: '/resource',
    dataType: 'json',
    error: () => { console.log('Oh no!') },
    success: (data) => { console.log(`foo is ${data.foo}`) }
})
```

### Logging

Mockjax logs various pieces of information to the `console`. You can alter the log level using the `$.mockjaxSettings.logLevel` global setting:

```javascript
$.mockjaxSettings.logging = 4;  // very verbose debug messages
$.mockjaxSettings.logging = 3;  // verbose log messages
$.mockjaxSettings.logging = 2;  // informational messages
$.mockjaxSettings.logging = 1;  // warning messages
$.mockjaxSettings.logging = 0;  // only critical error messages
```

> Note that each level enables that level plus any lower number... thus setting logging to `2` also enables warnings and errors.

#### Implement a custom logger

If you don't want to use the `console` object, you can pass in your own logging implementation with the `logger` setting. Note that your logger must implement the `debug`, `log`, `info`, `warn`, and `error` methods.

### Release History

Please read the [CHANGELOG](https://github.com/jakerella/jquery-mockjax/blob/master/CHANGELOG.md) for a list of changes per release. All releases are tagged in GitHub for easy reference, the `master` branch should _not_ be considered a stable release!

### License

Copyright (c) 2014-2026 Jordan Kasper, formerly appendTo

NOTE: This repository was taken over by Jordan Kasper (@jakerella) October, 2014

Licensed under the MIT license: [http://opensource.org/licenses/MIT](http://opensource.org/licenses/MIT)

### Contributing

We welcome any contributions by the community, whether in the form of a Pull Request, issue submission and comments, or just sharing on social media!

If you want to contribute code to the project, please read our [Contribution guidelines](CONTRIBUTING.md) to see what you need to do to get your Pull Request ready for merging.
