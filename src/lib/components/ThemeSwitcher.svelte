<script lang="ts">
  import { refreshAll } from '$app/navigation';
  import { themes, modes, getMode, getTheme, setMode, setTheme } from '#lib/themes.ts';

  let selectedTheme = $derived(getTheme());
  let selectedMode = $derived(getMode());
</script>

{#snippet choices(options: string[], selected: string, select: (value: string) => void)}
  {#each options as option (option)}
    <button
      class={`chip capitalize ${option === selected ? 'preset-filled' : 'preset-tonal'}`}
      onclick={() => {
        select(option);
        refreshAll();
      }}
    >
      <span>{option}</span>
    </button>
  {/each}
{/snippet}

<div class="z-50 flex flex-col gap-8">
  <div class="bg-surface-100-900 grid grid-cols-3 gap-2">
    {@render choices(modes, selectedMode, (mode) => {
      selectedMode = mode;
      setMode(mode);
    })}
  </div>
  <div class="grid grid-cols-3 gap-2">
    {@render choices(themes, selectedTheme, (theme) => {
      selectedTheme = theme;
      setTheme(theme);
    })}
  </div>
</div>
