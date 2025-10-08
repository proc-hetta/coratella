<script lang="ts">
  import { m } from '$lib/paraglide/messages.js';
  import { Modal, ProgressRing } from '@skeletonlabs/skeleton-svelte';

  let {
    title,
    prompt,
    onAccept,
    onClose,
    dialog = $bindable(),
    dialogOpen = $bindable(),
  } = $props();

  let running = $state(false);
</script>

<Modal
  open={dialogOpen}
  contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
  backdropClasses="backdrop-blur-sm"
>
  {#snippet content()}
    <header>
      <h4 class="h4">{title}</h4>
    </header>

    <div
      role="dialog"
      aria-modal="true"
      class="card z-60 flex w-full items-center justify-center"
      bind:this={dialog}
    >
      <div class="flex flex-col items-center justify-center gap-2">
        <div class="flex items-center justify-center">
          <p class="p w-full">{prompt}</p>
        </div>
        <div class="flex flex-row items-center justify-center gap-2"></div>
      </div>
    </div>

    <footer class="mt-4 flex items-center justify-center gap-2">
      <button
        type="button"
        class="btn preset-outlined-primary-500"
        disabled={running}
        onclick={() => onClose()}>{m.abort()}</button
      >
      <button
        type="button"
        class="btn preset-filled-primary-500"
        disabled={running}
        onclick={() => onAccept()}
        >{m.confirm()}
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
