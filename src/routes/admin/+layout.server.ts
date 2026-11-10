import type { User } from '$lib/server/db/schema';
import { themes, modes, defaultMode } from '$lib/themes';
import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  const user: User = locals.user!;
  const mode = cookies.get('mode') ?? defaultMode;

  const reducedUser: {
    id: string;
    username: string;
  } = {
    id: user.id,
    username: user.username,
  };

  return {
    user: reducedUser,
    themes,
    modes,
    title: env.PUBLIC_TITLE,
    logo:
      (mode === 'dark' ? env.PUBLIC_LOGODARK : env.PUBLIC_LOGOLIGHT) ??
      env.PUBLIC_LOGO ??
      '/src/lib/images/logo.svg',
  };
};
