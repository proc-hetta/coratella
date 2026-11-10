import { deleteAuthor } from '#lib/server/db/authors.ts';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params }) => {
  const id = parseInt(params.id!);
  await deleteAuthor(id);
  return new Response(null, { status: 204 });
};
