<script lang="ts">
  import '../app.css';
  import { Toaster } from '@skeletonlabs/skeleton-svelte';
  import { toaster } from '$lib/toaster';

  let { children } = $props();
</script>

<Toaster {toaster}></Toaster>

{@render children()}
