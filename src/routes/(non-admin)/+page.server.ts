import { getPosts } from '$lib/server/db/posts';
import type { PageServerLoad } from './$types';
import * as env from '$env/static/public';
import { defaultMode, modes, themes } from '$lib/themes';

export const load: PageServerLoad = async ({ cookies }) => {
  const posts = (await getPosts()) ?? [];
  posts.map((post) => (post.content = ''));
  const mode = cookies.get('mode') ?? defaultMode;
  return {
    posts: posts,
    title: env.PUBLIC_TITLE,
    logo:
      (mode === 'dark' ? env.PUBLIC_LOGODARK : env.PUBLIC_LOGOLIGHT) ??
      env.PUBLIC_LOGO ??
      './src/lib/images/logo.svg',
    themes,
    modes,
  };
};
