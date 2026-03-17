
import sinon from 'sinon'
import QUnit from 'qunit'
import * as settingsModule from '../../src/settings.mjs'
const it = QUnit.test

const mockSettings = {...settingsModule.getSettings()}
let mockGetSettings = null

const sandbox = sinon.createSandbox()

import { createMockXHR, determineResponseTime, READYSTATE } from '../../src/xhr.mjs'

/* ----------------- */
QUnit.module('XHR: createMockXHR', {
    beforeEach: () => {
        const testSettings = {...mockSettings}
        mockGetSettings = sandbox.fake(() => {
            return testSettings
        })
        sandbox.replace.usingAccessor(settingsModule.mocks, 'getSettings', mockGetSettings)
    },
    afterEach: () => {
        sandbox.restore()
    }
})
/* ----------------- */

it('should return a mock XHR object with default settings', (assert) => {
    const xhr = createMockXHR({}, {})
    assert.equal(xhr.status, -1, 'The status should start as -1')
    assert.strictEqual(xhr.statusText, '', 'The statusText should start as an empty string')
    assert.equal(xhr.readyState, READYSTATE.unsent, 'The readystate should start as unsent')
    assert.equal(typeof xhr.open, 'function', 'The XHR object should have an open method')
    assert.equal(typeof xhr.send, 'function', 'The XHR object should have an send method')
    assert.equal(typeof xhr.abort, 'function', 'The XHR object should have an abort method')
    assert.equal(typeof xhr.setRequestHeader, 'function', 'The XHR object should have an setRequestHeader method')
    assert.equal(typeof xhr.getResponseHeader, 'function', 'The XHR object should have an getResponseHeader method')
    assert.equal(typeof xhr.getAllResponseHeaders, 'function', 'The XHR object should have an getAllResponseHeaders method')
})

// TODO: create more tests!
