import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { verify } from '@node-rs/argon2';
import * as auth from '#lib/server/auth.ts';
import { m } from '#lib/paraglide/messages.js';
import * as table from '#lib/server/db/schema.ts';
import { argonOptions } from '#lib/server/db/utils.ts';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { PUBLIC_TITLE, PUBLIC_LOGODARK, PUBLIC_LOGOLIGHT, PUBLIC_LOGO } from '$app/env/public';
import { getMode } from '#lib/themes.ts';

export const load: PageServerLoad = async () => {
  return {
    title: PUBLIC_TITLE,
    logo:
      (getMode() === 'dark' ? PUBLIC_LOGODARK : PUBLIC_LOGOLIGHT) ??
      PUBLIC_LOGO ??
      './src/lib/images/logo.svg',
  };
};

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
    const validPassword = user
      ? await verify(user.password, password.toString(), argonOptions)
      : null;
    if (!user || !validPassword) {
      return fail(401, { message: m.incorrectUsernameOrPassword() });
    }

    const { token, payload } = await auth.generateSessionToken(user);
    auth.setSessionTokenCookie(event, token, payload.exp!);
    event.locals.user = user;

    return redirect(302, '/admin');
  },
};
