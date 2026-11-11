<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';

  // `form`: id of the form submitted on confirm.
  let {
    title,
    content,
    form,
    trigger,
    triggerClass,
    triggerDisabled = false,
    onClick = () => {},
  } = $props();
  const animation =
    'transition transition-discrete opacity-0 translate-y-[100px] starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-[100px] data-[state=open]:opacity-100 data-[state=open]:translate-y-0';
</script>

<Dialog>
  <Dialog.Trigger class={triggerClass} disabled={triggerDisabled} onclick={() => onClick()}>
    {@render trigger()}
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="bg-surface-50-950/50 fixed inset-0 z-50" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Dialog.Content
        class="card bg-surface-100-900 w-full max-w-xl space-y-4 p-4 shadow-xl {animation}"
      >
        <header class="flex items-center justify-between">
          <Dialog.Title class="text-lg font-bold">{title}</Dialog.Title>
        </header>
        <Dialog.Description>
          {@render content()}
        </Dialog.Description>
        <footer class="flex justify-end gap-2 pt-4">
          <Dialog.CloseTrigger id="abort" class="btn preset-tonal">{m.abort()}</Dialog.CloseTrigger>
          <button type="submit" {form} class="btn preset-filled-primary-500">
            {m.confirm()}
          </button>
        </footer>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
