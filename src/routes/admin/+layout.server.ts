import type { User } from '#lib/server/db/schema.ts';
import { themes, modes, defaultMode } from '#lib/themes.ts';
import type { LayoutServerLoad } from './$types';
import { PUBLIC_TITLE, PUBLIC_LOGODARK, PUBLIC_LOGOLIGHT, PUBLIC_LOGO } from '$app/env/public';

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
    title: PUBLIC_TITLE,
    logo:
      (mode === 'dark' ? PUBLIC_LOGODARK : PUBLIC_LOGOLIGHT) ??
      PUBLIC_LOGO ??
      '/src/lib/images/logo.svg',
  };
};
