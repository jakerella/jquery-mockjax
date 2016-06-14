(function(qunit, $) {
  'use strict';

  var t = qunit.test;

  /* ---------------------------------- */
  qunit.module( 'Retaining Ajax Calls' );
  /* ---------------------------------- */

  t('Setting defaults', function(assert) {
    assert.equal($.mockjaxSettings.retainAjaxCalls, true, '$.mockjaxSettings.retainAjaxCalls defaults to true');
  });

  t('Mocked GET request is properly retained when retainAjaxCalls is set to true', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = true;

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

  t('Mocked POST request (with data) is properly retained when retainAjaxCalls is set to true', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = true;

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

  t('Mocked JSONP GET request is properly retained when retainAjaxCalls is set to true', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = true;

    var numberOfMockedCalls = $.mockjax.mockedAjaxCalls().length;
    assert.equal(numberOfMockedCalls, 0, 'No mocked calls at the start');

    $.mockjax({
      url: '/api/example/*',
      contentType: 'text/json',
      proxy: 'test_jsonp.js'
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
        assert.equal(actualCalls[0].url, '/api/example/jsonp?callback=abcdef123456', 'mockjax call has expected jsonp url');
        assert.ok(callbackExecuted, 'The jsonp callback was executed');
        window.abcdef123456 = null;
        done();
      }
    });
  });

  t('Multiple mocked calls are properly retained and stored in call order', function(assert) {
    $.mockjaxSettings.retainAjaxCalls = true;

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
      url: '/api/example/jsonp?callback=?',
      jsonpCallback: 'foo123',
      dataType: 'jsonp'
    });

    assert.equal($.mockjax.mockedAjaxCalls().length, 3, 'Afterwords there should be three saved ajax calls');

    var mockedUrls = $.map($.mockjax.mockedAjaxCalls(), function(ajaxOptions) {
      return ajaxOptions.url;
    });

    assert.deepEqual(mockedUrls, [
      '/api/example/1',
      '/api/example/2',
      '/api/example/jsonp?callback=foo123'
    ], 'Mocked ajax calls are saved in execution order');
  });

  t('Mocked calls are not retained when retainAjaxCalls is set to false', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = false;

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
        done()
      }
    });
  });

  t('Unmocked calls are properly retained when retainAjaxCalls is true and throwUnmocked is false', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = true;
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

  t('Unmocked calls are not retained when retainAjaxCalls is set to false', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.throwUnmocked = false;
    $.mockjaxSettings.retainAjaxCalls = false;

    var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
    assert.equal(numberOfUnmockedCalls, 0, 'No unmocked calls at the start');

    $.ajax({
      url: '/test.json',
      complete: function() {
        var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
        assert.equal(numberOfUnmockedCalls, 0, 'Unmocked calls count did not increase');
        done()
      }
    });
  });

  t('Clearing retained mocked calls via clearRetainedAjaxCalls', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = true;

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

        var numberOfMockedCalls = $.mockjax.mockedAjaxCalls().length;
        assert.equal(numberOfMockedCalls, 0, 'Mocked calls count was reset to zero');

        done()
      }
    });
  });

  t('Clearing retained unmocked calls via clearRetainedAjaxCalls', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.throwUnmocked = false;
    $.mockjaxSettings.retainAjaxCalls = true;

    var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
    assert.equal(numberOfUnmockedCalls, 0, 'No unmocked calls at the start');

    $.mockjax({
      url: '/test',
      contentType: 'text/plain',
      responseText: 'test'
    });

    $.ajax({
      url: '/test.json',
      complete: function() {
        var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
        assert.equal(numberOfUnmockedCalls, 1, 'Unmocked calls count increased by one');

        $.mockjax.clearRetainedAjaxCalls();

        var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
        assert.equal(numberOfUnmockedCalls, 0, 'Unmocked calls count was reset to zero');

        done()
      }
    });
  });

  t('Clearing retained mocked calls via clear', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.retainAjaxCalls = true;

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

        $.mockjax.clear();

        var numberOfMockedCalls = $.mockjax.mockedAjaxCalls().length;
        assert.equal(numberOfMockedCalls, 0, 'Mocked calls count was reset to zero');

        done()
      }
    });
  });

  t('Clearing retained unmocked calls via clear', function(assert) {
    var done = assert.async();

    $.mockjaxSettings.throwUnmocked = false;
    $.mockjaxSettings.retainAjaxCalls = true;

    var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
    assert.equal(numberOfUnmockedCalls, 0, 'No unmocked calls at the start');

    $.mockjax({
      url: '/test',
      contentType: 'text/plain',
      responseText: 'test'
    });

    $.ajax({
      url: '/test.json',
      complete: function() {
        var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
        assert.equal(numberOfUnmockedCalls, 1, 'Unmocked calls count increased by one');

        $.mockjax.clear();

        var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
        assert.equal(numberOfUnmockedCalls, 0, 'Unmocked calls count was reset to zero');

        done()
      }
    });
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
})(window.QUnit, window.jQuery);
