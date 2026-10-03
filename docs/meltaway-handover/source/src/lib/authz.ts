/**
 * Authorization helpers. Every route that needs a role or an owned record goes
 * through here; no route file compares role strings inline.
 */

import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { auth } from './auth';
import { canAccessOwnedRecord, type Actor } from './authz-core';

export class AuthzError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function unauthorized(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Forbidden'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/** Admin-only API routes. Returns the session, or a 401 response to return. */
export async function requireAdminApi(): Promise<Session | NextResponse> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return unauthorized();
  }
  return session;
}

/** Patient-only API routes. */
export async function requirePatientApi(): Promise<Session | NextResponse> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'patient') {
    return unauthorized();
  }
  return session;
}

export function actorFromSession(session: Session | null | undefined): Actor | null {
  if (!session?.user?.id) return null;
  return { userId: session.user.id, role: session.user.role === 'admin' ? 'admin' : 'patient' };
}

/**
 * Load a record and refuse unless the actor owns it or is an admin.
 * `load` must return the record with its owner id, or null when not found.
 * Refusal is an exception, never an empty result, so a bug surfaces loudly.
 */
export async function requireOwnedRecord<T extends { userId: string }>(
  actor: Actor | null,
  load: () => Promise<T | null>
): Promise<T> {
  if (!actor) throw new AuthzError('Unauthorized', 401);
  const record = await load();
  if (!record) throw new AuthzError('Not found', 404);
  if (!canAccessOwnedRecord(actor, record.userId)) throw new AuthzError('Forbidden', 403);
  return record;
}

export function authzErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof AuthzError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return null;
}
