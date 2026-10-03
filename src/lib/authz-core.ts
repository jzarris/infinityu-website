/**
 * Pure authorization rules, free of framework imports so they can be unit
 * tested directly. Roles today: patient and admin. A staff or provider tier can
 * be added here without touching call sites.
 */

export type Role = 'patient' | 'admin';

export interface Actor {
  userId: string;
  role: Role;
}

/** A patient may access records they own; an admin may access any record. */
export function canAccessOwnedRecord(actor: Actor | null | undefined, ownerUserId: string): boolean {
  if (!actor) return false;
  if (actor.role === 'admin') return true;
  return actor.role === 'patient' && actor.userId === ownerUserId;
}
