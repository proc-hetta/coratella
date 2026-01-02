<script lang="ts">
  import { modes } from '$lib/themes';
  import { capitalize } from '$lib/utils';
  import { Contrast, Icon, Moon, Paintbrush, Sun } from '@lucide/svelte';
  import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';

  let { themes, getCallback, setCallback } = $props();

  let selectedTheme = $derived(getCallback());
</script>

<Popover>
  <Popover.Trigger class="btn">
    {#if !modes.includes(selectedTheme)}
      <Paintbrush></Paintbrush>
    {:else if selectedTheme === 'light'}
      <Sun></Sun>
    {:else if selectedTheme === 'dark'}
      <Moon></Moon>
    {:else}
      <Contrast></Contrast>
    {/if}
    {capitalize(selectedTheme)}</Popover.Trigger
  >
  <Portal>
    <Popover.Positioner>
      <Popover.Content class="card bg-surface-100-900 w-96 p-4 shadow-xl">
        <div class="grid grid-cols-3 gap-2">
          {#each themes as theme (theme)}
            <button
              class={`chip capitalize ${
                theme === selectedTheme ? 'preset-filled' : 'preset-tonal'
              }`}
              onclick={async () => {
                selectedTheme = theme;
                setCallback(theme);
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
