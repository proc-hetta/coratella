import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { verify } from '@node-rs/argon2';
import * as auth from '$lib/server/auth';
import { m } from '$lib/paraglide/messages';
import * as table from '$lib/server/db/schema';
import { argonOptions } from '$lib/server/db/utils';
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
      return fail(400, { message: m.insertBothUsernameAndPassword() });
    }

    const results = await db
      .select()
      .from(table.users)
      .where(eq(table.users.username, username.toString()));

    const user = results.at(0);
    if (!user) {
      return fail(401, { message: m.incorrectUsernameOrPassword() });
    }

    const validPassword = await verify(user.password, password.toString(), argonOptions);
    if (!validPassword) {
      return fail(401, { message: m.incorrectUsernameOrPassword() });
    }

    const { token, payload } = await auth.generateSessionToken(user);
    auth.setSessionTokenCookie(event, token, payload.exp!);
    event.locals.user = user;

    return redirect(302, '/admin');
  },
};
