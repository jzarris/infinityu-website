/**
 * Simulator domain logic shared by the patient and admin routes: consent,
 * photo storage, goal capping, submission to the GPU service, result
 * collection, deletion, and retention.
 *
 * Logging rule: ids, codes, timings only. Never params, records, or bytes.
 */

import type { BodyPhoto, Simulation } from '@prisma/client';
import { prisma } from './prisma';
import { getPhotoStore, isPhotoStoreConfigured } from './photo-store';
import { sha256Hex } from './photo-crypto';
import {
  fetchSimulationResult,
  isSimulatorConfigured,
  submitSimulation,
  type SimulatorOverrides,
  type SimulatorParams,
  type SimulatorProgress,
} from './simulator-client';
import { sendSmsNotification } from './twilio';
import { getSimulatorSettings } from './settings';
import { PHOTO_CONSENT_PURPOSES, PHOTO_CONSENT_TEXT, PHOTO_CONSENT_VERSION } from './consent-text';
import { applyGoalCap, displayFor, validateMetricParams, type MetricParams, type Units } from './units';
import { readImageDimensions } from './image-dims';
import { createLogger } from './log';
import { cleanupExpiredAuditLogs } from './audit';
import { cleanupExpiredTrustedBrowsers } from './trustedBrowser';

const log = createLogger('simulator');

export class SimulatorError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const REFUSED_RETENTION_DAYS = 7;
export const V1_VARIANTS = [{ name: 'expected', fat_fraction: 0.75 }];

// ---- availability ------------------------------------------------------

export async function simulatorAvailability(): Promise<{ ok: boolean; reason?: string }> {
  const settings = await getSimulatorSettings();
  if (!settings.enabled) return { ok: false, reason: 'disabled' };
  if (!isPhotoStoreConfigured()) return { ok: false, reason: 'storage_not_configured' };
  if (!isSimulatorConfigured()) return { ok: false, reason: 'service_not_configured' };
  return { ok: true };
}

// ---- consent -------------------------------------------------------------

export async function currentConsent(userId: string) {
  return prisma.photoConsent.findFirst({
    where: { userId, version: PHOTO_CONSENT_VERSION, withdrawnAt: null },
    orderBy: { createdAt: 'desc' },
  });
}

export async function recordConsent(userId: string, ipAddress?: string, userAgent?: string) {
  const existing = await currentConsent(userId);
  if (existing) return existing;
  return prisma.photoConsent.create({
    data: {
      userId,
      version: PHOTO_CONSENT_VERSION,
      textShown: PHOTO_CONSENT_TEXT,
      purposes: JSON.stringify(PHOTO_CONSENT_PURPOSES),
      ipAddress,
      userAgent,
    },
  });
}

// ---- retention -----------------------------------------------------------

async function retentionDateFor(userId: string, kind: 'accepted' | 'refused'): Promise<Date> {
  const days = kind === 'refused' ? REFUSED_RETENTION_DAYS : await (async () => {
    const settings = await getSimulatorSettings();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { asherPatientId: true } });
    return user?.asherPatientId ? settings.retentionDaysPatient : settings.retentionDaysLead;
  })();
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

// ---- create --------------------------------------------------------------

export interface CreateSimulationArgs {
  userId: string;
  cohort: 'pre_signup' | 'post_login' | 'admin_rerun';
  units: Units;
  params: MetricParams;
  /** New upload, or omit when re-running an existing photo. */
  imageBytes?: Buffer;
  existingPhotoId?: string;
  overrides?: SimulatorOverrides;
  rerunOfId?: string;
}

