import { db } from '#lib/server/db/index.ts';
import { totalVisits } from '#lib/server/db/posts.ts';
import { tags, posts, users, authors, categories } from '#lib/server/db/schema.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    tagsCount: await db.$count(tags),
    postsCount: await db.$count(posts),
    usersCount: await db.$count(users),
    authorsCount: await db.$count(authors),
    categoriesCount: await db.$count(categories),
    totalVisits: await totalVisits(),
  };
};
