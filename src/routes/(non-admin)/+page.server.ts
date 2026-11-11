import { getPublishedPostSummaries } from '#lib/server/db/posts.ts';
import { logo } from '#lib/server/branding.ts';
import { modeOrDefault } from '#lib/themes.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  return {
    posts: await getPublishedPostSummaries(),
    logo: logo(modeOrDefault(cookies.get('mode'))),
  };
};
