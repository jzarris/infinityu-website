/**
 * Versioned consent text for the body photo simulator. The exact text shown is
 * stored with every consent record, so edit by adding a new version rather than
 * rewriting history. Review with whoever owns the privacy policy before launch.
 */

export const PHOTO_CONSENT_VERSION = '2026-09-20.1';

export const PHOTO_CONSENT_PURPOSES = ['simulation'] as const;

export const PHOTO_CONSENT_TEXT = `I agree that MeltAwayMD may store the full-body photo I provide and use it to produce a simulated image of how my body might look at a goal weight I choose.

I understand that:
- The result is a computer-generated simulation, not a prediction or a promise. Real results vary from person to person.
- My photo and the simulated images are stored encrypted on MeltAwayMD systems and are processed by a contracted computing provider to generate the simulation. They are not used for advertising, sold, or shared with anyone else.
- My photo and images are kept for a limited time and then deleted automatically. I can delete them myself at any time from the simulator page, and staff can delete them on request.
- My photo is not used to train or improve any model.
- Taking or uploading a photo is optional and does not affect any care or program decision.`;

export function consentSummary() {
  return { version: PHOTO_CONSENT_VERSION, text: PHOTO_CONSENT_TEXT, purposes: [...PHOTO_CONSENT_PURPOSES] };
}
