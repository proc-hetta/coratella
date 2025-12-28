import { torcoloUpload } from '$lib/utils';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const fileUrl = await torcoloUpload(formData.get('file')!.valueOf() as File);
  let response = new Response(null, { status: 201 });
  response.headers.append('Location', fileUrl!);
  return response;
};
