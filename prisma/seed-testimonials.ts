/**
 * Run once to seed the initial 10 curated Google reviews.
 * npx tsx prisma/seed-testimonials.ts
 */
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const INITIAL_TESTIMONIALS = [
  {
    name: 'Christabelle E.',
    rating: 5,
    date: '4 months ago',
    treatment: 'Skin Rejuvenation',
    text: 'I did my skin rejuvenation treatment here and I had the best experience! Minta, the owner, was so sweet. She explained thoroughly a lot of the different procedures that works best for me. I felt really taken cared of. The clinic is very clean and I love the aesthetic. 10/10 would definitely recommend!',
    isActive: true,
    sortOrder: 0,
  },
  {
    name: 'Star A.',
    rating: 5,
    date: '5 months ago',
    treatment: 'HIFU',
    text: "Jennie did an amazing job with my HIFU Treatment. I was surprised how basically painless it was. I'm literally obsessed!",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'J L.',
    rating: 5,
    date: '5 months ago',
    treatment: 'Med Spa Services',
    text: 'Jennie Ramirez walked me through the services along with her recommendations. She was knowledgeable, kind, and the results were immediate. If you are interested in anything they offer, I highly recommend Jennie.',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Zel M.',
    rating: 5,
    date: '6 months ago',
    treatment: 'HIFU',
    text: 'Jenny did the hifu treatment on me and the results were great! The staff is super up to date with aesthetics procedures and are incredibly kind! The owner is also very kind and they offer good deals to loyal clients.',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Antoinette G.',
    rating: 5,
    date: '1 year ago',
    treatment: 'Injectables & Skin Care',
    text: "I love the friendly and welcoming nature of the team here. The nurse practitioner is very knowledgeable and provides excellent recommendations for skin care. I've been going here for years and love this place!",
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'Vivian P.',
    rating: 5,
    date: '1 year ago',
    treatment: 'Aesthetic Treatments',
    text: 'Always a great visit here. The staff is knowledgeable and friendly. The treatments always deliver great results. I appreciate how they explained each step and make sure you are well taken care of. I always leave feeling refreshed.',
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'Bimia H.',
    rating: 5,
    date: '1 year ago',
    treatment: 'Facial Treatments',
    text: "I've been going to this Med Spa for a few years now and it's been an amazing experience with amazing results every time. The women are helpful and beyond knowledgeable about what products are best for my face specifically.",
    isActive: true,
    sortOrder: 6,
  },
  {
    name: 'Nana S.',
    rating: 5,
    date: '1 year ago',
    treatment: 'RF Skin Treatment',
    text: 'Happy with this medical spa — they recommend the right treatment for me. Jenny did my RF skin treatment and I love it.',
    isActive: true,
    sortOrder: 7,
  },
  {
    name: 'Hazem H.',
    rating: 5,
    date: '1 year ago',
    treatment: 'Med Spa Services',
    text: 'Great place with great service! They offer a wide range of services at very reasonable prices. They are very friendly and accommodating. Highly recommend!',
    isActive: true,
    sortOrder: 8,
  },
  {
    name: 'Jimmy',
    rating: 5,
    date: '2 years ago',
    treatment: 'HydraFacial',
    text: 'Tried HydraFacial for the first time from the recommendations of my friends. The care I received was professional and efficient — the team really took the time to understand my skin care habits. Great experience from start to finish. I left the office feeling good and loving the way I look.',
    isActive: true,
    sortOrder: 9,
  },
];

async function main() {
  const existing = await prisma.testimonial.count();
  if (existing > 0) {
    console.log(`${existing} testimonials already exist — skipping seed.`);
    return;
  }

  await prisma.testimonial.createMany({ data: INITIAL_TESTIMONIALS });
  console.log(`Seeded ${INITIAL_TESTIMONIALS.length} testimonials.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
