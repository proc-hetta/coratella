import { describe, expect, it } from 'vitest';
import { isHttpError, isRedirect } from '@sveltejs/kit';
import { hash } from '@node-rs/argon2';
import { call, cookieJar, formRequest, newPost, thrown } from './helpers';
import * as homePage from '../routes/(non-admin)/+page.server';
import * as postPage from '../routes/(non-admin)/posts/[id=number]/+page.server';
import * as passwordPage from '../routes/(non-admin)/password/+page.server';
import { createAuthor } from '#lib/server/db/authors.ts';
import { createCategory } from '#lib/server/db/categories.ts';
import { getPost, updateOrCreatePost } from '#lib/server/db/posts.ts';
import { argonOptions } from '#lib/server/db/utils.ts';
import { generatePostUnlockToken } from '#lib/server/auth.ts';

async function seedPost(overrides: { password?: string } & Record<string, unknown> = {}) {
  const [author] = await createAuthor('nick');
  const [category] = await createCategory('cat', undefined);
  const password = overrides.password && (await hash(overrides.password, argonOptions));
  return updateOrCreatePost(
    newPost({
      authors: [author],
      categories: [category],
      content: 'body',
      ...overrides,
      password: password ?? null,
    }),
  );
}

const url = (path: string) => new URL(`http://localhost${path}`);

/** Loads post `id` with the given unlock cookie. */
const loadPost = (id: number, unlock?: string) =>
  call(postPage.load, {
    params: { id },
    cookies: cookieJar(unlock ? { 'post-unlock': unlock } : {}).cookies,
  });

describe('home page', () => {
  it('lists published posts newest first, with only the fields the listing shows', async () => {
    await seedPost({ title: 'older' });
    await updateOrCreatePost({
      ...(await getPost(1))!,
      ctime: new Date('2024-01-01T00:00:00Z'),
    });
    await updateOrCreatePost(
      newPost({
        title: 'newer',
        password: 'pw',
        authors: [{ id: 1 }] as never,
        categories: [{ id: 1 }] as never,
      }),
    );
    await updateOrCreatePost(
      newPost({
        title: 'draft',
        draft: true,
        authors: [{ id: 1 }] as never,
        categories: [{ id: 1 }] as never,
      }),
    );
    const { cookies } = cookieJar();
    const data = (await call(homePage.load, { cookies })) as { posts: Record<string, unknown>[] };

    expect(data.posts.map((p) => p.title)).toEqual(['newer', 'older']);
    expect(data.posts[0]).toEqual({
      id: 2,
      title: 'newer',
      ctime: expect.any(Date),
      tags: [],
      categories: [{ id: 1, name: 'cat', color: null }],
      authors: [{ id: 1, nickname: 'nick', firstName: null, lastName: null, image: null }],
    });
  });

  it('never exposes passwords, drafts or post content', async () => {
    await seedPost({ title: 'locked', password: 'secret-pw', content: 'secret-body' });
    await updateOrCreatePost(
      newPost({
        title: 'secret-draft',
        draft: true,
        authors: [{ id: 1 }] as never,
        categories: [{ id: 1 }] as never,
      }),
    );
    const { cookies } = cookieJar();
    const serialized = JSON.stringify(await call(homePage.load, { cookies }));
    expect(serialized).toContain('locked');
    for (const secret of ['secret-pw', 'secret-body', 'secret-draft', '"password"', '"draft"']) {
      expect(serialized).not.toContain(secret);
    }
  });
});

