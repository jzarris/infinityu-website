import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackingAllowedForPath } from './tracking-scope.ts';

test('marketing routes allow tracking', () => {
  for (const p of ['/', '/about', '/programs', '/intake', '/contact', '/education', '/privacy']) {
    assert.equal(trackingAllowedForPath(p), true, p);
  }
});

test('authenticated and health routes never load tracking', () => {
  for (const p of [
    '/portal', '/portal/', '/portal/resources', '/portal/simulate',
    '/admin', '/admin/patients', '/admin/login',
    '/simulate', '/simulate/result',
    '/auth/login', '/auth/verify',
    '/api/simulate',
  ]) {
    assert.equal(trackingAllowedForPath(p), false, p);
  }
});

test('prefix match is on path segments, not substrings', () => {
  assert.equal(trackingAllowedForPath('/portals-of-wellness'), true);
  assert.equal(trackingAllowedForPath('/administration'), true);
});

test('unknown pathname is treated as not allowed', () => {
  assert.equal(trackingAllowedForPath(null), false);
  assert.equal(trackingAllowedForPath(undefined), false);
});
