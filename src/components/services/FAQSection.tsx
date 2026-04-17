import { Section } from '@/components/ui/Section';
import { Accordion } from '@/components/ui/Accordion';

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs: { question: string; answer: string }[];
}

export function FAQSection({
  title = 'Frequently Asked Questions',
  subtitle,
  faqs,
}: FAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl mb-3">{title}</h2>
          {subtitle && (
            <p
              className="text-base md:text-lg"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <Accordion items={faqs} />
      </div>
    </Section>
  );
}
