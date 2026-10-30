import assert from 'node:assert/strict';
import { test } from 'node:test';
import { userState } from '../src/validation.js';

const document = (fileData: string) => ({ id: 'test-file', title: 'Test file', category: 'id', uploadDate: '2026-10-30', size: 'test', fileData });
test('vault accepts exactly 1 MiB of decoded file content, including WebP', () => {
  for (const type of ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']) {
    assert.equal(userState.safeParse({ documents: [document(`data:${type};base64,${Buffer.alloc(1024 * 1024).toString('base64')}`)] }).success, true);
  }
});
test('vault rejects files over 1 MiB even when the encoded string fits the old limit', () => {
  assert.equal(userState.safeParse({ documents: [document(`data:image/png;base64,${Buffer.alloc(1024 * 1024 + 1).toString('base64')}`)] }).success, false);
});
test('vault rejects malformed base64 instead of silently accepting undecodable data', () => {
  assert.equal(userState.safeParse({ documents: [document('data:image/png;base64,A')] }).success, false);
});
