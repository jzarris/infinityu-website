import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PhoneLogin } from '@/components/auth/PhoneLogin';

export const metadata: Metadata = {
  title: 'Sign in with your phone',
  robots: { index: false, follow: false },
};

/**
 * Sign in with a phone number and a one-time code. Works for anyone whose phone
 * was verified at intake, including people who never set a password. This is
 * the page the "your simulation is ready" text links to.
 */
export default function PhoneLoginPage() {
  return (
    <Suspense fallback={null}>
      <PhoneLogin />
    </Suspense>
  );
}
