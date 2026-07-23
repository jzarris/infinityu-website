import { Metadata } from 'next';
import { CheckCircle } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { ServiceHero } from '@/components/services/ServiceHero';
import { TreatmentCard } from '@/components/services/TreatmentCard';
import { ServiceCTA } from '@/components/services/ServiceCTA';
import { FAQSection } from '@/components/services/FAQSection';
import { getCategoryInfo, getTreatmentsByCategory } from '@/data/services';
import { generatePageMetadata } from '@/lib/seo';
import { SERVICE_HERO_IMAGES } from '@/lib/media';
import { BUSINESS } from '@/lib/constants';

const category = getCategoryInfo('hormone-wellness')!;

export const metadata: Metadata = generatePageMetadata(
  category.metaTitle,
  category.metaDescription
);

// Paste YouTube video IDs from https://www.purepell.com/testimonials
// e.g. 'dQw4w9WgXcQ' from https://youtube.com/watch?v=dQw4w9WgXcQ
const purepellTestimonialVideoIds: string[] = [
  '7rkz6bOhk6I',
  '9GqpTUMppeI',
  '96yHzzoakvA',
  'vTKk9ARgcgo',
  'awa8WCc9ZfY',
  '2AUyaBA7w6k',
];

const bhrtBenefits = [
  'Better sleep, less fatigue & more energy',
  'Enhanced libido, sensitivity & performance',
  'Reduced or eliminated hot flashes & night sweats',
  'Increased weight loss & muscle tone',
  '24/7 consistent delivery — no daily pills or creams',
];

export default function HormoneWellnessPage() {
  const treatments = getTreatmentsByCategory('hormone-wellness');

  return (
    <>
      <ServiceHero
        category={category.name}
        headline={category.headline}
        description={category.description}
        image={SERVICE_HERO_IMAGES['hormone-wellness']}
      />

      {/* Purepell Certified Provider */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p
              className="text-sm font-medium uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-accent-dark)' }}
            >
              Purepell Certified Provider
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-5">
              Bioidentical Hormone Replacement Therapy for Men & Women
            </h2>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-text-muted)' }}>
              InfinityU is a Purepell Certified Provider — specially trained in Bioidentical Hormone
              Replacement Therapy (BHRT) using Purepell&apos;s precision-compounded hormone pellets.
              Treatments are tailored to each individual patient based on lab work and health history,
              because every person&apos;s hormone needs are unique.
            </p>
            <ul className="space-y-3 mb-8">
              {bhrtBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            {BUSINESS.bookingUrl && (
              <Button href={BUSINESS.bookingUrl} variant="accent" size="lg">
                Schedule a Consultation
              </Button>
            )}
          </div>

          <div
            className="rounded-2xl p-8 border"
            style={{ background: 'var(--color-surface-alt)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-heading text-xl font-semibold mb-3">
              Why Pellets?
            </h3>
            <p className="leading-relaxed mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Unlike creams, patches, and injections, Purepell pellets release bioidentical hormones
              24/7 in a dynamic, physiologic pattern that responds to your body&apos;s actual activity
              and needs — delivering consistent levels without peaks and troughs. Most patients only
              require new pellets 3 to 4 times per year.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { stat: '24/7', label: 'Consistent delivery' },
                { stat: '3–4×', label: 'Per year' },
                { stat: '2–4 wks', label: 'To feel results' },
              ].map(({ stat, label }) => (
                <div
                  key={stat}
                  className="rounded-xl py-4 px-2"
                  style={{ background: 'var(--color-surface)' }}
                >
                  <p className="text-xl font-bold mb-1" style={{ color: 'var(--color-accent)' }}>
                    {stat}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Treatments */}
      <Section background="surface">
        <div className="space-y-6">
          {treatments.map((treatment) => (
            <TreatmentCard key={treatment.slug} treatment={treatment} />
          ))}
        </div>
      </Section>

      {/* Patient Testimonials */}
      {purepellTestimonialVideoIds.length > 0 && (
        <Section>
          <div className="text-center mb-10">
            <p
              className="text-sm font-medium uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-accent-dark)' }}
            >
              Real Patient Stories
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              What Purepell Patients Are Saying
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Don&apos;t just take it from us — hear directly from real patients about their
              experiences with bioidentical hormone optimization.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {purepellTestimonialVideoIds.map((videoId) => (
              <div key={videoId} className="rounded-xl overflow-hidden aspect-video shadow-sm border" style={{ borderColor: 'var(--color-border)' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Purepell patient testimonial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      <FAQSection
        subtitle={`Common questions about ${category.name.toLowerCase()} at InfinityU.`}
        faqs={category.faqs}
      />
      <ServiceCTA serviceName={category.name} />
    </>
  );
}
