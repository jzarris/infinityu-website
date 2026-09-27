import twilio from 'twilio';
import { readFile } from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'config', 'settings.json');

/**
 * Get settings from file
 */
async function getSettings(): Promise<Record<string, string>> {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Get Twilio credentials from settings file or environment
 */
async function getCredentials(): Promise<{
  accountSid: string | null;
  authToken: string | null;
  verifyServiceSid: string | null;
  fromPhone: string | null;
}> {
  const settings = await getSettings();

  return {
    accountSid: settings.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID || null,
    authToken: settings.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN || null,
    verifyServiceSid: settings.twilio_verify_service_sid || process.env.TWILIO_VERIFY_SERVICE_SID || null,
    fromPhone: settings.twilio_from_phone || process.env.TWILIO_FROM_PHONE || null,
  };
}

/**
 * Get admin notification phone number
 */
async function getAdminNotificationPhone(): Promise<string | null> {
  const settings = await getSettings();
  return settings.admin_notification_phone || process.env.ADMIN_NOTIFICATION_PHONE || null;
}

/**
 * Format phone number to E.164 format for Twilio
 * Assumes US numbers if no country code provided
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If it starts with 1 and is 11 digits, it's already a US number with country code
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // If it's 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // Otherwise, assume it's already in international format
  return `+${digits}`;
}

/**
 * Send a verification code to a phone number
 */
export async function sendVerificationCode(
  phone: string
): Promise<{ success: boolean; error?: string }> {
  const { accountSid, authToken, verifyServiceSid } = await getCredentials();

  if (!accountSid || !authToken || !verifyServiceSid) {
    return {
      success: false,
      error: 'SMS verification not configured',
    };
  }

  try {
    const client = twilio(accountSid, authToken);
    const formattedPhone = formatPhoneNumber(phone);

    await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: formattedPhone,
        channel: 'sms',
      });

    return { success: true };
  } catch (error) {
    console.error('Failed to send verification code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send code',
    };
  }
}

/**
 * Verify a code entered by the user
 */
export async function verifyCode(
  phone: string,
  code: string
): Promise<{ success: boolean; valid: boolean; error?: string }> {
  const { accountSid, authToken, verifyServiceSid } = await getCredentials();

  if (!accountSid || !authToken || !verifyServiceSid) {
    return {
      success: false,
      valid: false,
      error: 'SMS verification not configured',
    };
  }

  try {
    const client = twilio(accountSid, authToken);
    const formattedPhone = formatPhoneNumber(phone);

    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: formattedPhone,
        code,
      });

    return {
      success: true,
      valid: verification.status === 'approved',
    };
  } catch (error) {
    console.error('Failed to verify code:', error);
    return {
      success: false,
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Check if Twilio is configured
 */
export async function isTwilioConfigured(): Promise<boolean> {
  const { accountSid, authToken, verifyServiceSid } = await getCredentials();
  return !!(accountSid && authToken && verifyServiceSid);
}

/**
 * Send an SMS notification message
 */
export async function sendSmsNotification(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const { accountSid, authToken, fromPhone } = await getCredentials();

  if (!accountSid || !authToken || !fromPhone) {
    return {
      success: false,
      error: 'SMS notifications not configured (missing from phone)',
    };
  }

  try {
    const client = twilio(accountSid, authToken);
    const formattedTo = formatPhoneNumber(to);
    const formattedFrom = formatPhoneNumber(fromPhone);

    await client.messages.create({
      to: formattedTo,
      from: formattedFrom,
      body: message,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send SMS notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
}

/**
 * Send admin notification for new intake submission
 */
export async function notifyAdminOfIntake(patientName: string, patientPhone: string): Promise<void> {
  const adminPhone = await getAdminNotificationPhone();

  if (!adminPhone) {
    console.log('Admin notification phone not configured, skipping SMS notification');
    return;
  }

  const message = `New patient intake submitted!\n\nPatient: ${patientName}\nPhone: ${patientPhone}\n\nLog in to the admin panel to review.`;

  const result = await sendSmsNotification(adminPhone, message);

  if (result.success) {
    console.log('Admin notification sent successfully');
  } else {
    console.error('Failed to send admin notification:', result.error);
  }
}
