import Image from 'next/image';
import { ShieldCheck, UserCheck, Microscope, MapPin } from 'lucide-react';
import { HOME_IMAGES } from '@/lib/media';

const reasons = [
  {
    icon: ShieldCheck,
    title: 'Board-Certified Physicians',
    description: 'Our doctors bring years of specialized training and expertise in medical aesthetics.',
  },
  {
    icon: UserCheck,
    title: 'Personalized Care',
    description: 'Every treatment plan is tailored to your unique goals, anatomy, and lifestyle.',
  },
  {
    icon: Microscope,
    title: 'Advanced Technology',
    description: 'We invest in the latest FDA-approved devices and evidence-based treatments.',
  },
  {
    icon: MapPin,
    title: 'Huntington Beach Location',
    description: 'Conveniently located on Main Street in the heart of Huntington Beach.',
  },
];

export function WhyUs() {
  return (
    <section className="relative gradient-primary section-padding overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Image */}
          <div className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl order-last lg:order-first">
            <Image
              src={HOME_IMAGES.whyUs.src}
              alt={HOME_IMAGES.whyUs.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>

          {/* Copy + reasons */}
          <div>
            <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">
              Why Choose Us
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              The InfinityU Difference
            </h2>
            <p className="text-white/70 mb-10 max-w-lg">
              We combine medical excellence with a warm, welcoming environment to
              deliver results that exceed your expectations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <div key={reason.title} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-semibold text-white mb-1 drop-shadow-sm">
                        {reason.title}
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
