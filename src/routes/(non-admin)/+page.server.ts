import { getPosts } from '#lib/server/db/posts.ts';
import type { PageServerLoad } from './$types';
import { PUBLIC_TITLE, PUBLIC_LOGODARK, PUBLIC_LOGOLIGHT, PUBLIC_LOGO } from '$app/env/public';
import { defaultMode, modes, themes } from '#lib/themes.ts';

export const load: PageServerLoad = async ({ cookies }) => {
  const posts = (await getPosts()) ?? [];
  posts.map((post) => (post.content = ''));
  const mode = cookies.get('mode') ?? defaultMode;
  return {
    posts,
    title: PUBLIC_TITLE,
    logo:
      (mode === 'dark' ? PUBLIC_LOGODARK : PUBLIC_LOGOLIGHT) ??
      PUBLIC_LOGO ??
      './src/lib/images/logo.svg',
    themes,
    modes,
  };
};
