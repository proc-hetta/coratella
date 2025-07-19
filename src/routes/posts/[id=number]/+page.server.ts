import { getPost } from '$lib/server/db/posts';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
  const id = parseInt(params.id);
  const post = await getPost(id);
  if (post === null) {
    throw error(404, 'Not found');
  }
  let password = url.searchParams.get('password');
  if (post.password !== null && post.password !== password) {
    return redirect(307, `/password?post=${id}`);
  }
  return {
    post: post,
  };
};
