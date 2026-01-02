<script lang="ts">
  import { browser } from '$app/environment';
  import { getTheme, setTheme } from '$lib/themes';
  import { Paintbrush } from '@lucide/svelte';
  import { Popover, Portal, SegmentedControl } from '@skeletonlabs/skeleton-svelte';
  import 'tailwindcss';

  let { themes, variants } = $props();

  let selectedTheme = $state(getTheme());
  let selectedVariant = $state(
    browser ? document.documentElement.getAttribute('class')?.includes('dark') : undefined,
  );
</script>

<!--
<svelte:head>
  {@html `
  <style>${currentTheme}</style>
  `}
</svelte:head> -->

<Popover>
  <Popover.Trigger class="btn"><Paintbrush></Paintbrush>Theme</Popover.Trigger>
  <Portal>
    <Popover.Positioner>
      <!-- <hr class="hr top-5" /> -->
      <!-- <div class="flex gap-2">
        {#each store as theme (theme)}
          <button class={`chip capitalize ${theme === selectedTheme ? 'preset-filled' : 'preset-tonal'}`} onclick={
            () => setTheme(theme)
          }>
            <span>{theme}</span>
          </button>
        {/each}
      </div> -->
      <Popover.Content class="card bg-surface-100-900 w-96 p-4 shadow-xl">
        <div class="grid grid-cols-3 gap-2">
          {#each themes as theme (theme)}
            <button
              class={`chip capitalize ${
                theme === selectedTheme ? 'preset-filled' : 'preset-tonal'
              }`}
              onclick={async () => {
                selectedTheme = theme;
                setTheme(theme);
              }}
            >
              <span>{theme}</span>
            </button>
          {/each}
        </div>
      </Popover.Content>
    </Popover.Positioner>
  </Portal>
</Popover>
