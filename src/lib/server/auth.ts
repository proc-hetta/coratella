import * as jose from 'jose';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { env } from '$env/dynamic/private';
import * as table from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';

export const sessionCookieName = 'auth-session';
const sessionCookieKey = new TextEncoder().encode(env.CORATELLA_SECRET);

export async function generateSessionToken(user: table.User) {
  const token = await new jose.SignJWT({})
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setExpirationTime('24h')
    .setIssuedAt(Math.floor(Date.now() / 1000))
    .setSubject(user.id)
    .sign(sessionCookieKey);

  const payload = jose.decodeJwt(token);

  return { token, payload };
}

export async function validateSessionToken(token: string) {
  let payload: jose.JWTPayload;

  try {
    payload = (await jose.jwtVerify(token, sessionCookieKey)).payload;
  } catch (e) {
    return { user: null, payload: null };
  }

  // Check if the session is expired
  if (payload.exp! < Math.floor(Date.now() / 1000)) {
    return {
      user: null,
      payload: null,
    };
  }

  const users = await db
    .select({ user: table.users })
    .from(table.users)
    .where(eq(table.users.id, payload.sub!));
  const user = users.at(0) || null;

  return { user, payload };
}

export function setSessionTokenCookie(event: RequestEvent, token: string, exp: number) {
  event.cookies.set(sessionCookieName, token, {
    expires: new Date(exp * 1000),
    path: '/',
    secure: false,
  });
}

export function deleteSessionTokenCookie(event: RequestEvent) {
  event.cookies.delete(sessionCookieName, {
    path: '/',
  });
}
