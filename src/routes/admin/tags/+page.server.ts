import * as z from 'zod';
import { constraintFailure, formFields, idField, invalid, required } from '#lib/server/actions.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Actions, PageServerLoad } from './$types';
import { getTags, createTag, updateTag, deleteTag } from '#lib/server/db/tags.ts';

const name = required(() => m.missingRequiredParameters({ parameters: m.name() }));

export const load: PageServerLoad = async () => {
  return {
    tags: await getTags(),
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const form = z.object({ name }).safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    try {
      await createTag(form.data.name);
    } catch (e) {
      return constraintFailure(e, m.alreadyExists());
    }
  },
  edit: async ({ request }) => {
    const form = z.object({ id: idField, name }).safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    try {
      await updateTag(form.data.id, form.data.name);
    } catch (e) {
      return constraintFailure(e, m.alreadyExists());
    }
  },
  delete: async ({ request }) => {
    const form = z.object({ id: idField }).safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    try {
      await deleteTag(form.data.id);
    } catch (e) {
      return constraintFailure(e, m.errorWhileDeleting());
    }
  },
};
