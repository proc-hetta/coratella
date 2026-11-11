import { getPost, incrementVisits } from '#lib/server/db/posts.ts';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
  const id = parseInt(params.id);
  const post = await getPost(id);
  // Drafts are indistinguishable from missing posts.
  if (post === null || post.draft) {
    throw error(404, 'Not found');
  }
  if (post.password !== null && post.password !== url.searchParams.get('password')) {
    return redirect(307, `/password?post=${id}`);
  }
  await incrementVisits(id);
  return {
    post: {
      id: post.id,
      title: post.title,
      content: post.content,
      math: post.math,
      toc: post.toc,
      tags: post.tags,
      categories: post.categories,
      authors: post.authors,
    },
  };
};
