import { deleteTag } from '$lib/server/db/tags';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params }) => {
  const id = parseInt(params.id!);
  await deleteTag(id);
  return new Response(null, { status: 204 });
};
