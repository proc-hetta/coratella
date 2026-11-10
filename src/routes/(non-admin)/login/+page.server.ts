import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { verify } from '@node-rs/argon2';
import * as auth from '#lib/server/auth.ts';
import { m } from '#lib/paraglide/messages.js';
import * as table from '#lib/server/db/schema.ts';
import { argonOptions } from '#lib/server/db/utils.ts';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { branding } from '#lib/server/branding.ts';
import { defaultMode } from '#lib/themes.ts';

export const load: PageServerLoad = async () => branding(defaultMode);

export const actions: Actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
      return fail(400, { message: m.insertBothUsernameAndPassword() });
    }

    const [user] = await db
      .select()
      .from(table.users)
      .where(eq(table.users.username, username.toString()));

    const validPassword = user && (await verify(user.password, password.toString(), argonOptions));
    if (!validPassword) {
      return fail(401, { message: m.incorrectUsernameOrPassword() });
    }

    const { token, payload } = await auth.generateSessionToken(user);
    auth.setSessionTokenCookie(event, token, payload.exp!);
    event.locals.user = user;

    return redirect(302, '/admin');
  },
};
