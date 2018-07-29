(function(qunit, $) {
	'use strict';
	
	var t = qunit.test;
    
	/* ----------------------------- */
	qunit.module( 'Match Order' );
  /* ----------------------------- */

  function testMatchOrderTest(matchForward, mocks, url, expectedResult) {
    return function (assert) {
      var done = assert.async();
      assert.expect(1);
      
      $.mockjaxSettings.matchInRegistrationOrder = matchForward;
      for (var i = 0; i < mocks.length; i++) {
        $.mockjax(mocks[i]);
      }

      $.ajax({
        url: url,
        error: function() {
          if (expectedResult) {
            assert.ok(false, 'Error should not be called');
          } else {
            assert.ok(true, 'Nothing was matched');
          }
        },
        success: function(result) {
          if (expectedResult) {
            assert.equal(result, expectedResult, expectedResult + ' is matched');
          } else {
            assert.ok(false, 'Nothing should have been matched');
          }
        },
        complete: function() {
          // when the test is done, set matchInRegistrationOrder back to the default
          $.mockjaxSettings.matchInRegistrationOrder = true;
          done();
        }
      });
    };
  }

  /**
   * Generate a test with forward and and a test with backward matching
   */
  function testMatchOrder(name, mocks, url, forwardResult, backwardResult) {
    for (var i = 0; i < 2; i++) {
      var matchForward = Boolean(i);
      var prefix = matchForward ? 'Match forward' : 'Match backward';
      var expectedResult = matchForward ? forwardResult : backwardResult;
      t(
        prefix + ': ' + name,
        testMatchOrderTest(matchForward, mocks, url, expectedResult)
      );
    }
  }

  testMatchOrder(
    '1 handler',
    [ { url: '/rest', responseText: '1' }],
    '/rest',
    '1',
    '1'
  );

  testMatchOrder(
    'first handler matches',
    [
      { url: '/rest', responseText: '1' },
      { url: '/nap', responseText: '2' },
      { url: '/sleep', responseText: '3' },
    ],
    '/rest',
    '1',
    '1'
  );

  testMatchOrder(
    'last handler matches',
    [
      { url: '/rest', responseText: '1' },
      { url: '/nap', responseText: '2' },
      { url: '/sleep', responseText: '3' },
    ],
    '/sleep',
    '3',
    '3'
  );

  testMatchOrder(
    '0 matching handlers (of multiple)',
    [
      { url: '/rest', responseText: '1' },
      { url: '/nap', responseText: '2' },
      { url: '/sleep', responseText: '3' },
    ],
    '/wake-up',
    null,
    null
  );

  testMatchOrder(
    'first and second matching handlers',
    [
      { url: '/rest', responseText: '1' },
      { url: '/rest', responseText: '2' },
      { url: '/sleep', responseText: '3' },
    ],
    '/rest',
    '1',
    '2'
  )

  testMatchOrder(
    'second and third matching handlers',
    [
      { url: '/sleep', responseText: '1' },
      { url: '/rest', responseText: '2' },
      { url: '/rest', responseText: '3' },
    ],
    '/rest',
    '2',
    '3'
  )

  testMatchOrder(
    'first and third matching handlers',
    [
      { url: '/rest', responseText: '1' },
      { url: '/sleep', responseText: '2' },
      { url: '/rest', responseText: '3' },
    ],
    '/rest',
    '1',
    '3'
  )

})(window.QUnit, window.jQuery);
