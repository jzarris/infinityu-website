import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';
import { HOME_IMAGES } from '@/lib/media';

export function CTABand() {
  return (
    <section className="relative overflow-hidden py-20">
      <Image
        src={HOME_IMAGES.ctaBackground.src}
        alt={HOME_IMAGES.ctaBackground.alt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(120deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <div className="container-custom relative z-10 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Start Your Transformation?
        </h2>
        <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
          Book a complimentary consultation and discover the treatments that are right for you.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {BUSINESS.bookingUrl && (
            <Button href={BUSINESS.bookingUrl} variant="accent" size="lg">
              Book Your Consultation
            </Button>
          )}
          <Button
            href="/contact"
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-primary"
          >
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
}
