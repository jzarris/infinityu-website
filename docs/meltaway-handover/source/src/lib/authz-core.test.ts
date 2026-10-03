import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canAccessOwnedRecord } from './authz-core.ts';

test('patient can read own record', () => {
  assert.equal(canAccessOwnedRecord({ userId: 'u1', role: 'patient' }, 'u1'), true);
});

test('patient cannot read another patient record', () => {
  assert.equal(canAccessOwnedRecord({ userId: 'u1', role: 'patient' }, 'u2'), false);
});

test('admin can read any record', () => {
  assert.equal(canAccessOwnedRecord({ userId: 'a1', role: 'admin' }, 'u2'), true);
});

test('no session is refused', () => {
  assert.equal(canAccessOwnedRecord(null, 'u1'), false);
  assert.equal(canAccessOwnedRecord(undefined, 'u1'), false);
});
