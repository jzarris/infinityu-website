import { Camera } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

export function BeforeAfterPreview() {
  return (
    <Section background="surface">
      <div className="text-center mb-12">
        <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Results</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Before &amp; After
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto">
          We&apos;re curating a gallery of real patient results — shared with
          full consent. Check back soon!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm bg-gradient-to-br from-primary/5 to-accent/10 border border-border flex flex-col items-center justify-center gap-3"
          >
            <Camera className="h-10 w-10 text-accent/40" />
            <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider bg-accent/10 text-accent">
              Coming Soon
            </span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button href="/gallery" variant="outline">
          View Full Gallery
        </Button>
      </div>
    </Section>
  );
}
