export type ThemeId =
  | 'clinical'
  | 'editorial'
  | 'organic'
  | 'gradient'
  | 'spa';

export interface Theme {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  preview: {
    primary: string;
    accent: string;
    background: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'spa',
    name: 'Spa Minimalism',
    tagline: 'Pink Beauty & Wellness',
    description: 'Plum ink with rose and berry accents. Cormorant serif + Inter. Warm and on-brand.',
    preview: {
      primary: '#3A1B30',
      accent: '#A32463',
      background: '#FDF9FB',
    },
  },
  {
    id: 'editorial',
    name: 'Editorial Luxury',
    tagline: 'Magazine Refined',
    description: 'Deep indigo on cream with emerald CTAs. Playfair serif + Inter. Sophisticated and magazine-like.',
    preview: {
      primary: '#1E1B3A',
      accent: '#5B7C3F',
      background: '#F5F0E8',
    },
  },
  {
    id: 'clinical',
    name: 'Clean Clinical',
    tagline: 'Apple-Inspired',
    description: 'Ink navy with sage accent on white. Manrope throughout. Confident and minimal.',
    preview: {
      primary: '#1A1F3A',
      accent: '#8FA876',
      background: '#FFFFFF',
    },
  },
  {
    id: 'organic',
    name: 'Organic Wellness',
    tagline: 'Botanical Calm',
    description: 'Deep plum with sage on warm cream. DM Serif + DM Sans. Soft, natural, calming.',
    preview: {
      primary: '#3B2E5A',
      accent: '#9BAE84',
      background: '#F4EFE6',
    },
  },
  {
    id: 'gradient',
    name: 'Bold Gradient',
    tagline: 'Modern & Youthful',
    description: 'Pure white with logo-color gradients. Inter bold. Energetic and social-forward.',
    preview: {
      primary: '#0A0A0A',
      accent: '#84B341',
      background: '#FFFFFF',
    },
  },
];

export const DEFAULT_THEME: ThemeId = 'spa';
