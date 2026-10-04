import { getSettings } from './settings';

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Weight Management',
  anti_aging: 'Anti-Aging & Longevity',
  energy_wellness: 'Energy & Wellness',
  recovery_healing: 'Recovery & Healing',
  cognitive_mood: 'Cognitive & Mood Support',
};

const PRODUCT_LABELS: Record<string, string> = {
  tirzepatide: 'GLP-1/GIP Therapy',
  semaglutide: 'GLP-1 Therapy',
  aod9604: 'Fat Metabolism Peptide',
  lipo_b: 'Lipotropic Injection',
  nad_plus: 'NAD+ Therapy',
  sermorelin: 'Growth Hormone Peptide',
  glutathione: 'Antioxidant Therapy',
  mots_c: 'Metabolic Peptide',
  ghk_cu: 'Copper Peptide',
  bpc157_tb500: 'Healing Peptides',
  semax_selank: 'Cognitive Peptides',
};

async function getResendApiKey(): Promise<string | null> {
  const settings = await getSettings();
  return settings.resend_api_key || process.env.RESEND_API_KEY || null;
}

export async function isEmailConfigured(): Promise<boolean> {
  return !!(await getResendApiKey());
}

export interface IntakeNotificationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  state: string;
  biologicalSex?: string;
  selectedGoals: string[];
  eligibleProducts: string[];
  ineligibleProducts: Array<{ productId: string; reason: string }>;
  healthSummary: string;
  submissionLanguage?: string;
  acknowledgmentSigned: boolean;
  bmi?: number;
}

export async function sendIntakeNotificationEmail(
  data: IntakeNotificationData,
  to: string,
): Promise<{ success: boolean; error?: string }> {
  const apiKey = await getResendApiKey();
  if (!apiKey) return { success: false, error: 'Resend API key not configured' };

  const goalList = data.selectedGoals.map((g) => GOAL_LABELS[g] ?? g).join(', ');
  const eligibleList = data.eligibleProducts.length
    ? data.eligibleProducts.map((p) => PRODUCT_LABELS[p] ?? p).join(', ')
    : 'None identified';
  const ineligibleRows = data.ineligibleProducts
    .map((p) => `<li><strong>${PRODUCT_LABELS[p.productId] ?? p.productId}:</strong> ${p.reason}</li>`)
    .join('');
  const langNote = data.submissionLanguage && data.submissionLanguage !== 'en'
    ? `<p><strong>Submission Language:</strong> ${data.submissionLanguage.toUpperCase()}</p>`
    : '';

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: 'InfinityU <noreply@infinity-u.com>',
      to,
      replyTo: data.email,
      subject: `New Health Assessment: ${data.firstName} ${data.lastName} — ${goalList}`,
      html: `
        <div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#1a1a1a">
          <h2 style="margin:0 0 4px">New Health Assessment Submission</h2>
          <p style="margin:0 0 24px;color:#666">Submitted via InfinityU intake questionnaire</p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:6px 0;color:#666;width:160px">Name</td><td style="padding:6px 0"><strong>${data.firstName} ${data.lastName}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#666">Email</td><td style="padding:6px 0"><a href="mailto:${data.email}">${data.email}</a></td></tr>
            <tr><td style="padding:6px 0;color:#666">Phone</td><td style="padding:6px 0">${data.phone}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Date of Birth</td><td style="padding:6px 0">${data.dateOfBirth}</td></tr>
            <tr><td style="padding:6px 0;color:#666">State</td><td style="padding:6px 0">${data.state}</td></tr>
            ${data.biologicalSex ? `<tr><td style="padding:6px 0;color:#666">Biological Sex</td><td style="padding:6px 0">${data.biologicalSex}</td></tr>` : ''}
            ${data.bmi ? `<tr><td style="padding:6px 0;color:#666">BMI</td><td style="padding:6px 0">${data.bmi.toFixed(1)}</td></tr>` : ''}
          </table>

          ${langNote}

          <h3 style="margin:0 0 8px">Wellness Goals</h3>
          <p style="margin:0 0 24px">${goalList}</p>

          <h3 style="margin:0 0 8px">Potentially Eligible</h3>
          <p style="margin:0 0 24px;color:#15803d">${eligibleList}</p>

          ${ineligibleRows ? `<h3 style="margin:0 0 8px">Not Eligible</h3><ul style="margin:0 0 24px;color:#b91c1c;padding-left:20px">${ineligibleRows}</ul>` : ''}

          <h3 style="margin:0 0 8px">Acknowledgment</h3>
          <p style="margin:0 0 24px">${data.acknowledgmentSigned ? '✅ Results &amp; Refund Acknowledgment signed' : '⚠️ No acknowledgment recorded'}</p>

          <h3 style="margin:0 0 8px">Health Summary</h3>
          <pre style="background:#f5f5f5;padding:16px;border-radius:6px;font-size:12px;line-height:1.6;white-space:pre-wrap;overflow-x:auto;margin:0 0 24px">${data.healthSummary}</pre>

          <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0" />
          <p style="color:#999;font-size:12px;margin:0">InfinityU Med Spa · infinity-u.com</p>
        </div>
      `,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Kept for backwards compatibility — now delegates to the general notification.
export interface WeightManagementAssessmentData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  biologicalSex?: string;
  heightFeet: number;
  heightInches: number;
  weightLbs: number;
  bmi: number;
  wellnessGoals: string[];
  eligibleProducts: string[];
  ineligibleProducts: Array<{ productId: string; reason: string }>;
}

export async function sendWeightManagementAssessmentEmail(
  _data: WeightManagementAssessmentData,
  _to: string,
): Promise<{ success: boolean; error?: string }> {
  // Superseded by sendIntakeNotificationEmail which fires for every submission.
  return { success: true };
}
