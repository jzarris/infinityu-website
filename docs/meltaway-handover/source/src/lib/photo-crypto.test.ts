import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { decryptBytes, encryptBytes, parseKey, sha256Hex } from './photo-crypto.ts';

test('round trip and distinct ciphertexts for the same input', () => {
  const key = randomBytes(32);
  const plain = randomBytes(5000);
  const a = encryptBytes(plain, key);
  const b = encryptBytes(plain, key);
  assert.equal(a.equals(b), false);
  assert.equal(decryptBytes(a, key).equals(plain), true);
  assert.equal(decryptBytes(b, key).equals(plain), true);
  assert.equal(a.includes(plain.subarray(0, 64)), false);
});

test('wrong key and tampering are rejected', () => {
  const key = randomBytes(32);
  const blob = encryptBytes(Buffer.from('hello'), key);
  assert.throws(() => decryptBytes(blob, randomBytes(32)));
  const tampered = Buffer.from(blob);
  tampered[tampered.length - 1] ^= 0x01;
  assert.throws(() => decryptBytes(tampered, key));
  assert.throws(() => decryptBytes(Buffer.from('not a blob'), key));
});

test('parseKey enforces 32 bytes and sha256Hex is stable', () => {
  assert.throws(() => parseKey(undefined));
  assert.throws(() => parseKey(Buffer.from('short').toString('base64')));
  assert.equal(parseKey(randomBytes(32).toString('base64')).length, 32);
  assert.equal(sha256Hex(Buffer.from('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
