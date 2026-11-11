import { fail, redirect } from '@sveltejs/kit';
import { verify } from '@node-rs/argon2';
import * as z from 'zod';
import { formFields } from '#lib/server/actions.ts';
import { numericId } from '#lib/schemas.ts';
import { generatePostUnlockToken, postUnlockCookieName } from '#lib/server/auth.ts';
import { getPost } from '#lib/server/db/posts.ts';
import { argonOptions } from '#lib/server/db/utils.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Actions, PageServerLoad } from './$types';

const unlockForm = z.object({ password: z.string().catch('') });

export const load: PageServerLoad = async ({ url }) => {
  const postId = url.searchParams.get('post');
  if (postId === null) {
    redirect(307, '/');
  }
  return {
    postId: postId,
  };
};

export const actions: Actions = {
  default: async ({ url, request, cookies }) => {
    const id = numericId.safeParse(url.searchParams.get('post')).data;
    const { password } = unlockForm.parse(await formFields(request));
    const post = id === undefined ? null : await getPost(id);
    if (!post?.password || post.draft || !(await verify(post.password, password, argonOptions))) {
      return fail(401, { message: m.incorrectPassword() });
    }
    cookies.set(postUnlockCookieName, await generatePostUnlockToken(post.id), {
      path: `/posts/${post.id}`,
      maxAge: 60 * 60 * 24,
    });
    redirect(303, `/posts/${post.id}`);
  },
};
