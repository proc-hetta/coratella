import { getPublishedPostSummaries } from '#lib/server/db/posts.ts';
import { branding } from '#lib/server/branding.ts';
import { defaultMode, modes, themes } from '#lib/themes.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  return {
    posts: await getPublishedPostSummaries(),
    ...branding(cookies.get('mode') ?? defaultMode),
    themes,
    modes,
  };
};