export async function createSimulation(args: CreateSimulationArgs): Promise<Simulation> {
  const issues = validateMetricParams(args.params);
  if (issues.length) throw new SimulatorError('invalid_params', issues.map((i) => i.message).join(' '), 400);

  // A new upload needs the current consent version. A re-run of a stored photo
  // is covered by the consent that photo was taken under.
  let consentId: string | null = null;
  if (!args.existingPhotoId) {
    const consent = await currentConsent(args.userId);
    if (!consent) throw new SimulatorError('consent_required', 'Consent is required before a photo can be used.', 403);
    consentId = consent.id;
  }

  const settings = await getSimulatorSettings();
  const goal = applyGoalCap(args.params.weight_kg, args.params.target_weight_kg, args.params.height_cm, settings.maxLossFraction);
  const applied: MetricParams = { ...args.params, target_weight_kg: goal.appliedKg };

  let photo: BodyPhoto;
  let createdPhoto = false;
  let imageBytes: Buffer;
  if (args.existingPhotoId) {
    const existing = await prisma.bodyPhoto.findUnique({ where: { id: args.existingPhotoId } });
    if (!existing || existing.deletedAt) throw new SimulatorError('photo_not_found', 'Photo not found.', 404);
    photo = existing;
    imageBytes = await getPhotoStore().get(photo.storageKey);
  } else {
    if (!args.imageBytes) throw new SimulatorError('invalid_image', 'No photo was provided.', 400);
    if (args.imageBytes.length > MAX_UPLOAD_BYTES) throw new SimulatorError('image_too_large', 'The photo is too large.', 413);
    const dims = readImageDimensions(args.imageBytes);
    if (!dims) throw new SimulatorError('invalid_image', 'The file is not a JPEG or PNG image.', 400);
    imageBytes = args.imageBytes;
    const storageKey = await getPhotoStore().put(imageBytes);
    photo = await prisma.bodyPhoto.create({
      data: {
        userId: args.userId,
        consentId: consentId!,
        storageKey,
        sha256: sha256Hex(imageBytes),
        width: dims.width,
        height: dims.height,
        contentType: dims.type === 'png' ? 'image/png' : 'image/jpeg',
        retentionAt: await retentionDateFor(args.userId, 'accepted'),
      },
    });
    createdPhoto = true;
  }

  const overrides: SimulatorOverrides = {
    variants: V1_VARIANTS,
    typical_results_text: settings.typicalResults,
    ...(args.overrides || {}),
  };
  const serviceParams: SimulatorParams = { ...applied, units: args.units };

  let callId: string;
  try {
    ({ callId } = await submitSimulation(imageBytes, serviceParams, overrides));
  } catch (error) {
    log.error('submit failed', { photoId: photo.id, error });
    if (createdPhoto) await deletePhotoCascade(photo.id).catch(() => undefined);
    throw new SimulatorError('service_unavailable', 'The simulator is temporarily unavailable. Please try again in a few minutes.', 503);
  }

  const sim = await prisma.simulation.create({
    data: {
      photoId: photo.id,
      userId: args.userId,
      cohort: args.cohort,
      units: args.units,
      paramsMetric: JSON.stringify(applied),
      paramsDisplay: JSON.stringify(displayFor(applied, args.units)),
      goalWeightKgRequested: args.params.target_weight_kg,
      goalWeightKgApplied: goal.appliedKg,
      status: 'pending',
      remoteCallId: callId,
      configOverrides: JSON.stringify(overrides),
      rerunOfId: args.rerunOfId,
    },
  });
  log.info('simulation submitted', { simulationId: sim.id, cohort: args.cohort, capped: goal.capped });
  watchSimulation(sim.id);
  return sim;
}

// ---- poll ----------------------------------------------------------------

const OUTPUT_SKIP = new Set(['original.png', 'contact_sheet.png', 'fit_debug.npz']);

export interface PollResult {
  sim: Simulation;
  progress?: SimulatorProgress;
}

export async function pollSimulation(simulationId: string): Promise<PollResult> {
  const sim = await prisma.simulation.findUnique({ where: { id: simulationId } });
  if (!sim || sim.deletedAt) throw new SimulatorError('not_found', 'Simulation not found.', 404);
  if (sim.status !== 'pending' || !sim.remoteCallId) return { sim };

  let result;
  try {
    result = await fetchSimulationResult(sim.remoteCallId);
  } catch (error) {
    log.error('poll failed', { simulationId, error });
    return { sim };
  }
  if (result.status === 'pending') {
    return {
      sim,
      progress: {
        stage: result.stage || 'starting',
        fraction: typeof result.fraction === 'number' ? result.fraction : 0,
        label: result.label || 'Starting up',
      },
    };
  }

  if (result.status === 'failed') {
    log.warn('simulation failed', { simulationId, error: result.error });
    const failed = await prisma.simulation.update({
      where: { id: sim.id },
      data: { status: 'failed', completedAt: new Date(), userMessage: 'Something went wrong while generating the simulation. Please try again.' },
    });
    await notifyIfRequested(failed);
    return { sim: failed };
  }

  const record = result.record as {
    refusals?: string[];
    user_message?: string;
    bodysim_version?: string;
  };
  const refusals = record.refusals || [];
  const diagnostics = JSON.stringify(record);

  if (refusals.length) {
    await prisma.bodyPhoto.update({
      where: { id: sim.photoId },
      data: {
        status: 'refused',
        refusalReasons: JSON.stringify(refusals),
        retentionAt: await retentionDateFor(sim.userId, 'refused'),
      },
    });
    log.info('simulation refused', { simulationId, refusals });
    const refused = await prisma.simulation.update({
      where: { id: sim.id },
      data: {
        status: 'refused',
        refusalReasons: JSON.stringify(refusals),
        userMessage: record.user_message || 'We could not use this photo. Please take another one.',
        diagnostics,
        modelVersion: record.bodysim_version,
        completedAt: new Date(),
      },
    });
    await notifyIfRequested(refused);
    return { sim: refused };
  }

  const store = getPhotoStore();
  const outputKeys: Record<string, string> = {};
  for (const [name, b64] of Object.entries(result.images)) {
    if (OUTPUT_SKIP.has(name)) continue;
    outputKeys[name] = await store.put(Buffer.from(b64, 'base64'));
  }
  log.info('simulation done', { simulationId, outputs: Object.keys(outputKeys).length });
  const done = await prisma.simulation.update({
    where: { id: sim.id },
    data: {
      status: 'done',
      outputKeys: JSON.stringify(outputKeys),
      diagnostics,
      modelVersion: record.bodysim_version,
      completedAt: new Date(),
    },
  });
  await notifyIfRequested(done);
  return { sim: done };
}

