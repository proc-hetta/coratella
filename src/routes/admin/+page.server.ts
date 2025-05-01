import { rowsCount } from '$lib/server/db/utils';
import { totalVisits } from '$lib/server/db/posts';
import type { PageServerLoad } from './$types';
import { tags, posts, users, authors, categories } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
  return {
    // If the website seems unresponsive and there is not a best way, then return promises and await them in svelte page
    tagsCount: await rowsCount(tags),
    postsCount: await rowsCount(posts),
    usersCount: await rowsCount(users),
    authorsCount: await rowsCount(authors),
    categoriesCount: await rowsCount(categories),
    totalVisits: await totalVisits(),
  };
};
