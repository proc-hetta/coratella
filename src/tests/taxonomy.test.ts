import { describe, expect, it } from 'vitest';
import { call, formRequest } from './helpers';
import * as tagsPage from '../routes/admin/tags/+page.server';
import * as tagEndpoint from '../routes/admin/tags/[id=number]/+server';
import * as categoriesPage from '../routes/admin/categories/+page.server';
import * as categoryEndpoint from '../routes/admin/categories/[id=number]/+server';
import { createTag, getTags } from '$lib/server/db/tags';
import { createCategory, getCategories } from '$lib/server/db/categories';
import { createAuthor } from '$lib/server/db/authors';
import { updateOrCreatePost } from '$lib/server/db/posts';
import { newPost } from './helpers';

describe('admin tags', () => {
  it('loads tags ordered by id', async () => {
    await createTag('b');
    await createTag('a');
    expect(await call(tagsPage.load, {})).toEqual({
      tags: [
        { id: 1, name: 'b' },
        { id: 2, name: 'a' },
      ],
    });
  });

  it('creates a tag', async () => {
    const result = await call(tagsPage.actions.create, {
      request: formRequest({ name: 'svelte' }),
    });
    expect(result).toBeUndefined();
    expect(await getTags()).toEqual([{ id: 1, name: 'svelte' }]);
  });

  it('rejects a tag without name', async () => {
    const result = await call(tagsPage.actions.create, { request: formRequest({}) });
    expect(result).toEqual({
      status: 400,
      data: { message: 'Missing required parameters: Name' },
    });
  });

  it('reports database errors as 500', async () => {
    await createTag('dup');
    const result = await call(tagsPage.actions.create, { request: formRequest({ name: 'dup' }) });
    expect(result).toMatchObject({ status: 500 });
  });

  it('edits a tag', async () => {
    await createTag('old');
    await call(tagsPage.actions.edit, { request: formRequest({ id: '1', name: 'new' }) });
    expect(await getTags()).toEqual([{ id: 1, name: 'new' }]);
  });

  it('validates edit parameters', async () => {
    expect(
      await call(tagsPage.actions.edit, { request: formRequest({ name: 'x' }) }),
    ).toMatchObject({ status: 400, data: { message: 'Missing ID' } });
    expect(await call(tagsPage.actions.edit, { request: formRequest({ id: '1' }) })).toMatchObject({
      status: 400,
      data: { message: 'Missing required parameters: Name' },
    });
  });

  it('deletes a tag', async () => {
    await createTag('x');
    const response = await call(tagEndpoint.DELETE, { params: { id: '1' } });
    expect(response.status).toBe(204);
    expect(await getTags()).toEqual([]);
  });

  it('fails to delete a tag used by a post', async () => {
    const [tag] = await createTag('used');
    const [author] = await createAuthor('nick');
    const [category] = await createCategory('cat', undefined);
    await updateOrCreatePost(newPost({ tags: [tag], authors: [author], categories: [category] }));
    await expect(call(tagEndpoint.DELETE, { params: { id: '1' } })).rejects.toThrow();
  });
});

describe('admin categories', () => {
  it('creates a category with and without color', async () => {
    await call(categoriesPage.actions.create, {
      request: formRequest({ name: 'red', color: '#ff0000' }),
    });
    await call(categoriesPage.actions.create, { request: formRequest({ name: 'plain' }) });
    expect(await call(categoriesPage.load, {})).toEqual({
      categories: [
        { id: 1, name: 'red', color: '#ff0000' },
        { id: 2, name: 'plain', color: null },
      ],
    });
  });

  it('treats an empty color as no color', async () => {
    await call(categoriesPage.actions.create, {
      request: formRequest({ name: 'empty', color: '' }),
    });
    expect(await getCategories()).toEqual([{ id: 1, name: 'empty', color: null }]);
  });

  it('edits a category, keeping color when omitted', async () => {
    await createCategory('c', '#000000');
    await call(categoriesPage.actions.edit, { request: formRequest({ id: '1', name: 'd' }) });
    expect(await getCategories()).toEqual([{ id: 1, name: 'd', color: '#000000' }]);
    await call(categoriesPage.actions.edit, {
      request: formRequest({ id: '1', name: 'd', color: '#00ff00' }),
    });
    expect(await getCategories()).toEqual([{ id: 1, name: 'd', color: '#00ff00' }]);
  });

  it('validates parameters', async () => {
    expect(await call(categoriesPage.actions.create, { request: formRequest({}) })).toMatchObject({
      status: 400,
      data: { message: 'Missing required parameters: Name' },
    });
    expect(
      await call(categoriesPage.actions.edit, { request: formRequest({ name: 'x' }) }),
    ).toMatchObject({ status: 400, data: { message: 'Missing ID' } });
    expect(
      await call(categoriesPage.actions.edit, { request: formRequest({ id: '1' }) }),
    ).toMatchObject({ status: 400, data: { message: 'Missing required parameters: Name' } });
  });

  it('deletes a category', async () => {
    await createCategory('c', undefined);
    const response = await call(categoryEndpoint.DELETE, { params: { id: '1' } });
    expect(response.status).toBe(204);
    expect(await getCategories()).toEqual([]);
  });
});
