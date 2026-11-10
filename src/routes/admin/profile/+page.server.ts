import { fail } from '@sveltejs/kit';
import { publicUser, serverFailure } from '#lib/server/actions.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Actions, PageServerLoad } from './$types';
import { updateUser } from '#lib/server/db/users.ts';

export const load: PageServerLoad = async ({ locals }) => {
  return { user: publicUser(locals.user!) };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();

    const password = data.get('password');
    if (password !== data.get('repeatPassword')) {
      return fail(400, { message: m.passwordDoesntMatches() });
    }
    try {
      await updateUser(locals.user!.id, data.get('username')?.toString(), password?.toString());
    } catch (e) {
      return serverFailure(e);
    }
  },
};
