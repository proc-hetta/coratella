import { logo } from '#lib/server/branding.ts';
import { publicUser } from '#lib/server/actions.ts';
import { modeOrDefault } from '#lib/themes.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  return {
    user: publicUser(locals.user!),
    logo: logo(modeOrDefault(cookies.get('mode'))),
  };
};
