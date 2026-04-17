import crypto from 'crypto';

const TOTP_PERIOD = 30;
const TOTP_DIGITS = 6;
const TOTP_ALGORITHM = 'sha1';

export function generateTOTPSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

export function generateTOTP(secret: string, timestamp?: number): string {
  const time = timestamp ?? Date.now();
  const counter = Math.floor(time / 1000 / TOTP_PERIOD);
  const secretBuffer = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));
  const hmac = crypto.createHmac(TOTP_ALGORITHM, secretBuffer);
  hmac.update(counterBuffer);
  const hmacResult = hmac.digest();
  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  const code =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);
  const otp = code % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, '0');
}

export function verifyTOTP(secret: string, code: string): boolean {
  const now = Date.now();
  for (let i = -1; i <= 1; i++) {
    const timestamp = now + i * TOTP_PERIOD * 1000;
    const expectedCode = generateTOTP(secret, timestamp);
    if (expectedCode === code.padStart(TOTP_DIGITS, '0')) return true;
  }
  return false;
}

export function generateTOTPUri(secret: string, email: string, issuer: string = 'InfinityU Admin'): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
  let result = '';
  let bits = 0;
  let value = 0;
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += BASE32_ALPHABET[(value >> bits) & 0x1f];
    }
  }
  if (bits > 0) result += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  return result;
}

function base32Decode(str: string): Buffer {
  const cleanStr = str.replace(/=+$/, '').toUpperCase();
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (let i = 0; i < cleanStr.length; i++) {
    const index = BASE32_ALPHABET.indexOf(cleanStr[i]);
    if (index === -1) throw new Error(`Invalid base32 character: ${cleanStr[i]}`);
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >> bits) & 0xff);
    }
  }
  return Buffer.from(bytes);
}
