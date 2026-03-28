
import QUnit from 'qunit'
const it = QUnit.test

import { generateUUID, deepClone } from '../../src/utils.mjs'

QUnit.module('Utils', () => {

    QUnit.module('generateUUID', () => {

        it('should generate a valid UUID', (assert) => {
            const uuid = generateUUID()
            assert.ok(typeof uuid === 'string', 'UUID should be a string')
            assert.equal(uuid.length, 36, 'UUID should be 36 characters long')
        })

        it('should generate RFC 4122 compliant UUID format', (assert) => {
            const uuid = generateUUID()
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            assert.ok(uuidPattern.test(uuid), 'UUID should match RFC 4122 format')
        })

        it('should generate unique UUIDs', (assert) => {
            const uuid1 = generateUUID()
            const uuid2 = generateUUID()
            const uuid3 = generateUUID()
            assert.notEqual(uuid1, uuid2, 'First and second UUIDs should be different')
            assert.notEqual(uuid2, uuid3, 'Second and third UUIDs should be different')
            assert.notEqual(uuid1, uuid3, 'First and third UUIDs should be different')
        })

        it('should generate many unique UUIDs', (assert) => {
            const uuids = new Set()
            for (let i = 0; i < 100; i++) {
                uuids.add(generateUUID())
            }
            assert.equal(uuids.size, 100, 'All 100 UUIDs should be unique')
        })
    })

    QUnit.module('deepClone', () => {

        it('should clone primitive values', (assert) => {
            assert.equal(deepClone(42), 42, 'number cloned correctly')
            assert.equal(deepClone('test'), 'test', 'string cloned correctly')
            assert.equal(deepClone(true), true, 'boolean cloned correctly')
            assert.equal(deepClone(null), null, 'null cloned correctly')
            assert.equal(deepClone(undefined), undefined, 'undefined cloned correctly')
        })

        it('should clone simple objects', (assert) => {
            const obj = { name: 'John', age: 30 }
            const clone = deepClone(obj)
            assert.deepEqual(clone, obj, 'cloned object has same properties')
            assert.notEqual(clone, obj, 'cloned object is not the same reference')
        })

        it('should clone empty objects', (assert) => {
            const obj = {}
            const clone = deepClone(obj)
            assert.deepEqual(clone, obj, 'empty object cloned correctly')
            assert.notEqual(clone, obj, 'cloned empty object is not the same reference')
        })

        it('should clone simple arrays', (assert) => {
            const arr = [1, 2, 3, 4, 5]
            const clone = deepClone(arr)
            assert.deepEqual(clone, arr, 'cloned array has same elements')
            assert.notEqual(clone, arr, 'cloned array is not the same reference')
        })

        it('should clone empty arrays', (assert) => {
            const arr = []
            const clone = deepClone(arr)
            assert.deepEqual(clone, arr, 'empty array cloned correctly')
            assert.notEqual(clone, arr, 'cloned empty array is not the same reference')
        })

        it('should clone arrays with mixed types', (assert) => {
            const arr = [1, 'test', true, null, { key: 'value' }]
            const clone = deepClone(arr)
            assert.deepEqual(clone, arr, 'mixed array cloned correctly')
            assert.notEqual(clone, arr, 'cloned mixed array is not the same reference')
        })

        it('should clone nested objects', (assert) => {
            const obj = {
                user: {
                    name: 'John',
                    address: {
                        city: 'New York',
                        zip: '10001'
                    }
                }
            }
            const clone = deepClone(obj)
            assert.deepEqual(clone, obj, 'nested object cloned correctly')
            assert.notEqual(clone, obj, 'cloned nested object is not the same reference')
            assert.notEqual(clone.user, obj.user, 'nested user object is not the same reference')
            assert.notEqual(clone.user.address, obj.user.address, 'deeply nested address object is not the same reference')
        })

        it('should clone deeply nested objects', (assert) => {
            const obj = { a: { b: { c: { d: { e: 'value' } } } } }
            const clone = deepClone(obj)
            assert.deepEqual(clone, obj, 'deeply nested object cloned correctly')
            assert.notEqual(clone.a.b.c.d, obj.a.b.c.d, 'deeply nested object is not the same reference')
        })

        it('should clone nested arrays', (assert) => {
            const arr = [[1, 2], [3, 4], [5, 6]]
            const clone = deepClone(arr)
            assert.deepEqual(clone, arr, 'nested array cloned correctly')
            assert.notEqual(clone, arr, 'cloned nested array is not the same reference')
            assert.notEqual(clone[0], arr[0], 'nested sub-array is not the same reference')
        })

        it('should clone arrays of objects', (assert) => {
            const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
            const clone = deepClone(arr)
            assert.deepEqual(clone, arr, 'array of objects cloned correctly')
            assert.notEqual(clone, arr, 'cloned array is not the same reference')
            assert.notEqual(clone[0], arr[0], 'object in array is not the same reference')
        })

        it('should clone objects with array properties', (assert) => {
            const obj = {
                name: 'John',
                scores: [90, 85, 95],
                metadata: { tags: ['a', 'b', 'c'] }
            }
            const clone = deepClone(obj)
            assert.deepEqual(clone, obj, 'object with arrays cloned correctly')
            assert.notEqual(clone.scores, obj.scores, 'array property is not the same reference')
            assert.notEqual(clone.metadata.tags, obj.metadata.tags, 'nested array is not the same reference')
        })

        it('should create independent clones that do not affect original', (assert) => {
            const obj = { name: 'John', age: 30 }
            const clone = deepClone(obj)
            clone.name = 'Jane'
            clone.age = 25
            assert.equal(obj.name, 'John', 'original object name unchanged')
            assert.equal(obj.age, 30, 'original object age unchanged')
            assert.equal(clone.name, 'Jane', 'cloned object name changed')
            assert.equal(clone.age, 25, 'cloned object age changed')
        })

        it('should create independent nested clones', (assert) => {
            const obj = { user: { name: 'John' } }
            const clone = deepClone(obj)
            clone.user.name = 'Jane'
            assert.equal(obj.user.name, 'John', 'original nested object unchanged')
            assert.equal(clone.user.name, 'Jane', 'cloned nested object changed')
        })

        it('should create independent array clones', (assert) => {
            const arr = [1, 2, 3]
            const clone = deepClone(arr)
            clone.push(4)
            assert.equal(arr.length, 3, 'original array length unchanged')
            assert.equal(clone.length, 4, 'cloned array length changed')
        })

        it('should handle objects with null values', (assert) => {
            const obj = { value: null, other: 'test' }
            const clone = deepClone(obj)
            assert.deepEqual(clone, obj, 'object with null values cloned correctly')
        })

        it('should handle objects with undefined values', (assert) => {
            const obj = { value: undefined, other: 'test' }
            const clone = deepClone(obj)
            assert.deepEqual(clone, obj, 'object with undefined values cloned correctly')
        })

        it('should handle objects with boolean values', (assert) => {
            const obj = { active: true, deleted: false }
            const clone = deepClone(obj)
            assert.deepEqual(clone, obj, 'object with boolean values cloned correctly')
        })

        it('should handle objects with number values', (assert) => {
            const obj = { count: 42, price: 19.99, negative: -5 }
            const clone = deepClone(obj)
            assert.deepEqual(clone, obj, 'object with number values cloned correctly')
        })

        it('should handle objects with many properties', (assert) => {
            const obj = {}
            for (let i = 0; i < 100; i++) {
                obj[`key${i}`] = `value${i}`
            }
            const clone = deepClone(obj)
            assert.deepEqual(clone, obj, 'object with many properties cloned correctly')
            assert.notEqual(clone, obj, 'cloned object is not the same reference')
        })

        it('should handle large arrays', (assert) => {
            const arr = Array.from({ length: 1000 }, (_, i) => i)
            const clone = deepClone(arr)
            assert.deepEqual(clone, arr, 'large array cloned correctly')
            assert.notEqual(clone, arr, 'cloned large array is not the same reference')
        })

        it('should handle objects with special characters in keys', (assert) => {
            const obj = { 'key-with-dash': 1, 'key.with.dot': 2, 'key with space': 3 }
            const clone = deepClone(obj)
            assert.deepEqual(clone, obj, 'object with special character keys cloned correctly')
        })

        it('should handle objects with numeric keys', (assert) => {
            const obj = { 0: 'zero', 1: 'one', 2: 'two' }
            const clone = deepClone(obj)
            assert.deepEqual(clone, obj, 'object with numeric keys cloned correctly')
        })

        it('should handle objects with function properties', (assert) => {
            const obj = {
                name: 'test',
                method: function() { return 'hello' }
            }
            const clone = deepClone(obj)
            assert.equal(clone.name, 'test', 'non-function properties cloned')
            assert.ok(typeof clone.method === 'function', 'function property preserved')
        })

        it('should use fallback cloning for nested objects with functions', (assert) => {
            const obj = {
                user: {
                    name: 'John',
                    method: function() { return 'test' }
                },
                count: 42
            }
            const clone = deepClone(obj)
            assert.equal(clone.user.name, 'John', 'nested property cloned via fallback')
            assert.equal(clone.count, 42, 'top-level property cloned via fallback')
            assert.ok(typeof clone.user.method === 'function', 'nested function cloned via fallback')
            assert.notEqual(clone.user, obj.user, 'nested object is not the same reference')
        })

        it('should handle objects with inherited properties via fallback', (assert) => {
            function Parent() {
                this.parentProp = 'parent'
            }
            Parent.prototype.inheritedMethod = function() { return 'inherited' }
            
            function Child() {
                Parent.call(this)
                this.childProp = 'child'
            }
            Child.prototype = Object.create(Parent.prototype)
            
            const obj = new Child()
            const clone = deepClone(obj)
            
            assert.equal(clone.parentProp, 'parent', 'parent property cloned')
            assert.equal(clone.childProp, 'child', 'child property cloned')
            assert.notEqual(clone, obj, 'cloned object is not the same reference')
        })
    })

    QUnit.module('deepClone (fallback path)', () => {

        it('should use fallback for-in loop for objects with enumerable properties', (assert) => {
            const obj = {
                prop1: 'value1',
                prop2: 'value2',
                nested: {
                    prop3: 'value3'
                },
                func: function() { return 'test' }
            }
            const clone = deepClone(obj)
            assert.equal(clone.prop1, 'value1', 'prop1 cloned via fallback')
            assert.equal(clone.prop2, 'value2', 'prop2 cloned via fallback')
            assert.equal(clone.nested.prop3, 'value3', 'nested prop3 cloned via fallback')
            assert.ok(typeof clone.func === 'function', 'function cloned via fallback')
            assert.notEqual(clone, obj, 'fallback clone is not the same reference')
            assert.notEqual(clone.nested, obj.nested, 'nested object is not the same reference')
        })

        it('should handle objects that structuredClone cannot clone', (assert) => {
            const obj = {
                name: 'test',
                symbol: Symbol('test'),
                func: function() { return 'hello' }
            }
            const clone = deepClone(obj)
            assert.equal(clone.name, 'test', 'name property cloned')
            assert.ok(typeof clone.symbol === 'symbol', 'symbol property cloned')
            assert.ok(typeof clone.func === 'function', 'function property cloned')
            assert.notEqual(clone, obj, 'cloned object is not the same reference')
        })
    })
})
