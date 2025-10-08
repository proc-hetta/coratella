<script lang="ts">
  import { toaster, toasterOptions } from '$lib/toaster.js';
  import { m } from '$lib/paraglide/messages';
  import { invalidateAll } from '$app/navigation';
  import { Trash, Pencil, Circle } from '@lucide/svelte';

  import AdministrationCard from '$lib/components/AdministrationCard.svelte';
  import CategoryFormModal from '$lib/components/CategoryFormModal.svelte';

  import Color from 'color';
  import type { ColorInstance } from 'color';
  import type { RGB } from '$lib/server/db/color';
  import DialogModal from '$lib/components/DialogModal.svelte';

  let { data } = $props();
  let categories = $state(data.categories);
  let selected_id = $state(NaN);
  let selected_category = $state('');
  let dialog: HTMLDialogElement | undefined = $state();
  let dialogOpen = $state(false);

  // https://www.reddit.com/r/sveltejs/comments/1gx65ho/proper_page_data_and_reactivity_pattern_in_svelte/
  $effect(() => {
    categories = data.categories;
  });

  export const rgb = (color: ColorInstance): RGB => {
    const [r, g, b] = color.toJSON().color;
    return {
      r,
      g,
      b,
    };
  };

  let createModalOpen = $state(false);
  let editModalOpen = $state(false);

  let formName: string = $state('');
  let formId: number | null = $state(null);
  let formColor: RGB | null = $state({
    r: 0,
    g: 0,
    b: 0,
  });

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
    dialogOpen = false;
  }

  function openCreateCategoryModal() {
    formName = '';
    formId = null;
    formColor = rgb(Color('#000000'));
    createModalOpen = true;
  }

  function openEditCategoryModal(id: number, name: string, color: RGB) {
    console.log(color);
    formName = name;
    formId = id;
    formColor = color;
    editModalOpen = true;
  }
</script>

<DialogModal
  title={m.deleteCategory()}
  {dialog}
  prompt={m.deletePrompt({ parameter: selected_category })}
  onAccept={() => deleteCategory(selected_id)}
  onClose={() => (dialogOpen = false)}
  {dialogOpen}
></DialogModal>

<AdministrationCard title={m.categories()} addButtonAction={openCreateCategoryModal}>
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
              <button
                class="btn-icon"
                onclick={() =>
                  openEditCategoryModal(row.id, row.name, rgb(Color(row.color ?? '#000000')))}
                ><Pencil /></button
              >
              <button
                class="btn-icon"
                onclick={() => {
                  selected_id = row.id;
                  selected_category = row.name;
                  dialogOpen = true;
                  dialog?.showModal();
                }}><Trash /></button
              >
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</AdministrationCard>

<CategoryFormModal
  title={m.createCategory()}
  action="?/create"
  callback={async () => (createModalOpen = false)}
  successMessage={m.categoryCreationSuccessful()}
  bind:modalOpen={createModalOpen}
  bind:name={formName}
  bind:id={formId}
  bind:color={formColor}
/>

<CategoryFormModal
  title={m.editCategory()}
  action="?/edit"
  callback={async () => (editModalOpen = false)}
  successMessage={m.successfulModification()}
  bind:modalOpen={editModalOpen}
  bind:name={formName}
  bind:id={formId}
  bind:color={formColor}
/>
