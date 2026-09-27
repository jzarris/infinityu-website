/**
 * Authenticated encryption for stored photos. Pure functions, no I/O, so they
 * can be unit tested. Format: magic(4) | iv(12) | tag(16) | ciphertext.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';
const MAGIC = Buffer.from('MAP1');
const IV_LEN = 12;
const TAG_LEN = 16;

export function encryptBytes(plain: Buffer, key: Buffer): Buffer {
  if (key.length !== 32) throw new Error('key must be 32 bytes');
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const body = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([MAGIC, iv, tag, body]);
}

export function decryptBytes(blob: Buffer, key: Buffer): Buffer {
  if (key.length !== 32) throw new Error('key must be 32 bytes');
  if (blob.length < MAGIC.length + IV_LEN + TAG_LEN || !blob.subarray(0, 4).equals(MAGIC)) {
    throw new Error('not an encrypted photo blob');
  }
  const iv = blob.subarray(4, 4 + IV_LEN);
  const tag = blob.subarray(4 + IV_LEN, 4 + IV_LEN + TAG_LEN);
  const body = blob.subarray(4 + IV_LEN + TAG_LEN);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]);
}

export function sha256Hex(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export function parseKey(base64: string | undefined): Buffer {
  if (!base64) throw new Error('PHOTO_ENCRYPTION_KEY is not set');
  const key = Buffer.from(base64, 'base64');
  if (key.length !== 32) throw new Error('PHOTO_ENCRYPTION_KEY must decode to 32 bytes');
  return key;
}
