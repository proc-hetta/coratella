<script lang="ts">
  import { refreshAll } from '$app/navigation';
  import { themes, modes, getMode, getTheme, setMode, setTheme } from '#lib/themes.ts';

  let selectedTheme = $derived(getTheme());
  let selectedMode = $derived(getMode());
</script>

<div class="z-50 grid grid-rows-2 gap-8">
  <div class="bg-surface-100-900 grid grid-cols-3 gap-2">
    {#each modes as mode (mode)}
      <button
        class={`chip capitalize ${mode === selectedMode ? 'preset-filled' : 'preset-tonal'}`}
        onclick={async () => {
          selectedMode = mode;
          setMode(selectedMode);
          refreshAll();
        }}
      >
        <span>{mode}</span>
      </button>
    {/each}
  </div>
  <div class="grid grid-cols-3 gap-2">
    {#each themes as theme (theme)}
      <button
        class={`chip capitalize ${theme === selectedTheme ? 'preset-filled' : 'preset-tonal'}`}
        onclick={async () => {
          selectedTheme = theme;
          setTheme(selectedTheme);
          refreshAll();
        }}
      >
        <span>{theme}</span>
      </button>
    {/each}
  </div>
</div>
