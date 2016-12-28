import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('person', 'Unit | Model | person', {
  // Specify the other units that are required for this test.
  needs: []
});

test('model exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});

test('mockjax exists', function(assert) {
  assert.strictEqual(typeof(Ember.$.mockjax), 'function');
});

test('can find records with mock using Ember.$', function(assert) {
  let done = assert.async();

  Ember.$.mockjax({
    type: 'GET',
    url: '/people',
    status: '200',
    dataType: 'json',
    responseText: {
      data: [
        {
          id: 1,
          attributes: {
            firstName: 'John',
            lastName: 'Doe'
          },
          type: 'people'
        },
        {
          id: 2,
          attributes: {
            firstName: 'Jane',
            lastName: 'Doe'
          },
          type: 'people'
        }
      ]
    }
  });

  let people = this.store().findAll('person');
  assert.strictEqual(typeof(people), 'object');
  assert.strictEqual(typeof(people.then), 'function');

  people
    .then(function dataHandler() {
      assert.strictEqual(people.get('length'), 2);
      done();
    })
    .catch(function(err) {
      assert.ok(false, 'XHR request returned error: ' + err.message);
      done();
    });
});

test('can find records with mock using global $', function(assert) {
  let done = assert.async();

  window.$.mockjax({
    type: 'GET',
    url: '/people',
    status: '200',
    dataType: 'json',
    responseText: {
      data: [
        {
          id: 1,
          attributes: {
            firstName: 'John',
            lastName: 'Doe'
          },
          type: 'people'
        },
        {
          id: 2,
          attributes: {
            firstName: 'Jane',
            lastName: 'Doe'
          },
          type: 'people'
        }
      ]
    }
  });

  let people = this.store().findAll('person');
  assert.strictEqual(typeof(people), 'object');
  assert.strictEqual(typeof(people.then), 'function');

  people
    .then(function dataHandler() {
      assert.strictEqual(people.get('length'), 2);
      done();
    })
    .catch(function(err) {
      assert.ok(false, 'XHR request returned error: ' + err.message);
      done();
    });
});
