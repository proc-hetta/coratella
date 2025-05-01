import { fail } from '@sveltejs/kit';
import { m } from '$lib/paraglide/messages';
import type { PageServerLoad } from '../$types';
import { getCategories, createCategory, updateCategory } from '$lib/server/db/categories';

export const load: PageServerLoad = async () => {
  return {
    categories: await getCategories(),
  };
};

export const actions = {
  create: async ({ request }) => {
    const data = await request.formData();

    const name = data.get('name');

    if (!name) {
      return fail(400, { message: m.missingRequiredParameters({ parameters: m.name() }) });
    }
    try {
      await createCategory(name.toString());
    } catch (e: any) {
      return fail(500, { message: e.toString() });
    }
  },
  edit: async ({ request }) => {
    const data = await request.formData();

    const id = data.get('id');
    const name = data.get('name');
    if (!id) {
      return fail(400, { message: m.missingId() });
    }
    if (!name) {
      return fail(400, { message: m.missingRequiredParameters({ parameters: m.name() }) });
    }
    try {
      await updateCategory(parseInt(id.toString()), name.toString());
    } catch (e: any) {
      return fail(500, { message: e.toString() });
    }
  },
};
