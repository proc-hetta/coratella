import { rowsCount } from '$lib/server/db/utils';
import { totalVisits } from '$lib/server/db/posts';
import type { PageServerLoad } from './$types';
import { tags, posts, users, authors, categories } from '$lib/server/db/schema';
import * as env from '$env/static/public';
import { getMode } from '$lib/themes';

export const load: PageServerLoad = async () => {
  return {
    // If the website seems unresponsive and there is not a better way, then return promises and await them in svelte page
    tagsCount: await rowsCount(tags),
    postsCount: await rowsCount(posts),
    usersCount: await rowsCount(users),
    authorsCount: await rowsCount(authors),
    categoriesCount: await rowsCount(categories),
    totalVisits: await totalVisits(),
    title: env.PUBLIC_TITLE,
    logo:
      (getMode() === 'dark' ? env.PUBLIC_LOGODARK : env.PUBLIC_LOGOLIGHT) ??
      env.PUBLIC_LOGO ??
      './src/lib/images/logo.svg',
  };
};
