import { describe, expect, it } from 'vitest';
import { isHttpError, isRedirect } from '@sveltejs/kit';
import { call, cookieJar, newPost, thrown } from './helpers';
import * as homePage from '../routes/(non-admin)/+page.server';
import * as postPage from '../routes/(non-admin)/posts/[id=number]/+page.server';
import * as passwordPage from '../routes/(non-admin)/password/+page.server';
import { createAuthor } from '$lib/server/db/authors';
import { createCategory } from '$lib/server/db/categories';
import { getPost, updateOrCreatePost } from '$lib/server/db/posts';
import type { Post } from '$lib/server/db/schema';

async function seedPost(overrides = {}) {
  const [author] = await createAuthor('nick');
  const [category] = await createCategory('cat', undefined);
  return updateOrCreatePost(
    newPost({ authors: [author], categories: [category], content: 'body', ...overrides }),
  );
}

const url = (path: string) => new URL(`http://localhost${path}`);

describe('home page', () => {
  it('returns every post with blanked content, plus title, logo, themes and modes', async () => {
    await seedPost({ title: 'public' });
    await updateOrCreatePost(
      newPost({
        title: 'draft',
        draft: true,
        password: 'pw',
        authors: [{ id: 1 }] as never,
        categories: [{ id: 1 }] as never,
      }),
    );
    const { cookies } = cookieJar();
    const data = (await call(homePage.load, { cookies })) as { posts: Post[] };
    expect(data.posts.map((p) => [p.title, p.content, p.draft, p.password])).toEqual([
      ['public', '', false, null],
      ['draft', '', true, 'pw'],
    ]);
    expect(data).toMatchObject({
      title: 'Test Title',
      logo: '/logolight.svg',
      themes: ['wintry', 'reign', 'mint', 'rose', 'pine', 'cerberus'],
      modes: ['system', 'dark', 'light'],
    });
  });

  it('uses the dark logo when the mode cookie is dark', async () => {
    const { cookies } = cookieJar({ mode: 'dark' });
    expect(((await call(homePage.load, { cookies })) as { logo: string }).logo).toBe(
      '/logodark.svg',
    );
  });
});

describe('post page', () => {
  it('returns the post and increments visits', async () => {
    await seedPost();
    const data = await call(postPage.load, { params: { id: '1' }, url: url('/posts/1') });
    expect(data).toMatchObject({ post: { id: 1, content: 'body', visits: 0 } });
    expect((await getPost(1))!.visits).toBe(1);
  });

  it('serves drafts too', async () => {
    await seedPost({ draft: true });
    expect(await call(postPage.load, { params: { id: '1' }, url: url('/posts/1') })).toMatchObject({
      post: { id: 1, draft: true },
    });
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
