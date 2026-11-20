import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';
import { HeroHeadline } from '@/components/home/HeroHeadline';
import { InteractivePuzzle } from '@/components/home/InteractivePuzzle';

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
            {/* Black Friday promo button */}
            <style>{`
              .bf-btn{display:inline-flex;align-items:center;gap:20px;padding:22px 44px;background:#0b0b0b;border:3px solid #ff1f5a;border-radius:999px;color:#ff1f5a;text-decoration:none;font-family:Inter,system-ui,sans-serif;box-shadow:0 0 18px rgba(255,31,90,.55),0 0 42px rgba(255,31,90,.3);transition:transform .15s ease,box-shadow .15s ease;animation:bf-pulse 2.4s ease-in-out infinite;margin-bottom:1.5rem;}
              .bf-btn:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 0 26px rgba(255,31,90,.8),0 0 64px rgba(255,31,90,.45);}
              .bf-icon{font-size:44px;line-height:1}
              .bf-title{display:block;font-size:34px;font-weight:800;letter-spacing:-.5px;line-height:1.05}
              .bf-sub{display:block;font-size:16px;font-weight:600;color:#fff;margin-top:6px;letter-spacing:.5px}
              .bf-arrow{font-size:34px;transition:transform .15s}
              .bf-btn:hover .bf-arrow{transform:translateX(5px)}
              @keyframes bf-pulse{0%,100%{box-shadow:0 0 18px rgba(255,31,90,.55),0 0 42px rgba(255,31,90,.3)}50%{box-shadow:0 0 28px rgba(255,31,90,.85),0 0 70px rgba(255,31,90,.45)}}
              @media(prefers-reduced-motion:reduce){.bf-btn{animation:none}}
              @media(max-width:600px){.bf-btn{padding:16px 28px;gap:14px}.bf-icon{font-size:32px}.bf-title{font-size:24px}.bf-sub{font-size:13px}.bf-arrow{font-size:24px}}
            `}</style>
            <a className="bf-btn animate-fade-in" href="https://shop.infinity-u.com/" target="_blank" rel="noopener noreferrer">
              <span className="bf-icon">🛍️</span>
              <span>
                <span className="bf-title">Black Friday Deals</span>
                <span className="bf-sub">UP TO 50% OFF · SHOP NOW</span>
              </span>
              <span className="bf-arrow">→</span>
            </a>
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
              <a
                href={BUSINESS.shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 hover:opacity-70 transition-opacity self-center"
                style={{ color: 'var(--color-accent-dark)' }}
              >
                See our latest deals →
              </a>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:ml-auto lg:mr-0">
            <InteractivePuzzle
              imageSrc="/images/tilepuzzle.jpg"
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
