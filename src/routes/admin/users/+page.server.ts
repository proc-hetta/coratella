import { getUsers, createUser, updateUser } from '$lib/server/db/users';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { m } from '$lib/paraglide/messages';

export const load: PageServerLoad = async ({ locals }) => {
  let reducedUser: {
    id: string;
    username: string;
  } = {
    id: locals.user.id,
    username: locals.user.username,
  };

  return {
    users: await getUsers(),
    user: reducedUser,
  };
};

export const actions = {
  create: async ({ request }) => {
    const data = await request.formData();

    const username = data.get('username');
    const password = data.get('password');

    if (!username || !password) {
      return fail(400, { message: m.insertBothUsernameAndPassword() });
    }
    try {
      await createUser(username.toString(), password.toString());
    } catch (e: any) {
      return fail(500, { message: e.toString() });
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
        id!.toString(),
        data.get('username')?.toString(),
        data.get('password')?.toString(),
      );
    } catch (e: any) {
      return fail(500, { message: e.toString() });
    }
  },
};
