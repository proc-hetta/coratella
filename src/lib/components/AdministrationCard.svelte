<script lang="ts">
  import { Plus } from '@lucide/svelte';

  let { title, children, addButtonAction } = $props();
</script>

<div class="flex items-center justify-center">
  <div class="card md:preset-filled-surface-100-900 w-full p-4 text-center">
    <div class="flex items-center justify-center">
      <h4 class="h4 w-full">{title}</h4>
      <button class="btn-icon w-min self-end" onclick={addButtonAction}><Plus /></button>
    </div>
    <div class="overflow-x-scroll">
      {@render children()}
    </div>
  </div>
</div>
