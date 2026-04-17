export type HeadlineId = 'pieces' | 'reveal' | 'focus' | 'refine' | 'slide';

export interface Headline {
  id: HeadlineId;
  label: string;
  lead: string;
  accent: string;
}

export const HEADLINES: Headline[] = [
  {
    id: 'pieces',
    label: 'Every piece of you',
    lead: 'Every piece of you,',
    accent: 'in its right place.',
  },
  {
    id: 'reveal',
    label: 'Reveal the version',
    lead: 'Reveal the version of you',
    accent: "you've been waiting for.",
  },
  {
    id: 'focus',
    label: 'Brought into focus',
    lead: 'Beauty,',
    accent: 'brought into focus.',
  },
  {
    id: 'refine',
    label: 'Refine. Restore. Reveal.',
    lead: 'Refine. Restore.',
    accent: 'Reveal.',
  },
  {
    id: 'slide',
    label: 'Slide into your best self',
    lead: 'Slide into',
    accent: 'your best self.',
  },
];

export const DEFAULT_HEADLINE: HeadlineId = 'pieces';
