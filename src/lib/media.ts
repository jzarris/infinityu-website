/**
 * Centralized image slots for the site.
 *
 * Images are stored locally in public/images/. To replace an image,
 * drop a new file at the same path (or update the path here).
 */

export interface MediaAsset {
  src: string;
  alt: string;
}

/** Homepage service overview cards. */
export const SERVICE_CARD_IMAGES: Record<string, MediaAsset> = {
  injectables: {
    src: '/images/services/card-injectables.jpg',
    alt: 'Dermatologist administering a cosmetic injection to a patient\'s forehead',
  },
  hifu: {
    src: '/images/services/card-hifu.jpg',
    alt: 'Aesthetic provider performing a device-based facial treatment in a clinic',
  },
  'radio-frequency': {
    src: '/images/services/card-radio-frequency.jpg',
    alt: 'Professional cosmetic skin treatment being performed with a handheld device',
  },
  'body-contouring': {
    src: '/images/services/card-body-contouring.jpg',
    alt: 'Toned waist being measured with a tape measure',
  },
  'weight-loss': {
    src: '/images/services/card-weight-loss.jpg',
    alt: 'Healthy lifestyle and nutrition',
  },
};

/** Service category hero background images. */
export const SERVICE_HERO_IMAGES: Record<string, MediaAsset> = {
  injectables: {
    src: '/images/services/hero-injectables.jpg',
    alt: 'Portrait showcasing smooth radiant skin',
  },
  hifu: {
    src: '/images/services/hero-hifu.jpg',
    alt: 'Close portrait with bright lifted skin',
  },
  'radio-frequency': {
    src: '/images/services/hero-radio-frequency.jpg',
    alt: 'Radiant skin in soft natural light',
  },
  'body-contouring': {
    src: '/images/services/hero-body-contouring.jpg',
    alt: 'Sculpted figure in studio light',
  },
};

/** Homepage visual accents. */
export const HOME_IMAGES = {
  whyUs: {
    src: '/images/home/why-us.jpg',
    alt: 'Calm modern spa treatment room',
  } satisfies MediaAsset,
  ctaBackground: {
    src: '/images/home/cta-background.jpg',
    alt: 'Warm spa ambiance',
  } satisfies MediaAsset,
};

/** Weight loss page imagery. */
export const WEIGHT_LOSS_IMAGES = {
  hero: {
    src: '/images/weight-loss/hero.jpg',
    alt: 'Person stepping on a scale, representing a weight loss journey',
  } satisfies MediaAsset,
  lifestyle: {
    src: '/images/weight-loss/lifestyle.jpg',
    alt: 'Active healthy lifestyle',
  } satisfies MediaAsset,
};

/** Contact page imagery. */
export const CONTACT_IMAGES = {
  hero: {
    src: '/images/contact/hero.jpg',
    alt: 'Huntington Beach coast at golden hour',
  } satisfies MediaAsset,
};
