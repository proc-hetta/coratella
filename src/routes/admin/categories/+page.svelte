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

  let { data } = $props();
  let categories = $state(data.categories);

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
              <button class="btn-icon" onclick={() => deleteCategory(row.id)}><Trash /></button>
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
  title={m.editAuthor()}
  action="?/edit"
  callback={async () => (editModalOpen = false)}
  successMessage={m.successfulModification()}
  bind:modalOpen={editModalOpen}
  bind:name={formName}
  bind:id={formId}
  bind:color={formColor}
/>
