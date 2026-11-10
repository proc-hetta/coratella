import { describe, expect, it } from 'vitest';
import { isRedirect } from '@sveltejs/kit';
import { call, jsonRequest, newPost, thrown } from './helpers';
import * as postsPage from '../routes/admin/posts/+page.server';
import * as postsEndpoint from '../routes/admin/posts/+server';
import * as postEndpoint from '../routes/admin/posts/[id=numberOrNew]/+server';
import * as postEditor from '../routes/admin/posts/[id=numberOrNew]/+page.server';
import { createAuthor } from '#lib/server/db/authors.ts';
import { createCategory } from '#lib/server/db/categories.ts';
import { createTag } from '#lib/server/db/tags.ts';
import {
  getPost,
  getPosts,
  incrementVisits,
  totalVisits,
  updateOrCreatePost,
} from '#lib/server/db/posts.ts';
import { db } from '#lib/server/db/index.ts';
import { postsToAuthors, postsToCategories, postsToTags } from '#lib/server/db/schema.ts';

async function relations() {
  const [author] = await createAuthor('nick', 'n@x.it', 'N', 'K', 'img');
  const [author2] = await createAuthor('other');
  const [category] = await createCategory('cat', '#ff0000');
  const [tag] = await createTag('tag');
  const [tag2] = await createTag('tag2');
  return { author, author2, category, tag, tag2 };
}

describe('posts data layer', () => {
  it('creates a post with relations', async () => {
    const { author, category, tag } = await relations();
    const created = await updateOrCreatePost(
      newPost({
        title: 'T',
        content: 'C',
        password: '',
        toc: true,
        math: true,
        visits: 5,
        authors: [author],
        categories: [category],
        tags: [tag],
      }),
    );
    expect(created).toMatchObject({
      id: 1,
      title: 'T',
      content: 'C',
      password: null,
      draft: false,
      toc: true,
      math: true,
      visits: 5,
      authors: [author],
      categories: [category],
      tags: [tag],
    });
    // ctime of a new post is assigned by the database, not taken from the payload
    expect(created!.ctime.getTime()).toBeGreaterThan(new Date('2024-01-02').getTime());
  });

  it('requires authors and categories', async () => {
    const { author, category } = await relations();
    await expect(updateOrCreatePost(newPost({ categories: [category] }))).rejects.toThrow(
      'Authors or Categories are empty!',
    );
    await expect(updateOrCreatePost(newPost({ authors: [author] }))).rejects.toThrow(
      'Authors or Categories are empty!',
    );
  });

  it('updates by recreating the post with the same id, ctime and visits from payload', async () => {
    const { author, author2, category, tag, tag2 } = await relations();
    const created = await updateOrCreatePost(
      newPost({ authors: [author], categories: [category], tags: [tag] }),
    );
    const updated = await updateOrCreatePost({
      ...created!,
      title: 'Updated',
      password: 'secret',
      draft: true,
      ctime: new Date('2020-05-05T10:00:00Z'),
      visits: 42,
      authors: [author2],
      tags: [tag2, tag],
    });
    expect(updated).toMatchObject({
      id: created!.id,
      title: 'Updated',
      password: 'secret',
      draft: true,
      visits: 42,
      authors: [author2],
      categories: [category],
    });
    expect(updated!.ctime.toISOString()).toBe('2020-05-05T10:00:00.000Z');
    expect(updated!.tags.map((t) => t.id).sort()).toEqual([tag.id, tag2.id]);
    expect(await getPosts()).toHaveLength(1);
  });

  it('increments and sums visits', async () => {
    const { author, category } = await relations();
    await updateOrCreatePost(newPost({ visits: 3, authors: [author], categories: [category] }));
    await updateOrCreatePost(newPost({ visits: 4, authors: [author], categories: [category] }));
    await incrementVisits(1);
    expect((await getPost(1))!.visits).toBe(4);
    expect(await totalVisits()).toBe('8');
  });

  it('returns 0 total visits with no posts and null for missing post', async () => {
    expect(await totalVisits()).toBe(0);
    expect(await getPost(1)).toBeNull();
    expect(await getPosts()).toEqual([]);
  });
});

describe('admin posts routes', () => {
  it('lists posts with relations', async () => {
    const { author, category, tag } = await relations();
    await updateOrCreatePost(newPost({ authors: [author], categories: [category], tags: [tag] }));
    const { posts } = (await call(postsPage.load, {})) as { posts: unknown[] };
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      id: 1,
      authors: [author],
      categories: [category],
      tags: [tag],
    });
  });

  it('creates through POST only when id is -1', async () => {
    const { author, category } = await relations();
    const forbidden = await call(postsEndpoint.POST, {
      request: jsonRequest('POST', newPost({ id: 7, authors: [author], categories: [category] })),
    });
    expect(forbidden.status).toBe(403);

    const response = await call(postsEndpoint.POST, {
      request: jsonRequest('POST', newPost({ authors: [author], categories: [category] })),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('Location')).toBe('/admin/posts/1');
    expect(await response.json()).toMatchObject({ id: 1, title: 'Title' });
  });

  it('updates through PUT only when id is not -1', async () => {
    const { author, category } = await relations();
    const created = await updateOrCreatePost(
      newPost({ authors: [author], categories: [category] }),
    );

    const forbidden = await call(postEndpoint.PUT, {
      request: jsonRequest('PUT', newPost({ authors: [author], categories: [category] })),
    });
    expect(forbidden.status).toBe(403);

    const response = await call(postEndpoint.PUT, {
      request: jsonRequest('PUT', { ...created, title: 'Changed' }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('Location')).toBe('/admin/posts/1');
    expect(await response.json()).toMatchObject({ id: 1, title: 'Changed' });
  });

  it('deletes a post with its relations', async () => {
    const { author, category, tag } = await relations();
    await updateOrCreatePost(newPost({ authors: [author], categories: [category], tags: [tag] }));
    const response = await call(postEndpoint.DELETE, { params: { id: '1' } });
    expect(response.status).toBe(204);
    expect(await getPosts()).toEqual([]);
    expect(await db.select().from(postsToAuthors)).toEqual([]);
    expect(await db.select().from(postsToTags)).toEqual([]);
    expect(await db.select().from(postsToCategories)).toEqual([]);
  });

  it('loads the editor for a new post', async () => {
    const { author, category, tag } = await relations();
    const data = await call(postEditor.load, { params: { id: 'new' } });
    expect(data).toMatchObject({
      post: null,
      categories: [category],
      tags: [{ id: tag.id, name: 'tag' }, { name: 'tag2' }],
      authors: [author, { nickname: 'other' }],
    });
  });

  it('loads the editor for an existing post and redirects for a missing one', async () => {
    const { author, category } = await relations();
    await updateOrCreatePost(newPost({ authors: [author], categories: [category] }));
    expect(await call(postEditor.load, { params: { id: '1' } })).toMatchObject({
      post: { id: 1 },
    });
    const error = await thrown(() => call(postEditor.load, { params: { id: '2' } }));
    expect(isRedirect(error) && error).toMatchObject({ status: 302, location: '/admin/posts' });
  });
});
