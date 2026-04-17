import { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';
import { generatePageMetadata } from '@/lib/seo';
import { Camera } from 'lucide-react';

export const metadata: Metadata = generatePageMetadata(
  'Before & After Gallery',
  'View real patient results from HiFu, body contouring, microneedling, and more at InfinityU Med Spa in Huntington Beach.',
  { noIndex: true }
);

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-primary py-20">
        <div className="container-custom text-center">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Results</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            Before & After Gallery
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Real results from real patients. All photos shared with documented patient consent.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="bg-surface-alt border-b border-border py-3">
        <div className="container-custom text-center">
          <p className="text-text-muted text-sm">
            Individual results may vary. All photos are shared with HIPAA-compliant patient consent.
            No patient identifying information is displayed.
          </p>
        </div>
      </div>

      {/* Gallery Coming Soon */}
      <Section>
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-6">
            <Camera className="h-10 w-10 text-text-light" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-4">Gallery Coming Soon</h2>
          <p className="text-text-muted max-w-md mx-auto mb-8">
            We&apos;re preparing our gallery of patient transformations. Check back soon to see
            the amazing results our treatments can achieve.
          </p>

          {/* Placeholder grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl bg-gradient-to-br from-surface to-surface-alt border border-border flex items-center justify-center"
              >
                <Camera className="h-8 w-8 text-border" />
              </div>
            ))}
          </div>

          <p className="text-text-muted mb-6">
            In the meantime, schedule a consultation to learn more about our treatments.
          </p>
          {BUSINESS.bookingUrl && (
            <Button href={BUSINESS.bookingUrl} variant="accent">
              Book a Consultation
            </Button>
          )}
        </div>
      </Section>
    </>
  );
}
