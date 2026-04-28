(function(qunit, $) {
  'use strict';

  var t = qunit.test;

  /* ---------------------------------- */
  qunit.module( 'Retaining Ajax Calls' );
  /* ---------------------------------- */

  t('Option default', function(assert) {
    assert.equal($.mockjaxSettings.retainAjaxCalls, -1, '$.mockjaxSettings.retainAjaxCalls defaults to -1 (retain all)');
  });

  t('Mocked GET request is properly retained when retainAjaxCalls is set to -1', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = -1;

    var numberOfMockedCalls = $.mockjax.mockedAjaxCalls().length;
    assert.equal(numberOfMockedCalls, 0, 'No mocked calls at the start');

    $.mockjax({
      url: '/api/example/*'
    });

    $.ajax({
      async: false,
      type: 'GET',
      url: '/api/example/1',
      complete: function() {
        var mockedAjaxCalls = $.mockjax.mockedAjaxCalls();
        assert.equal(mockedAjaxCalls.length, 1, 'mockjax call made');
        assert.equal(mockedAjaxCalls[0].type, 'GET', 'mockjax call has expected method');
        assert.equal(mockedAjaxCalls[0].url, '/api/example/1', 'mockjax call has expected url');
        done();
      }
    });
  });

  t('Support deprecated option format (true)', function(assert) {
    $.mockjaxSettings.retainAjaxCalls = true
    
    $.mockjax({
      url: '/api/example'
    });

    $.ajax({
      async: false,
      type: 'GET',
      url: '/api/example'
    });

    var mockedAjaxCalls = $.mockjax.mockedAjaxCalls();
    assert.equal(mockedAjaxCalls.length, 1, 'mocked call retained');
  })

  t('Support deprecated option format (false)', function(assert) {
    $.mockjaxSettings.retainAjaxCalls = false
    
    $.mockjax({
      url: '/api/example'
    });

    $.ajax({
      async: false,
      type: 'GET',
      url: '/api/example'
    });

    var mockedAjaxCalls = $.mockjax.mockedAjaxCalls();
    assert.equal(mockedAjaxCalls.length, 0, 'mocked call not retained');
  })

  t('Mocked POST request (with data) is properly retained when retainAjaxCalls is set to -1', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = -1;

    $.mockjax({
      url: '/api/example/*'
    });

    $.ajax({
      async: false,
      type: 'POST',
      url: '/api/example/2',
      data: {a: 1},
      complete: function() {
        var mockedAjaxCalls = $.mockjax.mockedAjaxCalls();
        assert.equal(mockedAjaxCalls.length, 1, 'mockjax call made');
        assert.equal(mockedAjaxCalls[0].type, 'POST', 'mockjax call has expected method');
        assert.equal(mockedAjaxCalls[0].url, '/api/example/2', 'mockjax call has expected url');
        assert.deepEqual(mockedAjaxCalls[0].data, {a: 1}, 'mockjax call has expected data');
        done();
      }
    });
  });

  t('Mocked JSONP GET request is properly retained when retainAjaxCalls is set to -1', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = -1;

    var numberOfMockedCalls = $.mockjax.mockedAjaxCalls().length;
    assert.equal(numberOfMockedCalls, 0, 'No mocked calls at the start');

    $.mockjax({
      url: '/api/example/*',
      contentType: 'text/json',
      proxy: '../proxies/jsonp-script.js'
    });
    var callbackExecuted = false;
    window.abcdef123456 = function() {
      assert.ok(true, 'JSONP Callback executed');
      callbackExecuted = true;
    };

    $.ajax({
      url: '/api/example/jsonp?callback=?',
      jsonpCallback: 'abcdef123456',
      dataType: 'jsonp',
      error: qunit.noErrorCallbackExpected,
      complete: function() {
        var actualCalls = $.mockjax.mockedAjaxCalls();
        assert.equal(actualCalls.length, 1, 'Mockjax call made');
        assert.equal(actualCalls[0].url, '/api/example/jsonp?callback=?', 'mockjax call has expected jsonp url');
        assert.ok(callbackExecuted, 'The jsonp callback was executed');
        window.abcdef123456 = null;
        done();
      }
    });
  });

  t('Multiple mocked calls are properly retained and stored in call order', function(assert) {
    $.mockjaxSettings.retainAjaxCalls = -1;

    $.mockjax({
      url: '/api/example/*'
    });

    assert.equal($.mockjax.mockedAjaxCalls().length, 0, 'Initially there are no saved ajax calls');

    $.ajax({
      async: false,
      type: 'GET',
      url: '/api/example/1'
    });
    $.ajax({
      async: false,
      type: 'GET',
      url: '/api/example/2'
    });
    $.ajax({
      async: false,
      url: '/api/example/other'
    });

    assert.equal($.mockjax.mockedAjaxCalls().length, 3, 'Afterwords there should be three saved ajax calls');

    var mockedUrls = $.map($.mockjax.mockedAjaxCalls(), function(ajaxOptions) {
      return ajaxOptions.url;
    });

    assert.deepEqual(mockedUrls, [
      '/api/example/1',
      '/api/example/2',
      '/api/example/other'
    ], 'Mocked ajax calls are saved in execution order');
  });

  t('Mocked calls are not retained when retainAjaxCalls is set to 0', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = 0;

    var numberOfMockedCalls = $.mockjax.mockedAjaxCalls().length;
    assert.equal(numberOfMockedCalls, 0, 'No mocked calls at the start');

    $.mockjax({
      url: '/test',
      contentType: 'text/plain',
      responseText: 'test'
    });

    $.ajax({
      url: '/test',
      complete: function() {
        var numberOfMockedCalls = $.mockjax.mockedAjaxCalls().length;
        assert.equal(numberOfMockedCalls, 0, 'Mocked calls count did not increase');
        done();
      }
    });
  });

  t('Unmocked calls are properly retained when retainAjaxCalls is -1 and throwUnmocked is false', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = -1;
    $.mockjaxSettings.throwUnmocked = false;

    var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
    assert.equal(numberOfUnmockedCalls, 0, 'No unmocked calls at the start');

    $.ajax({
      async: true,
      type: 'GET',
      url: '/api/example/1',
      complete: function() {
        var unmockedAjaxCalls = $.mockjax.unmockedAjaxCalls();
        assert.equal(unmockedAjaxCalls.length, 1, 'Unmocked calls count increased by one');
        assert.equal(unmockedAjaxCalls[0].url, '/api/example/1', 'unmockedAjaxcall has expected url');
        done();
      }
    });
  });

  t('Unmocked calls are not retained when retainAjaxCalls is set to 0', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.throwUnmocked = false;
    $.mockjaxSettings.retainAjaxCalls = 0;

    var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
    assert.equal(numberOfUnmockedCalls, 0, 'No unmocked calls at the start');

    $.ajax({
      url: '/api/data',
      complete: function() {
        var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
        assert.equal(numberOfUnmockedCalls, 0, 'Unmocked calls count did not increase');
        done();
      }
    });
  });

  t('Clearing retained mocked calls via clearRetainedAjaxCalls', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = -1;

    var numberOfMockedCalls = $.mockjax.mockedAjaxCalls().length;
    assert.equal(numberOfMockedCalls, 0, 'No mocked calls at the start');

    $.mockjax({
      url: '/test',
      contentType: 'text/plain',
      responseText: 'test'
    });

    $.ajax({
      url: '/test',
      complete: function() {
        var numberOfMockedCalls = $.mockjax.mockedAjaxCalls().length;
        assert.equal(numberOfMockedCalls, 1, 'Mocked calls count increased by one');

        $.mockjax.clearRetainedAjaxCalls();

        numberOfMockedCalls = $.mockjax.mockedAjaxCalls().length;
        assert.equal(numberOfMockedCalls, 0, 'Mocked calls count was reset to zero');

        done();
      }
    });
  });

  t('Clearing retained unmocked calls via clearRetainedAjaxCalls', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.throwUnmocked = false;
    $.mockjaxSettings.retainAjaxCalls = -1;

    var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
    assert.equal(numberOfUnmockedCalls, 0, 'No unmocked calls at the start');

    $.mockjax({
      url: '/test',
      contentType: 'text/plain',
      responseText: 'test'
    });

    $.ajax({
      url: '/api/data',
      complete: function() {
        var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
        assert.equal(numberOfUnmockedCalls, 1, 'Unmocked calls count increased by one');

        $.mockjax.clearRetainedAjaxCalls();

        numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
        assert.equal(numberOfUnmockedCalls, 0, 'Unmocked calls count was reset to zero');

        done();
      }
    });
  });

  t('Clearing retained mocked calls when mock handler cleared', function(assert) {
    $.mockjaxSettings.retainAjaxCalls = -1;

    const mockOne = $.mockjax({
      url: '/foo/one'
    });
    $.mockjax({
      url: '/foo/two'
    });
    $.mockjax({
      url: '/foo/three'
    });

    assert.equal($.mockjax.mockedAjaxCalls().length, 0, 'Initially there are no saved ajax calls');

    $.ajax({
      async: false,
      type: 'GET',
      url: '/foo/one'
    });
    $.ajax({
      async: false,
      type: 'GET',
      url: '/foo/one'
    });
    $.ajax({
      async: false,
      url: '/foo/three'
    });

    assert.equal($.mockjax.mockedAjaxCalls().length, 3, 'Afterwords there should be three saved ajax calls');

    $.mockjax.clearById(mockOne)

    const retained = $.mockjax.mockedAjaxCalls()
    assert.equal(retained.length, 1, 'Afterwords there should be one saved ajax call');
    assert.equal(retained[0].url, '/foo/three', 'Correct handler was retained');
  });

  t('Clearing all handlers does not clear unmocked calls', function(assert) {
    $.mockjaxSettings.retainAjaxCalls = -1;

    $.mockjax({
      url: '/foo/one'
    });
    $.mockjax({
      url: '/foo/two'
    });

    assert.equal($.mockjax.mockedAjaxCalls().length, 0, 'Initially there are no saved mocked calls');
    assert.equal($.mockjax.unmockedAjaxCalls().length, 0, 'Initially there are no saved unmocked calls');

    $.ajax({
      async: false,
      type: 'GET',
      url: '/foo/one'
    });
    $.ajax({
      async: false,
      type: 'GET',
      url: '/foo/two'
    });
    $.ajax({
      async: false,
      url: '/foo/three'
    });

    assert.equal($.mockjax.mockedAjaxCalls().length, 2, 'After ajax there should be two saved mocked calls');
    assert.equal($.mockjax.unmockedAjaxCalls().length, 1, 'After ajax there should be one saved unmocked call');

    $.mockjax.clearAll()

    assert.equal($.mockjax.mockedAjaxCalls().length, 0, 'After clearAll there should be no saved mocked calls');
    const unmocked = $.mockjax.unmockedAjaxCalls()
    assert.equal(unmocked.length, 1, 'After clearAll there should be one saved unmocked call');
    assert.equal(unmocked[0].url, '/foo/three', 'Correct unmocked call is retained');
  });

  t('unmockedAjaxCalls is (and remains) empty when no unmocked ajax calls have occurred', function(assert) {
    var done = assert.async();

    var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
    assert.equal(numberOfUnmockedCalls, 0, 'No unmocked calls at the start');

    $.mockjax({
      url: '/api/example/1'
    });

    $.ajax({
      async: true,
      type: 'GET',
      url: '/api/example/1',
      complete: function() {
        var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
        assert.equal(numberOfUnmockedCalls, 0, 'No unmocked calls after making a mocked call');
        done();
      }
    });
  });

  t('mockedAjaxCalls is (and remains) empty when no mocked ajax calls have occurred', function(assert) {
    var done = assert.async();

    var numberOfMockedCalls = $.mockjax.mockedAjaxCalls().length;
    assert.equal(numberOfMockedCalls, 0, 'No mocked calls at the start');

    $.ajax({
      async: true,
      type: 'GET',
      url: '/api/example/1',
      complete: function() {
        var numberOfMockedCalls = $.mockjax.mockedAjaxCalls().length;
        assert.equal(numberOfMockedCalls, 0, 'No mocked calls after making an unmocked call');
        done();
      }
    });
  });

  t('mockjax enforces retention limit', function(assert) {
    $.mockjaxSettings.retainAjaxCalls = 2;

    const mockOne = $.mockjax({
      url: '/foo/one'
    });
    $.mockjax({
      url: '/foo/two'
    });
    $.mockjax({
      url: '/foo/three'
    });

    assert.equal($.mockjax.mockedAjaxCalls().length, 0, 'Initially there are no saved ajax calls');

    $.ajax({
      async: false,
      type: 'GET',
      url: '/foo/one'
    });

    assert.equal($.mockjax.mockedAjaxCalls().length, 1, 'After first ajax call there should be one saved ajax call');

    $.ajax({
      async: false,
      type: 'GET',
      url: '/foo/one'
    });

    assert.equal($.mockjax.mockedAjaxCalls().length, 2, 'After second ajax call there should be two saved ajax calls');

    $.ajax({
      async: false,
      url: '/foo/three'
    });

    assert.equal($.mockjax.mockedAjaxCalls().length, 2, 'After third ajax call there should still be two saved ajax calls');
  });


})(window.QUnit, window.jQuery);
