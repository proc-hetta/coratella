import type { FullPost } from '#lib/server/db/posts.ts';
import { updateOrCreatePost } from '#lib/server/db/posts.ts';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const data: FullPost = await request.json();
  if (data.id !== -1) {
    return new Response(null, { status: 403 });
  }
  const body = await updateOrCreatePost(data);
  const response = new Response(JSON.stringify(body), { status: 200 });
  response.headers.append('Location', `/admin/posts/${body!.id}`);
  return response;
};
