import { getPosts } from '$lib/server/db/posts';
import type { PageServerLoad } from './$types';
import * as env from '$lib/info';

export const load: PageServerLoad = async () => {
  const posts = (await getPosts()) ?? [];
  posts.map((post) => (post.content = ''));
  return {
    posts: posts,
    title: env.title,
    logo: env.logo,
  };
};
