import { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { BUSINESS } from '@/lib/constants';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Privacy Policy',
  `Privacy policy for ${BUSINESS.legalName}. Learn how we collect, use, and protect your personal information.`,
  { canonical: `${BUSINESS.url}/privacy` }
);

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="gradient-primary py-16 text-center">
        <div className="container-custom">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/70 text-sm">Last updated: May 2, 2026</p>
        </div>
      </section>

      <Section>
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h2>1. Information We Collect</h2>
          <p>
            When you visit our website, contact us, or use our services, we may collect the following information:
          </p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, and any other information you voluntarily provide through our contact forms.</li>
            <li><strong>Health Information:</strong> Medical history, treatment preferences, and health-related data necessary to provide our medical spa services.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent, and referring URLs.</li>
            <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Respond to inquiries and schedule appointments</li>
            <li>Provide and improve our medical spa services</li>
            <li>Send appointment reminders and follow-up communications</li>
            <li>Send promotional communications (only with your consent)</li>
            <li>Comply with legal and regulatory requirements</li>
            <li>Improve our website and user experience</li>
          </ul>

          <h2>3. SMS Communications</h2>
          <p>
            If you opt in to SMS communications, we may send you:
          </p>
          <ul>
            <li><strong>Transactional messages:</strong> Appointment reminders, account updates, and customer support messages.</li>
            <li><strong>Promotional messages:</strong> Special offers, health tips, and program updates (only if you separately opt in).</li>
          </ul>
          <p>
            Message and data rates may apply. You can opt out at any time by replying STOP to any SMS message. Message frequency varies.
          </p>

          <h2>4. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your information with:
          </p>
          <ul>
            <li>Service providers who assist in operating our website and business (e.g., email providers, payment processors)</li>
            <li>Legal authorities when required by law</li>
            <li>Healthcare providers involved in your treatment, as permitted by applicable law</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2>6. Cookies</h2>
          <p>
            Our website may use cookies and similar tracking technologies to enhance your browsing experience. You can control cookie preferences through your browser settings.
          </p>

          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access, correct, or delete your personal information</li>
            <li>Opt out of marketing communications</li>
            <li>Request a copy of the data we hold about you</li>
          </ul>
          <p>
            California residents have additional rights under the California Consumer Privacy Act (CCPA). Please contact us to exercise these rights.
          </p>

          <h2>8. Children&apos;s Privacy</h2>
          <p>
            Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this privacy policy, please contact us at:
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
