<script lang="ts">
  import { toaster, toasterOptions } from '$lib/toaster.js';
  import { m } from '$lib/paraglide/messages';
  import { invalidateAll } from '$app/navigation';
  import { Trash, Pencil, Circle, Plus } from '@lucide/svelte';

  import AdministrationCard from '$lib/components/AdministrationCard.svelte';

  import Color from 'color';
  import type { ColorInstance } from 'color';
  import type { RGB } from '$lib/server/db/color';
  import DialogModal from '$lib/components/DialogModal.svelte';
  import { coratellaFormCallback } from '$lib/utils.js';
  import { enhance } from '$app/forms';

  let { data } = $props();
  let categories = $derived(data.categories);

  export const rgb = (color: ColorInstance): RGB => {
    const [r, g, b] = color.toJSON().color;
    return {
      r,
      g,
      b,
    };
  };

  async function deleteCategory(id: number) {
    const response = await fetch(`/admin/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (response.ok) {
      toaster.success({
        title: m.success(),
        description: m.categoryDeleted(),
        ...toasterOptions,
      });
      await invalidateAll();
    } else {
      toaster.error({
        title: m.error(),
        description: m.errorWhileDeleting(),
        ...toasterOptions,
      });
    }
  }
</script>

{#snippet categoryForm(categoryId: number, name: string, color: RGB)}
  <DialogModal
    title={Number.isNaN(categoryId) ? m.createTag() : m.editTag()}
    onAccept={async () => {
      const form = document.getElementById(
        `tag-form-${Number.isNaN(categoryId) ? 'new' : categoryId}`,
      ) as HTMLFormElement;
      form.requestSubmit();
    }}
    triggerClass="btn-icon {Number.isNaN(categoryId) ? 'w-min self-end' : ''}"
  >
    {#snippet trigger()}
      <Plus class={!Number.isNaN(categoryId) ? 'hidden' : ''} />
      <Pencil class={Number.isNaN(categoryId) ? 'hidden' : ''} />
    {/snippet}
    {#snippet content()}
      <form
        id="tag-form-{Number.isNaN(categoryId) ? 'new' : categoryId}"
        method="POST"
        action={Number.isNaN(categoryId) ? '?/create' : '?/edit'}
        class="flex flex-col items-center justify-center gap-2"
        use:enhance={coratellaFormCallback({
          successMessage: Number.isNaN(categoryId)
            ? m.tagCreationSuccessful()
            : m.successfulModification(),
          invalidateAll: true,
          callback: async () => {},
          preHook: () => {},
        })}
      >
        <div class="flex flex-wrap items-center justify-center gap-2">
          <label class="label max-w-md">
            <span class="label-text text-left">{m.name()}</span>
            <input class="input" type="text" value={name} name="name" />
          </label>
          <label class="label max-w-md">
            <span class="label-text text-left">{m.color()}</span>
            <input
              class="input"
              type="color"
              value={Color.rgb(color.r, color.g, color.b).hex()}
              name="color"
            />
          </label>
        </div>
        <input type="hidden" name="id" value={categoryId} />
      </form>
    {/snippet}
  </DialogModal>
{/snippet}

<AdministrationCard title={m.categories()}>
  {#snippet addElement()}
    {@render categoryForm(NaN, '', rgb(Color('#000000')))}
  {/snippet}
  <table class="table whitespace-nowrap">
    <thead>
      <tr>
        <th>Id</th>
        <th>{m.color()}</th>
        <th>{m.name()}</th>
        <th class="!text-right">{m.actions()}</th>
      </tr>
    </thead>
    <tbody class="[&>tr]:hover:preset-tonal-primary">
      {#each categories as row (row.id)}
        <tr>
          <td class="text-left">{row.id}</td>
          <td class="text-left"><Circle fill={row.color} color={row.color ?? undefined} /></td>
          <td class="text-left">{row.name}</td>
          <td class="text-right">
            <div class="flex flex-row justify-end">
              {@render categoryForm(row.id, row.name, rgb(Color(row.color ?? '#000000')))}
              <DialogModal
                title={m.deleteCategory()}
                onAccept={() => deleteCategory(row.id)}
                triggerClass="btn-icon"
              >
                {#snippet trigger()}
                  <Trash />
                {/snippet}
                {#snippet content()}
                  <p>{m.deletePrompt({ parameter: row.name })}</p>
                {/snippet}
              </DialogModal>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</AdministrationCard>
