import { getPosts } from '#lib/server/db/posts.ts';
import { branding } from '#lib/server/branding.ts';
import { defaultMode, modes, themes } from '#lib/themes.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  const posts = (await getPosts()).map((post) => ({ ...post, content: '' }));
  return {
    posts,
    ...branding(cookies.get('mode') ?? defaultMode),
    themes,
    modes,
  };
};
