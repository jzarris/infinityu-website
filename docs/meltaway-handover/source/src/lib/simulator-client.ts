/**
 * Client for the GPU simulation service (Modal web endpoints in
 * simulator/modal_app.py). The service is stateless: the photo goes with the
 * request and the result comes back in the response; nothing is retained there.
 *
 * Env: SIMULATOR_SUBMIT_URL, SIMULATOR_RESULT_URL, SIMULATOR_API_TOKEN.
 */

export interface SimulatorParams {
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number;
  sex: 'female' | 'male' | 'other';
  age: number;
  units: 'metric' | 'imperial';
}

export interface SimulatorOverrides {
  typical_results_text?: string;
  variants?: Array<{ name: string; fat_fraction: number }>;
  face_gain?: number;
  face_lift_gain?: number;
  solver_reg_weights?: number[] | null;
  [key: string]: unknown;
}

export interface SimulatorProgress {
  stage: string;
  fraction: number;
  label: string;
}

export type SimulatorResult =
  | ({ status: 'pending' } & Partial<SimulatorProgress>)
  | { status: 'done'; record: Record<string, unknown>; images: Record<string, string> }
  | { status: 'failed'; error: string };

function config() {
  const submit = process.env.SIMULATOR_SUBMIT_URL;
  const result = process.env.SIMULATOR_RESULT_URL;
  const token = process.env.SIMULATOR_API_TOKEN;
  if (!submit || !result || !token) {
    throw new Error('simulator service is not configured');
  }
  return { submit, result, token };
}

export function isSimulatorConfigured(): boolean {
  return !!(process.env.SIMULATOR_SUBMIT_URL && process.env.SIMULATOR_RESULT_URL && process.env.SIMULATOR_API_TOKEN);
}

export async function submitSimulation(
  imageBytes: Buffer,
  params: SimulatorParams,
  overrides: SimulatorOverrides = {}
): Promise<{ callId: string }> {
  const { submit, token } = config();
  const res = await fetch(submit, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ image_b64: imageBytes.toString('base64'), params, overrides }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`simulator submit failed: ${res.status}`);
  const data = (await res.json()) as { call_id?: string };
  if (!data.call_id) throw new Error('simulator submit returned no call id');
  return { callId: data.call_id };
}

export async function fetchSimulationResult(callId: string): Promise<SimulatorResult> {
  const { result, token } = config();
  const url = new URL(result);
  url.searchParams.set('id', callId);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`simulator result failed: ${res.status}`);
  return (await res.json()) as SimulatorResult;
}
