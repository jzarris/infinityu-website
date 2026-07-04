import { Metadata } from 'next';

import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Syringe, Waves, Zap, Sparkles, Scissors, Sun, Heart } from 'lucide-react';
import { serviceCategories } from '@/data/services';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Our Services',
  'Explore our full range of aesthetic treatments including injectables, hair restoration, laser treatments, HiFu, radio frequency, body contouring, and hormone & wellness at InfinityU Med Spa in Huntington Beach.'
);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Syringe,
  Waves,
  Zap,
  Sparkles,
  Scissors,
  Sun,
  Heart,
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-primary py-20">
        <div className="container-custom text-center">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">What We Offer</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            Our Services
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Advanced aesthetic treatments delivered by board-certified physicians,
            tailored to your unique goals and needs.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {serviceCategories.map((category) => {
            const Icon = iconMap[category.icon] || Sparkles;
            return (
              <Link key={category.slug} href={`/services/${category.slug}`}>
                <Card hover className="h-full group">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-7 w-7 text-accent" />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-semibold mb-2">{category.name}</h2>
                      <p className="text-text-muted text-sm mb-4">{category.description}</p>
                      <span className="inline-flex items-center text-accent text-sm font-medium">
                        View treatments <ArrowRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* Weight Loss CTA */}
      <Section background="surface">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-4">Medical Weight Loss</h2>
          <p className="text-text-muted mb-6">
            Our physician-supervised weight loss program combines personalized plans with
            medical expertise for sustainable results.
          </p>
          <Button href="/weight-loss" variant="accent">
            Learn About Our Weight Loss Program
          </Button>
        </div>
      </Section>
    </>
  );
}
