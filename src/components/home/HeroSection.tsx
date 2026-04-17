import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';
import { TilePuzzle } from '@/components/TilePuzzle';
import { HeroHeadline } from '@/components/home/HeroHeadline';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft themed backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, var(--color-surface) 0%, var(--color-background) 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(60% 50% at 85% 20%, var(--color-accent-light) 0%, transparent 70%)',
        }}
      />

      <div className="container-custom relative z-10 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          {/* Copy */}
          <div className="max-w-xl">
            <p
              className="text-sm font-medium uppercase tracking-wider mb-4 animate-fade-in"
              style={{ color: 'var(--color-accent-dark)' }}
            >
              Huntington Beach Premier Med Spa
            </p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-6 leading-[1.05] animate-fade-in">
              <HeroHeadline />
            </h1>
            <p
              className="text-lg md:text-xl mb-10 leading-relaxed max-w-lg animate-fade-in"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Advanced aesthetic treatments and personalized care — from injectables and
              HiFu to body contouring and medical weight loss.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in">
              {BUSINESS.bookingUrl && (
                <Button href={BUSINESS.bookingUrl} variant="accent" size="lg">
                  Book a Consultation
                </Button>
              )}
              <Button href="/services" variant="outline" size="lg">
                Explore Services
              </Button>
            </div>
          </div>

          {/* Tile puzzle */}
          <div className="mx-auto w-full max-w-md lg:ml-auto lg:mr-0">
            <TilePuzzle
              imageSrc="/images/tilepuzzle.png"
              cols={3}
              rows={4}
              alt="InfinityU feature image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
