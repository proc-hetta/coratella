<script lang="ts">
  import { enhance } from '$app/forms';
  import { m } from '$lib/paraglide/messages';
  import { coratellaFormCallback } from '$lib/utils';
  import { Modal, ProgressRing } from '@skeletonlabs/skeleton-svelte';

  let {
    title,
    action,
    callback,
    successMessage,

    modalOpen = $bindable(),
    username = $bindable(),
    password = $bindable(),
    id = $bindable(),
  } = $props();

  let running = $state(false);
  let form: HTMLFormElement | undefined = $state();
</script>

<Modal
  open={modalOpen}
  onOpenChange={(e) => (modalOpen = e.open)}
  contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
  backdropClasses="backdrop-blur-sm"
>
  {#snippet content()}
    <header>
      <h4 class="h4">{title}</h4>
    </header>

    <article>
      <form
        method="POST"
        {action}
        class="flex flex-col items-center justify-center gap-2"
        bind:this={form}
        use:enhance={coratellaFormCallback(
          successMessage,
          true,
          async () => {
            await callback();
            running = false;
          },
          () => (running = true),
        )}
      >
        <div class="flex flex-wrap items-center justify-center gap-2">
          <label class="label max-w-md">
            <span class="label-text text-left">{m.username()}</span>
            <input class="input" type="text" bind:value={username} name="username" />
          </label>
          <label class="label max-w-md">
            <span class="label-text text-left">{m.newPassword()}</span>
            <input
              class="input"
              type="password"
              bind:value={password}
              placeholder="*********"
              name="password"
            />
          </label>
        </div>
        <input type="hidden" name="id" value={id} />
      </form>
    </article>

    <footer class="mt-4 flex items-center justify-center gap-2">
      <button
        type="button"
        class="btn preset-outlined-primary-500"
        disabled={running}
        onclick={() => (modalOpen = false)}>{m.abort()}</button
      >
      <button
        type="button"
        class="btn preset-filled-primary-500"
        disabled={running}
        onclick={() => form!.requestSubmit()}
        >{m.save()}
        <div class={running ? '' : 'hidden'}>
          <ProgressRing
            value={null}
            size="size-4"
            meterStroke="stroke-tertiary-600-400"
            trackStroke="stroke-tertiary-50-950"
          />
        </div>
      </button>
    </footer>
  {/snippet}
</Modal>
