import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Syringe, Waves, Zap, Sparkles, Scale, Scissors, Sun, Heart, ArrowRight } from 'lucide-react';
import { SERVICE_CARD_IMAGES } from '@/lib/media';

const services = [
  {
    name: 'Injectables & Regenerative',
    description: 'Botox, fillers, PRP, PRF, Sculptra, P-Shot, O-Shot, and more.',
    href: '/services/injectables',
    icon: Syringe,
    image: SERVICE_CARD_IMAGES.injectables,
  },
  {
    name: 'Hair Restoration',
    description: 'Hair transplant, exosome therapy, and PRP for lasting hair regrowth.',
    href: '/services/hair-restoration',
    icon: Scissors,
    image: SERVICE_CARD_IMAGES['hair-restoration'],
  },
  {
    name: 'Laser Treatments',
    description: 'Laser facials and laser hair removal with precision light energy.',
    href: '/services/laser',
    icon: Sun,
    image: SERVICE_CARD_IMAGES['laser'],
  },
  {
    name: 'HiFu',
    description: 'Non-invasive ultrasound skin tightening for face and body.',
    href: '/services/hifu',
    icon: Waves,
    image: SERVICE_CARD_IMAGES.hifu,
  },
  {
    name: 'Radio Frequency',
    description: 'Advanced RF technology for skin tightening and contouring.',
    href: '/services/radio-frequency',
    icon: Zap,
    image: SERVICE_CARD_IMAGES['radio-frequency'],
  },
  {
    name: 'Body Contouring',
    description: 'Sculpt and reshape your body without surgery.',
    href: '/services/body-contouring',
    icon: Sparkles,
    image: SERVICE_CARD_IMAGES['body-contouring'],
  },
  {
    name: 'Hormone Optimization',
    description: 'Purepell Certified BHRT, anti-aging protocols, longevity programs, IV infusions, and stem cell therapy.',
    href: '/services/hormone-wellness',
    icon: Heart,
    image: SERVICE_CARD_IMAGES['hormone-wellness'],
  },
  {
    name: 'Weight Loss',
    description: 'Physician-supervised medical weight management programs.',
    href: '/weight-loss',
    icon: Scale,
    image: SERVICE_CARD_IMAGES['weight-loss'],
  },
];

export function ServicesOverview() {
  return (
    <Section background="surface">
      <div className="text-center mb-12">
        <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Our Services</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Comprehensive Aesthetic Solutions
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto">
          From injectables to body contouring, our expert team offers a full range of
          treatments tailored to your unique goals.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.name}
              href={service.href}
              className="group relative overflow-hidden rounded-xl bg-white border border-border hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={service.image.src}
                  alt={service.image.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)',
                  }}
                />
                <div className="absolute top-4 left-4 w-11 h-11 rounded-lg bg-white/95 backdrop-blur flex items-center justify-center shadow-sm">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-heading text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-text-muted text-sm mb-4 flex-1">{service.description}</p>
                <span className="inline-flex items-center text-accent text-sm font-medium group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
