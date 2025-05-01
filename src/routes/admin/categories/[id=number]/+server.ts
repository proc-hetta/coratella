import { deleteCategory } from '$lib/server/db/categories';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params }) => {
  const id = parseInt(params.id!);
  await deleteCategory(id);
  return new Response(null, { status: 204 });
};
