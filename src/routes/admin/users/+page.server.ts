import * as z from 'zod';
import { getUsers, createUser, updateUser, deleteUser } from '#lib/server/db/users.ts';
import {
  constraintFailure,
  formFields,
  invalid,
  publicUser,
  required,
} from '#lib/server/actions.ts';
import type { Actions, PageServerLoad } from './$types';
import { m } from '#lib/paraglide/messages.js';

const userId = required(() => m.missingId());

export const load: PageServerLoad = async ({ locals }) => {
  return {
    users: await getUsers(),
    user: publicUser(locals.user!),
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const credentials = required(() => m.insertBothUsernameAndPassword());
    const form = z
      .object({ username: credentials, password: credentials })
      .safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    try {
      await createUser(form.data.username, form.data.password);
    } catch (e) {
      return constraintFailure(e, m.alreadyExists());
    }
  },
  edit: async ({ request }) => {
    const form = z
      .object({ id: userId, username: z.string().optional(), password: z.string().optional() })
      .safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    try {
      await updateUser(form.data.id, form.data.username, form.data.password);
    } catch (e) {
      return constraintFailure(e, m.alreadyExists());
    }
  },
  delete: async ({ request }) => {
    const form = z.object({ id: userId }).safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    await deleteUser(form.data.id);
  },
};
