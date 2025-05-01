import { updateOrCreatePost, deletePost, type FullPost } from '$lib/server/db/posts';
import type { RequestHandler } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({ request }) => {
  const data: FullPost = await request.json();
  if (data.id === -1) {
    return new Response(null, { status: 403 });
  }
  const body = await updateOrCreatePost(data);
  let response = new Response(JSON.stringify(body), { status: 200 });
  response.headers.append('Location', `/admin/posts/${body!.id}`);
  return response;
};

export const DELETE: RequestHandler = async ({ params }) => {
  const id = parseInt(params.id ?? '');
  const body = await deletePost(id);
  return new Response(null, { status: 204 });
};
