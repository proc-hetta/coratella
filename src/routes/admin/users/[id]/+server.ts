import { deleteUser } from '$lib/server/db/users';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params }) => {
  const id = params.id!;
  await deleteUser(id);
  return new Response(null, { status: 204 });
};
