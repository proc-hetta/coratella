import { refreshAll } from '$app/navigation';
import { m } from '#lib/paraglide/messages.js';
import { notifyError, notifySuccess } from '#lib/toaster.ts';

/** Deletes a resource through its admin endpoint, then notifies and refreshes the page data. */
export async function deleteResource(url: string, successMessage: string) {
  const response = await fetch(url, { method: 'DELETE', credentials: 'include' });
  if (response.ok) {
    notifySuccess(successMessage);
    await refreshAll();
  } else {
    notifyError(m.errorWhileDeleting());
  }
}
