import { Suspense } from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Accordion';
import { weightLossProgram } from '@/data/weight-loss';
import { BUSINESS } from '@/lib/constants';
import { generatePageMetadata } from '@/lib/seo';
import { WEIGHT_LOSS_IMAGES } from '@/lib/media';
import { BMICalculator } from '@/components/weight-loss/BMICalculator';
import { Stethoscope, ClipboardList, Heart, TrendingDown } from 'lucide-react';

export const metadata: Metadata = generatePageMetadata(
  'Medical Weight Loss Program in Huntington Beach',
  'Physician-supervised medical weight loss program at InfinityU Med Spa. Personalized plans, medical support, and sustainable results in Huntington Beach, CA.'
);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Stethoscope,
  ClipboardList,
  Heart,
  TrendingDown,
};

export default function WeightLossPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-primary">
        <Image
          src={WEIGHT_LOSS_IMAGES.hero.src}
          alt={WEIGHT_LOSS_IMAGES.hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />
        <div className="container-custom relative z-10 py-20 text-center">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">New Program</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            {weightLossProgram.headline}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            {weightLossProgram.subheadline}
          </p>
          {BUSINESS.bookingUrl && (
            <Button href={BUSINESS.bookingUrl} variant="accent" size="lg">
              Book Your Consultation
            </Button>
          )}
        </div>
      </section>

      {/* Program Overview */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">Our Approach</h2>
          <p className="text-text-muted max-w-2xl mx-auto">{weightLossProgram.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {weightLossProgram.methodology.map((item) => {
            const Icon = iconMap[item.icon] || Heart;
            return (
              <Card key={item.title} className="text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-text-muted text-sm">{item.description}</p>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* How It Works */}
      <Section background="surface">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg lg:sticky lg:top-24">
            <Image
              src={WEIGHT_LOSS_IMAGES.lifestyle.src}
              alt={WEIGHT_LOSS_IMAGES.lifestyle.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-heading text-3xl font-bold mb-8">How It Works</h2>
            {weightLossProgram.steps.map((step, index) => (
              <div key={step.number} className="flex gap-6 mb-8 last:mb-0">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-accent text-primary-dark font-bold text-lg flex items-center justify-center">
                    {step.number}
                  </div>
                  {index < weightLossProgram.steps.length - 1 && (
                    <div className="w-px h-full bg-border mx-auto mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="font-heading text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-text-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* BMI Calculator */}
      <Section id="bmi-calculator">
        <div className="text-center mb-8">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">
            Free Tool
          </p>
          <h2 className="font-heading text-3xl font-bold mb-4">
            Check Your BMI
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Body Mass Index is a quick screening tool. For a comprehensive
            assessment and personalized plan, schedule a consultation with our
            physicians.
          </p>
        </div>
        <Suspense>
          <BMICalculator />
        </Suspense>
      </Section>

      {/* FAQ */}
      <Section background="surface">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <Accordion items={weightLossProgram.faqs} />
        </div>
      </Section>

      {/* CTA */}
      <section className="gradient-accent py-16">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl font-bold text-primary mb-4">
            Start Your Weight Loss Journey Today
          </h2>
          <p className="text-primary/70 mb-8 max-w-xl mx-auto">
            Take the first step toward a healthier you. Book a consultation to
            learn how our medical weight loss program can help you reach your goals.
          </p>
          {BUSINESS.bookingUrl && (
            <Button href={BUSINESS.bookingUrl} variant="primary" size="lg">
              Schedule Your Assessment
            </Button>
          )}
        </div>
      </section>
    </>
  );
}