// ---- notification and server-side watching --------------------------------

function siteBaseUrl(): string {
  const raw = process.env.NEXTAUTH_URL || 'https://www.meltawaymd.com';
  return raw.replace(/\/$/, '');
}

/** Ask to be texted when the run finishes. If it already finished, text now. */
export async function requestNotification(simulationId: string): Promise<{ ok: boolean; reason?: string; phoneLastFour?: string }> {
  const sim = await prisma.simulation.findUnique({ where: { id: simulationId }, include: { user: { select: { phone: true } } } });
  if (!sim) return { ok: false, reason: 'not_found' };
  if (!sim.user.phone) return { ok: false, reason: 'no_phone' };
  if (!sim.notifyRequested) {
    await prisma.simulation.update({ where: { id: sim.id }, data: { notifyRequested: true } });
  }
  if (sim.status !== 'pending') {
    await notifyIfRequested({ ...sim, notifyRequested: true });
  } else {
    watchSimulation(sim.id);
  }
  return { ok: true, phoneLastFour: sim.user.phone.slice(-4) };
}

/**
 * Send the SMS exactly once. The conditional update on notifiedAt makes this
 * safe when both the browser poll and the server watcher reach completion.
 * The text carries no health data, only that a result is ready.
 */
export async function notifyIfRequested(sim: Simulation): Promise<void> {
  if (!sim.notifyRequested || sim.status === 'pending') return;
  const claimed = await prisma.simulation.updateMany({
    where: { id: sim.id, notifiedAt: null, notifyRequested: true },
    data: { notifiedAt: new Date() },
  });
  if (claimed.count !== 1) return;
  const user = await prisma.user.findUnique({ where: { id: sim.userId }, select: { phone: true } });
  if (!user?.phone) return;
  const url = `${siteBaseUrl()}/auth/phone`;
  const message =
    sim.status === 'done'
      ? `MeltAwayMD: your body simulation is ready. Sign in with your phone number at ${url} to view it.`
      : `MeltAwayMD: we couldn't use the photo you sent. Sign in with your phone number at ${url} to see why and try again.`;
  const result = await sendSmsNotification(user.phone, message);
  log.info('notification sent', { simulationId: sim.id, ok: result.success });
}

const watching = new Set<string>();
const WATCH_INTERVAL_MS = 10_000;
const WATCH_MAX_MS = 15 * 60 * 1000;

/**
 * Keep polling a run server-side so it completes (and notifies) even if the
 * browser has gone. In-memory; after a restart, resumeWatchers() picks up
 * recent pending runs.
 */
export function watchSimulation(simulationId: string): void {
  if (watching.has(simulationId)) return;
  watching.add(simulationId);
  const startedAt = Date.now();
  const tick = async () => {
    try {
      const { sim } = await pollSimulation(simulationId);
      if (sim.status !== 'pending') {
        watching.delete(simulationId);
        return;
      }
    } catch {
      watching.delete(simulationId);
      return;
    }
    if (Date.now() - startedAt > WATCH_MAX_MS) {
      watching.delete(simulationId);
      return;
    }
    setTimeout(tick, WATCH_INTERVAL_MS).unref?.();
  };
  setTimeout(tick, WATCH_INTERVAL_MS).unref?.();
}

export async function resumeWatchers(): Promise<number> {
  const pending = await prisma.simulation.findMany({
    where: { status: 'pending', deletedAt: null, createdAt: { gt: new Date(Date.now() - WATCH_MAX_MS) } },
    select: { id: true },
  });
  for (const p of pending) watchSimulation(p.id);
  return pending.length;
}

