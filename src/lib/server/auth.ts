import * as jose from 'jose';
import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { CORATELLA_SECRET } from '$app/env/private';
import * as table from '#lib/server/db/schema.ts';
import type { RequestEvent } from '@sveltejs/kit';

export const sessionCookieName = 'auth-session';

const sessionCookieKey = new TextEncoder().encode(CORATELLA_SECRET);

export async function generateSessionToken(user: table.User) {
  const token = await new jose.SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .setSubject(user.id)
    .sign(sessionCookieKey);
  const payload = jose.decodeJwt(token);

  return { token, payload };
}

export async function validateSessionToken(token: string) {
  let payload: jose.JWTPayload;
  try {
    // Also rejects expired tokens
    payload = (await jose.jwtVerify(token, sessionCookieKey)).payload;
  } catch {
    return { user: null, payload: null };
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
