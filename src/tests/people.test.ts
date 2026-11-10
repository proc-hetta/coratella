import { describe, expect, it } from 'vitest';
import { verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { call, formRequest } from './helpers';
import * as authorsPage from '../routes/admin/authors/+page.server';
import * as authorEndpoint from '../routes/admin/authors/[id=number]/+server';
import * as usersPage from '../routes/admin/users/+page.server';
import * as userEndpoint from '../routes/admin/users/[id]/+server';
import * as profilePage from '../routes/admin/profile/+page.server';
import { createAuthor, getAuthors } from '#lib/server/db/authors.ts';
import { createUser, getUsers } from '#lib/server/db/users.ts';
import { argonOptions } from '#lib/server/db/utils.ts';
import { db } from '#lib/server/db/index.ts';
import { users } from '#lib/server/db/schema.ts';

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

  it('stores empty optional fields as empty strings', async () => {
    await call(authorsPage.actions.create, {
      request: formRequest({ nickname: 'n', email: '', firstName: '', lastName: '', image: '' }),
    });
    expect(await getAuthors()).toEqual([
      { id: 1, nickname: 'n', email: '', firstName: '', lastName: '', image: '' },
    ]);
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

  it('reports duplicate nickname as 500', async () => {
    await createAuthor('n');
    expect(
      await call(authorsPage.actions.create, { request: formRequest({ nickname: 'n' }) }),
    ).toMatchObject({ status: 500 });
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
    await call(authorsPage.actions.edit, { request: formRequest({ id: '1' }) });
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
    expect((await call(authorEndpoint.DELETE, { params: { id: '1' } })).status).toBe(204);
    expect(await getAuthors()).toEqual([]);
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
    expect((await call(userEndpoint.DELETE, { params: { id: u.id } })).status).toBe(204);
    expect(await getUsers()).toEqual([]);
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
