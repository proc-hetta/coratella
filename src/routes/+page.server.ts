import { getPosts } from '$lib/server/db/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const posts = (await getPosts()) ?? [];
  posts.map((post) => (post.content = ''));
  return {
    posts: posts,
  };
};
