<script lang="ts">
  import { enhance } from '$app/forms';
  import { m } from '$lib/paraglide/messages';
  import { coratellaFormCallback } from '$lib/utils';
  import ImageFrame from './ImageFrame.svelte';
  import { toaster, toasterOptions } from '$lib/toaster';
  import { tick } from 'svelte';
  import { Modal, ProgressRing } from '@skeletonlabs/skeleton-svelte';

  let {
    title,
    action,
    callback,
    successMessage,

    modalOpen = $bindable(),
    nickname = $bindable(),
    email = $bindable(),
    firstName = $bindable(),
    lastName = $bindable(),
    image = $bindable(),
    id = $bindable(),
    imageFile = $bindable(),
  } = $props();

  let running = $state(false);

  let form: HTMLFormElement | undefined = $state();
  async function submitForm() {
    running = true;

    if (imageFile) {
      let formData = new FormData();
      formData.append('file', imageFile);
      const response = await fetch('/admin/files', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        toaster.error({
          title: m.error(),
          description: response.status,
          ...toasterOptions,
        });
        return;
      }
      image = response.headers.get('Location');
    }

    await tick();

    form!.requestSubmit();
  }
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
        use:enhance={coratellaFormCallback(successMessage, true, async () => {
          await callback();
          running = false;
        })}
      >
        <div class="size-64">
          <ImageFrame
            src={imageFile ? URL.createObjectURL(imageFile) : image}
            onFileAccept={(file) => (imageFile = file)}
            onRemove={() => {
              imageFile = undefined;
              image = null;
            }}
          />
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <label class="label">
            <span class="label-text text-left">{m.nickname()}</span>
            <input class="input" type="text" bind:value={nickname} name="nickname" />
          </label>
          <label class="label">
            <span class="label-text text-left">{m.email()}</span>
            <input class="input" type="text" bind:value={email} name="email" />
          </label>
          <label class="label">
            <span class="label-text text-left">{m.firstName()}</span>
            <input class="input" type="text" bind:value={firstName} name="firstName" />
          </label>
          <label class="label">
            <span class="label-text text-left">{m.lastName()}</span>
            <input class="input" type="text" bind:value={lastName} name="lastName" />
          </label>
        </div>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="image" bind:value={image} />
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
        onclick={submitForm}
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