describe('post page', () => {
  it('returns the public fields and rendered content of the post and increments visits', async () => {
    await seedPost({ toc: true, content: '**body**' });
    expect(await loadPost(1)).toEqual({
      post: {
        id: 1,
        title: 'Title',
        html: '<p><strong>body</strong></p>',
        tags: [],
        categories: [{ id: 1, name: 'cat', color: null }],
        authors: [
          { id: 1, nickname: 'nick', firstName: null, lastName: null, image: null, email: null },
        ],
      },
    });
    expect((await getPost(1))!.visits).toBe(1);
  });

  it('answers 404 for drafts, even when unlocked, without counting a visit', async () => {
    await seedPost({ draft: true, password: 'pw' });
    for (const unlock of [undefined, await generatePostUnlockToken(1)]) {
      const error = await thrown(() => loadPost(1, unlock));
      expect(isHttpError(error) && error).toMatchObject({
        status: 404,
        body: { message: 'Not found' },
      });
    }
    expect((await getPost(1))!.visits).toBe(0);
  });

  it('does not send the password back for an unlocked post', async () => {
    await seedPost({ password: 'pw' });
    const data = await loadPost(1, await generatePostUnlockToken(1));
    expect(JSON.stringify(data)).not.toContain('"password"');
  });

  it('throws 404 for a missing post', async () => {
    const error = await thrown(() => loadPost(9));
    expect(isHttpError(error) && error).toMatchObject({
      status: 404,
      body: { message: 'Not found' },
    });
  });

  it('redirects to the password page unless the post is unlocked', async () => {
    await seedPost({ password: 'pw' });
    for (const unlock of [undefined, 'bad', await generatePostUnlockToken(2)]) {
      const error = await thrown(() => loadPost(1, unlock));
      expect(isRedirect(error) && error).toMatchObject({
        status: 307,
        location: '/password?post=1',
      });
    }
    expect((await getPost(1))!.visits).toBe(0);
    expect(await loadPost(1, await generatePostUnlockToken(1))).toMatchObject({ post: { id: 1 } });
    expect((await getPost(1))!.visits).toBe(1);
  });
});

describe('password page', () => {
  it('returns the post id', async () => {
    expect(await call(passwordPage.load, { url: url('/password?post=3') })).toEqual({
      postId: '3',
    });
  });

  it('redirects home without a post', async () => {
    const error = await thrown(() => call(passwordPage.load, { url: url('/password') }));
    expect(isRedirect(error) && error).toMatchObject({ status: 307, location: '/' });
  });

  const unlock = (path: string, password: string) => {
    const jar = cookieJar();
    // The returned failure, or the thrown redirect
    const result = Promise.resolve(
      call(passwordPage.actions.default, {
        url: url(path),
        request: formRequest({ password }),
        cookies: jar.cookies,
      }),
    ).catch((redirect: unknown) => redirect);
    return { jar, result };
  };

  it('unlocks the post with the right password', async () => {
    await seedPost({ password: 'pw' });
    const { jar, result } = unlock('/password?post=1', 'pw');
    expect(isRedirect(await result) && (await result)).toMatchObject({
      status: 303,
      location: '/posts/1',
    });
    expect(jar.operations).toEqual([
      {
        op: 'set',
        name: 'post-unlock',
        value: expect.any(String),
        options: { path: '/posts/1', maxAge: 86400 },
      },
    ]);
    const token = (jar.operations[0] as { value: string }).value;
    expect(await loadPost(1, token)).toMatchObject({ post: { id: 1 } });
  });

  it('rejects a wrong password, a draft, an open or a missing post', async () => {
    await seedPost({ password: 'pw' });
    const post = (await getPost(1))!;
    await updateOrCreatePost({ ...post, id: -1, draft: true });
    await updateOrCreatePost({ ...post, id: -1, password: null });
    for (const [path, password] of [
      ['/password?post=1', 'bad'],
      ['/password?post=2', 'pw'],
      ['/password?post=3', ''],
      ['/password?post=9', 'pw'],
      ['/password?post=x', 'pw'],
    ]) {
      const { jar, result } = unlock(path, password);
      expect(await result).toMatchObject({
        status: 401,
        data: { message: 'Incorrect password' },
      });
      expect(jar.operations).toEqual([]);
    }
  });
});
