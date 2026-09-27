import { Resend } from 'resend';
import { getSetting } from './settings';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Get Resend API key from settings or environment variable
 */
async function getResendApiKey(): Promise<string | undefined> {
  return getSetting('resend_api_key');
}

/**
 * Create a Resend client with the configured API key
 */
async function getResendClient(): Promise<Resend | null> {
  const apiKey = await getResendApiKey();
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const resend = await getResendClient();

  if (!resend) {
    console.warn('Resend not configured - email not sent');
    console.log('Would send email:', { to, subject });
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'MeltAwayMD <noreply@meltawaymd.com>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

export function generateMagicLinkEmail(url: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign in to MeltAwayMD</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://meltawaymd.com/images/logo.png" alt="MeltAwayMD" style="height: 50px; width: auto;" />
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #1e293b;">Sign in to your account</h2>
          <p style="color: #64748b;">
            Click the button below to sign in to your MeltAwayMD patient portal.
            This link will expire in 24 hours.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="display: inline-block; background: #1e3a5f; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Sign In to Portal
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 14px;">
            If you didn't request this email, you can safely ignore it.
          </p>
        </div>

        <div style="text-align: center; color: #94a3b8; font-size: 12px;">
          <p>
            MeltAwayMD | California, USA<br>
            <a href="https://meltawaymd.com" style="color: #4a9b7f;">meltawaymd.com</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

export async function isEmailConfigured(): Promise<boolean> {
  const apiKey = await getResendApiKey();
  return !!apiKey;
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  interest: string;
  message?: string;
}

/**
 * Generates HTML email for contact form notifications
 */
export function generateContactNotificationEmail(data: ContactFormData): string {
  const interestLabels: Record<string, string> = {
    'weight-management': 'Weight Management',
    'general-wellness': 'General Wellness',
    'fitness-support': 'Fitness Support',
    'other': 'Other',
  };

  const interestDisplay = interestLabels[data.interest] || data.interest;
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://meltawaymd.com/images/logo.png" alt="MeltAwayMD" style="height: 50px; width: auto;" />
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #1e293b;">New Contact Form Submission</h2>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
            Received: ${timestamp}
          </p>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 120px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${data.firstName} ${data.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <a href="mailto:${data.email}" style="color: #1e3a5f;">${data.email}</a>
              </td>
            </tr>
            ${data.phone ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Phone:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <a href="tel:${data.phone}" style="color: #1e3a5f;">${data.phone}</a>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Interest:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${interestDisplay}</td>
            </tr>
            ${data.message ? `
            <tr>
              <td style="padding: 10px 0; color: #64748b; vertical-align: top;">Message:</td>
              <td style="padding: 10px 0;">
                <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  ${data.message.replace(/\n/g, '<br>')}
                </div>
              </td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="text-align: center; color: #94a3b8; font-size: 12px;">
          <p>
            This is an automated notification from MeltAwayMD<br>
            <a href="https://meltawaymd.com/admin" style="color: #4a9b7f;">Admin Dashboard</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Sends a contact form notification email
 */
export async function sendContactNotification(
  data: ContactFormData,
  notificationEmail: string
) {
  const html = generateContactNotificationEmail(data);

  return sendEmail({
    to: notificationEmail,
    subject: `New Contact: ${data.firstName} ${data.lastName} - ${data.interest}`,
    html,
  });
}

/**
 * Generates HTML email for account setup invitation
 */
export function generateAccountSetupEmail(
  name: string,
  setupUrl: string,
  accountType: 'patient' | 'admin' = 'patient',
  customMessage?: string
): string {
  // Default message if none provided
  const defaultMessage = accountType === 'admin'
    ? `Hi${name ? ` ${name}` : ''},\n\nYour administrator account has been created. Please click the button below to set up your password and complete your account setup.\n\nThis link will expire in 48 hours.`
    : `Hi${name ? ` ${name}` : ''},\n\nYour patient account has been created. Please click the button below to set up your password and complete your account setup.\n\nThis link will expire in 48 hours.`;

  const message = customMessage || defaultMessage;
  // Convert newlines to <br> for HTML
  const htmlMessage = message.split('\n').map(line =>
    `<p style="color: #64748b; margin: 0 0 12px 0;">${line || '&nbsp;'}</p>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Set Up Your MeltAwayMD Account</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://meltawaymd.com/images/logo.png" alt="MeltAwayMD" style="height: 50px; width: auto;" />
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #1e293b;">Welcome to MeltAwayMD!</h2>
          ${htmlMessage}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${setupUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Set Up Your Account
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 14px;">
            If you didn't expect this email, please contact us at info@meltawaymd.com.
          </p>
        </div>

        <div style="text-align: center; color: #94a3b8; font-size: 12px;">
          <p>
            MeltAwayMD | California, USA<br>
            <a href="https://meltawaymd.com" style="color: #4a9b7f;">meltawaymd.com</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generates HTML email for password reset
 */
export function generatePasswordResetEmail(name: string, resetUrl: string, customMessage?: string): string {
  // Default message if none provided
  const defaultMessage = `Hi${name ? ` ${name}` : ''},\n\nA password reset has been requested for your account. Click the button below to create a new password.\n\nThis link will expire in 1 hour.`;

  const message = customMessage || defaultMessage;
  // Convert newlines to <br> for HTML
  const htmlMessage = message.split('\n').map(line =>
    `<p style="color: #64748b; margin: 0 0 12px 0;">${line || '&nbsp;'}</p>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your MeltAwayMD Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://meltawaymd.com/images/logo.png" alt="MeltAwayMD" style="height: 50px; width: auto;" />
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #1e293b;">Reset Your Password</h2>
          ${htmlMessage}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Reset Password
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 14px;">
            If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <div style="text-align: center; color: #94a3b8; font-size: 12px;">
          <p>
            MeltAwayMD | California, USA<br>
            <a href="https://meltawaymd.com" style="color: #4a9b7f;">meltawaymd.com</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Sends account setup email to a new user (patient or admin)
 */
export async function sendAccountSetupEmail(
  email: string,
  name: string,
  token: string,
  accountType: 'patient' | 'admin' = 'patient',
  customMessage?: string
) {
  let baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  // Strip port from production URLs (https doesn't need explicit port 443)
  if (baseUrl.startsWith('https://')) {
    baseUrl = baseUrl.replace(/:\d+$/, '');
  }
  const setupUrl = `${baseUrl}/auth/setup-password?token=${token}`;
  const html = generateAccountSetupEmail(name, setupUrl, accountType, customMessage);

  return sendEmail({
    to: email,
    subject: 'Set Up Your MeltAwayMD Account',
    html,
  });
}

/**
 * Sends password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string,
  customMessage?: string
) {
  let baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  // Strip port from production URLs (https doesn't need explicit port 443)
  if (baseUrl.startsWith('https://')) {
    baseUrl = baseUrl.replace(/:\d+$/, '');
  }
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
  const html = generatePasswordResetEmail(name, resetUrl, customMessage);

  return sendEmail({
    to: email,
    subject: 'Reset Your MeltAwayMD Password',
    html,
  });
}

/**
 * Weight management assessment data for email notification
 */
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

/**
 * Generates plain text email for weight management assessment notification
 */
export function generateWeightManagementAssessmentEmail(data: WeightManagementAssessmentData): string {
  // Calculate age from date of birth
  const dob = new Date(data.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  // Build BMI calculator URL
  const sex = data.biologicalSex === 'female' ? 'f' : 'm';
  const bmiCalculatorUrl = `https://www.calculator.net/bmi-calculator.html?cage=${age}&csex=${sex}&cheightfeet=${data.heightFeet}&cheightinch=${data.heightInches}&cpound=${data.weightLbs}`;

  // Product labels for display
  const productLabels: Record<string, string> = {
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

  // Format eligible products
  const eligibleDisplay = data.eligibleProducts
    .map(p => productLabels[p] || p)
    .join(', ');

  // Format ineligible products with reasons
  const ineligibleDisplay = data.ineligibleProducts
    .map(p => `${productLabels[p.productId] || p.productId} (${p.reason})`)
    .join('; ');

  // Build the email body
  const lines = [
    `NAME: ${data.firstName} ${data.lastName}`,
    `AGE: ${age}`,
    `WELLNESS GOALS: ${data.wellnessGoals.join(', ')}`,
    `HEIGHT/WEIGHT: ${data.heightFeet}'${data.heightInches}" / ${data.weightLbs} lbs`,
    `CALCULATED BMI: ${data.bmi.toFixed(1)}`,
  ];

  if (data.eligibleProducts.length > 0) {
    lines.push(`POTENTIALLY ELIGIBLE FOR: ${eligibleDisplay}`);
  }

  if (data.ineligibleProducts.length > 0) {
    lines.push(`MAY NOT BE ELIGIBLE FOR: ${ineligibleDisplay}`);
  }

  lines.push('');
  lines.push('Follow this link for a detailed BMI description:');
  lines.push(bmiCalculatorUrl);

  // Simple HTML wrapper for plain text content
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weight Management Assessment</title>
      </head>
      <body style="font-family: 'Courier New', Courier, monospace; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Weight Management Assessment</h2>
          <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 14px; margin: 0;">${lines.join('\n')}</pre>
        </div>
        <div style="text-align: center; color: #94a3b8; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <p>
            This is an automated notification from MeltAwayMD<br>
            <a href="https://meltawaymd.com/admin" style="color: #4a9b7f;">Admin Dashboard</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Sends weight management assessment notification email
 */
export async function sendWeightManagementAssessmentEmail(
  data: WeightManagementAssessmentData,
  notificationEmail: string = 'info@meltawaymd.com'
) {
  const html = generateWeightManagementAssessmentEmail(data);

  return sendEmail({
    to: notificationEmail,
    subject: `Weight Management Assessment: ${data.firstName} ${data.lastName}`,
    html,
  });
}
