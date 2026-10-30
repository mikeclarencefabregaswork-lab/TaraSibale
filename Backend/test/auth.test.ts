import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hashPassword, verifyPassword } from '../src/auth.js'

test('password hashes are salted and verify only the correct password', async () => {
  const first = await hashPassword('Correct horse battery staple!')
  const second = await hashPassword('Correct horse battery staple!')
  assert.notEqual(first, second)
  assert.equal(first.includes('Correct horse'), false)
  assert.equal(await verifyPassword('Correct horse battery staple!', first), true)
  assert.equal(await verifyPassword('incorrect', first), false)
})

test('malformed stored password hashes cannot authenticate', async () => {
  assert.equal(await verifyPassword('password', 'garbage'), false)
  assert.equal(await verifyPassword('password', 'scrypt$invalid$aa'), false)
})
