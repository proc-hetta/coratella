import * as z from 'zod';
import { formFields, idField, invalid } from '#lib/server/actions.ts';
import { deletePost, getPosts } from '#lib/server/db/posts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return { posts: await getPosts() };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const form = z.object({ id: idField }).safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    await deletePost(form.data.id);
  },
};
