<script lang="ts">
  import { enhance } from '$app/forms';
  import { m } from '$lib/paraglide/messages';
  import { coratellaFormCallback } from '$lib/utils';
  import { Modal, ProgressRing, Slider } from '@skeletonlabs/skeleton-svelte';
  import CategoryBadge from './CategoryBadge.svelte';
  import Color from 'color';

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
  let colorProfile = $derived(Color(color));
  let colorString = $derived(colorProfile.hex());

  name = name === '' ? m.placeholderName() : name;
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
            <span class="label-text text-left">{m.R()}</span>
            <input
              type="number"
              class="input"
              bind:value={color.r}
              min="0"
              max="255"
              placeholder=""
            />
          </label>
          <label class="label">
            <span class="label-text text-left">{m.G()}</span>
            <input
              type="number"
              class="input"
              bind:value={color.g}
              min="0"
              max="255"
              placeholder=""
            />
          </label>
          <label class="label">
            <span class="label-text text-left">{m.B()}</span>
            <input
              type="number"
              class="input"
              bind:value={color.b}
              min="0"
              max="255"
              placeholder=""
            />
          </label>
          <label class="label">
            <p>{m.R()}</p>
            <Slider
              name="value"
              value={[colorProfile.red()]}
              onValueChange={(e) => {
                color.r = e.value[0];
              }}
              max={255}
            />
            <p>{m.G()}</p>
            <Slider
              name="value"
              value={[colorProfile.green()]}
              onValueChange={(e) => {
                color.g = e.value[0];
              }}
              max={255}
            />
            <p>{m.B()}</p>
            <Slider
              name="value"
              value={[colorProfile.blue()]}
              onValueChange={(e) => {
                color.b = e.value[0];
              }}
              max={255}
            />
          </label>
        </div>
        <input type="hidden" name="color" value={colorString} />
        <input type="hidden" name="id" value={id} />
        <CategoryBadge bind:text={name} bind:colorText={colorString} />
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
