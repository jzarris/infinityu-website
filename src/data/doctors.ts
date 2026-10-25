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
    slug: 'dr-mike',
    name: 'Dr. Mike Le',
    title: 'Medical Director',
    credentials: [
      'Board Certified',
      'Advanced Aesthetic Medicine',
    ],
    specializations: [
      'Bioidentical Hormone Replacement Therapy (BHRT)',
      'Regenerative Medicine',
      'Hair Restoration',
      'Body Contouring',
      'Radio Frequency Treatments',
      'Sculptra & Dermal Fillers',
      'Medical Weight Loss',
    ],
    bio: 'Dr. Mike is a dedicated aesthetic and regenerative medicine physician with expertise in Bioidentical Hormone Replacement Therapy (BHRT), body contouring, advanced skin tightening technologies, and hair restoration. He performs FUE hair transplants and non-surgical hair restoration using PRP and exosome therapy — building personalized treatment plans based on each patient\'s pattern of loss and goals. As a Purepell Certified Provider, he also specializes in precision hormone optimization for men and women alongside comprehensive weight management programs. His approach integrates the latest in regenerative and aesthetic medicine with a commitment to natural-looking results that enhance each patient\'s confidence and well-being.',
    headshotUrl: '/images/doctors/dr_le.png',
  },
];
