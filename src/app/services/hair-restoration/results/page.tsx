import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';
import { Camera, Clock, Microscope } from 'lucide-react';
import { HairResultsGallery } from './HairResultsGallery';

export const metadata: Metadata = {
  title: 'Hair Restoration Results | InfinityU Med Spa',
  description:
    'AI-illustrated before and after examples for hair transplant, PRP therapy, exosome therapy, and eyebrow transplant at InfinityU in Huntington Beach.',
};

export default function HairResultsPage() {
  return (
    <>
      {/* Hero */}
      <div className="gradient-primary text-white py-16 md:py-20">
        <div className="container-custom">
          <Link
            href="/services/hair-restoration"
            className="text-white/60 text-sm hover:text-white/90 transition-colors inline-block mb-6"
          >
            ← Back to Hair Restoration
          </Link>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Before &amp; After Results
          </h1>
          <p className="text-white/80 text-lg max-w-xl">
            Treatment illustrations across hair transplant, PRP therapy, exosome therapy, and eyebrow restoration. Filter by treatment type or gender to find cases similar to yours.
          </p>
          <p className="text-white/50 text-xs mt-3">
            AI-generated illustrations — not actual patient results. Individual results vary.
          </p>
        </div>
      </div>

      {/* Gallery */}
      <Section>
        <HairResultsGallery />
      </Section>

      {/* How to read results */}
      <Section background="surface-alt">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
              <Camera className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-1">Same lighting matters</h4>
              <p className="text-text-muted text-sm leading-relaxed">
                Before and after photos taken under consistent lighting are the only meaningful comparison — so differences reflect real improvement, not photography tricks.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-1">Results take time</h4>
              <p className="text-text-muted text-sm leading-relaxed">
                Full results take 9–12 months. Look at the timeframe shown — not just the &ldquo;after&rdquo; image — when comparing to your own goals.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
              <Microscope className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-1">Results vary</h4>
              <p className="text-text-muted text-sm leading-relaxed">
                Individual results depend on degree of loss, follicle health, and biological response. These are documented outcomes, not guarantees.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section background="surface">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
            Want to see results for cases like yours?
          </h2>
          <p className="text-text-muted mb-6">
            At your free consultation, we&apos;ll show you relevant examples from cases with similar hair loss patterns and treatment goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {BUSINESS.bookingUrl && (
              <Button href={BUSINESS.bookingUrl} variant="accent">
                Book Free Consultation
              </Button>
            )}
            <Button
              href={`tel:${BUSINESS.phoneRaw}`}
              variant="outline"
            >
              Call {BUSINESS.phone}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
