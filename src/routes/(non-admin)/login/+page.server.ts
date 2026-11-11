import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { verify } from '@node-rs/argon2';
import * as auth from '#lib/server/auth.ts';
import { m } from '#lib/paraglide/messages.js';
import * as table from '#lib/server/db/schema.ts';
import { argonOptions } from '#lib/server/db/utils.ts';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { logo } from '#lib/server/branding.ts';
import { defaultMode } from '#lib/themes.ts';
import * as z from 'zod';
import { formFields, invalid, required } from '#lib/server/actions.ts';

const credentials = required(() => m.insertBothUsernameAndPassword());
const loginForm = z.object({ username: credentials, password: credentials });

export const load: PageServerLoad = async () => ({ logo: logo(defaultMode) });

export const actions: Actions = {
  default: async (event) => {
    const form = loginForm.safeParse(await formFields(event.request));
    if (!form.success) return invalid(form.error);
    const { username, password } = form.data;

    const [user] = await db.select().from(table.users).where(eq(table.users.username, username));

    const validPassword = user && (await verify(user.password, password, argonOptions));
    if (!validPassword) {
      return fail(401, { message: m.incorrectUsernameOrPassword() });
    }

    const { token, payload } = await auth.generateSessionToken(user);
    auth.setSessionTokenCookie(event, token, payload.exp!);
    event.locals.user = user;

    return redirect(302, '/admin');
  },
};
