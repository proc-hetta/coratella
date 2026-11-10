import { fail } from '@sveltejs/kit';
import type { User } from '#lib/server/db/schema.ts';

/** Turns an unexpected error into a 500 action failure carrying its message. */
export function serverFailure(error: unknown) {
  return fail(500, { message: String(error) });
}

/** The user fields that are safe to send to the browser. */
export function publicUser(user: User) {
  return { id: user.id, username: user.username };
}
