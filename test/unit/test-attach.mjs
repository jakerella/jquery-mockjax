
import QUnit from 'qunit'
import { getJQueryMock } from './mocks.mjs'
import { getJQuery } from '../../src/lib.mjs'

const it = QUnit.test
let $ = getJQuery(getJQueryMock())

import { init, mockjax } from '../../src/attach.mjs'
import { mockAjaxCall } from '../../src/core.mjs'
import { getSettings } from '../../src/settings.mjs'



/* ----------------- */
QUnit.module('Attach: init', {
    beforeEach: () => {
        $ = getJQuery(getJQueryMock())
    }
})
/* ----------------- */

it('should add the mockjax function to jQuery', (assert) => {
    init()
    assert.equal(typeof $.mockjax, 'function', 'mockjax should be a function')
    assert.strictEqual($.mockjax, mockjax, 'the mockjax function should be the same on the $ object')
})

it('should swap out the ajax method for the mockjax version', (assert) => {
    init()
    assert.equal(typeof $.ajax, 'function', 'The jQuery ajax property is a function')
    assert.equal($.ajax?.name, 'mockAjaxCall', 'the jQuery ajax method should be replaced with mockAjaxCall')
    assert.strictEqual($.ajax, mockAjaxCall, 'the jQuery ajax method should be the core mockAjaxCall function')
    assert.equal(typeof $._ajax, 'function', 'The jQuery _ajax property is a function')
    assert.equal($._ajax?.name, 'ajax', 'the original ajax method should exist on $._ajax')
})

it('should add the mockjax settings to jQuery', (assert) => {
    init()
    const settings = getSettings()
    assert.strictEqual($.mockjaxSettings, settings, 'the settings and $.mockjaxSettings should be the same object')
})

it('should add all public mockjax methods to the $.mockjax object', (assert) => {
    init()
    assert.equal($.mockjax.getLogger.name, 'getLogger', 'The getLogger method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.getLogger, 'function', 'The getLogger property is a function')
    assert.equal($.mockjax.resetSettings.name, 'resetSettings', 'The resetSettings method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.resetSettings, 'function', 'The resetSettings property is a function')
    assert.equal($.mockjax.validateSettings.name, 'validateSettings', 'The validateSettings method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.validateSettings, 'function', 'The validateSettings property is a function')
    assert.equal($.mockjax.clear.name, 'clear', 'The clear method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.clear, 'function', 'The clear property is a function')
    assert.equal($.mockjax.clearById.name, 'clearById', 'The clearById method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.clearById, 'function', 'The clearById property is a function')
    assert.equal($.mockjax.clearByUrl.name, 'clearByUrl', 'The clearByUrl method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.clearByUrl, 'function', 'The clearByUrl property is a function')
    assert.equal($.mockjax.clearAll.name, 'clearAll', 'The clearAll method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.clearAll, 'function', 'The clearAll property is a function')
    assert.equal($.mockjax.handler.name, 'handler', 'The handler method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.handler, 'function', 'The handler property is a function')
    assert.equal($.mockjax.handlers.name, 'handlers', 'The handlers method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.handlers, 'function', 'The handlers property is a function')
    assert.equal($.mockjax.unfiredHandlers.name, 'unfiredHandlers', 'The unfiredHandlers method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.unfiredHandlers, 'function', 'The unfiredHandlers property is a function')
    assert.equal($.mockjax.mockedAjaxCalls.name, 'mockedAjaxCalls', 'The mockedAjaxCalls method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.mockedAjaxCalls, 'function', 'The mockedAjaxCalls property is a function')
    assert.equal($.mockjax.unmockedAjaxCalls.name, 'unmockedAjaxCalls', 'The unmockedAjaxCalls method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.unmockedAjaxCalls, 'function', 'The unmockedAjaxCalls property is a function')
    assert.equal($.mockjax.clearRetainedAjaxCalls.name, 'clearRetainedAjaxCalls', 'The clearRetainedAjaxCalls method should be added to $.mockjax')
    assert.equal(typeof $.mockjax.clearRetainedAjaxCalls, 'function', 'The clearRetainedAjaxCalls property is a function')
})
