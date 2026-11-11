<script lang="ts">
  import '../app.css';
  import { Toast } from '@skeletonlabs/skeleton-svelte';
  import { toaster } from '#lib/toaster.ts';
  import { PUBLIC_TITLE } from '$app/env/public';

  let { children } = $props();
</script>

<svelte:head>
  <title>{PUBLIC_TITLE ?? 'Coratella'}</title>
</svelte:head>

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
