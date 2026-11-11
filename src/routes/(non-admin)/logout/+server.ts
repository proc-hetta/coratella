import * as auth from '#lib/server/auth.ts';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async (event) => {
  auth.deleteSessionTokenCookie(event);
  return redirect(303, '/login');
};
