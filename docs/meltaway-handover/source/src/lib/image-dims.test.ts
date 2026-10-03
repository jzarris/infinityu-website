import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readImageDimensions } from './image-dims.ts';

function png(w: number, h: number): Buffer {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
}

function jpeg(w: number, h: number): Buffer {
  // SOI, APP0 (len 16), SOF0 (len 17) with height/width, then some bytes
  const app0 = Buffer.concat([Buffer.from([0xff, 0xe0, 0x00, 0x10]), Buffer.alloc(14)]);
  const sof = Buffer.alloc(19);
  sof[0] = 0xff; sof[1] = 0xc0; sof.writeUInt16BE(17, 2); sof[4] = 8;
  sof.writeUInt16BE(h, 5); sof.writeUInt16BE(w, 7); sof[9] = 3;
  return Buffer.concat([Buffer.from([0xff, 0xd8]), app0, sof, Buffer.alloc(16)]);
}

test('png dimensions', () => {
  assert.deepEqual(readImageDimensions(png(720, 1280)), { type: 'png', width: 720, height: 1280 });
});

test('jpeg dimensions with a leading APP0 segment', () => {
  assert.deepEqual(readImageDimensions(jpeg(2268, 4032)), { type: 'jpeg', width: 2268, height: 4032 });
});

test('non-image bytes are rejected', () => {
  assert.equal(readImageDimensions(Buffer.from('GIF89a......')), null);
  assert.equal(readImageDimensions(Buffer.alloc(0)), null);
});
