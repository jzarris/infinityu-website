export const BUSINESS = {
  name: 'InfinityU',
  legalName: 'InfinityU Med Spa',
  tagline: 'Elevate Your Natural Beauty',
  description: 'Premier medical spa in Huntington Beach offering advanced aesthetic treatments, injectables, body contouring, and medical weight loss programs.',
  phone: '(714) 660-0702',
  phoneRaw: '+17146600702',
  email: 'services@infinity-u.com',
  address: {
    street: '428 Main Street Suite 101',
    city: 'Huntington Beach',
    state: 'CA',
    zip: '92648',
    country: 'US',
    full: '428 Main Street Suite 101, Huntington Beach, CA 92648',
  },
  hours: {
    display: 'Monday - Friday, 10 AM - 6 PM',
    note: 'By appointment only',
    structured: 'Mo-Fr 10:00-18:00',
  },
  social: {
    instagram: 'https://www.instagram.com/infinityu_medspa/',
    facebook: '',
  },
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://infinity-u.com',
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || '',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Injectables & Regenerative', href: '/services/injectables' },
      { label: 'HiFu', href: '/services/hifu' },
      { label: 'Radio Frequency', href: '/services/radio-frequency' },
      { label: 'Body Contouring', href: '/services/body-contouring' },
    ],
  },
  { label: 'Weight Loss', href: '/weight-loss' },
  { label: 'Our Doctors', href: '/doctors' },
  // { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
] as const;
