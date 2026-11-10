import { TORCOLO_TOKEN, TORCOLO_URL } from '$app/env/private';

export async function torcoloUpload(file: File) {
  if (TORCOLO_URL === undefined || TORCOLO_TOKEN === undefined) {
    return '';
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${TORCOLO_URL}/files`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${TORCOLO_TOKEN}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error while uploading file, status code ${response.status}`);
  }
  return `${TORCOLO_URL}${response.headers.get('Location')}`;
}
