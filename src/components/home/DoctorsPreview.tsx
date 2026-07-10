import Image from 'next/image';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { doctors } from '@/data/doctors';
import { User } from 'lucide-react';

export function DoctorsPreview() {
  return (
    <Section>
      <div className="text-center mb-12">
        <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Our Team</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Meet Our Doctors
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto">
          Board-certified physicians dedicated to helping you achieve your aesthetic goals
          with expertise, compassion, and personalized care.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {doctors.map((doctor) => (
          <Card key={doctor.slug} hover className="text-center">
            {/* Placeholder headshot */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 mx-auto mb-6 flex items-center justify-center">
              {doctor.headshotUrl ? (
                <Image
                  src={doctor.headshotUrl}
                  alt={doctor.name}
                  width={128}
                  height={128}
                  sizes="128px"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-accent/50" />
              )}
            </div>
            <h3 className="font-heading text-2xl font-semibold mb-1">{doctor.name}</h3>
            <p className="text-text-muted mb-4">{doctor.title}</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {doctor.credentials.map((cred) => (
                <Badge key={cred} variant="accent">{cred}</Badge>
              ))}
            </div>
            <p className="text-text-muted text-sm line-clamp-3 mb-6">{doctor.bio}</p>
            <Button href="/doctors" variant="outline" size="sm">
              View Full Profile
            </Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}
