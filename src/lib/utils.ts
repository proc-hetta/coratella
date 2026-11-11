import type { SubmitFunction } from '$app/forms';

type SubmitInput = Parameters<SubmitFunction>[0];
import { notifyError, notifySuccess } from '#lib/toaster.ts';
import { m } from '#lib/paraglide/messages.js';

/**
 * `use:enhance` handler for admin forms: shows a success or error toast, then applies the default
 * update without resetting the form. `preHook` runs on submit (it may edit `formData` or `cancel()`),
 * `callback` once the result is known.
 */
export function coratellaFormCallback({
  successMessage,
  refreshAll,
  callback = async () => {},
  preHook = () => {},
}: {
  successMessage: string;
  refreshAll: boolean;
  callback?: () => Promise<void>;
  preHook?: (input: SubmitInput) => void | Promise<void>;
}): SubmitFunction {
  return async (input) => {
    await preHook(input);
    return async ({ result, update }) => {
      if (result.type === 'success' || result.type === 'redirect') {
        notifySuccess(successMessage);
      } else {
        notifyError(
          result.type === 'failure' ? (result.data?.message ?? m.unknownError()) : m.unknownError(),
        );
      }

      await callback();

      return update({ reset: false, refreshAll });
    };
  };
}
