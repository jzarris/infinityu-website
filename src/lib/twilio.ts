import twilio from 'twilio';
import { getSettings } from '@/lib/settings';

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

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

export async function sendVerificationCode(
  phone: string
): Promise<{ success: boolean; error?: string }> {
  const { accountSid, authToken, verifyServiceSid } = await getCredentials();
  if (!accountSid || !authToken || !verifyServiceSid) {
    return { success: false, error: 'SMS verification not configured' };
  }
  try {
    const client = twilio(accountSid, authToken);
    await client.verify.v2.services(verifyServiceSid).verifications.create({
      to: formatPhoneNumber(phone),
      channel: 'sms',
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification code:', error instanceof Error ? error.message : String(error));
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send code' };
  }
}

export async function verifyCode(
  phone: string,
  code: string
): Promise<{ success: boolean; valid: boolean; error?: string }> {
  const { accountSid, authToken, verifyServiceSid } = await getCredentials();
  if (!accountSid || !authToken || !verifyServiceSid) {
    return { success: false, valid: false, error: 'SMS verification not configured' };
  }
  try {
    const client = twilio(accountSid, authToken);
    const verification = await client.verify.v2.services(verifyServiceSid).verificationChecks.create({
      to: formatPhoneNumber(phone),
      code,
    });
    return { success: true, valid: verification.status === 'approved' };
  } catch (error) {
    console.error('Failed to verify code:', error instanceof Error ? error.message : String(error));
    return { success: false, valid: false, error: error instanceof Error ? error.message : 'Verification failed' };
  }
}

export async function isTwilioConfigured(): Promise<boolean> {
  const { accountSid, authToken, verifyServiceSid } = await getCredentials();
  return !!(accountSid && authToken && verifyServiceSid);
}

export async function sendSmsNotification(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const { accountSid, authToken, fromPhone } = await getCredentials();
  if (!accountSid || !authToken || !fromPhone) {
    return { success: false, error: 'SMS notifications not configured (missing from phone)' };
  }
  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      to: formatPhoneNumber(to),
      from: formatPhoneNumber(fromPhone),
      body: message,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send SMS notification:', error instanceof Error ? error.message : String(error));
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send SMS' };
  }
}
