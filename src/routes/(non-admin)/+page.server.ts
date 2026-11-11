import { getPublishedPostSummaries } from '#lib/server/db/posts.ts';
import { branding } from '#lib/server/branding.ts';
import { modeOrDefault, modes, themes } from '#lib/themes.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  return {
    posts: await getPublishedPostSummaries(),
    ...branding(modeOrDefault(cookies.get('mode'))),
    themes,
    modes,
  };
};
