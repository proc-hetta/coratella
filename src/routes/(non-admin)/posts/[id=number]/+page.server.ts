import { getPost, incrementVisits } from '#lib/server/db/posts.ts';
import { isPostUnlocked, postUnlockCookieName } from '#lib/server/auth.ts';
import { renderMarkdown } from '#lib/markdown.ts';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, cookies }) => {
  const id = params.id;
  const post = await getPost(id);
  // Drafts are indistinguishable from missing posts.
  if (post === null || post.draft) {
    error(404, 'Not found');
  }
  if (post.password !== null && !(await isPostUnlocked(cookies.get(postUnlockCookieName), id))) {
    redirect(307, `/password?post=${id}`);
  }
  await incrementVisits(id);
  return {
    post: {
      id: post.id,
      title: post.title,
      html: renderMarkdown(post.content, post.math, post.toc),
      tags: post.tags,
      categories: post.categories,
      authors: post.authors,
    },
  };
};
