import { createToaster } from '@skeletonlabs/skeleton-svelte';

export const toaster = createToaster({
  placement: 'top-end',
});

export const toasterOptions = {
  duration: 3000,
  closable: false,
};
