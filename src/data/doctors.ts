export interface Doctor {
  slug: string;
  name: string;
  title: string;
  credentials: string[];
  specializations: string[];
  bio: string;
  headshotUrl: string;
  bookingUrl?: string;
}

// TODO: Replace placeholder bios and headshot URLs with actual content
export const doctors: Doctor[] = [
  {
    slug: 'dr-sisii',
    name: 'Dr. Sepideh "Sisii" Yadollahi',
    title: 'Aesthetic Physician',
    credentials: [
      'Board Certified',
      'Advanced Aesthetic Medicine',
    ],
    specializations: [
      'Injectables & Neuromodulators',
      'Regenerative Aesthetics (PRP/PRF)',
      'High-Intensity Focused Ultrasound (HiFu)',
      'Medical Weight Loss',
    ],
    bio: 'Dr. SiSii brings extensive expertise in medical aesthetics and regenerative medicine to InfinityU. With a passion for helping patients achieve their aesthetic goals through evidence-based treatments, she specializes in advanced injectable techniques, skin rejuvenation, and personalized treatment plans tailored to each patient\'s unique needs.',
    headshotUrl: '/images/doctors/dr-sisii.png',
  },
  {
    slug: 'dr-mike',
    name: 'Dr. Mike Le',
    title: 'Medical Director',
    credentials: [
      'Board Certified',
      'Advanced Aesthetic Medicine',
    ],
    specializations: [
      'Body Contouring',
      'Radio Frequency Treatments',
      'Sculptra & Dermal Fillers',
      'Medical Weight Loss',
    ],
    bio: 'Dr. Mike is a dedicated aesthetic physician with a focus on body contouring, advanced skin tightening technologies, and comprehensive weight management programs. His approach combines the latest in medical aesthetics with a commitment to natural-looking results that enhance each patient\'s confidence and well-being.',
    headshotUrl: '',
  },
];
