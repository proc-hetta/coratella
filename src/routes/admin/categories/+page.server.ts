import * as z from 'zod';
import { constraintFailure, formFields, idField, invalid, required } from '#lib/server/actions.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Actions, PageServerLoad } from './$types';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '#lib/server/db/categories.ts';

const fields = {
  name: required(() => m.missingRequiredParameters({ parameters: m.name() })),
  // An empty color means no color
  color: z
    .string()
    .optional()
    .transform((color) => color || undefined),
};

export const load: PageServerLoad = async () => {
  return {
    categories: await getCategories(),
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const form = z.object(fields).safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    try {
      await createCategory(form.data.name, form.data.color);
    } catch (e) {
      return constraintFailure(e, m.alreadyExists());
    }
  },
  edit: async ({ request }) => {
    const form = z.object({ id: idField, ...fields }).safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    try {
      await updateCategory(form.data.id, form.data.name, form.data.color);
    } catch (e) {
      return constraintFailure(e, m.alreadyExists());
    }
  },
  delete: async ({ request }) => {
    const form = z.object({ id: idField }).safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    try {
      await deleteCategory(form.data.id);
    } catch (e) {
      return constraintFailure(e, m.errorWhileDeleting());
    }
  },
};
