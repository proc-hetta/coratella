import { afterEach, describe, expect, it, vi } from 'vitest';
import { isRedirect } from '@sveltejs/kit';
import * as jose from 'jose';
import { call, cookieJar, formRequest, thrown } from './helpers';
import * as auth from '$lib/server/auth';
import * as loginPage from '../routes/(non-admin)/login/+page.server';
import * as logout from '../routes/(non-admin)/logout/+server';
import * as adminLayout from '../routes/admin/+layout.server';
import * as adminHome from '../routes/admin/+page.server';
import * as files from '../routes/admin/files/+server';
import { createUser } from '$lib/server/db/users';
import { createTag } from '$lib/server/db/tags';

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

  it('exposes title and logo on the login page', async () => {
    expect(await call(loginPage.load, {})).toEqual({
      title: 'Test Title',
      logo: '/logolight.svg',
    });
  });

  it('logs out by deleting the cookie and redirecting to login', async () => {
    const { cookies, operations } = cookieJar({ 'auth-session': 'x' });
    const result = await thrown(() => call(logout.GET, { cookies }));
    expect(isRedirect(result) && result).toMatchObject({ status: 302, location: '/login' });
    expect(operations).toEqual([{ op: 'delete', name: 'auth-session', options: { path: '/' } }]);
  });
});

describe('admin shell', () => {
  it('exposes reduced user, themes, modes, title and mode-dependent logo', async () => {
    const [user] = await createUser('u', 'p');
    const light = cookieJar();
    expect(await call(adminLayout.load, { locals: { user }, cookies: light.cookies })).toEqual({
      user: { id: user.id, username: 'u' },
      themes: ['wintry', 'reign', 'mint', 'rose', 'pine', 'cerberus'],
      modes: ['system', 'dark', 'light'],
      title: 'Test Title',
      logo: '/logolight.svg',
    });
    const dark = cookieJar({ mode: 'dark' });
    expect(
      (
        (await call(adminLayout.load, { locals: { user }, cookies: dark.cookies })) as {
          logo: string;
        }
      ).logo,
    ).toBe('/logodark.svg');
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
      title: 'Test Title',
      logo: '/logolight.svg',
    });
  });
});

describe('file upload', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const upload = () => {
    const body = new FormData();
    body.append('file', new File(['data'], 'a.png', { type: 'image/png' }));
    return call(files.POST, {
      request: new Request('http://localhost/admin/files', { method: 'POST', body }),
    });
  };

  it('answers 401 when Torcolo is not configured', async () => {
    vi.stubEnv('TORCOLO_URL', undefined);
    vi.stubEnv('TORCOLO_TOKEN', undefined);
    expect((await upload()).status).toBe(401);
  });

  it('forwards the file to Torcolo and returns its location', async () => {
    vi.stubEnv('TORCOLO_URL', 'https://torcolo.test');
    vi.stubEnv('TORCOLO_TOKEN', 'tok');
    const fetchMock = vi.fn(
      async () => new Response(null, { status: 201, headers: { Location: '/files/abc' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const response = await upload();
    expect(response.status).toBe(201);
    expect(response.headers.get('Location')).toBe('https://torcolo.test/files/abc');
    const [target, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(target).toBe('https://torcolo.test/files');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ Authorization: 'Bearer tok' });
    expect((init.body as FormData).get('file')).toBeInstanceOf(File);
  });

  it('fails when Torcolo answers with an error', async () => {
    vi.stubEnv('TORCOLO_URL', 'https://torcolo.test');
    vi.stubEnv('TORCOLO_TOKEN', 'tok');
    vi.stubGlobal('fetch', async () => new Response(null, { status: 500 }));
    await expect(upload()).rejects.toThrow('Error while uploading file, status code 500');
  });
});
