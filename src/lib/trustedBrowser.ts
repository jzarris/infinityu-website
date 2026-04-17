import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const TRUST_DURATION_DAYS = 30;

export function generateBrowserToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashBrowserToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createTrustedBrowser(userId: string, userAgent?: string, ipAddress?: string): Promise<string> {
  const token = generateBrowserToken();
  const tokenHash = hashBrowserToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TRUST_DURATION_DAYS);
  await prisma.trustedBrowser.create({ data: { userId, tokenHash, userAgent, ipAddress, expiresAt } });
  return token;
}

export async function verifyTrustedBrowser(userId: string, token: string): Promise<boolean> {
  if (!token) return false;
  const tokenHash = hashBrowserToken(token);
  const trustedBrowser = await prisma.trustedBrowser.findFirst({
    where: { userId, tokenHash, expiresAt: { gt: new Date() } },
  });
  if (trustedBrowser) {
    await prisma.trustedBrowser.update({ where: { id: trustedBrowser.id }, data: { lastUsed: new Date() } });
    return true;
  }
  return false;
}

export async function getTrustedBrowsers(userId: string) {
  return prisma.trustedBrowser.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    select: { id: true, userAgent: true, ipAddress: true, lastUsed: true, expiresAt: true, createdAt: true },
    orderBy: { lastUsed: 'desc' },
  });
}

export async function revokeTrustedBrowser(userId: string, browserId: string): Promise<boolean> {
  const result = await prisma.trustedBrowser.deleteMany({ where: { id: browserId, userId } });
  return result.count > 0;
}

export async function revokeAllTrustedBrowsers(userId: string): Promise<number> {
  const result = await prisma.trustedBrowser.deleteMany({ where: { userId } });
  return result.count;
}
