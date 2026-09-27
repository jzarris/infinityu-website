import { Metadata } from 'next';
import { HealthAssessment } from '@/components/intake';
import { Card, CardContent } from '@/components/ui/Card';
import { Shield, Clock, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Health Assessment',
  description:
    'Complete our comprehensive health assessment to begin your personalized wellness journey. Our licensed providers will review your responses to determine the best treatment options for you.',
};

const features = [
  {
    icon: Clock,
    text: 'Takes about 10-15 minutes',
  },
  {
    icon: Shield,
    text: 'Reviewed by licensed providers',
  },
  {
    icon: Lock,
    text: 'HIPAA-compliant & secure',
  },
];

export default function IntakePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-[var(--color-surface)] to-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium rounded-full mb-4">
              Step 1 of Your Journey
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
              Health Assessment
            </h1>
            <p className="text-lg text-[var(--color-text-muted)] mb-6">
              Answer a few questions about your health and wellness goals. Based on your responses,
              we&apos;ll determine which treatments may be right for you.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <feature.icon className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Section */}
      <section className="section-padding pt-8">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <Card variant="elevated">
              <CardContent className="p-6 md:p-10">
                <HealthAssessment />
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="mt-8 p-6 bg-[var(--color-surface)] rounded-[var(--radius-lg)] text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                <strong>Important:</strong> Medical services are provided independently by licensed
                medical providers. Completing this assessment does not guarantee approval for any
                treatment. A licensed provider will review your information and determine if our
                programs are appropriate for your individual needs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
