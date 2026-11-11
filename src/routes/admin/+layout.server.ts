import { publicUser } from '#lib/server/actions.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  return { user: publicUser(locals.user!) };
};
