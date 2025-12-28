<script lang="ts">
  import { Plus } from '@lucide/svelte';

  let { title, children, addElement } = $props();
</script>

<div class="flex items-center justify-center">
  <div class="card md:preset-filled-surface-100-900 w-full p-4 text-center">
    <div class="flex items-center justify-center">
      <h4 class="h4 w-full">{title}</h4>
      {@render addElement()}
    </div>
    <div class="overflow-x-scroll">
      {@render children()}
    </div>
  </div>
</div>
