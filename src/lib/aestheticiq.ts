/**
 * AestheticIQ CRM sync. The intake route and the admin "Retry sync" action both
 * push a completed health assessment to the AestheticIQ intake webhook through
 * here, so the token exchange and request shape live in one place.
 */

// Module-level JWT cache for the AestheticIQ token exchange.
// On Railway (persistent process) this survives across requests; re-exchange
// only on expiry.
let _aiqJwt: { token: string; expiresAt: number } | null = null;

// Cap each outbound call so a hung AestheticIQ can't stall the intake response.
const REQUEST_TIMEOUT_MS = 10_000;

async function getAestheticIqJwt(webhookUrl: string, apiToken: string): Promise<string> {
  const now = Date.now();
  if (_aiqJwt && _aiqJwt.expiresAt > now + 60_000) return _aiqJwt.token;
  const base = new URL(webhookUrl).origin;
  const res = await fetch(`${base}/api/v1/tokens/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiToken }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`AestheticIQ token exchange failed: ${res.status}`);
  const data = (await res.json()) as { data: { accessToken: string; expiresIn: number } };
  _aiqJwt = { token: data.data.accessToken, expiresAt: now + data.data.expiresIn * 1000 };
  return _aiqJwt.token;
}

export interface AestheticIqAcknowledgment {
  id: string;
  version: string;
  title: string;
  text: string;
  checkboxLabel: string;
  acceptedAt: string;
}

export interface AestheticIqCrmPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  state: string;
  biologicalSex?: string;
  selectedGoals: string[];
  eligibleProducts: string[];
  healthSummary: string;
  answers: Record<string, unknown>;
  acknowledgments?: AestheticIqAcknowledgment[];
  smsConsent?: { transactional: boolean; marketing: boolean };
  submissionLanguage: string;
  timestamp: string;
}

export type AestheticIqSyncResult =
  | { ok: true }
  | { ok: false; configured: false; error: string }
  | { ok: false; configured: true; status?: number; error: string };

/**
 * Pushes a submission payload to AestheticIQ. Never throws — returns a result
 * the caller records. If the integration isn't configured, reports
 * `configured: false` so the caller can distinguish "not set up" from "failed".
 */
export async function syncToAestheticIq(payload: AestheticIqCrmPayload): Promise<AestheticIqSyncResult> {
  const webhookUrl = process.env.AESTHETICIQ_WEBHOOK_URL;
  const apiToken = process.env.AESTHETICIQ_API_TOKEN;
  if (!webhookUrl || !apiToken) {
    return { ok: false, configured: false, error: 'AestheticIQ is not configured' };
  }

  try {
    const jwt = await getAestheticIqJwt(webhookUrl, apiToken);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      // A stale cached JWT would surface as 401; drop it so the next attempt re-exchanges.
      if (res.status === 401) _aiqJwt = null;
      let detail = '';
      try {
        detail = (await res.text()).slice(0, 500);
      } catch {
        /* ignore body read errors */
      }
      return { ok: false, configured: true, status: res.status, error: `Webhook returned ${res.status}${detail ? `: ${detail}` : ''}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, configured: true, error: err instanceof Error ? err.message : String(err) };
  }
}
