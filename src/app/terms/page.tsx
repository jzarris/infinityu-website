import { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { BUSINESS } from '@/lib/constants';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Terms & Conditions',
  `Terms and conditions for ${BUSINESS.legalName}. Please read these terms carefully before using our website or services.`,
  { canonical: `${BUSINESS.url}/terms` }
);

export default function TermsPage() {
  return (
    <>
      <section className="gradient-primary py-16 text-center">
        <div className="container-custom">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-white/70 text-sm">Last updated: May 2, 2026</p>
        </div>
      </section>

      <Section>
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the {BUSINESS.legalName} website (&quot;Site&quot;), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Site.
          </p>

          <h2>2. Services</h2>
          <p>
            {BUSINESS.legalName} provides medical spa services including but not limited to injectables, skin tightening, body contouring, and medical weight loss programs. All services are provided by licensed medical professionals.
          </p>
          <p>
            Information on this Site is for general informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare provider regarding any medical questions or conditions.
          </p>

          <h2>3. Appointments & Cancellations</h2>
          <p>
            Appointments are required for all services. We request at least 24 hours&apos; notice for cancellations or rescheduling. Late cancellations or no-shows may be subject to a cancellation fee.
          </p>

          <h2>4. Payment</h2>
          <p>
            Payment is due at the time of service. We accept major credit cards and other payment methods as posted at our location. Prices are subject to change without notice.
          </p>

          <h2>5. Medical Disclaimer</h2>
          <p>
            Results from our treatments vary by individual. The information provided on this Site, including before/after images, testimonials, and treatment descriptions, is for informational purposes and should not be considered a guarantee of results.
          </p>
          <p>
            All medical treatments carry potential risks and side effects. Your provider will discuss these with you during your consultation.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            All content on this Site, including text, images, logos, graphics, and design, is the property of {BUSINESS.legalName} and is protected by copyright and trademark laws. You may not reproduce, distribute, or use any content without our written permission.
          </p>

          <h2>7. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Site for any unlawful purpose</li>
            <li>Submit false or misleading information through our forms</li>
            <li>Attempt to interfere with the Site&apos;s functionality or security</li>
            <li>Scrape, copy, or harvest data from the Site</li>
          </ul>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, {BUSINESS.legalName} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Site or our services.
          </p>

          <h2>9. Third-Party Links</h2>
          <p>
            Our Site may contain links to third-party websites. We are not responsible for the content, privacy practices, or terms of any third-party sites.
          </p>

          <h2>10. Privacy</h2>
          <p>
            Your use of the Site is also governed by our <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>, which is incorporated into these terms by reference.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These terms are governed by the laws of the State of California. Any disputes shall be resolved in the courts of Orange County, California.
          </p>

          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to update these terms at any time. Continued use of the Site after changes constitutes acceptance of the updated terms.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            If you have questions about these terms, please contact us at:
          </p>
          <ul>
            <li>Email: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></li>
            <li>Phone: <a href={`tel:${BUSINESS.phoneRaw}`}>{BUSINESS.phone}</a></li>
            <li>Address: {BUSINESS.address.full}</li>
          </ul>
        </div>
      </Section>
    </>
  );
}
