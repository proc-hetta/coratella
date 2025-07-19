import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const postId = url.searchParams.get('post');
  if (postId === null) {
    return redirect(307, '/');
  }
  return {
    postId: postId,
  };
};
