import { afterEach, describe, expect, it, vi } from 'vitest';
import { verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { call, formRequest, newPost } from './helpers';
import * as authorsPage from '../routes/admin/authors/+page.server';
import * as usersPage from '../routes/admin/users/+page.server';
import * as profilePage from '../routes/admin/profile/+page.server';
import { createAuthor, getAuthors } from '#lib/server/db/authors.ts';
import { createUser, getUsers } from '#lib/server/db/users.ts';
import { argonOptions } from '#lib/server/db/utils.ts';
import { db } from '#lib/server/db/index.ts';
import { users } from '#lib/server/db/schema.ts';
import { createCategory } from '#lib/server/db/categories.ts';
import { updateOrCreatePost } from '#lib/server/db/posts.ts';

const author = {
  nickname: 'nick',
  email: 'nick@example.com',
  firstName: 'Nick',
  lastName: 'Name',
  image: 'https://img/nick.png',
};

async function passwordOf(id: string) {
  const [row] = await db.select().from(users).where(eq(users.id, id));
  return row.password;
}

describe('admin authors', () => {
  it('creates an author with all fields', async () => {
    const result = await call(authorsPage.actions.create, { request: formRequest(author) });
    expect(result).toBeUndefined();
    expect(await call(authorsPage.load, {})).toEqual({ authors: [{ id: 1, ...author }] });
  });

  it('stores empty optional fields as null', async () => {
    await call(authorsPage.actions.create, {
      request: formRequest({ nickname: 'n', email: '', firstName: '', lastName: '', image: '' }),
    });
    expect(await getAuthors()).toEqual([
      { id: 1, nickname: 'n', email: null, firstName: null, lastName: null, image: null },
    ]);
  });

  it('creates several authors without an email', async () => {
    for (const nickname of ['a', 'b']) {
      expect(
        await call(authorsPage.actions.create, { request: formRequest({ nickname, email: '' }) }),
      ).toBeUndefined();
    }
    expect(await getAuthors()).toHaveLength(2);
  });

  it('stores missing optional fields as null', async () => {
    await call(authorsPage.actions.create, { request: formRequest({ nickname: 'n' }) });
    expect(await getAuthors()).toEqual([
      { id: 1, nickname: 'n', email: null, firstName: null, lastName: null, image: null },
    ]);
  });

  it('requires a nickname', async () => {
    expect(
      await call(authorsPage.actions.create, { request: formRequest({ email: 'a@b.c' }) }),
    ).toMatchObject({ status: 400, data: { message: 'Missing required parameters: Nickname' } });
  });

  it.each(['not-an-email', 'a@b', 'x a@b.com', 'a@b.com x'])('rejects email %s', async (email) => {
    expect(
      await call(authorsPage.actions.create, { request: formRequest({ nickname: 'n', email }) }),
    ).toMatchObject({ status: 400, data: { message: 'Incorrect required parameters: Email' } });
  });

  it('reports a duplicate nickname or email', async () => {
    await createAuthor('n', 'n@x.it');
    const cases: Record<string, string>[] = [{ nickname: 'n' }, { nickname: 'm', email: 'n@x.it' }];
    for (const fields of cases) {
      expect(
        await call(authorsPage.actions.create, { request: formRequest(fields) }),
      ).toMatchObject({
        status: 400,
        data: { message: 'An element with the same values already exists' },
      });
    }
  });

  it('edits only the provided non-empty fields, image also when empty', async () => {
    await createAuthor('n', 'n@x.it', 'F', 'L', 'img');
    await call(authorsPage.actions.edit, {
      request: formRequest({
        id: '1',
        nickname: '',
        email: '',
        firstName: 'G',
        lastName: '',
        image: '',
      }),
    });
    expect(await getAuthors()).toEqual([
      { id: 1, nickname: 'n', email: 'n@x.it', firstName: 'G', lastName: 'L', image: '' },
    ]);
    // Nothing to update is an error
    await expect(
      call(authorsPage.actions.edit, { request: formRequest({ id: '1' }) }),
    ).rejects.toThrow('No values to set');
    expect(await getAuthors()).toEqual([
      { id: 1, nickname: 'n', email: 'n@x.it', firstName: 'G', lastName: 'L', image: '' },
    ]);
  });

  it('validates edit parameters', async () => {
    expect(await call(authorsPage.actions.edit, { request: formRequest({}) })).toMatchObject({
      status: 400,
      data: { message: 'Missing ID' },
    });
    expect(
      await call(authorsPage.actions.edit, { request: formRequest({ id: '1', email: 'bad' }) }),
    ).toMatchObject({ status: 400, data: { message: 'Incorrect required parameters: Email' } });
  });

  it('deletes an author', async () => {
    await createAuthor('n');
    const result = await call(authorsPage.actions.delete, { request: formRequest({ id: '1' }) });
    expect(result).toBeUndefined();
    expect(await getAuthors()).toEqual([]);
  });

  it('refuses to delete an author of a post', async () => {
    const [author] = await createAuthor('n');
    const [category] = await createCategory('c', undefined);
    await updateOrCreatePost(newPost({ authors: [author], categories: [category] }));
    expect(
      await call(authorsPage.actions.delete, { request: formRequest({ id: '1' }) }),
    ).toMatchObject({ status: 400, data: { message: 'Error while deleting' } });
    expect(await getAuthors()).toHaveLength(1);
  });
});

describe('author images', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const image = () => new File(['data'], 'a.png', { type: 'image/png' });
  const create = (imageFile: File) =>
    call(authorsPage.actions.create, { request: formRequest({ nickname: 'n', imageFile }) });

  it('fails when Torcolo is not configured', async () => {
    vi.stubEnv('TORCOLO_URL', undefined);
    vi.stubEnv('TORCOLO_TOKEN', undefined);
    expect(await create(image())).toMatchObject({
      status: 401,
      data: { message: 'Error: Torcolo credentials are either invalid or not provided' },
    });
    expect(await getAuthors()).toEqual([]);
  });

  it('uploads the image to Torcolo and stores its location', async () => {
    vi.stubEnv('TORCOLO_URL', 'https://torcolo.test');
    vi.stubEnv('TORCOLO_TOKEN', 'tok');
    const fetchMock = vi.fn(
      async () => new Response(null, { status: 201, headers: { Location: '/files/abc' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    expect(await create(image())).toBeUndefined();
    expect((await getAuthors())[0].image).toBe('https://torcolo.test/files/abc');
    const [target, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(target).toBe('https://torcolo.test/files');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ Authorization: 'Bearer tok' });
    expect((init.body as FormData).get('file')).toBeInstanceOf(File);
  });

  it('replaces the image on edit', async () => {
    vi.stubEnv('TORCOLO_URL', 'https://torcolo.test');
    vi.stubEnv('TORCOLO_TOKEN', 'tok');
    vi.stubGlobal(
      'fetch',
      async () => new Response(null, { status: 201, headers: { Location: '/files/new' } }),
    );
    await createAuthor('n', undefined, undefined, undefined, 'old');
    await call(authorsPage.actions.edit, {
      request: formRequest({ id: '1', image: 'old', imageFile: image() }),
    });
    expect((await getAuthors())[0].image).toBe('https://torcolo.test/files/new');
  });

  it('fails when Torcolo answers with an error', async () => {
    vi.stubEnv('TORCOLO_URL', 'https://torcolo.test');
    vi.stubEnv('TORCOLO_TOKEN', 'tok');
    vi.stubGlobal('fetch', async () => new Response(null, { status: 500 }));
    await expect(create(image())).rejects.toThrow('Error while uploading file, status code 500');
  });

  it('rejects files that are not images', async () => {
    expect(await create(new File(['x'], 'a.txt', { type: 'text/plain' }))).toMatchObject({
      status: 400,
      data: { message: 'Incorrect required parameters: Image' },
    });
  });
});

describe('admin users', () => {
  it('loads users and the reduced current user', async () => {
    const [me] = await createUser('me', 'pw');
    const result = await call(usersPage.load, { locals: { user: me } });
    expect(result).toEqual({
      users: [{ id: me.id, username: 'me' }],
      user: { id: me.id, username: 'me' },
    });
  });

  it('creates a user with an argon2 hashed password', async () => {
    const result = await call(usersPage.actions.create, {
      request: formRequest({ username: 'u', password: 'secret' }),
    });
    expect(result).toBeUndefined();
    const [created] = await getUsers();
    expect(created.username).toBe('u');
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    const hash = await passwordOf(created.id);
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    expect(await verify(hash, 'secret', argonOptions)).toBe(true);
  });

  it('requires username and password on create', async () => {
    const cases: Record<string, string>[] = [{ username: 'u' }, { password: 'p' }, {}];
    for (const fields of cases) {
      expect(await call(usersPage.actions.create, { request: formRequest(fields) })).toMatchObject({
        status: 400,
        data: { message: 'Both username and password must be set' },
      });
    }
  });

  it('edits username and password independently', async () => {
    const [u] = await createUser('u', 'old');
    const oldHash = await passwordOf(u.id);
    await call(usersPage.actions.edit, {
      request: formRequest({ id: u.id, username: 'v', password: '' }),
    });
    expect(await getUsers()).toEqual([{ id: u.id, username: 'v' }]);
    expect(await passwordOf(u.id)).toBe(oldHash);
    await call(usersPage.actions.edit, {
      request: formRequest({ id: u.id, username: '', password: 'new' }),
    });
    expect(await getUsers()).toEqual([{ id: u.id, username: 'v' }]);
    expect(await verify(await passwordOf(u.id), 'new', argonOptions)).toBe(true);
  });

  it('requires an id on edit', async () => {
    expect(await call(usersPage.actions.edit, { request: formRequest({}) })).toMatchObject({
      status: 400,
      data: { message: 'Missing ID' },
    });
  });

  it('deletes any user, including the current one', async () => {
    const [u] = await createUser('u', 'p');
    const result = await call(usersPage.actions.delete, { request: formRequest({ id: u.id }) });
    expect(result).toBeUndefined();
    expect(await getUsers()).toEqual([]);
  });

  it('reports a duplicate username', async () => {
    await createUser('u', 'p');
    expect(
      await call(usersPage.actions.create, {
        request: formRequest({ username: 'u', password: 'q' }),
      }),
    ).toMatchObject({
      status: 400,
      data: { message: 'An element with the same values already exists' },
    });
  });
});

describe('admin profile', () => {
  it('loads the reduced current user', async () => {
    const [me] = await createUser('me', 'pw');
    expect(await call(profilePage.load, { locals: { user: me } })).toEqual({
      user: { id: me.id, username: 'me' },
    });
  });

  it('rejects mismatching passwords', async () => {
    const [me] = await createUser('me', 'pw');
    expect(
      await call(profilePage.actions.default, {
        locals: { user: me },
        request: formRequest({ username: 'me', password: 'a', repeatPassword: 'b' }),
      }),
    ).toMatchObject({ status: 400, data: { message: "Password doesn't match" } });
  });

  it('updates username and password of the current user', async () => {
    const [me] = await createUser('me', 'pw');
    await call(profilePage.actions.default, {
      locals: { user: me },
      request: formRequest({ username: 'you', password: 'np', repeatPassword: 'np' }),
    });
    expect(await getUsers()).toEqual([{ id: me.id, username: 'you' }]);
    expect(await verify(await passwordOf(me.id), 'np', argonOptions)).toBe(true);
  });

  it('keeps the password when both fields are empty', async () => {
    const [me] = await createUser('me', 'pw');
    const oldHash = await passwordOf(me.id);
    await call(profilePage.actions.default, {
      locals: { user: me },
      request: formRequest({ username: 'me', password: '', repeatPassword: '' }),
    });
    expect(await passwordOf(me.id)).toBe(oldHash);
  });
});
