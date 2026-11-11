import * as z from 'zod';
import { constraintFailure, formFields, invalid, publicUser } from '#lib/server/actions.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Actions, PageServerLoad } from './$types';
import { updateUser } from '#lib/server/db/users.ts';

const profile = z
  .object({
    username: z.string().optional(),
    password: z.string().optional(),
    repeatPassword: z.string().optional(),
  })
  .refine((form) => form.password === form.repeatPassword, {
    error: () => m.passwordDoesntMatches(),
  });

export const load: PageServerLoad = async ({ locals }) => {
  return { user: publicUser(locals.user!) };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = profile.safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    try {
      await updateUser(locals.user!.id, form.data.username, form.data.password);
    } catch (e) {
      return constraintFailure(e, m.alreadyExists());
    }
  },
};
