import { fail } from '@sveltejs/kit';
import { serverFailure } from '#lib/server/actions.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Actions, PageServerLoad } from './$types';
import { getCategories, createCategory, updateCategory } from '#lib/server/db/categories.ts';

export const load: PageServerLoad = async () => {
  return {
    categories: await getCategories(),
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();

    const name = data.get('name');
    const color = data.get('color')?.toString() || undefined;

    if (!name) {
      return fail(400, { message: m.missingRequiredParameters({ parameters: m.name() }) });
    }
    try {
      await createCategory(name.toString(), color);
    } catch (e) {
      return serverFailure(e);
    }
  },
  edit: async ({ request }) => {
    const data = await request.formData();

    const id = data.get('id');
    const name = data.get('name');
    const color = data.get('color')?.toString() || undefined;
    if (!id) {
      return fail(400, { message: m.missingId() });
    }
    if (!name) {
      return fail(400, { message: m.missingRequiredParameters({ parameters: m.name() }) });
    }
    try {
      await updateCategory(parseInt(id.toString()), name.toString(), color);
    } catch (e) {
      return serverFailure(e);
    }
  },
};
