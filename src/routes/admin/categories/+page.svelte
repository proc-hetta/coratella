<script lang="ts">
  import { deleteResource, submitForm } from '#lib/admin.ts';
  import { m } from '#lib/paraglide/messages.js';
  import { Trash, Pencil, Circle, Plus } from '@lucide/svelte';

  import AdministrationCard from '#lib/components/AdministrationCard.svelte';

  import Color from 'color';
  import DialogModal from '#lib/components/DialogModal.svelte';
  import { coratellaFormCallback } from '#lib/utils.js';
  import { enhance } from '$app/forms';

  let { data } = $props();
  let categories = $derived(data.categories);

  function deleteCategory(id: number) {
    return deleteResource(`/admin/categories/${id}`, m.categoryDeleted());
  }
</script>

{#snippet categoryForm(categoryId: number, name: string, color: string)}
  {@const isNew = Number.isNaN(categoryId)}
  <DialogModal
    title={isNew ? m.createTag() : m.editTag()}
    onAccept={() => submitForm(`category-form-${isNew ? 'new' : categoryId}`)}
    triggerClass="btn-icon {isNew ? 'w-min self-end' : ''}"
  >
    {#snippet trigger()}
      <Plus class={!isNew ? 'hidden' : ''} />
      <Pencil class={isNew ? 'hidden' : ''} />
    {/snippet}
    {#snippet content()}
      <form
        id="category-form-{isNew ? 'new' : categoryId}"
        method="POST"
        action={isNew ? '?/create' : '?/edit'}
        class="flex flex-col items-center justify-center gap-2"
        use:enhance={coratellaFormCallback({
          successMessage: isNew ? m.tagCreationSuccessful() : m.successfulModification(),
          refreshAll: true,
        })}
      >
        <div class="flex flex-wrap items-center justify-center gap-2">
          <label class="label max-w-md">
            <span class="label-text text-left">{m.name()}</span>
            <input class="input" type="text" value={name} name="name" />
          </label>
          <label class="label max-w-md">
            <span class="label-text text-left">{m.color()}</span>
            <input class="input" type="color" value={Color(color).hex()} name="color" />
          </label>
        </div>
        <input type="hidden" name="id" value={categoryId} />
      </form>
    {/snippet}
  </DialogModal>
{/snippet}

<AdministrationCard title={m.categories()}>
  {#snippet addElement()}
    {@render categoryForm(NaN, '', '#000000')}
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
              {@render categoryForm(row.id, row.name, row.color ?? '#000000')}
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
