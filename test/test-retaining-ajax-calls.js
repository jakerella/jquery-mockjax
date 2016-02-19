(function(qunit, $) {
  'use strict';

  var t = qunit.test;

  /* ---------------------------------- */
  qunit.module( 'Retaining Ajax Calls' );
  /* ---------------------------------- */

  t('Setting defaults', function(assert) {
    assert.equal($.mockjaxSettings.retainAjaxCalls, true, '$.mockjaxSettings.retainAjaxCalls defaults to true');
  });

  t('Mocked calls are retained when the setting is set to true', function(assert) {
    var done = assert.async();

    $.mockjax.clear();
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
        done()
      }
    });
  });

  t('Mocked calls are not retained when the setting is set to false', function(assert) {
    var done = assert.async();

    $.mockjax.clear();
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

  t('Unmocked calls are retained when the setting is set to true', function(assert) {
    var done = assert.async();

    $.mockjax.clear();
    $.mockjaxSettings.retainAjaxCalls = true;

    var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
    assert.equal(numberOfUnmockedCalls, 0, 'No unmocked calls at the start');

    $.ajax({
      url: '/test.json',
      complete: function() {
        var numberOfUnmockedCalls = $.mockjax.unmockedAjaxCalls().length;
        assert.equal(numberOfUnmockedCalls, 1, 'Unmocked calls count increased by one');
        done()
      }
    });
  });

  t('Unmocked calls are not retained when the setting is set to false', function(assert) {
    var done = assert.async();

    $.mockjax.clear();
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
})(window.QUnit, window.jQuery);
