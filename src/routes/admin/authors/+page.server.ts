import { fail } from '@sveltejs/kit';
import * as z from 'zod';
import { constraintFailure, formFields, idField, invalid, required } from '#lib/server/actions.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Actions, PageServerLoad } from './$types';
import { getAuthors, createAuthor, updateAuthor, deleteAuthor } from '#lib/server/db/authors.ts';
import { torcoloUpload } from '#lib/server/torcolo.ts';

const incorrectEmail = () => m.incorrectRequiredParameters({ parameters: m.email() });

const fields = {
  email: z
    .union([z.literal(''), z.email({ error: incorrectEmail })], { error: incorrectEmail })
    .optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  image: z.string().optional(),
  // A new image, uploaded to Torcolo in place of `image`
  imageFile: z
    .instanceof(File)
    .refine((file) => file.type.startsWith('image/'), {
      error: () => m.incorrectRequiredParameters({ parameters: m.image() }),
    })
    .optional(),
};

/** The uploaded image URL, `image` when nothing was uploaded, `null` without Torcolo credentials. */
async function imageUrl({ image, imageFile }: { image?: string; imageFile?: File }) {
  if (!imageFile) return image;
  return (await torcoloUpload(imageFile)) || null;
}

export const load: PageServerLoad = async () => {
  return {
    authors: await getAuthors(),
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const form = z
      .object({
        nickname: required(() => m.missingRequiredParameters({ parameters: m.nickname() })),
        ...fields,
      })
      .safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    const { nickname, email, firstName, lastName } = form.data;
    const image = await imageUrl(form.data);
    if (image === null) return fail(401, { message: m.errorNoTorcoloAuth() });
    try {
      await createAuthor(nickname, email, firstName, lastName, image);
    } catch (e) {
      return constraintFailure(e, m.alreadyExists());
    }
  },
  edit: async ({ request }) => {
    const form = z
      .object({ id: idField, nickname: z.string().optional(), ...fields })
      .safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    const { id, email, nickname, firstName, lastName } = form.data;
    const image = await imageUrl(form.data);
    if (image === null) return fail(401, { message: m.errorNoTorcoloAuth() });
    try {
      await updateAuthor(id, email, nickname, firstName, lastName, image);
    } catch (e) {
      return constraintFailure(e, m.alreadyExists());
    }
  },
  delete: async ({ request }) => {
    const form = z.object({ id: idField }).safeParse(await formFields(request));
    if (!form.success) return invalid(form.error);
    try {
      await deleteAuthor(form.data.id);
    } catch (e) {
      return constraintFailure(e, m.errorWhileDeleting());
    }
  },
};
