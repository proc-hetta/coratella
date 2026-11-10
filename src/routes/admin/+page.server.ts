import { rowsCount } from '#lib/server/db/utils.ts';
import { totalVisits } from '#lib/server/db/posts.ts';
import type { PageServerLoad } from './$types';
import { tags, posts, users, authors, categories } from '#lib/server/db/schema.ts';
import { PUBLIC_TITLE, PUBLIC_LOGODARK, PUBLIC_LOGOLIGHT, PUBLIC_LOGO } from '$app/env/public';
import { getMode } from '#lib/themes.ts';

export const load: PageServerLoad = async () => {
  return {
    // If the website seems unresponsive and there is not a better way, then return promises and await them in svelte page
    tagsCount: await rowsCount(tags),
    postsCount: await rowsCount(posts),
    usersCount: await rowsCount(users),
    authorsCount: await rowsCount(authors),
    categoriesCount: await rowsCount(categories),
    totalVisits: await totalVisits(),
    title: PUBLIC_TITLE,
    logo:
      (getMode() === 'dark' ? PUBLIC_LOGODARK : PUBLIC_LOGOLIGHT) ??
      PUBLIC_LOGO ??
      './src/lib/images/logo.svg',
  };
};
