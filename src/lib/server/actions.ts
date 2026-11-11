import { fail } from '@sveltejs/kit';
import { DrizzleQueryError } from 'drizzle-orm/errors';
import * as z from 'zod';
import { m } from '#lib/paraglide/messages.js';
import type { User } from '#lib/server/db/schema.ts';

/** A non-empty text field; `message` is reported when it is missing or empty. */
export const required = (message: () => string) =>
  z.string({ error: message }).min(1, { error: message });

/** A numeric id field, as sent by the admin forms. */
export const idField = z
  .string({ error: () => m.missingId() })
  .regex(/^\d+$/, { error: () => m.missingId() })
  .transform(Number);

/** Reads the form fields of a request (repeated names keep their last value). */
export async function formFields(request: Request) {
  return Object.fromEntries(await request.formData());
}

/** A 400 action failure carrying the first validation message. */
export function invalid(error: z.ZodError) {
  return fail(400, { message: error.issues[0].message });
}

/** Turns a unique or foreign key violation into a 400 failure with `message`; rethrows anything else. */
export function constraintFailure(error: unknown, message: string) {
  const code = error instanceof DrizzleQueryError && (error.cause as { code?: string })?.code;
  if (code === '23505' || code === '23503') {
    return fail(400, { message });
  }
  throw error;
}

/** The user fields that are safe to send to the browser. */
export function publicUser(user: User) {
  return { id: user.id, username: user.username };
}
