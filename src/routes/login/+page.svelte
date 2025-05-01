<script lang="ts">
  import { enhance } from '$app/forms';
  import { m } from '$lib/paraglide/messages';
  import { coratellaFormCallback } from '$lib/utils';
  import { ProgressRing } from '@skeletonlabs/skeleton-svelte';

  let running = false;
</script>

<div class="mt-32 flex items-center justify-center">
  <div class="card md:preset-filled-surface-100-900 w-full max-w-md p-4 text-center">
    <h4 class="h4">{m.loginTitle()}</h4>
    <form
      class="mt-8 flex flex-col items-center justify-center gap-2"
      method="POST"
      use:enhance={coratellaFormCallback(
        m.loginSuccess(),
        false,
        async () => {
          running = false;
        },
        () => (running = true),
      )}
    >
      <label class="label">
        <span class="label-text text-left">{m.username()}</span>
        <input class="input" type="text" placeholder={m.username()} name="username" />
      </label>
      <label class="label">
        <span class="label-text text-left">{m.password()}</span>
        <input class="input" type="password" placeholder={m.password()} name="password" />
      </label>
      <button class="btn preset-filled-primary-500 mt-4 w-full md:w-min" disabled={running}
        >{m.login()}
        <div class={running ? '' : 'hidden'}>
          <ProgressRing
            value={null}
            size="size-4"
            meterStroke="stroke-tertiary-600-400"
            trackStroke="stroke-tertiary-50-950"
          />
        </div>
      </button>
    </form>
  </div>
</div>
