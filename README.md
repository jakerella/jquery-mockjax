# jQuery Mockjax: Ajax request mocking #
[http://github.com/jakerella/jquery-mockjax/](http://github.com/jakerella/jquery-mockjax/)

[![Codacy Badge](https://www.codacy.com/project/badge/72d5f8c1c29ee60f6282d7d3fa9cb52c)](https://www.codacy.com/app/mikehostetler_1249/jquery-mockjax/dashboard)
[![Travis CI Badge](https://travis-ci.org/jakerella/jquery-mockjax.svg?branch=master)](https://travis-ci.org/jakerella/jquery-mockjax)

There are some minor breaking changes in v2, so if you need an older version, please check the [v1.x](https://github.com/jakerella/jquery-mockjax/tree/v1.x) branch or the list of [releases](https://github.com/jakerella/jquery-mockjax/tags) in Github.

jQuery Mockjax provides request/response mocking for ajax requests using the jQuery API and provides all standard behaviors in the request/response flow.

You may report any issues you may find [in the github issue tracking](https://github.com/jakerella/jquery-mockjax/issues).

**Table of Contents**

* [About Mockjax and Its History](#about-mockjax-and-its-history)
* [Basic Documentation](#basic-documentation)
  * [API Methods](#api-methods)
  * [Overview: Your First Mock](#overview-your-first-mock)
  * [Mockjax in Depth](#mockjax-in-depth)
* [Detailed Request and Response Definition](#detailed-request-and-response-definition)
  * [Defining a Request to Match](#defining-a-request-to-match)
  * [Defining Multiple Requests](#defining-multiple-requests)
  * [Defining a Response](#defining-a-response)
* [Advanced Mocking Techniques](#advanced-mocking-techniques)
  * [Simulating Response Time and Latency](#simulating-response-time-and-latency)
  * [Simulating HTTP Response Statuses](#simulating-http-response-statuses)
  * [Setting the Content-Type](#setting-the-content-type)
  * [Setting Additional HTTP Response Headers](#setting-additional-http-response-headers)
  * [Dynamically Generating Mock Definitions](#dynamically-generating-mock-definitions)
  * [Accessing Request Headers](#accessing-request-headers)
  * [Forced Simulation of Server Timeouts](#forced-simulation-of-server-timeouts)
  * [Dynamically Generating Mock Responses](#dynamically-generating-mock-responses)
  * [Data Types](#data-types)
  * [Performing Actions After Request Completion](#performing-actions-after-request-completion)
  * [Globally Defining Mockjax Settings](#globally-defining-mockjax-settings)
  * [Setting a Global URL Namespace](#setting-global-url-namespace)
  * [Removing Mockjax Handlers](#removing-mockjax-handlers)
* [Miscellaneous Information](#miscellaneous-information)
  * [jQuery Version Support](#jquery-version-support)
  * [Browsers Tested](#browsers-tested)
  * [Using Mockjax in Other Ways (Node, require, browserify, etc)](#using-mockjax-in-other-ways)
  * [Logging](#logging)
  * [Release History](#release-history)
  * [License](#license)


## About Mockjax and Its History ##

Most backend developers are familiar with the concepts of [mocking
objects](http://en.wikipedia.org/wiki/Mock_object) or stubbing in
methods for unit testing. For those not familiar with mocking, it's the
simulation of an interface or API for testing or integration development
purposes. Mocking with front-end development though is still quite new. Mockjax
gives front end developers the ability to define ajax requests that should be
mocked out, as well as how those requests should be responded to. These mocks
can be extremely simple or quite complex, representing the entire request-response
workflow.

At appendTo we developed a lot of applications which use
[RESTFUL](http://en.wikipedia.org/wiki/Representational_State_Transfer)
web services, but much of the time those services are not yet created.
We spec out the service contract and data format at the beginning of a project
and develop the front-end interface against mock data while the back end team
builds the production services.

This plugin was originally developed by appendTo in March 2010 and the
[team](http://twitter.com/appendto/team) has been using it in many projects since.


## Basic Documentation ##

### API Methods ###

Mockjax consists of just a few methods, each listed below. You'll find plenty of
examples in the sections below, but if you're looking for a specific option,
checkout this list:

* `Number $.mockjax(/* Object */ options)`
  * Sets up a mockjax handler for a matching request
  * Returns that handler's index, can be used to clear individual handlers
  * `options`: [Object] Defines the settings to use for the mocked request
      * `url`: [String | RegExp] Specifies the url of the request that the data should be mocked for. If it is a string and contains any asterisks ( `*` ), they will be treated as a wildcard by translating to a regular expression. Any `*` will be replaced with `.+`. If you run into trouble with this shortcut, switch to using a full regular expression instead of a string and asterisk combination
      * `data`: [Object | Function] In addition to the URL, match parameters
      * `type`: [String] Specify what HTTP method to match, usually GET or POST. Case-insensitive, so `get` and `post` also work
      * `headers`: [Object] Keys will be simulated as additional headers returned from the server for the request (**NOTE: This is NOT used to match request headers!**)
      * `status`: [Number] An integer that specifies a valid server response code. This simulates a server response code
      * `statusText`: [String] Specifies a valid server response code description. This simulates a server response code description
      * `responseTime`: [Number] An integer that specifies a simulated network
         and server latency (in milliseconds). Default is `500`. Setting this
	 to `0` will minimize the simulated latency
      * `isTimeout`: [Boolean] Determines whether or not the mock will force a timeout on the request
      * `contentType`: [String] Specifies the content type for the response
      * `response`: [Function] A function that accepts the request settings and allows for the dynamic setting of response settings (including the body of the response) upon each request (see examples below)
      * `responseText`: [String] Specifies the mocked text, or a mocked object literal, for the request
      * `responseXML`: [String] Specifies the mocked XML for the request
      * `proxy`: [String] Specifies a path to a file, from which the contents will be returned for the request
      * `lastModified`: [String] A date string specifying the mocked last-modified time for the request. This is used by `$.ajax` to determine if the requested data is new since the last request
      * `etag`: [String] Specifies a unique identifier referencing a specific version of the requested data. This is used by `$.ajax` to determine if the requested data is new since the last request. (see [HTTP_ETag](http://en.wikipedia.org/wiki/HTTP_ETag))
      * `onAfterSuccess`: [Function] A callback that will be called after the success method has been called, this is useful to check a condition after the call has been completed
      * `onAfterError`: [Function] A callback that will be called after the error method has been called, this is useful to check a condition after the call has been completed
      * `onAfterComplete`: [Function] Similar to onAfterSuccess, but will be executed after the complete method has been called
* `Object $.mockjax.handler(/* Number */ id)`
  * Returns the mock request settings for the handler with the provided `id`. Be careful here, you're accessing the inner workings of the plugin, any changes to this object could be bad.
* `Array $.mockjax.handlers()`
  * Returns the array of mock handlers. **NOTE:** This array is NOT modified when a handler is cleared, the cleared handler position is simply set to `null`. As such, the array length will only change when new mocks are added. Be careful here, you're accessing the inner workings of the plugin, any changes to the array could be very bad.
* `void $.mockjax.clear([/* Number */ id])`
  * If the `id` is provided, the handler with that ID is cleared (that is, requests matching it will no longer do so, the handler is completely removed)
  * If no `id` is provided, all handlers are cleared, resetting Mockjax to its initial state
* `Array<Object> $.mockjax.mockedAjaxCalls()`
  * Returns an array of all mocked ajax calls with each entry being the request settings object as passed into the `$.mockjax()` function
  * If `$.mockjaxSettings.retainAjaxCalls is set to false, this will always be empty
* `Array<Object> $.mockjax.unfiredHandlers()`
  * Returns an array of all mock handler settings that have not been used. In other words, if a handler has been used for a `$.ajax()` call then it will _not_ appear in this array
* `Array<Object> $.mockjax.unmockedAjaxCalls()`
  * Returns an array of all unmocked Ajax calls that were made. The array contains the settings object passed into `$.ajax({...})`
  * If `$.mockjaxSettings.retainAjaxCalls is set to false, this will always be empty
* `void $.mockjax.clearRetainedAjaxCalls()`
  * Empties the arrays returned by `$.mockjax.mockedAjaxCalls` and `$.mockjax.unmockedAjaxCalls`

### Overview: Your First Mock ###

Our first example will be for a simple REST service for a fortune app
with the REST endpoint being `/restful/fortune` which returns the
following JSON message:

```json
{
    "status": "success",
    "fortune" : "Are you a turtle?"
}
```

To pull the fortune into our page, we'd use the following HTML and jQuery
code:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Fortune App</title>
    <script src="http://code.jquery.com/jquery-1.11.1.min.js"></script>
  </head>
<body>
  <div id="fortune"></div>
</body>
</html>
```
```javascript
$.getJSON("/restful/fortune", function(response) {
  if ( response.status == "success") {
    $("#fortune").html( "Your fortune is: " + response.fortune );
  } else {
    $("#fortune").html( "Things do not look good, no fortune was told" );
  }
});
```

At this point if we were to run this code it would fail since the REST
service has yet to be implemented. This is where the benefit of the
Mockjax plugin starts to pay off. The first step in using Mockjax is to
include the plugin by just adding a regular script tag:

```html
<head>
  ...
  <script src="vendor/jquery.mockjax.js"></script>
</head>
```

Once you have that included, you can start intercepting Ajax requests
and mocking the responses. So let's mock out the service by including
the following code:

```javascript
$.mockjax({
  url: "/restful/fortune",
  responseText: {
    status: "success",
    fortune: "Are you a mock turtle?"
  }
});
```

**Defining a JSON string inline requires a `JSON.stringify()` method to be
available. For some browsers you may need to include
[json2.js](https://raw.github.com/douglascrockford/JSON-js/master/json2.js),
which is included in the `lib` folder.** However, you could also simply
provide an already stringified version of your JSON in the `responseText`
property.

_If you plan on mocking xml responses, you may also have to include
`jquery.xmldom.js`, which can also be found in the `lib` folder._

### Mockjax in Depth ###

What Mockjax does at this point is replace the `$.ajax()` method with a
wrapper that transparently checks the URL being requested. If the URL
matches one defined by `$.mockjax()`, it intercepts the request
and sets up a mock `XMLHttpRequest` object before executing the
`jQuery.ajax()` handler. Otherwise, the request is handed back to the
native `$.ajax()` method for normal execution. One benefit in this
implementation detail is that by simulating the `XMLHttpRequest` object,
the plugin continues to make use of jQuery's native ajax handling, so
there are no concerns with implementing a custom Ajax workflow.

As you write code to mock responses, there's great value in the fact that
there are no modifications required to production code. The mocks can be
transparently inserted. This provides easy integration into most
frameworks by including the plugin and mock definitions through your
build framework. It's also possible to include it at run time by
listening for a query string flag and injecting the plugin and definitions.

Now let's look at the various approaches to defining mocks as offered by
the plugin. The sections below feature an extensive overview of the
flexibility in Mockjax and creating responses.

#### Data Types Available for Mocking ####

jQuery is able to handle and parse `Text`, `HTML`, `JSON`, `JSONP`,
`Script` and `XML` data formats and Mockjax is able to mock any of those
formats. Two things to note: depending upon how you mock out `JSON` and
`JSONP` you may need to include [json2.js](https://raw.github.com/douglascrockford/JSON-js/master/json2.js)
for the `JSON.stringify()` method (older browsers only, typically). Additionally
if you mock XML inline, you'll need to include the [`xmlDOM`](http://github.com/jakerella/jquery-xmldom)
plugin that transforms a string of XML into a DOM object. However, if you use
the proxy approach outlined below then there should be no need to include either
the JSON or XMLDOM plugins in any case.


## Detailed Request and Response Definition ##

### Defining a Request to Match ###

The first thing you need to do when mocking a request is define the URL
end-point to intercept and mock. As with our example above this can be a
simple string:

```javascript
$.mockjax({
  url: "/url/to/rest-service"
});
```

or contain a `*` as a wildcard:

```javascript
$.mockjax({
  // Matches /data/quote, /data/tweet etc.
  url: "/data/*"
});
```

or a full regular expression:

```javascript
$.mockjax({
  // Matches /data/quote, /data/tweet but not /data/quotes
  url: /^\/data\/(quote|tweet)$/i
});
```

You can also match against the data option in addition to url:

```javascript
$.mockjax({
  url:  "/rest",
  data: { action: "foo" }
});
```

The data option may be a custom matching function returning `true` of `false`
whether the data is expected or not:

```javascript
$.mockjax({
  url: "/rest",
  data: function( data ) {
    return deepEqual( data, expected );
  }
});
```

The data function is a recommended place for assertions. Return `true` and let
a testing framework of choice do the rest:

```javascript
$.mockjax({
  url: "/rest",
  data: function ( json ) {
    assert.deepEqual( JSON.parse(json), expected ); // QUnit example.
    return true;
  }
});
```

To capture URL parameters, use a capturing regular expression for the
URL and a `urlParams` array to indicate, ordinally, the names of the
paramters that will be captured:

```javascript
$.mockjax({
  // matches /author/{any number here}/isbn/{any number with dashes here}
  // for example: "/author/1234/isbn/1234-5678-9012-0"
  url: /^\/author\/([\d]+)\/isbn\/([\d\-]+)$/,
  // names of matching params
  urlParams: ["authorID", "isbnNumber"],
  response: function (settings) {
    var authorID = settings.urlParams.authorID;
    var isbnNumber = settings.urlParams.isbnNumber;
    // etc...
  }
});
```

### Defining Multiple Requests ###

Since version 2.2 it is allowed to define several requests at once.
`$.mockjax([...])` returns a array of handlers' indexes. It is possible to
reset handler by index. Read more in [Removing Mockjax Handlers](#removing-mockjax-handlers).

```javascript
var handlers = $.mockjax([
  {url: '/rest', responseText: 'one'},
  {url: '/rest', responseText: 'two'}
]);

$.mockjax.clear(handlers[0]);
```

### Defining a Response ###

The second step is to define the type and content of the response. The two main
properties you will be dealing with are either `responseText` or
`responseXML`. These properties mirror the native `XMLHttpRequest`
object properties that are set during a live response. There are three
different patterns for specifying the responses: Inline, Proxy, and
Callback.

#### Inline Responses ####

A simple text response would be:

```javascript
$.mockjax({
  url: "/restful/api",
  responseText: "A text response from the server"
});
```

A simple JSON response would be:

```javascript
$.mockjax({
  url: "/restful/api",
  // You may need to include the [json2.js](https://raw.github.com/douglascrockford/JSON-js/master/json2.js) library for older browsers
  responseText: { "foo": "bar" }
});
```

Also note that a JSON response is really just a text response that jQuery will
parse as JSON for you (and return a JSON object to the `success` and `complete`
callbacks).

A simple XML response would be:

```javascript
$.mockjax({
  url: "/restful/api",
  // Need to include the xmlDOM plugin to have this translated into a DOM object
  responseXML: "<document><quote>Hello world!</quote></document>"
});
```

As you can see, if you have a significant amount of data being
mocked this becomes unwieldy. So that brings us to the next pattern:
the proxy.

#### Proxy ####

In this example below, the Mockjax plugin will intercept requests for
`/restful/api` and redirect them to `/mocks/data.json`:

```javascript
$.mockjax({
  url: "/restful/api",
  proxy: "/mocks/data.json"
});
```

The `/mocks/data.json` file can have any valid JSON content you want, and allows
you to maintain that mock data in its own file for maintainability.

> Note: If you're testing your code with a poxy, it is best to run an actual web
server for the tests. Simply loading `test/index.html` from the file system may
result in the proxy file not being loaded correctly. We recommend using something
like the [`http-server` npm module](https://www.npmjs.com/package/http-server).

#### Callback ####

In the final response pattern, we can define a callback function on the
`response` property and have it set `responseText` or `responseXML` as
needed:

```javascript
$.mockjax({
  url: "/restful/api",
  response: function(settings) {
    // Investigate the `settings` to determine the response...

    this.responseText = "Hello world!";
  }
});
```

The default version of this callback is synchronous. If you provide both parameters
to the callback function, you can use asynchronous code to set the dynamic response.

```javascript
$.mockjax({
  url: '/restful/api',
  response: function(settings, done) {
    var self = this;
    someAsyncMethod(function(data){
      self.responseText = data;
      done();
    });
  }
});
```

Note that the callback is given the settings provided to the `$.mockjax({...})`
method merged with any Ajax settings defined by jQuery or your application. This
allows you to thoroughly investigate the request before setting the response
body (or headers).


## Advanced Mocking Techniques ##

At this point we've looked at a series of basic mocking techniques with
Mockjax and will now unpack some of the additional functionality
contained in the plugin.

### Simulating Response Time and Latency ###

Simulating network and server latency for a mock is as simple as adding
a `responseTime` property to your mock definition:

```javascript
$.mockjax({
  url: "/restful/api",
  // Simulate a network latency of 750ms
  responseTime: 750,
  responseText: "A text response from the server"
});
```

You can also use an interval for `responseTime` to randomize latency:

```javascript
$.mockjax({
  url: "/restful/api",
  // Use a random value between 250ms and 750ms
  responseTime: [250, 750],
  responseText: "A text response from the server"
});
```

### Simulating HTTP Response Statuses ###

It's also possible to simulate response statuses other than 200 (default
for Mockjax) by simply adding a `status` property.

```javascript
$.mockjax({
  url: "/restful/api",
  // Server 500 error occurred
  status: 500,
  responseText: "A text response from the server"
});
```

These forced error status codes will be handled just as if the server had
returned the error: the `error` callback will get executed with the proper
arguments.

### Setting the Content-Type ###

You can set the content type to associate with the mock response, in the
example below, we're setting a JSON content type.

```javascript
$.mockjax({
  url: "/restful/api",
  contentType: "application/json",
  responseText: {
    hello: "World!"
  }
});
```

### Setting Additional HTTP Response Headers ###

Additional HTTP Response Headers may be provided by setting a key in the
headers object literal:

```javascript
$.mockjax({
  url: "/restful/api",
  contentType: "application/json",
  responseText: {
    hello: "World!"
  },
  headers: {
    etag: "xyz123"
  }
});
```

### Dynamically Generating Mock Definitions ###

In some situations, all of your REST calls are based upon a URL schema.
Mockjax has the ability for you to specify a callback function that is
handed the `$.ajax` request settings. The callback function may then
either return false to allow the request to be handled natively, or
return an object literal with relevant Mockjax parameters set. Below is
an example that rewrites all Ajax requests to proxy to static mocks:

```javascript
$.mockjax(function(settings) {

  // settings.url might be: "/restful/<service>" such as "/restful/user"

  var service = settings.url.match(/\/restful\/(.*)$/);
  if ( service ) {
    return {
      proxy: "/mocks/" + service[1] + ".json"
    };
  }
  // If you get here, there was no url match
  return;
});
```

### Accessing Request Headers ###

In some situations, you may need access to the  request headers to determine
matching or response bodies. To do this, you will need to specify a
callback function that is handed the `$.ajax` request settings:

```javascript
$.mockjax(function( requestSettings ) {
  // Here is our manual URL matching...
  if ( requestSettings.url === "/restful/user" ) {
    // We have a match, so we return a response callback...
    return {
      response: function( origSettings ) {

      	// now we check the request headers, which may be set directly
      	// on the xhr object through an ajaxSetup() call or otherwise:

      	if ( requestSettings.headers["Authentication"] === "some-token" ) {
      	  this.responseText = { user: { id: 13 } };
      	} else {
  		  this.status = 403;
  		  this.responseText = "You are not authorized";
        }
      }
    };
  }
  // If you get here, there was no url match
  return;
});
```

### Forced Simulation of Server Timeouts ###

Because of the way Mockjax was implemented, it takes advantage of
jQuery's internal timeout handling for requests. But if you'd like to
force a timeout for a request you can do so by setting the `isTimeout`
property to true:

```javascript
$.mockjax({
  url: '/restful/api',
  responseTime: 1000,
  isTimeout: true
});
```

### Dynamically Generating Mock Responses ###

It's also possible to dynamically generate the response text upon each
request by implementing a callback function on the `response` parameter:

```javascript
$.mockjax({
  url: "/restful/webservice",
  dataType: "json",
  response: function(settings) {
    this.responseText = {
      randomText: "random " + Math.random()
    };
  }
});
```

### Data Types ###

Many of the examples above mock a `json` response. You can also mock `xml`:

```javascript
$.mockjax({
  url: "/some/xml",
  dataType: "xml",
  responseXML: "<document><say>Hello world XML</say></document>"
});
```

(Don't forget that it's likely you'll need the [`xmlDOM`](http://github.com/jakerella/jquery-xmldom) library as well!)

And `html`:

```javascript
$.mockjax({
  url: "/some/webservice",
  dataType: "html",
  responseText: "<div>Hello there</div>"
});
```

### Performing Actions After Request Completion ###

If you need to perform some actions after a call has completed you can
use one of the `onAfter{Xxxxx}` options. For example, to fire a method when
a request completes (either successfully or not):

```javascript
$.mockjax({
  url: "/api/end/point",
  onAfterComplete: function() {
    // do any required cleanup
  }
});
```

### Globally Defining Mockjax Settings ###

It is also possible to define the global defaults for all Mockjax
requests by overwriting the `$.mockjaxSettings` object. By default the
settings are as follows:

```javascript
{
  log:             null,  // DEPRECATED, use $.mockjaxSettings.logger instead
  logger:          window.console,
  logging:         2,
  logLevelMethods: ['error', 'warn', 'info', 'log', 'debug'],
  namespace:       null,
  status:          200,
  statusText:      "OK",
  responseTime:    500,
  isTimeout:       false,
  throwUnmocked:   false,
  retainAjaxCalls: true,
  contentType:     "text/plain",
  response:        "",
  responseText:    "",
  responseXML:     "",
  proxy:           "",
  proxyType:       "GET",
  lastModified:    null,
  etag:            "",
  headers: {
    etag: "IJF@H#@923uf8023hFO@I#H#",
    "content-type" : "text/plain"
  }
}
```

To overwrite a particular settings such as the default `content-type`, you
would do the following:

```javascript
$.mockjaxSettings.contentType = "application/json";
```

### Setting a Global URL Namespace ###

The namespace option in `$.mockjaxSettings` allows you to apply a prefix to
all of your mocked urls, such as `/api/v1`.

```javascript
$.mockjaxSettings.namespace = "/api/v1";
```

Then the following mock will match `/api/v1/rest`:

```javascript
$.mockjax({
    url: "/rest"
})
```

The global namespace option can also be overwritten on a particular mock.

```javascript
$.mockjax({
    url: "/rest-2",
    namespace: null
})
```

Note that the namespace prefix does not apply to proxies.

### Removing Mockjax Handlers ###

If you need to reset the Mockjax handlers you've added, just call
`$.mockjax.clear()`. _This will NOT reset the `$.mockjaxSettings`!_

```javascript
$.mockjax.clear();
```

You can also clear individual mock handlers using their ID:

```javascript
var id = $.mockjax({
   ...
});

$.mockjax.clear(id);
```


## Miscellaneous Information ##

### jQuery Version Support ###

We strive to ensure that Mockjax is tested on the furthest patch version of all
minor (and major) versions of jQuery beginning with 1.5.2 going all the way
through 2.x. In other words, we don't test 1.6.1, but rather 1.6.4 (the furthest
patch version on the 1.6.x line). The QUnit tests in the `/test` directory include
links to each version of jQuery tested in the header.

### Browsers Tested ###

We use virtual machines to test current versions of the browsers below. In addition,
we test the specific versions of IE specified.

* Internet Explorer 8-11
* Firefox
* Safari
* Chrome
* Opera

_Please note that while we strive to keep `master` as bug free as possible, we do
not necessarily run tests in all of the above browsers for every single commit. We
do, however, ensure all tests are passing before tagging a release._


### Using Mockjax in Other Ways ###

You can use Mockjax as a Node module, with require.js, or with Browserify... and
presumably in other ways as well. We have tests for each of the methods above.

When using Mockjax as a Node module (including with Browserify), **you must
provide the module with the jQuery library and a `window`**. Here is an example
using a module intended for use as a "browserified" module:

```js
var jquery = require('jquery');
var mockjax = require('jquery-mockjax')(jquery, window);
// Note that we expect `window` to be defined once this file is browserified and
// used in a browser. If it isn't Mockjax will have a problem!

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
```


### Logging ###

Mockjax logs various pieces of information to the `console` (on `window`) in
browsers, or to stdout in Node). You can customize various aspects of the
logging to suit your needs. By default, only 'error', 'warn' or 'info' messages
will be shown, but detailed information may be available in debug logs. Below
are some common things you might need to do to get better logging information.

#### Show different levels of log messages

```js
$.mockjaxSettings.logging = 4;  // very verbose debug messages
$.mockjaxSettings.logging = 3;  // verbose log messages
$.mockjaxSettings.logging = 2;  // informational messages
$.mockjaxSettings.logging = 1;  // warning messages
$.mockjaxSettings.logging = 0;  // only critical error messages
```

(Note that each level enables that level plus any lower number... thus setting
logging to `2` also enables warnings and errors.)

#### Implement a custom logger

If you don't want to use the `console` object, you can pass in your own logging
implementation with the `logger` setting. Note that your logger must either
implement the `debug`, `log`, `info`, `warn`, and `error` methods, or you must
also provide what methods map to the 5 levels (0 through 4).

```js
$.mockjaxSettings.logger = {
  debug: function() { ... },
  log: function() { ... },
  // ...
};
```

Your logger methods may receive any number of arguments to log out, either as
strings or objects, similar to how the `window.console` object methods work.

If you have a logger that uses different methods names, specify them in this array:

```js
$.mockjaxSettings.logLevelMethods = ['critical', 'bad', 'stuff', 'log', 'verbose'];
```

Note that the first entry in this array (index `0`) will be errors while the last
entry will be verbose output. Anything beyond index `4` will be ignored.

#### What about the old `log` setting?

This was an undocumented feature whereby you could provide a `log` method using
`$.mockjaxSettings`, however, it is no longer used internally. This undocumented
option is now **deprecated**, and while it will work, log messages of ALL levels
will be sent to it.

If you have no idea what we're talking about... good! Don't worry about it. The
proper way to implement your own logger is via `$.mockjaxSettings.logger`.

### Release History ###

Please read the [CHANGELOG](https://github.com/jakerella/jquery-mockjax/blob/master/CHANGELOG.md)
for a list of changes per release.

Note that all releases are tagged in Github for easy reference, the `master` branch
should *not* be considered a stable release!

### License ###

Copyright (c) 2014 Jordan Kasper, formerly appendTo

NOTE: This repository was taken over by Jordan Kasper (@jakerella) October, 2014

Dual licensed under the MIT or GPL licenses:
[http://opensource.org/licenses/MIT](http://opensource.org/licenses/MIT)
[http://www.gnu.org/licenses/gpl-2.0.html](http://www.gnu.org/licenses/gpl-2.0.html)

### Troubleshooting ###

If mockjax appears to be behaving unexpectedly, be sure to check the console
logs for warnings.

### Contributing ###

We welcome any contributions by the community, whether in the form of a Pull
Request, issue submission and comments, or just sharing on social media!

If you want to contribute code to the project, please read our
[Contribution guidelines](CONTRIBUTING.md) to see what you need to do to get your
Pull Request ready for merging.

#### Admins ####

All pull requests are reviewed by the wonderful collaborators on this project:
* [Doug Neiner](https://github.com/dcneiner)
* [Jonathan Creamer](https://github.com/jcreamer898)
* [Jordan Kasper](https://github.com/jakerella)
