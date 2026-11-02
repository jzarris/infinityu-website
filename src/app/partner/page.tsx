import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { PartnerContent } from './PartnerContent';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--partner-display',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--partner-ui',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Partner With Us | Open a Med Spa in California — InfinityU',
  description:
    'Explore a physician-partnership opportunity with Dr. Michael Le under a California MSO–PC structure. Medical direction, protocol oversight, and compliance support for qualified med spa partners.',
  openGraph: {
    title: 'Partner With Dr. Michael Le | California Med Spa MSO–PC Partnership',
    description:
      'Dr. Michael Le is selectively partnering with qualified business owners and clinicians to open medically compliant aesthetic practices in California under a physician-owned PC structure.',
    url: 'https://www.infinity-u.com/partner',
    siteName: 'InfinityU Med Spa',
    type: 'website',
  },
};

export default function PartnerPage() {
  return (
    <div className={`${cormorant.variable} ${jost.variable}`}>
      <PartnerContent />
    </div>
  );
}
