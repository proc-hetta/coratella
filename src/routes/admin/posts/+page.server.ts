import { getPosts } from '$lib/server/db/posts';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async () => {
  return {
    posts: (await getPosts()) ?? [],
  };
};
