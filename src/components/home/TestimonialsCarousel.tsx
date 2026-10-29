import { prisma } from '@/lib/prisma';
import { TestimonialsCarouselClient } from './TestimonialsCarouselClient';

export async function TestimonialsCarousel() {
  const reviews = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, rating: true, date: true, treatment: true, text: true },
  });

  if (reviews.length === 0) return null;

  return (
    <section className="section-padding bg-[#FDF9FB]">
      <div className="container-custom">
        <div className="text-center mb-12">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">
            Patient Stories
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#3A1B30]">
            What Our Patients Say
          </h2>
        </div>
        <TestimonialsCarouselClient reviews={reviews} />
      </div>
    </section>
  );
}
