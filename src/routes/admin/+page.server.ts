import { rowsCount } from '#lib/server/db/utils.ts';
import { totalVisits } from '#lib/server/db/posts.ts';
import { branding } from '#lib/server/branding.ts';
import { tags, posts, users, authors, categories } from '#lib/server/db/schema.ts';
import { defaultMode } from '#lib/themes.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    tagsCount: await rowsCount(tags),
    postsCount: await rowsCount(posts),
    usersCount: await rowsCount(users),
    authorsCount: await rowsCount(authors),
    categoriesCount: await rowsCount(categories),
    totalVisits: await totalVisits(),
    ...branding(defaultMode),
  };
};
