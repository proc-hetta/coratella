import { createToaster } from '@skeletonlabs/skeleton-svelte';
import { m } from '#lib/paraglide/messages.js';

export const toaster = createToaster({
  placement: 'top-end',
});

const toastOptions = {
  duration: 3000,
  closable: false,
};

export function notifySuccess(description: string) {
  toaster.success({ title: m.success(), description, ...toastOptions });
}

export function notifyError(description: string) {
  toaster.error({ title: m.error(), description, ...toastOptions });
}