// ---- images --------------------------------------------------------------

export interface SimulationImages {
  original: string; // data URL
  outputs: Record<string, string>; // variant name -> data URL
}

export async function simulationImages(sim: Simulation): Promise<SimulationImages> {
  const photo = await prisma.bodyPhoto.findUnique({ where: { id: sim.photoId } });
  if (!photo || photo.deletedAt) throw new SimulatorError('not_found', 'Photo not found.', 404);
  const store = getPhotoStore();
  const original = await store.get(photo.storageKey);
  const outputs: Record<string, string> = {};
  const keys: Record<string, string> = sim.outputKeys ? JSON.parse(sim.outputKeys) : {};
  for (const [name, key] of Object.entries(keys)) {
    const bytes = await store.get(key);
    outputs[name.replace(/\.png$/, '')] = `data:image/png;base64,${bytes.toString('base64')}`;
  }
  return { original: `data:${photo.contentType};base64,${original.toString('base64')}`, outputs };
}

// ---- delete --------------------------------------------------------------

export async function deleteSimulation(simulationId: string): Promise<void> {
  const sim = await prisma.simulation.findUnique({ where: { id: simulationId } });
  if (!sim) return;
  const store = getPhotoStore();
  const keys: Record<string, string> = sim.outputKeys ? JSON.parse(sim.outputKeys) : {};
  for (const key of Object.values(keys)) await store.delete(key);
  await prisma.simulation.delete({ where: { id: simulationId } });
  log.info('simulation deleted', { simulationId });
}

/** Delete a photo, every simulation made from it, and every output. */
export async function deletePhotoCascade(photoId: string): Promise<void> {
  const photo = await prisma.bodyPhoto.findUnique({ where: { id: photoId }, include: { simulations: true } });
  if (!photo) return;
  for (const sim of photo.simulations) await deleteSimulation(sim.id);
  await getPhotoStore().delete(photo.storageKey);
  await prisma.bodyPhoto.delete({ where: { id: photoId } });
  log.info('photo deleted', { photoId });
}

// ---- retention sweep -------------------------------------------------------

export async function runRetentionSweep(): Promise<{ photosDeleted: number; auditDeleted: number; browsersDeleted: number }> {
  const expired = await prisma.bodyPhoto.findMany({
    where: { retentionAt: { lt: new Date() } },
    select: { id: true },
    take: 500,
  });
  for (const p of expired) await deletePhotoCascade(p.id);
  const auditDeleted = await cleanupExpiredAuditLogs();
  const browsersDeleted = await cleanupExpiredTrustedBrowsers();
  log.info('retention sweep', { photosDeleted: expired.length, auditDeleted, browsersDeleted });
  return { photosDeleted: expired.length, auditDeleted, browsersDeleted };
}

let lastSweep = 0;
/** Opportunistic hourly sweep, triggered from request handlers, never awaited. */
export function maybeRunRetentionSweep(): void {
  const now = Date.now();
  if (now - lastSweep < 60 * 60 * 1000) return;
  lastSweep = now;
  runRetentionSweep().catch((error) => log.error('retention sweep failed', { error }));
  resumeWatchers().catch((error) => log.error('resume watchers failed', { error }));
}

// ---- prefill -------------------------------------------------------------

export async function prefillFor(userId: string): Promise<{ height_cm?: number; weight_kg?: number; age?: number; sex?: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { dateOfBirth: true, email: true } });
  const out: { height_cm?: number; weight_kg?: number; age?: number; sex?: string } = {};
  if (user?.dateOfBirth) {
    const dob = new Date(user.dateOfBirth);
    if (!isNaN(dob.getTime())) {
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) age--;
      if (age >= 18 && age <= 100) out.age = age;
    }
  }
  const q = await prisma.questionnaireSubmission.findFirst({
    where: { OR: [{ userId }, ...(user?.email ? [{ email: user.email }] : [])] },
    orderBy: { submittedAt: 'desc' },
    select: { answers: true, biologicalSex: true },
  });
  if (q) {
    try {
      const a = JSON.parse(q.answers) as Record<string, unknown>;
      const ft = Number(a.heightFeet);
      const inch = Number(a.heightInches) || 0;
      const lb = Number(a.currentWeight);
      if (ft > 0) out.height_cm = (ft * 12 + inch) * 2.54;
      if (lb > 0) out.weight_kg = lb / 2.2046226218;
    } catch {
      // ignore malformed answers
    }
    if (q.biologicalSex && ['female', 'male', 'other'].includes(q.biologicalSex)) out.sex = q.biologicalSex;
  }
  return out;
}
