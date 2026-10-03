/**
 * Legal acknowledgments shown as the final questionnaire step, before the
 * results screen and the simulator. The exact text shown is recorded with the
 * submission together with the version and the time of acceptance, so a later
 * edit to this file cannot change what a person agreed to. Edit by adding a
 * new version string, never by silently rewording.
 *
 * On by default for every site that shares this intake. Set
 * NEXT_PUBLIC_INTAKE_RESULTS_ACKNOWLEDGMENT=false to turn it off, and
 * NEXT_PUBLIC_COMPANY_NAME to change the company named in the text
 * (default MeltAwayMD; Infinity-U sets "InfinityU"). Both are read on the
 * client and the server.
 */

export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'MeltAwayMD';

export interface IntakeAcknowledgment {
  id: string;
  version: string;
  title: string;
  description: string;
  paragraphs: string[];
  checkboxLabel: string;
}

export interface AcknowledgmentRecord {
  id: string;
  version: string;
  title: string;
  text: string;
  checkboxLabel: string;
  acceptedAt: string;
}

export const RESULTS_REFUND_ACKNOWLEDGMENT: IntakeAcknowledgment = {
  id: 'results_refund',
  version: '2026-10-03.1',
  title: 'Results & Refund Acknowledgment',
  description: 'Please read the following and confirm before continuing.',
  paragraphs: [
    `Results are not guaranteed. ${COMPANY_NAME}, its medical director, providers, and staff make no promise, guarantee, or warranty about the results of GLP-based weight loss treatment, including how much weight you will lose, how quickly, whether you will lose any weight at all, or whether any weight lost will stay off. Results vary significantly from person to person, and some patients lose little or no weight even when following all instructions. Testimonials, before-and-after photos, and other patients' experiences do not predict your results. Weight regain is common if treatment is stopped.`,
    'All payments are final. All payments for services provided and for medications dispensed or shipped are final and non-refundable. No refunds, credits, or exchanges will be given for any reason, including your results, lack of results, dissatisfaction with your results, side effects, a change or discontinuation of your medication, your decision to stop treatment, or medication you did not use. Dispensed or shipped medications cannot be returned for safety reasons.',
  ],
  checkboxLabel:
    'I have read and understand that results are not guaranteed and that all payments for services provided and medications dispensed or shipped are final and non-refundable.',
};

export const RESULTS_ACKNOWLEDGMENT_QUESTION_ID = 'acknowledgeResultsRefund';

export function isResultsAcknowledgmentEnabled(): boolean {
  return process.env.NEXT_PUBLIC_INTAKE_RESULTS_ACKNOWLEDGMENT !== 'false';
}

export function acknowledgmentRecord(ack: IntakeAcknowledgment, acceptedAt: string): AcknowledgmentRecord {
  return {
    id: ack.id,
    version: ack.version,
    title: ack.title,
    text: ack.paragraphs.join('\n\n'),
    checkboxLabel: ack.checkboxLabel,
    acceptedAt,
  };
}
