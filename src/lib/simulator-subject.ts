/**
 * Who is using the simulator. Infinity-U has no patient NextAuth sessions, so
 * the only subject is a person who completed intake phone verification and holds
 * a valid sim_access cookie. Admins use their own routes.
 */

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { SIM_ACCESS_COOKIE, verifySimAccessToken } from './sim-access';

export type SimulatorCohort = 'pre_signup' | 'post_login' | 'admin_rerun';

export interface SimulatorSubject {
  userId: string;
  cohort: SimulatorCohort;
}

export async function getSimulatorSubject(): Promise<SimulatorSubject | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  const store = await cookies();
  const verified = verifySimAccessToken(store.get(SIM_ACCESS_COOKIE)?.value, secret);
  if (!verified) return null;
  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
    select: { role: true, isActive: true },
  });
  if (!user || user.role !== 'patient' || !user.isActive) return null;
  return { userId: verified.userId, cohort: 'pre_signup' };
}
