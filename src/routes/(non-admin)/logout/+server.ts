import * as auth from '#lib/server/auth.ts';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
  await auth.deleteSessionTokenCookie(event);
  return redirect(302, '/login');
};
