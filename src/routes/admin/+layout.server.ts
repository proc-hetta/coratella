import { branding } from '#lib/server/branding.ts';
import { publicUser } from '#lib/server/actions.ts';
import { themes, modes, defaultMode } from '#lib/themes.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  return {
    user: publicUser(locals.user!),
    themes,
    modes,
    ...branding(cookies.get('mode') ?? defaultMode),
  };
};
