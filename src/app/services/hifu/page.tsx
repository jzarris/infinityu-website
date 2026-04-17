import { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { ServiceHero } from '@/components/services/ServiceHero';
import { TreatmentCard } from '@/components/services/TreatmentCard';
import { ServiceCTA } from '@/components/services/ServiceCTA';
import { FAQSection } from '@/components/services/FAQSection';
import { getCategoryInfo, getTreatmentsByCategory } from '@/data/services';
import { generatePageMetadata } from '@/lib/seo';
import { SERVICE_HERO_IMAGES } from '@/lib/media';

const category = getCategoryInfo('hifu')!;

export const metadata: Metadata = generatePageMetadata(
  category.metaTitle,
  category.metaDescription
);

export default function HifuPage() {
  const treatments = getTreatmentsByCategory('hifu');

  return (
    <>
      <ServiceHero
        category={category.name}
        headline={category.headline}
        description={category.description}
        image={SERVICE_HERO_IMAGES.hifu}
      />
      <Section>
        <div className="space-y-6">
          {treatments.map((treatment) => (
            <TreatmentCard key={treatment.slug} treatment={treatment} />
          ))}
        </div>
      </Section>
      <FAQSection
        subtitle="Everything you might want to know about HiFu before booking."
        faqs={category.faqs}
      />
      <ServiceCTA serviceName={category.name} />
    </>
  );
}
