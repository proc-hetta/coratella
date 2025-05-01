<script lang="ts">
  import { toaster, toasterOptions } from '$lib/toaster.js';
  import { m } from '$lib/paraglide/messages';
  import { invalidateAll } from '$app/navigation';
  import { Trash, Pencil } from '@lucide/svelte';

  import NameFormModal from '$lib/components/NameFormModal.svelte';
  import AdministrationCard from '$lib/components/AdministrationCard.svelte';

  let { data } = $props();
  let categories = $state(data.categories);

  // https://www.reddit.com/r/sveltejs/comments/1gx65ho/proper_page_data_and_reactivity_pattern_in_svelte/
  $effect(() => {
    categories = data.categories;
  });

  let createModalOpen = $state(false);
  let editModalOpen = $state(false);

  let formName: string = $state('');
  let formId: number | null = $state(null);

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
    createModalOpen = true;
  }

  function openEditCategoryModal(id: number, name: string) {
    formName = name;
    formId = id;
    editModalOpen = true;
  }
</script>

<AdministrationCard title={m.categories()} addButtonAction={openCreateCategoryModal}>
  <table class="table whitespace-nowrap">
    <thead>
      <tr>
        <th>Id</th>
        <th>{m.name()}</th>
        <th class="!text-right">{m.actions()}</th>
      </tr>
    </thead>
    <tbody class="[&>tr]:hover:preset-tonal-primary">
      {#each categories as row (row.id)}
        <tr>
          <td class="text-left">{row.id}</td>
          <td class="text-left">{row.name}</td>
          <td class="text-right">
            <div class="flex flex-row justify-end">
              <button class="btn-icon" onclick={() => openEditCategoryModal(row.id, row.name)}
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

<NameFormModal
  title={m.createCategory()}
  action="?/create"
  callback={async () => (createModalOpen = false)}
  successMessage={m.categoryCreationSuccessful()}
  bind:modalOpen={createModalOpen}
  bind:name={formName}
  bind:id={formId}
/>

<NameFormModal
  title={m.editAuthor()}
  action="?/edit"
  callback={async () => (editModalOpen = false)}
  successMessage={m.successfulModification()}
  bind:modalOpen={editModalOpen}
  bind:name={formName}
  bind:id={formId}
/>
