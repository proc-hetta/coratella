import { redirect } from '@sveltejs/kit';
import { getCategories } from '$lib/server/db/categories';
import { getTags } from '$lib/server/db/tags';
import { getPost } from '$lib/server/db/posts';
import type { PageServerLoad } from './$types';
import { getAuthors } from '$lib/server/db/authors';

export const load: PageServerLoad = async ({ params }) => {
  let post = null;
  if (params.id !== 'new') {
    post = await getPost(parseInt(params.id));
    if (!post) {
      throw redirect(302, '/admin/posts');
    }
  }
  return {
    categories: await getCategories(),
    tags: await getTags(),
    authors: await getAuthors(),
    post,
  };
};
