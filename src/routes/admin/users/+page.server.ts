import { getUsers, createUser, updateUser } from '#lib/server/db/users.ts';
import { publicUser, serverFailure } from '#lib/server/actions.ts';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { m } from '#lib/paraglide/messages.js';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    users: await getUsers(),
    user: publicUser(locals.user!),
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();

    const username = data.get('username');
    const password = data.get('password');

    if (!username || !password) {
      return fail(400, { message: m.insertBothUsernameAndPassword() });
    }
    try {
      await createUser(username.toString(), password.toString());
    } catch (e) {
      return serverFailure(e);
    }
  },
  edit: async ({ request }) => {
    const data = await request.formData();

    const id = data.get('id');
    if (!id) {
      return fail(400, { message: m.missingId() });
    }
    try {
      await updateUser(
        id.toString(),
        data.get('username')?.toString(),
        data.get('password')?.toString(),
      );
    } catch (e) {
      return serverFailure(e);
    }
  },
};
