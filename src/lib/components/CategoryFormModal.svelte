<script lang="ts">
  import { enhance } from '$app/forms';
  import { m } from '$lib/paraglide/messages';
  import { coratellaFormCallback } from '$lib/utils';
  import { Modal, ProgressRing, Slider } from '@skeletonlabs/skeleton-svelte';
  import type { HSL, RGB } from '$lib/server/db/color';

  let {
    title,
    action,
    callback,
    successMessage,

    modalOpen = $bindable(),
    name = $bindable(),
    id = $bindable(),
    color = $bindable(),
  } = $props();

  let running = $state(false);
  let form: HTMLFormElement | undefined = $state();

  function hslToRgb(color: HSL): RGB {
    let { h, s, l } = color;

    s /= 100;
    l /= 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
  }

  function rgbToHex(color: RGB): string {
    let { r, g, b } = color;
    return (
      '#' +
      [r, g, b]
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
        .toLowerCase()
    );
  }

  let colorString = $derived(rgbToHex(hslToRgb(color)));
</script>

<Modal
  open={modalOpen}
  onOpenChange={(e) => (modalOpen = e.open)}
  contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
  backdropClasses="backdrop-blur-sm"
>
  {#snippet content()}
    <header>
      <h4 class="h4">{title}</h4>
    </header>

    <article>
      <form
        method="POST"
        {action}
        class="flex flex-col items-center justify-center gap-2"
        bind:this={form}
        use:enhance={coratellaFormCallback(
          successMessage,
          true,
          async () => {
            await callback();
            running = false;
          },
          () => (running = true),
        )}
      >
        <div class="flex flex-wrap items-center justify-center gap-2">
          <label class="label">
            <span class="label-text text-left">{m.name()}</span>
            <input class="input" type="text" bind:value={name} name="name" />
          </label>
          <label class="label">
            <span class="label-text text-left">{m.H()}</span>
            <input
              type="number"
              class="input"
              bind:value={color.h}
              min="0"
              max="255"
              placeholder=""
            />
          </label>
          <label class="label">
            <span class="label-text text-left">{m.S()}</span>
            <input
              type="number"
              class="input"
              bind:value={color.s}
              min="0"
              max="255"
              placeholder=""
            />
          </label>
          <label class="label">
            <span class="label-text text-left">{m.L()}</span>
            <input
              type="number"
              class="input"
              bind:value={color.l}
              min="0"
              max="255"
              placeholder=""
            />
          </label>
          <label class="label">
            <p>{m.H()}</p>
            <Slider
              name="value"
              value={[color.h]}
              onValueChange={(e) => {
                color.h = e.value[0];
              }}
            />
            <p>{m.S()}</p>
            <Slider
              name="value"
              value={[color.s]}
              onValueChange={(e) => {
                color.s = e.value[0];
              }}
            />
            <p>{m.L()}</p>
            <Slider
              name="value"
              value={[color.l]}
              onValueChange={(e) => {
                color.l = e.value[0];
              }}
            />
          </label>
        </div>
        <input type="hidden" name="color" value={colorString} />
        <input type="hidden" name="id" value={id} />
        <div
          class="badge preset-filled-primary-500 mt-2.5 h-fit"
          style="background-color: {colorString};"
        >
          {name === '' ? m.placeholderName() : name}
        </div>
      </form>
    </article>

    <footer class="mt-4 flex items-center justify-center gap-2">
      <button
        type="button"
        class="btn preset-outlined-primary-500"
        disabled={running}
        onclick={() => (modalOpen = false)}>{m.abort()}</button
      >
      <button
        type="button"
        class="btn preset-filled-primary-500"
        disabled={running}
        onclick={() => form!.requestSubmit()}
        >{m.save()}
        <div class={running ? '' : 'hidden'}>
          <ProgressRing
            value={null}
            size="size-4"
            meterStroke="stroke-tertiary-600-400"
            trackStroke="stroke-tertiary-50-950"
          />
        </div>
      </button>
    </footer>
  {/snippet}
</Modal>
