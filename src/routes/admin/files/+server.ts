import { torcoloUpload } from '#lib/server/torcolo.ts';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const fileUrl = await torcoloUpload(formData.get('file')!.valueOf() as File);

  if (fileUrl === '') {
    return new Response(null, { status: 401 });
  }

  const response = new Response(null, { status: 201 });
  response.headers.append('Location', fileUrl!);
  return response;
};
