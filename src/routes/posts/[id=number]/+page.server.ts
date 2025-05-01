import { getPost } from '$lib/server/db/posts';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const id = parseInt(params.id);
  const post = await getPost(id);
  if (post === null) {
    throw error(404, 'Not found');
  }
  return {
    post: post,
  };
};
