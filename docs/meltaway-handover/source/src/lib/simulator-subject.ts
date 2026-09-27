/**
 * Who is using the simulator. Either a logged-in patient (session) or a person
 * who just completed intake phone verification (sim_access cookie). Admins do
 * not use the patient endpoints; they have their own routes.
 */

import { cookies } from 'next/headers';
import { auth } from './auth';
import { prisma } from './prisma';
import { SIM_ACCESS_COOKIE, verifySimAccessToken } from './sim-access';

export type SimulatorCohort = 'pre_signup' | 'post_login';

export interface SimulatorSubject {
  userId: string;
  cohort: SimulatorCohort;
}

export async function getSimulatorSubject(): Promise<SimulatorSubject | null> {
  const session = await auth();
  if (session?.user?.id && session.user.role === 'patient') {
    return { userId: session.user.id, cohort: 'post_login' };
  }
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  const store = await cookies();
  const verified = verifySimAccessToken(store.get(SIM_ACCESS_COOKIE)?.value, secret);
  if (!verified) return null;
  // The cookie only stands for an active patient account.
  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
    select: { role: true, isActive: true },
  });
  if (!user || user.role !== 'patient' || !user.isActive) return null;
  return { userId: verified.userId, cohort: 'pre_signup' };
}
