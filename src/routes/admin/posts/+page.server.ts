import { getPosts } from '#lib/server/db/posts.ts';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async () => {
  return {
    posts: (await getPosts()) ?? [],
  };
};
