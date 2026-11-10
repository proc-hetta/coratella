import type { SubmitFunction } from '$app/forms';
import { toaster, toasterOptions } from '#lib/toaster.ts';
import { m } from '#lib/paraglide/messages.js';

export function coratellaFormCallback(params: {
  successMessage: string;
  refreshAll: boolean;
  callback: () => Promise<void>;
  preHook: () => void;
}): SubmitFunction {
  return () => {
    const { successMessage, refreshAll, callback, preHook } = params;

    preHook();
    return async ({ result, update }) => {
      if (['redirect', 'success'].includes(result.type)) {
        toaster.success({
          title: m.success(),
          description: successMessage,
          ...toasterOptions,
        });
      } else {
        toaster.error({
          title: m.error(),
          description:
            result.type == 'failure'
              ? (result.data?.message ?? m.unknownError())
              : m.unknownError(),
          ...toasterOptions,
        });
      }

      await callback();

      return update({
        reset: false,
        refreshAll,
      });
    };
  };
}
