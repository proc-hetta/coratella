import { branding } from '#lib/server/branding.ts';
import { publicUser } from '#lib/server/actions.ts';
import { modeOrDefault, modes, themes } from '#lib/themes.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  return {
    user: publicUser(locals.user!),
    themes,
    modes,
    ...branding(modeOrDefault(cookies.get('mode'))),
  };
};
