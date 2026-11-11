import { describe, expect, it } from 'vitest';
import { isRedirect } from '@sveltejs/kit';
import * as jose from 'jose';
import { call, cookieJar, formRequest, thrown } from './helpers';
import * as auth from '#lib/server/auth.ts';
import * as loginPage from '../routes/(non-admin)/login/+page.server';
import * as logout from '../routes/(non-admin)/logout/+server';
import * as adminLayout from '../routes/admin/+layout.server';
import * as adminHome from '../routes/admin/+page.server';
import { createUser } from '#lib/server/db/users.ts';
import { createTag } from '#lib/server/db/tags.ts';

describe('session tokens', () => {
  it('generates an HS256 JWT valid for 24h with the user id as subject', async () => {
    const [user] = await createUser('u', 'p');
    const { token, payload } = await auth.generateSessionToken(user);
    expect(jose.decodeProtectedHeader(token)).toEqual({ alg: 'HS256' });
    expect(payload.sub).toBe(user.id);
    expect(payload.exp! - payload.iat!).toBe(24 * 60 * 60);
    const validated = await auth.validateSessionToken(token);
    expect(validated.user?.user).toEqual(user);
  });

  it('rejects tampered, foreign or unknown-user tokens', async () => {
    const [user] = await createUser('u', 'p');
    const { token } = await auth.generateSessionToken(user);
    expect(await auth.validateSessionToken(token + 'x')).toEqual({ user: null, payload: null });
    const foreign = await new jose.SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .setSubject(user.id)
      .sign(new TextEncoder().encode('other'));
    expect(await auth.validateSessionToken(foreign)).toEqual({ user: null, payload: null });
    const ghost = await auth.generateSessionToken({ ...user, id: 'ghost' });
    expect((await auth.validateSessionToken(ghost.token)).user).toBeNull();
  });

  it('signs post unlock tokens valid for one post only', async () => {
    const token = await auth.generatePostUnlockToken(1);
    expect(await auth.isPostUnlocked(token, 1)).toBe(true);
    expect(await auth.isPostUnlocked(token, 2)).toBe(false);
    expect(await auth.isPostUnlocked(token + 'x', 1)).toBe(false);
    expect(await auth.isPostUnlocked(undefined, 1)).toBe(false);
    const [user] = await createUser('u', 'p');
    const session = await auth.generateSessionToken(user);
    expect(await auth.isPostUnlocked(session.token, 1)).toBe(false);
  });

  it('sets and deletes the session cookie', () => {
    const { cookies, operations } = cookieJar();
    auth.setSessionTokenCookie({ cookies } as never, 'tok', 1_700_000_000);
    auth.deleteSessionTokenCookie({ cookies } as never);
    expect(operations).toEqual([
      {
        op: 'set',
        name: 'auth-session',
        value: 'tok',
        options: { expires: new Date(1_700_000_000_000), path: '/', secure: false },
      },
      { op: 'delete', name: 'auth-session', options: { path: '/' } },
    ]);
  });
});

describe('login and logout', () => {
  it('logs in with valid credentials', async () => {
    const [user] = await createUser('admin', 'pw');
    const { cookies, operations } = cookieJar();
    const locals = {} as App.Locals;
    const result = await thrown(() =>
      call(loginPage.actions.default, {
        request: formRequest({ username: 'admin', password: 'pw' }),
        cookies,
        locals,
      }),
    );
    expect(isRedirect(result) && result).toMatchObject({ status: 302, location: '/admin' });
    expect(locals.user).toEqual(user);
    expect(operations).toHaveLength(1);
    const validated = await auth.validateSessionToken((operations[0] as { value: string }).value);
    expect(validated.user?.user.id).toBe(user.id);
  });

  it('rejects missing or wrong credentials', async () => {
    await createUser('admin', 'pw');
    const { cookies } = cookieJar();
    const attempt = (fields: Record<string, string>) =>
      call(loginPage.actions.default, { request: formRequest(fields), cookies, locals: {} });
    expect(await attempt({ username: 'admin' })).toMatchObject({
      status: 400,
      data: { message: 'Both username and password must be set' },
    });
    for (const fields of [
      { username: 'admin', password: 'bad' },
      { username: 'nobody', password: 'pw' },
    ]) {
      expect(await attempt(fields)).toMatchObject({
        status: 401,
        data: { message: 'Incorrect username or password' },
      });
    }
  });

  it('logs out by deleting the cookie and redirecting to login', async () => {
    const { cookies, operations } = cookieJar({ 'auth-session': 'x' });
    const result = await thrown(() => call(logout.POST, { cookies }));
    expect(isRedirect(result) && result).toMatchObject({ status: 303, location: '/login' });
    expect(operations).toEqual([{ op: 'delete', name: 'auth-session', options: { path: '/' } }]);
  });
});

describe('admin shell', () => {
  it('exposes the reduced user', async () => {
    const [user] = await createUser('u', 'p');
    expect(await call(adminLayout.load, { locals: { user } })).toEqual({
      user: { id: user.id, username: 'u' },
    });
  });

  it('computes dashboard counters', async () => {
    await createUser('u', 'p');
    await createTag('a');
    await createTag('b');
    expect(await call(adminHome.load, {})).toEqual({
      tagsCount: 2,
      postsCount: 0,
      usersCount: 1,
      authorsCount: 0,
      categoriesCount: 0,
      totalVisits: 0,
    });
  });
});
