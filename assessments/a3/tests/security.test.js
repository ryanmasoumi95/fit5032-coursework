import test from 'node:test'
import assert from 'node:assert/strict'

import { containsUnsafeMarkup } from '../src/utils/security.js'

test('accepts normal report text', () => {
  assert.equal(
    containsUnsafeMarkup('The recycling bin is damaged near the entrance.'),
    false
  )
})

test('rejects script markup', () => {
  assert.equal(
    containsUnsafeMarkup("<script>alert('test')</script>"),
    true
  )
})

test('rejects HTML markup', () => {
  assert.equal(
    containsUnsafeMarkup('<strong>unsafe markup</strong>'),
    true
  )
})

test('rejects isolated angle brackets', () => {
  assert.equal(containsUnsafeMarkup('2 < 3'), true)
  assert.equal(containsUnsafeMarkup('3 > 2'), true)
})