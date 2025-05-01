<script lang="ts">
  import { FileUpload } from '@skeletonlabs/skeleton-svelte';
  import { X, ImagePlus } from '@lucide/svelte/icons';

  interface Props {
    readonly src?: string;
    readonly onRemove: () => void;
    readonly onFileAccept: (file: File) => void;
  }

  let { src, onRemove, onFileAccept }: Props = $props();
</script>

{#if !src}
  <FileUpload
    classes="w-full h-full"
    accept="image/*"
    onFileAccept={(details) => onFileAccept(details.files[0])}
  >
    {@render imageCard()}
  </FileUpload>
{:else}
  {@render imageCard()}
{/if}

{#snippet imageCard()}
  <div
    class={[
      'flex aspect-square flex-col items-center justify-center gap-2 overflow-clip rounded-lg shadow-lg contain-content',
      src ? 'bg-black' : 'bg-surface-200-800',
    ]}
  >
    {#if !src}
      <ImagePlus class="text-surface-500 size-1/5" />
      <span class="text-surface-400">Aggiungi immagine</span>
    {:else}
      <img
        {src}
        alt="Immagine di anteprima"
        class="border-surface-200 max-h-full max-w-full object-contain"
      />
      <button
        class="btn-icon btn-icon-lg preset-glass-neutral absolute end-2 top-2"
        onclick={() => onRemove()}
      >
        <X />
      </button>
    {/if}
  </div>
{/snippet}
