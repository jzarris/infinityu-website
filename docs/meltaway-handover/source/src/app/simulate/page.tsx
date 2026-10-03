import type { Metadata } from 'next';
import Link from 'next/link';
import { getSimulatorSubject } from '@/lib/simulator-subject';
import { SimulatorFlow } from '@/components/simulator/SimulatorFlow';

export const metadata: Metadata = {
  title: 'Body Simulator',
  description: 'See a simulation of your body at a goal weight.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * The simulator page. Reachable with a patient session or the short-lived
 * access cookie set after intake phone verification. This route is excluded
 * from all tracking scripts (see lib/tracking-scope).
 */
export default async function SimulatePage() {
  const subject = await getSimulatorSubject();

  if (!subject) {
    return (
      <div className="py-16 md:py-24">
        <div className="container-custom max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-4">Body Simulator</h1>
          <p className="text-[var(--color-text-muted)] mb-8">
            The simulator is available after you complete the health assessment, or when you are
            signed in to the patient portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/intake" className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white font-medium">
              Start the health assessment
            </Link>
            <Link href="/auth/login" className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)] font-medium text-[var(--color-text)]">
              Patient sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16">
      <div className="container-custom max-w-3xl">
        <SimulatorFlow cohort={subject.cohort} />
      </div>
    </div>
  );
}
