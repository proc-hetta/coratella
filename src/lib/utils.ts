import { toaster, toasterOptions } from '$lib/toaster';
import { m } from '$lib/paraglide/messages';
import type { ActionResult } from '@sveltejs/kit';

export function coratellaFormCallback(
  successMessage: string,
  invalidateAll: boolean = false,
  callback: () => Promise<void> = async () => {},
  preHook: () => void = () => {},
) {
  return () => {
    preHook();
    return async ({
      result,
      update,
    }: {
      result: ActionResult;
      update: ({
        reset,
        invalidateAll,
      }: {
        reset?: boolean;
        invalidateAll?: boolean;
      }) => Promise<void>;
    }) => {
      if (['redirect', 'success'].includes(result.type)) {
        toaster.success({
          title: m.success(),
          description: successMessage,
          ...toasterOptions,
        });
      } else {
        toaster.error({
          title: m.error(),
          description: result.data.message ?? m.unknownError(),
          ...toasterOptions,
        });
      }

      await callback();

      return update({
        reset: false,
        invalidateAll,
      });
    };
  };
}

export async function torcoloUpload(file: File) {
  const torcoloUrl = process.env.TORCOLO_URL;
  const torcoloToken = process.env.TORCOLO_TOKEN;

  let formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${torcoloUrl}/files`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${torcoloToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error while uploading file, status code ${response.status}`);
  }
  return `${torcoloUrl}${response.headers.get('Location')}`;
}
