import { fail } from '@sveltejs/kit';
import { m } from '$lib/paraglide/messages';
import type { PageServerLoad } from '../$types';
import { getAuthors, createAuthor, updateAuthor } from '$lib/server/db/authors';

export const load: PageServerLoad = async () => {
  return {
    authors: await getAuthors(),
  };
};

export const actions = {
  create: async ({ request }) => {
    const data = await request.formData();

    const nickname = data.get('nickname');
    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const image = data.get('image');

    if (!nickname) {
      return fail(400, { message: m.missingRequiredParameters({ parameters: m.nickname() }) });
    }
    try {
      await createAuthor(
        nickname.toString(),
        firstName?.toString(),
        lastName?.toString(),
        image?.toString(),
      );
    } catch (e: any) {
      return fail(500, { message: e.toString() });
    }
  },
  edit: async ({ request }) => {
    const data = await request.formData();

    const id = data.get('id');
    if (!id) {
      return fail(400, { message: m.missingId() });
    }
    try {
      await updateAuthor(
        parseInt(id.toString()),
        data.get('nickname')?.toString(),
        data.get('firstName')?.toString(),
        data.get('lastName')?.toString(),
        data.get('image')?.toString(),
      );
    } catch (e: any) {
      return fail(500, { message: e.toString() });
    }
  },
};
