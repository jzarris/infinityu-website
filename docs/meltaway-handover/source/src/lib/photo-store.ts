/**
 * Storage interface for patient photos and simulation outputs.
 *
 * V1 backend: files on the Railway volume under data/photos, encrypted with
 * AES-256-GCM under PHOTO_ENCRYPTION_KEY (never the session secret). Keys are
 * opaque UUID-based paths with no user identifier. Nothing outside this module
 * touches the filesystem for photos, so a bucket backend later is a change to
 * this file only.
 */

import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import { decryptBytes, encryptBytes, parseKey } from './photo-crypto';

export interface PhotoStore {
  put(bytes: Buffer): Promise<string>;
  get(storageKey: string): Promise<Buffer>;
  delete(storageKey: string): Promise<void>;
}

const PHOTO_DIR = path.join(process.cwd(), 'data', 'photos');
const KEY_PATTERN = /^[0-9a-f]{2}\/[0-9a-f-]{36}\.bin$/;

export function isPhotoStoreConfigured(): boolean {
  try {
    parseKey(process.env.PHOTO_ENCRYPTION_KEY);
    return true;
  } catch {
    return false;
  }
}

class VolumePhotoStore implements PhotoStore {
  private key: Buffer;

  constructor() {
    this.key = parseKey(process.env.PHOTO_ENCRYPTION_KEY);
  }

  private pathFor(storageKey: string): string {
    if (!KEY_PATTERN.test(storageKey)) throw new Error('invalid storage key');
    return path.join(PHOTO_DIR, storageKey);
  }

  async put(bytes: Buffer): Promise<string> {
    const id = randomUUID();
    const storageKey = `${id.slice(0, 2)}/${id}.bin`;
    const file = this.pathFor(storageKey);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, encryptBytes(bytes, this.key), { mode: 0o600 });
    return storageKey;
  }

  async get(storageKey: string): Promise<Buffer> {
    const blob = await readFile(this.pathFor(storageKey));
    return decryptBytes(blob, this.key);
  }

  async delete(storageKey: string): Promise<void> {
    try {
      await unlink(this.pathFor(storageKey));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
}

let store: PhotoStore | null = null;

export function getPhotoStore(): PhotoStore {
  if (!store) store = new VolumePhotoStore();
  return store;
}
