import { fail } from '@sveltejs/kit';
import { m } from '$lib/paraglide/messages';
import type { PageServerLoad, RequestEvent } from '../$types';
import { getAuthors, createAuthor, updateAuthor } from '$lib/server/db/authors';

// RFC2822 Email
const rfc2822_regex =
  /[-A-Za-z0-9!#$%&'*+/=?^_`{|}~]+(?:\.[-A-Za-z0-9!#$%&'*+/=?^_`{|}~]+)*@(?:[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?/;

export const load: PageServerLoad = async () => {
  return {
    authors: await getAuthors(),
  };
};

export const actions = {
  create: async ({ request }: RequestEvent) => {
    const data = await request.formData();

    const nickname = data.get('nickname');
    const email = data.get('email');
    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const image = data.get('image');

    if (!nickname) {
      return fail(400, { message: m.missingRequiredParameters({ parameters: m.nickname() }) });
    }
    const emailString = email?.toString();
    if (emailString && emailString.match(rfc2822_regex)?.toString() !== emailString) {
      return fail(400, { message: m.incorrectRequiredParameters({ parameters: m.email() }) });
    }
    try {
      await createAuthor(
        nickname.toString(),
        emailString,
        firstName?.toString(),
        lastName?.toString(),
        image?.toString(),
      );
    } catch (e: any) {
      return fail(500, { message: e.toString() });
    }
  },
  edit: async ({ request }: RequestEvent) => {
    const data = await request.formData();

    const id = data.get('id');
    const email = data.get('email');
    if (!id) {
      return fail(400, { message: m.missingId() });
    }
    const emailString = email?.toString();
    if (emailString && emailString.match(rfc2822_regex)?.toString() !== emailString) {
      return fail(400, { message: m.incorrectRequiredParameters({ parameters: m.email() }) });
    }
    try {
      await updateAuthor(
        parseInt(id.toString()),
        emailString,
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
