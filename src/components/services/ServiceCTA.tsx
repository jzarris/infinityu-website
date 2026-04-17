import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';

interface ServiceCTAProps {
  serviceName: string;
}

export function ServiceCTA({ serviceName }: ServiceCTAProps) {
  return (
    <Section background="surface">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
          Interested in {serviceName}?
        </h2>
        <p className="text-text-muted mb-6">
          Schedule a consultation to learn which treatment is right for you.
          Our physicians will create a personalized plan based on your goals.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {BUSINESS.bookingUrl && (
            <Button href={BUSINESS.bookingUrl} variant="accent">
              Book a Consultation
            </Button>
          )}
          <Button href="/contact" variant="outline">
            Ask a Question
          </Button>
        </div>
      </div>
    </Section>
  );
}
