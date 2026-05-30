import { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { BUSINESS } from '@/lib/constants';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'SMS Messaging Policy & Consent Disclosure',
  `Documents how ${BUSINESS.legalName} collects SMS consent, including the consent form and message types. Provided for Twilio toll-free verification.`,
  { canonical: `${BUSINESS.url}/sms-policy` }
);

export default function SmsPolicyPage() {
  return (
    <>
      <section className="gradient-primary py-16 text-center">
        <div className="container-custom">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            SMS Messaging Policy &amp; Consent Disclosure — InfinityU Med Spa
          </h1>
        </div>
      </section>

      <Section>
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h2>Overview</h2>
          <p>
            InfinityU Med Spa sends SMS messages only to individuals who provide express consent through the consent form on our website. This page documents how that consent is collected.
          </p>

          <h2>How Consent Is Collected</h2>
          <p>
            Consent is collected via a web form on our contact page at{' '}
            <Link href="/contact">https://www.infinity-u.com/contact</Link>, under the &ldquo;SMS Communication Preferences&rdquo; section. SMS consent is collected through two separate, independent checkboxes. The promotional checkbox is a distinct, unchecked-by-default opt-in. SMS consent is never a condition of receiving any service, scheduling an appointment, or submitting the form.
          </p>
          <p>
            This SMS policy and the toll-free number registered against it are associated specifically with our promotional/marketing messaging, governed by the second (promotional) consent checkbox shown below. Transactional and account messaging is governed by the first (transactional) checkbox and operates on a separate, independently registered toll-free number.
          </p>

          <h2>Consent Form</h2>
          {/* TODO: Drop the actual screenshot file at /public/sms-optin-form.png. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sms-optin-form.png"
            alt="Screenshot of the SMS Communication Preferences section on the InfinityU Med Spa contact form, showing two separate unchecked opt-in checkboxes for transactional and promotional SMS."
          />
          <p>
            <em>The SMS Communication Preferences section as shown on our contact form.</em>
          </p>

          <h2>Consent Language</h2>
          <ol>
            <li>
              &ldquo;I agree to receive SMS messages from InfinityU Med Spa for appointment reminders, account updates, and customer support. Message and data rates may apply. Reply STOP to opt out.&rdquo;
            </li>
            <li>
              &ldquo;I agree to receive promotional SMS messages from InfinityU Med Spa about special offers, health tips, and program updates. Message and data rates may apply. Reply STOP to opt out.&rdquo;
            </li>
          </ol>

          <h2>Message Types &amp; Examples</h2>
          <ul>
            <li>
              <strong>Transactional (first checkbox):</strong> appointment reminders, account updates, customer support. Example: &ldquo;InfinityU Med Spa: Reminder — your appointment is tomorrow at 2:00 PM. Reply STOP to opt out, HELP for help.&rdquo;
            </li>
            <li>
              <strong>Promotional (second checkbox, separate opt-in):</strong> special offers, health tips, program updates. Example: &ldquo;InfinityU Med Spa: Black Friday sale this weekend — 20% off all services. Book: [link]. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.&rdquo;
            </li>
          </ul>

          <h2>Message Frequency &amp; Rates</h2>
          <p>Message frequency varies. Message and data rates may apply.</p>

          <h2>Opt-Out &amp; Help</h2>
          <p>
            Reply STOP to any message to unsubscribe at any time. Reply HELP for assistance, or contact{' '}
            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> /{' '}
            <a href={`tel:${BUSINESS.phoneRaw}`}>{BUSINESS.phone}</a>.
          </p>

          <h2>Data Handling</h2>
          <p>
            Mobile opt-in data and consent are never shared with or sold to third parties or affiliates for marketing purposes. See our{' '}
            <Link href="/privacy">Privacy Policy</Link> at https://www.infinity-u.com/privacy. See also our{' '}
            <Link href="/terms">Terms &amp; Conditions</Link>.
          </p>

          <h2>Contact</h2>
          <p>
            {BUSINESS.legalName}, {BUSINESS.address.full}.{' '}
            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.{' '}
            <a href={`tel:${BUSINESS.phoneRaw}`}>{BUSINESS.phone}</a>.
          </p>
        </div>
      </Section>
    </>
  );
}
