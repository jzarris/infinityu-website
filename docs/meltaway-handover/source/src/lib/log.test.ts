import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redact, sanitizeForLogging } from './log.ts';

test('sanitizeForLogging masks emails and phones', () => {
  const s = sanitizeForLogging('contact jane.doe@example.com or (714) 202-7838 today');
  assert.equal(s.includes('jane.doe'), false);
  assert.equal(s.includes('7838'), false);
  assert.match(s, /\[EMAIL\]/);
  assert.match(s, /\[PHONE\]/);
});

test('redact walks objects, arrays, and errors and truncates long strings', () => {
  const out = redact({
    email: 'a@b.co',
    nested: { phone: '+1 714 202 7838', list: ['x@y.z', 5, true] },
    err: new Error('failed for a@b.co'),
    long: 'y'.repeat(1000),
  }) as Record<string, unknown>;
  const json = JSON.stringify(out);
  assert.equal(json.includes('a@b.co'), false);
  assert.equal(json.includes('7838'), false);
  assert.equal((out.long as string).length, 300);
  assert.equal((out.err as { name: string }).name, 'Error');
});
