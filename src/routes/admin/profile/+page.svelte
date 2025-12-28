<script lang="ts">
  import { enhance } from '$app/forms';
  import { m } from '$lib/paraglide/messages';
  import { coratellaFormCallback } from '$lib/utils';
  import { Progress } from '@skeletonlabs/skeleton-svelte';

  const { data } = $props();
  let running = $state(false);
</script>

<div class="mt-32 flex items-center justify-center">
  <div class="card md:preset-filled-surface-100-900 w-full max-w-md p-4 text-center">
    <h4 class="h4">{m.profileTitle()}</h4>
    <form
      class="mt-8 flex flex-col items-center justify-center gap-2"
      method="POST"
      use:enhance={coratellaFormCallback({
        successMessage: m.successfulModification(),
        invalidateAll: false,
        callback: async () => {
          running = false;
        },
        preHook: () => {
          running = true;
        },
      })}
    >
      <label class="label">
        <span class="label-text text-left">{m.username()}</span>
        <input class="input" type="text" value={data.user.username} name="username" />
      </label>
      <label class="label">
        <span class="label-text text-left">{m.newPassword()}</span>
        <input class="input" type="password" placeholder="*********" name="password" />
      </label>
      <label class="label">
        <span class="label-text text-left">{m.repeatNewPassword()}</span>
        <input class="input" type="password" placeholder="*********" name="repeatPassword" />
      </label>
      <button class="btn preset-filled-primary-500 mt-4 w-full md:w-min">
        {m.save()}
        <div class={running ? '' : 'hidden'}>
          <Progress value={null}>
            <Progress.Circle class="[--size:--spacing(4)]">
              <Progress.CircleTrack />
              <Progress.CircleRange />
            </Progress.Circle>
          </Progress>
        </div>
      </button>
    </form>
  </div>
</div>
