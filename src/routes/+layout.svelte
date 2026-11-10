<script lang="ts">
  import '../app.css';
  import { Toast } from '@skeletonlabs/skeleton-svelte';
  import { toaster } from '#lib/toaster.ts';

  let { children } = $props();
</script>

<Toast.Group {toaster}>
  {#snippet children(toast)}
    <Toast {toast}>
      <Toast.Message>
        <Toast.Title>{toast.title}</Toast.Title>
        <Toast.Description>{toast.description}</Toast.Description>
      </Toast.Message>
    </Toast>
  {/snippet}
</Toast.Group>

{@render children()}
