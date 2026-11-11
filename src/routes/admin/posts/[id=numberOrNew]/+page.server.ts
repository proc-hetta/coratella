import { error, redirect } from '@sveltejs/kit';
import { hash } from '@node-rs/argon2';
import * as z from 'zod';
import { invalid } from '#lib/server/actions.ts';
import { numericId } from '#lib/schemas.ts';
import { m } from '#lib/paraglide/messages.js';
import { getCategories } from '#lib/server/db/categories.ts';
import { getTags } from '#lib/server/db/tags.ts';
import { getPost, updateOrCreatePost } from '#lib/server/db/posts.ts';
import { argonOptions } from '#lib/server/db/utils.ts';
import type { Actions, PageServerLoad } from './$types';
import { getAuthors } from '#lib/server/db/authors.ts';

const checkbox = z.literal('on').optional().transform(Boolean);
const ids = (min: number) =>
  z
    .array(numericId)
    .min(min, { error: () => m.errorWhileSaving() })
    .transform((ids) => ids.map((id) => ({ id })));

const postForm = z.object({
  title: z.string(),
  content: z.string(),
  // A new password; empty keeps the current one
  password: z.string(),
  removePassword: checkbox,
  draft: z.enum(['true', 'false']).transform((draft) => draft === 'true'),
  toc: checkbox,
  math: checkbox,
  tags: ids(0),
  categories: ids(1),
  authors: ids(1),
});

export const load: PageServerLoad = async ({ params }) => {
  let post = null;
  if (params.id !== 'new') {
    post = await getPost(params.id);
    if (!post) {
      redirect(302, '/admin/posts');
    }
  }
  return {
    categories: await getCategories(),
    tags: await getTags(),
    authors: await getAuthors(),
    post: post && {
      id: post.id,
      title: post.title,
      content: post.content,
      hasPassword: post.password !== null,
      draft: post.draft,
      toc: post.toc,
      math: post.math,
      tags: post.tags,
      categories: post.categories,
      authors: post.authors,
    },
  };
};

export const actions: Actions = {
  save: async ({ params, request }) => {
    const data = await request.formData();
    const form = postForm.safeParse({
      ...Object.fromEntries(data),
      tags: data.getAll('tags'),
      categories: data.getAll('categories'),
      authors: data.getAll('authors'),
    });
    if (!form.success) return invalid(form.error);

    const existing = params.id === 'new' ? null : await getPost(params.id);
    if (params.id !== 'new' && !existing) {
      error(404, 'Not found');
    }
    const { password, removePassword, ...fields } = form.data;
    await updateOrCreatePost({
      ...fields,
      id: existing?.id ?? -1,
      password: removePassword
        ? null
        : password
          ? await hash(password, argonOptions)
          : (existing?.password ?? null),
      // Creation time and visits are never taken from the form
      ctime: existing?.ctime ?? new Date(),
      visits: existing?.visits ?? 0,
    });
    redirect(303, '/admin/posts');
  },
};
