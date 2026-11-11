import { describe, expect, it } from 'vitest';
import { isHttpError, isRedirect } from '@sveltejs/kit';
import { call, cookieJar, newPost, thrown } from './helpers';
import * as homePage from '../routes/(non-admin)/+page.server';
import * as postPage from '../routes/(non-admin)/posts/[id=number]/+page.server';
import * as passwordPage from '../routes/(non-admin)/password/+page.server';
import { createAuthor } from '#lib/server/db/authors.ts';
import { createCategory } from '#lib/server/db/categories.ts';
import { getPost, updateOrCreatePost } from '#lib/server/db/posts.ts';

async function seedPost(overrides = {}) {
  const [author] = await createAuthor('nick');
  const [category] = await createCategory('cat', undefined);
  return updateOrCreatePost(
    newPost({ authors: [author], categories: [category], content: 'body', ...overrides }),
  );
}

const url = (path: string) => new URL(`http://localhost${path}`);

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
    expect(data).toMatchObject({
      title: 'Test Title',
      logo: '/logolight.svg',
      themes: ['wintry', 'reign', 'mint', 'rose', 'pine', 'cerberus'],
      modes: ['system', 'dark', 'light'],
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

  it('uses the dark logo when the mode cookie is dark', async () => {
    const { cookies } = cookieJar({ mode: 'dark' });
    expect(((await call(homePage.load, { cookies })) as { logo: string }).logo).toBe(
      '/logodark.svg',
    );
  });
});

describe('post page', () => {
  it('returns the public fields of the post and increments visits', async () => {
    await seedPost({ toc: true });
    const data = await call(postPage.load, { params: { id: '1' }, url: url('/posts/1') });
    expect(data).toEqual({
      post: {
        id: 1,
        title: 'Title',
        content: 'body',
        math: false,
        toc: true,
        tags: [],
        categories: [{ id: 1, name: 'cat', color: null }],
        authors: [
          { id: 1, nickname: 'nick', firstName: null, lastName: null, image: null, email: null },
        ],
      },
    });
    expect((await getPost(1))!.visits).toBe(1);
  });

  it('answers 404 for drafts, even with their password, without counting a visit', async () => {
    await seedPost({ draft: true, password: 'pw' });
    for (const path of ['/posts/1', '/posts/1?password=pw']) {
      const error = await thrown(() =>
        call(postPage.load, { params: { id: '1' }, url: url(path) }),
      );
      expect(isHttpError(error) && error).toMatchObject({
        status: 404,
        body: { message: 'Not found' },
      });
    }
    expect((await getPost(1))!.visits).toBe(0);
  });

  it('does not send the password back for an unlocked post', async () => {
    await seedPost({ password: 'pw' });
    const data = await call(postPage.load, {
      params: { id: '1' },
      url: url('/posts/1?password=pw'),
    });
    expect(JSON.stringify(data)).not.toContain('"password"');
  });

  it('throws 404 for a missing post', async () => {
    const error = await thrown(() =>
      call(postPage.load, { params: { id: '9' }, url: url('/posts/9') }),
    );
    expect(isHttpError(error) && error).toMatchObject({
      status: 404,
      body: { message: 'Not found' },
    });
  });

  it('redirects to the password page unless the right password is in the query', async () => {
    await seedPost({ password: 'pw' });
    for (const path of ['/posts/1', '/posts/1?password=bad']) {
      const error = await thrown(() =>
        call(postPage.load, { params: { id: '1' }, url: url(path) }),
      );
      expect(isRedirect(error) && error).toMatchObject({
        status: 307,
        location: '/password?post=1',
      });
    }
    expect((await getPost(1))!.visits).toBe(0);
    expect(
      await call(postPage.load, { params: { id: '1' }, url: url('/posts/1?password=pw') }),
    ).toMatchObject({ post: { id: 1 } });
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
});
