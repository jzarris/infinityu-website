import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { SIM_ACCESS_TTL_MS, issueSimAccessToken, verifySimAccessToken } from './sim-access.ts';

const SECRET = 'a-very-long-secret-value-for-tests-1234567890';

test('issued token verifies and carries the user id', () => {
  const t = issueSimAccessToken('user_1', SECRET, 1000);
  assert.deepEqual(verifySimAccessToken(t, SECRET, 2000), { userId: 'user_1' });
});

test('token expires after the ttl', () => {
  const t = issueSimAccessToken('user_1', SECRET, 1000);
  assert.equal(verifySimAccessToken(t, SECRET, 1000 + SIM_ACCESS_TTL_MS + 1), null);
});

test('tampered payload, wrong secret, and garbage are rejected', () => {
  const t = issueSimAccessToken('user_1', SECRET, 1000);
  const [payload, sig] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ uid: 'user_2', exp: 9e15, p: 'simulator' })).toString('base64url');
  assert.equal(verifySimAccessToken(`${forged}.${sig}`, SECRET, 2000), null);
  assert.equal(verifySimAccessToken(t, 'other-secret', 2000), null);
  assert.equal(verifySimAccessToken(payload, SECRET, 2000), null);
  assert.equal(verifySimAccessToken('', SECRET, 2000), null);
  assert.equal(verifySimAccessToken(null, SECRET, 2000), null);
});

test('token is bound to the simulator purpose', () => {
  const other = Buffer.from(JSON.stringify({ uid: 'user_1', exp: 9e15, p: 'session' })).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(other).digest('base64url');
  assert.equal(verifySimAccessToken(`${other}.${sig}`, SECRET, 2000), null);
});
