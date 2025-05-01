import { fail } from '@sveltejs/kit';
import { m } from '$lib/paraglide/messages';
import type { PageServerLoad } from './$types';
import { updateUser } from '$lib/server/db/users';
import type { User } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
  const user: User = locals.user;
  const reducedUser: {
    id: string;
    username: string;
  } = {
    id: user.id,
    username: user.username,
  };

  return {
    user: reducedUser,
  };
};

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();

    const password = data.get('password');
    const repeatPassword = data.get('repeatPassword');
    if (password !== repeatPassword) {
      return fail(400, { message: m.passwordDoesntMatches() });
    }
    try {
      await updateUser(
        locals.user.id,
        data.get('username')?.toString(),
        data.get('password')?.toString(),
      );
    } catch (e: any) {
      return fail(500, { message: e.toString() });
    }
  },
};
