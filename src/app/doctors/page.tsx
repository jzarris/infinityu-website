import { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { doctors } from '@/data/doctors';
import { generatePageMetadata } from '@/lib/seo';
import { User, Award } from 'lucide-react';

export const metadata: Metadata = generatePageMetadata(
  'Our Doctors',
  'Meet the board-certified physicians at InfinityU Med Spa in Huntington Beach. Expertise in aesthetic medicine, injectables, body contouring, and weight loss.'
);

export default function DoctorsPage() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-primary py-20">
        <div className="container-custom text-center">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Our Team</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            Meet Our Doctors
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Our board-certified physicians combine years of experience with a genuine
            passion for helping patients look and feel their best.
          </p>
        </div>
      </section>

      {/* Doctor Profiles */}
      {doctors.map((doctor, index) => (
        <Section key={doctor.slug} background={index % 2 === 0 ? 'white' : 'surface'}>
          <div className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
            {/* Headshot */}
            <div className="shrink-0">
              <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                {doctor.headshotUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={doctor.headshotUrl}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-24 w-24 text-accent/40" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2">{doctor.name}</h2>
              <p className="text-accent font-medium text-lg mb-4">{doctor.title}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {doctor.credentials.map((cred) => (
                  <Badge key={cred} variant="accent">
                    <Award className="h-3.5 w-3.5 mr-1" />
                    {cred}
                  </Badge>
                ))}
              </div>

              <p className="text-text-muted leading-relaxed mb-6">{doctor.bio}</p>

              <div className="mb-8">
                <h3 className="font-semibold text-sm mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.specializations.map((spec) => (
                    <Badge key={spec} variant="outline">{spec}</Badge>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </Section>
      ))}
    </>
  );
}
