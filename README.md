# jQuery Mockjax: Ajax request mocking #
[http://github.com/appendto/jquery-mockjax/](http://github.com/appendto/jquery-mockjax/)

jQuery Mockjax provides request/response mocking for ajax requests with
jQuery and provides all standard behaviors in the request/response flow.

You may report any issues you may find [https://github.com/appendto/jquery-mockjax/issues](in the github issue tracking).

### jQuery Version Support ###

The current version of Mockjax has been tested with jQuery 1.3.2 through
1.7.0 with QUnit unit tests, residing in /test.

### Browsers Tested ###
Internet Explorer 6-9, Firefox 3.6 and stable, Safari 5.x, Chrome stable, Opera 9.6-latest.

### Release History ##
[CHANGELOG](https://github.com/appendto/jquery-mockjax/blob/master/CHANGELOG.md)

## License ##
Copyright (c) 2012 appendTo LLC.

Dual licensed under the MIT or GPL licenses.

[http://appendto.com/open-source-licenses](http://appendto.com/open-source-licenses)

## Documentation ##

Most backend developers are familiar with the concepts of [mocking
objects](http://en.wikipedia.org/wiki/Mock_object) or stubbing in
methods for unit testing. For those not familiar with mocking, it’s the
simulation of an interface or API for testing or integration development
purposes. Mocking with front-end development though is still quite new.

Much of the development that [appendTo](http://appendto.com) does
focuses on front-end development tied to
[RESTFUL](http://en.wikipedia.org/wiki/Representational_State_Transfer)
web services. **As such we’re able to spec out the service contract and
data format at the beginning of a project and develop the front-end
interface against mock data while the back end team builds the
production services.**

The plugin was originally developed by appendTo back in
March 2010 and the [team](http://twitter.com/appendto/team) has been
using it in all of its projects since.

### API

Mockjax consists of two methods, one to set up mocks, one to remove them.
You'll find plenty of examples below. If you're looking for a specific option,
checkout this list:

* `$.mockjax(options)`
  * Sets up a mockjax handler.
  * `options`: An object literal which defines the settings to use for the mocked request.
      * `url`: A string or regular expression specifying the url of the request that the data should be mocked for. If the url is a string and contains any asterisks ( * ), they will be treated as a wildcard by translating to a regular expression. Any `*` will be replaced with `.+`. If you run into trouble with this shortcut, switch to using a full regular expression instead of a string and asterisk combination.
      * `data`: In addition to the URL, match parameters.
      * `type`: Specify what HTTP method to match, usually GET or POST. Case-insensitive, so `get` and `post` also work.
      * `headers`: An object literal whose keys will be simulated as additional headers returned from the server for the request.
      * `status`: An integer that specifies a valid server response code. This simulates a server response code.
      * `statusText`: An string that specifies a valid server response code description. This simulates a server response code description.
      * `responseTime`: An integer that specifies a simulated network and server latency (in milliseconds).
      * `isTimeout`: A boolean value that determines whether or not the mock will force a timeout on the request.
      * `contentType`: A string which specifies the content type for the response.
      * `response`: `function(settings) {}`, A function that allows for the dynamic setting of responseText/responseXML upon each request.
      * `responseText`: A string specifying the mocked text, or a mocked object literal, for the request.
      * `responseXML`: A string specifying the mocked XML for the request.
      * `proxy`: A string specifying a path to a file, from which the contents will be returned for the request.
      * `lastModified`: A date string specifying the mocked last-modified time for the request. This is used by `$.ajax` to determine if the requested data is new since the last request.
      * `etag`: A string specifying a unique identifier referencing a specific version of the requested data. This is used by `$.ajax` to determine if the requested data is new since the last request. (see [HTTP_ETag](http://en.wikipedia.org/wiki/HTTP_ETag))
* `$.mockjaxClear()`
  * Removes all mockjax handlers.
* `$.mockjaxClear(id)`
  * Remove a single mockjax handler.
  * `id` is the string returned from `$.mockjax`.
* `$.mockjax.mockedAjaxCalls()`
  * Returns all mocked ajax calls so you can e.g. check that expected data is sent to backend.

### Overview: Your First Mock

Our first example will be for a simple REST service for a fortune app
with the REST endpoint being `/restful/fortune` which returns the
following JSON message:

    {
        "status": "success",
        "fortune" : "Are you a turtle?"
    }

To pull the fortune into our page, we’d use the following HTML & jQuery
code:

    <!DOCTYPE html>
    <html>
      <head>
        <title>Fortune App</title>
        <script src="http://code.jquery.com/jquery-1.7.0.min.js"></script>
      </head>
    <body>
      <div id="fortune"></div>
    </body>
    </html>

    $.getJSON('/restful/fortune', function(response) {
      if ( response.status == 'success') {
        $('#fortune').html( 'Your fortune is: ' + response.fortune );
      } else {
        $('#fortune').html( 'Things do not look good, no fortune was told' );
      }
    });

At this point if we were to run this code it would fail since the REST
service has yet to be implemented. This is where the benefit of the
Mockjax Plugin starts to pay off. The first step in using Mockjax is to
include the plugin by just adding a regular script tag.

Once you have that included, you can start intercepting Ajax requests
and mocking the responses. So let’s mock out the service by including
the following code:

    $.mockjax({
      url: '/restful/fortune',
      responseTime: 750,
      responseText: {
        status: 'success',
        fortune: 'Are you a turtle?'
      }
    });

**Defining a JSON string inline requires a `JSON.stringify` method to be
available. For some browsers you may need to include
[json2.js](http://json.org/json2.js), which is included in the `lib` folder**

**If you plan on mocking xml responses, you may also have to include
`jquery.xmldom.js`, which can also be found in the `lib` folder.**

What Mockjax does at this point is replace the `$.ajax` method with a
wrapper that transparently checks the URL being requested. If the URL
matches one defined by `$.mockjax()`, Mockjax intercepts the request
and sets up a mock `XMLHttpRequest` object before executing the
`jQuery.ajax` handler. Otherwise, the request is handed back to the
native `$.ajax` method for normal execution. One benefit in this
implementation detail is by simulating the `XMLHttpRequest` object, the
plugin continues to make use of jQuery’s native ajax handling.

As you write code to mock responses, there’s great value in the fact that there are no
modifications required to production code. The mocks can be
transparently inserted. This provides easy integration into most
frameworks by including the plugin and mock definitions through your
build framework. It’s also possible to include it at run time by
listening for a flag query string flag and injecting the plugin and
definitions.

### Mockjax in Depth

Now let’s look at the various approaches to defining mocks as offered by
the plugin. The sections below feature an extensive overview of the
flexibility in Mockjax and creating responses.

## Data Types Available for Mocking

jQuery is able to handle and parse `Text`, `HTML`, `JSON`, `JSONP`,
`Script` and `XML` data formats and Mockjax is able to mock any of those
formats. Two things to note, depending upon how you mock out `JSON` and
`JSONP` you may need to include [json2.js](http://json.org/json2.js) for
the `JSON.stringify()` method. Additionally if you mock XML inline,
you’ll need to include the
[`xmlDOM`](http://github.com/appendto/jquery-xmldom) plugin that
transforms a string of XML into a DOM object. If you use the proxy
approach outlined below, there’s no need to include either the JSON or
XMLDOM plugins.

## Step 1. Define the URL

The first thing you need to do when mocking a request is define the URL
end-point to intercept and mock. As with our example above this can be a
simple string:

    $.mockjax({
      url: '/url/to/rest-service'
    });

or contain a `*` as a wildcard:

    $.mockjax({
      // Matches /data/quote, /data/tweet etc.
      url: '/data/*'
    });

or a full regular expression:

    $.mockjax({
      // Matches /data/quote, /data/tweet but not /data/quotes
      url: /^\/data\/(quote|tweet)$/i
    });

You can also match against the data option in addition to url:

    $.mockjax({
        url:  '/rest',
        data: { action: "foo" },
        responseText: { bar: "hello world" }
    });

    $.mockjax({
        url:  '/rest',
        data: { action: "bar" },
        responseText: { bar: "hello world 2" }
    });

To capture URL parameters, use a capturing regular expression for the URL and a `urlParams` array to indicate, ordinally, the names of the paramters that will be captured.

```javascript
$.mockjax({
  // matches /author/1234/isbn/1234-5678-9012-0
  url: /^\/author\/([\d]+)\/isbn\/([\d\-]+)$/,
  urlParams: ['authorID', 'isbnNumber'],
  response: function (settings) {
    var authorID = settings.urlParams.authorID;
    var isbnNumber = settigns.urlParams.isbnNumber;
    //etc.
  }
});
```

### Step 2. Define the Response

The second step is to define the type of response. The two main
properties you’ll be dealing with are either `responseText` or
`responseXML`. These properties mirror the native `XMLHttpRequest`
object properties that are set during a live response. There are three
different patterns for specifying the responses: Inline, Proxy, and
Callback.

#### Inline Responses

A simple text response would be:

    $.mockjax({
      url: '/restful/api',
      responseText: 'A text response from the server'
    });

A simple XML response would be:

    $.mockjax({
      url: '/restful/api',
      // Need to include the xmlDOM plugin to have this translated into a DOM
      responseXML: '<document><quote>Hello world!</quote></document>'
    });

As you can quickly see, if you have a significant amount of data being
mocked this becomes unwieldy. So that brings us to the next pattern,
proxying.

#### Proxy

In this example below, the Mockjax plugin will intercept requests for
`/restful/api` and redirect them to `/mocks/data.json`.

    $.mockjax({
      url: '/restful/api',
      proxy: '/mocks/data.json'
    });

#### Callback

In the final response pattern, we can define a callback on the
`response` property and have it set `responseText` or `responseXML` as
needed.

    $.mockjax({
      url: '/restful/api',
      response: function() {
        this.responseText = 'Hello world!';
      }
    });

### Advanced Mocking Techniques

At this point we’ve looked at a series of basic mocking techniques with
Mockjax and will now unpack some of the additional functionality
contained in the plugin.

#### Simulating Response Time and Latency

Simulating network and server latency for a mock is as simple as adding
a `responseTime` property to your mock definition:

    $.mockjax({
      url: '/restful/api',
      // Simulate a network latency of 750ms
      responseTime: 750,
      responseText: 'A text response from the server'
    });

#### Simulating HTTP Response Statuses

It’s also possible to simulate response statuses other than 200 (default
for Mockjax) by simply adding a `status` property.

    $.mockjax({
      url: '/restful/api',
      // Server 500 error occurred
      status: 500,
      responseTime: 750,
      responseText: 'A text response from the server'
    });

#### Setting the Content-Type

You can set the content type to associate with the mock response, in the
example below, we’re setting a json content type.

    $.mockjax({
      url: '/restful/api',
      contentType: 'text/json',
      responseText: {
        hello: 'World!'
      }
    });

#### Setting Additional HTTP Response Headers

Additional HTTP Response Headers may be provided by setting a key in the
headers object literal:

    $.mockjax({
      url: '/restful/api',
      contentType: 'text/json',
      responseText: {
        hello: 'World!'
      },
      headers: {
        etag: 'xyz123'
      }
    });

#### Force Simulation of Server Timeouts

Because of the way Mockjax was implemented, it takes advantage of
jQuery’s internal timeout handling for requests. But if you’d like to
force a timeout for a request you can do so by setting the `isTimeout`
property to true:

    $.mockjax({
      url: '/restful/api',
      isTimeout: true
    });

#### Dynamically Generating Mock Definitions

In some situations, all of your REST calls are based upon a URL schema.
Mockjax has the ability for you to specify a callback function that is
handed the `$.ajax` request settings. The callback function may then
either return false to allow the request to be handled natively, or
return an object literal with relevant Mockjax parameters set. Below is
an example that rewrites all Ajax requests to proxy to static mocks:

    $.mockjax(function(settings) {
      // settings.url == '/restful/<service>'
      var service = settings.url.match(/\/restful\/(.*)$/);
      if ( service ) {
        return {
          proxy: '/mocks/' + service[1] + '.json'
        };
      }
      return;
    });

#### Dynamically Generating Mock Responses

It’s also possible to dynamically generate the response text upon each
request by implementing a callback function on the `response` parameter:

    $.mockjax({
      url: '/restful/webservice',
      dataType: 'json',
      response: function(settings) {
        this.responseText = { say: 'random ' + Math.random() };
      }
    });

#### Data types

The example above mocks a `json` response. You can also mock `xml`:

    $.mockjax({
      url: '/some/xml',
      dataType: 'xml',
      responseXML: '<document><say>Hello world XML</say></document>'
    });

And `html`:

    $.mockjax({
      url: '/some/webservice',
      dataType: 'html',
      responseText: '<div>Hello there</div>'
    });

#### Globally Defining Mockjax Settings

It’s also possible to define the global defaults for all Mockjax
requests by overwriting the `$.mockjaxSettings` object. By default the
settings are as follows:

    $.mockjaxSettings = {
      status:        200,
      statusText     'OK',
      responseTime:  500,
      isTimeout:     false,
      contentType:   'text/plain',
      response:      '',
      responseText:  '',
      responseXML:   '',
      proxy:         '',
      lastModified:  null,
      etag:          ''
    };

To overwrite a particular settings such as the default content-type, you
would do the following:

    $.mockjaxSettings.contentType = 'text/json';

#### Removing Mockjax Handlers

Remove all mockjax handlers:

    $.mockjaxClear();

#### Remove Single Mockjax Handler

    var id = $.mockjax({
       ...
    });
    $.mockjaxClear(id);
