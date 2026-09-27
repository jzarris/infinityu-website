import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | MeltAwayMD',
  description: 'Privacy Policy for MeltAwayMD - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4">Privacy Policy</h1>
        <p className="text-[var(--color-text-muted)] mb-8">Last updated: September 2026</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">1. Introduction</h2>
            <p className="text-[var(--color-text-muted)] mb-4">
              MeltAwayMD (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website meltawaymd.com or use our services.
            </p>
            <p className="text-[var(--color-text-muted)]">
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-medium text-[var(--color-text)] mb-3">Personal Information</h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-6 text-[var(--color-text-muted)] mb-4 space-y-2">
              <li>Register for an account</li>
              <li>Complete our intake form</li>
              <li>Contact us through our website</li>
              <li>Sign up for our newsletter</li>
              <li>Use our patient portal</li>
            </ul>
            <p className="text-[var(--color-text-muted)] mb-4">
              This information may include:
            </p>
            <ul className="list-disc pl-6 text-[var(--color-text-muted)] mb-4 space-y-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Date of birth</li>
              <li>Health information you choose to provide</li>
              <li>Mailing address</li>
            </ul>

            <h3 className="text-xl font-medium text-[var(--color-text)] mb-3">Automatically Collected Information</h3>
            <p className="text-[var(--color-text-muted)]">
              When you access our website, we may automatically collect certain information about your device and usage, including your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the website.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">3. How We Use Your Information</h2>
            <p className="text-[var(--color-text-muted)] mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-[var(--color-text-muted)] space-y-2">
              <li>Provide, operate, and maintain our services</li>
              <li>Process and manage your account registration</li>
              <li>Communicate with you about our services, including appointment reminders and updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Coordinate care with our affiliated medical providers</li>
              <li>Send you marketing and promotional communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">4. Disclosure of Your Information</h2>
            <p className="text-[var(--color-text-muted)] mb-4">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 text-[var(--color-text-muted)] space-y-2">
              <li><strong>With Medical Providers:</strong> We share necessary information with licensed medical providers who provide healthcare services through our platform.</li>
              <li><strong>With Service Providers:</strong> We may share your information with third-party vendors who perform services on our behalf, such as payment processing, email delivery, and hosting services.</li>
              <li><strong>For Legal Purposes:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
              <li><strong>With Your Consent:</strong> We may share your information with third parties when you have given us your consent to do so.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">5. Health Information (HIPAA)</h2>
            <p className="text-[var(--color-text-muted)] mb-4">
              If you provide health information through our services, that information may be protected by the Health Insurance Portability and Accountability Act (HIPAA). Medical services are provided by independent licensed medical providers, and your protected health information (PHI) is handled in accordance with applicable healthcare privacy laws.
            </p>
            <p className="text-[var(--color-text-muted)]">
              For more information about how your PHI is handled, please refer to the Notice of Privacy Practices provided by your healthcare provider.
            </p>
          </section>

          <section className="mb-10 scroll-mt-24" id="body-simulator-photos">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">5a. Body Simulator Photos</h2>
            <p className="text-[var(--color-text-muted)] mb-4">
              If you choose to use our body simulator, you may provide a full-body photo of yourself. We use that photo only to produce a computer-generated image estimating how your body might look at a goal weight you choose. The result is a simulation, not a prediction or a promise, and individual results vary.
            </p>
            <ul className="list-disc pl-6 text-[var(--color-text-muted)] mb-4 space-y-2">
              <li>Your photo and the simulated images are stored encrypted on our systems. To generate the simulation, the photo is processed by a contracted computing provider that does not retain it.</li>
              <li>We do not use your photo for advertising, sell it, share it with anyone else, or use it to train or improve any model.</li>
              <li>Photos and simulated images are deleted automatically after a limited period: 30 days if you do not become a patient, and up to one year if you do. Photos we could not use are deleted within 7 days.</li>
              <li>You can delete your photo and images at any time from the simulator page, and our staff can delete them on request.</li>
              <li>Using the simulator is optional and does not affect any care or program decision. You will be asked to agree to these terms before taking a photo.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">6. Data Security</h2>
            <p className="text-[var(--color-text-muted)]">
              We implement appropriate technical and organizational security measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">7. Your Privacy Rights</h2>
            <p className="text-[var(--color-text-muted)] mb-4">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 text-[var(--color-text-muted)] space-y-2">
              <li>The right to access your personal information</li>
              <li>The right to correct inaccurate information</li>
              <li>The right to delete your personal information</li>
              <li>The right to opt out of marketing communications</li>
              <li>The right to data portability</li>
            </ul>
            <p className="text-[var(--color-text-muted)] mt-4">
              To exercise any of these rights, please contact us using the information provided below.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">8. California Privacy Rights</h2>
            <p className="text-[var(--color-text-muted)]">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete your personal information, and the right to opt out of the sale of your personal information. We do not sell your personal information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">9. Cookies and Tracking Technologies</h2>
            <p className="text-[var(--color-text-muted)]">
              We may use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings and other tools. However, disabling cookies may affect your ability to use certain features of our website.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">10. Third-Party Links</h2>
            <p className="text-[var(--color-text-muted)]">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">11. Children&apos;s Privacy</h2>
            <p className="text-[var(--color-text-muted)]">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-[var(--color-text-muted)]">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this privacy policy periodically for any changes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">13. Contact Us</h2>
            <p className="text-[var(--color-text-muted)] mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-[var(--color-surface)] rounded-lg p-6">
              <p className="text-[var(--color-text)] font-medium">MeltAwayMD</p>
              <p className="text-[var(--color-text-muted)]">Email: info@meltawaymd.com</p>
              <p className="text-[var(--color-text-muted)]">Phone: (714) 202-7838</p>
              <p className="text-[var(--color-text-muted)]">California, USA</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
