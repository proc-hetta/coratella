import { describe, expect, it } from 'vitest';
import { isHttpError, isRedirect } from '@sveltejs/kit';
import { verify } from '@node-rs/argon2';
import { call, formRequest, newPost, thrown } from './helpers';
import * as postsPage from '../routes/admin/posts/+page.server';
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
import { argonOptions } from '#lib/server/db/utils.ts';
import { hashPlaintextPostPasswords } from '#lib/server/db/post-passwords.ts';
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
    expect(await totalVisits()).toBe(8);
  });

  it('returns 0 total visits with no posts and null for missing post', async () => {
    expect(await totalVisits()).toBe(0);
    expect(await getPost(1)).toBeNull();
    expect(await getPosts()).toEqual([]);
  });

  it('hashes post passwords still stored in plaintext', async () => {
    const { author, category } = await relations();
    const base = { authors: [author], categories: [category] };
    await updateOrCreatePost(newPost({ ...base, password: 'plain' }));
    await updateOrCreatePost(newPost({ ...base, password: '$argon2id$v=19$already' }));
    await updateOrCreatePost(newPost(base));
    await hashPlaintextPostPasswords(db);
    const [plain, hashed, open] = await Promise.all([1, 2, 3].map((id) => getPost(id)));
    expect(await verify(plain!.password!, 'plain', argonOptions)).toBe(true);
    expect(hashed!.password).toBe('$argon2id$v=19$already');
    expect(open!.password).toBeNull();
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

  it('deletes a post with its relations', async () => {
    const { author, category, tag } = await relations();
    await updateOrCreatePost(newPost({ authors: [author], categories: [category], tags: [tag] }));
    const result = await call(postsPage.actions.delete, { request: formRequest({ id: '1' }) });
    expect(result).toBeUndefined();
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
    await updateOrCreatePost(
      newPost({ password: 'hash', authors: [author], categories: [category] }),
    );
    const { post } = (await call(postEditor.load, { params: { id: 1 } })) as {
      post: Record<string, unknown>;
    };
    expect(post).toMatchObject({ id: 1, hasPassword: true });
    expect(post).not.toHaveProperty('password');
    const error = await thrown(() => call(postEditor.load, { params: { id: 2 } }));
    expect(isRedirect(error) && error).toMatchObject({ status: 302, location: '/admin/posts' });
  });

  describe('save action', () => {
    const save = (id: number | 'new', fields: Record<string, string | string[]>) =>
      thrown(() =>
        call(postEditor.actions.save, {
          params: { id },
          request: formRequest({
            title: 'T',
            content: 'C',
            password: '',
            draft: 'false',
            ...fields,
          }),
        }),
      );

    it('creates a post and redirects to the list', async () => {
      const { author, category, tag } = await relations();
      const result = await save('new', {
        toc: 'on',
        authors: [String(author.id)],
        categories: [String(category.id)],
        tags: [String(tag.id)],
        password: 'secret',
        draft: 'true',
      });
      expect(isRedirect(result) && result).toMatchObject({ status: 303, location: '/admin/posts' });
      const post = await getPost(1);
      expect(post).toMatchObject({
        title: 'T',
        content: 'C',
        draft: true,
        toc: true,
        math: false,
        visits: 0,
        authors: [author],
        categories: [category],
        tags: [tag],
      });
      expect(await verify(post!.password!, 'secret', argonOptions)).toBe(true);
    });

    it('updates in place, keeping creation time, visits and password', async () => {
      const { author, author2, category } = await relations();
      await save('new', {
        password: 'secret',
        authors: [String(author.id)],
        categories: [String(category.id)],
      });
      await incrementVisits(1);
      const before = (await getPost(1))!;
      await save(1, {
        title: 'Renamed',
        authors: [String(author2.id)],
        categories: [String(category.id)],
      });
      expect(await getPosts()).toHaveLength(1);
      const after = (await getPost(1))!;
      expect(after).toMatchObject({ id: 1, title: 'Renamed', visits: 1, authors: [author2] });
      expect(after.ctime).toEqual(before.ctime);
      expect(after.password).toBe(before.password);
    });

    it('replaces or removes the password', async () => {
      const { author, category } = await relations();
      const base = { authors: [String(author.id)], categories: [String(category.id)] };
      await save('new', { ...base, password: 'old' });
      await save(1, { ...base, password: 'new' });
      expect(await verify((await getPost(1))!.password!, 'new', argonOptions)).toBe(true);
      await save(1, { ...base, password: 'ignored', removePassword: 'on' });
      expect((await getPost(1))!.password).toBeNull();
    });

    it('requires authors and categories', async () => {
      const { author, category } = await relations();
      const cases: Record<string, string[]>[] = [
        { authors: [String(author.id)] },
        { categories: [String(category.id)] },
      ];
      for (const fields of cases) {
        expect(
          await call(postEditor.actions.save, {
            params: { id: 'new' },
            request: formRequest({
              title: 'T',
              content: 'C',
              password: '',
              draft: 'false',
              ...fields,
            }),
          }),
        ).toMatchObject({ status: 400, data: { message: 'Error while saving' } });
      }
      expect(await getPosts()).toEqual([]);
    });

    it('answers 404 for a missing post', async () => {
      const { author, category } = await relations();
      const error = await save(9, {
        authors: [String(author.id)],
        categories: [String(category.id)],
      });
      expect(isHttpError(error) && error.status).toBe(404);
      expect(await getPosts()).toEqual([]);
    });
  });
});
