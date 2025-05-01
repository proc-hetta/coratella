<script lang="ts">
  import { toaster, toasterOptions } from '$lib/toaster.js';
  import { m } from '$lib/paraglide/messages';
  import { invalidateAll } from '$app/navigation';
  import { Trash, Pencil } from '@lucide/svelte';

  import AuthorFormModal from '$lib/components/AuthorFormModal.svelte';
  import AdministrationCard from '$lib/components/AdministrationCard.svelte';
  import { Avatar } from '@skeletonlabs/skeleton-svelte';

  let { data } = $props();
  let authors = $state(data.authors);

  // https://www.reddit.com/r/sveltejs/comments/1gx65ho/proper_page_data_and_reactivity_pattern_in_svelte/
  $effect(() => {
    authors = data.authors;
  });

  let createModalOpen = $state(false);
  let editModalOpen = $state(false);

  let formNickname: string = $state('');
  let formFirstName: string = $state('');
  let formLastName: string = $state('');
  let formImage: string | null = $state(null);
  let formId: number | null = $state(null);
  let formImageFile: File | undefined = $state(undefined);

  async function deleteAuthor(id: number) {
    const response = await fetch(`/admin/authors/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (response.ok) {
      toaster.success({
        title: m.success(),
        description: m.authorDeleted(),
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

  function openCreateAuthorModal() {
    formNickname = '';
    formFirstName = '';
    formLastName = '';
    formId = null;
    formImage = null;
    formImageFile = undefined;
    createModalOpen = true;
  }

  function openEditAuthorModal(
    id: number,
    nickname: string,
    firstName: string,
    lastName: string,
    image: string | null,
  ) {
    formNickname = nickname;
    formFirstName = firstName;
    formLastName = lastName;
    formId = id;
    formImage = image;
    formImageFile = undefined;
    editModalOpen = true;
  }
</script>

<AdministrationCard title={m.authors()} addButtonAction={openCreateAuthorModal}>
  <table class="table whitespace-nowrap">
    <thead>
      <tr>
        <th>Id</th>
        <th>{m.image()}</th>
        <th>{m.nickname()}</th>
        <th>{m.firstName()}</th>
        <th>{m.lastName()}</th>
        <th class="!text-right">{m.actions()}</th>
      </tr>
    </thead>
    <tbody class="[&>tr]:hover:preset-tonal-primary">
      {#each authors as row (row.id)}
        <tr>
          <td class="text-left">{row.id}</td>
          <td class="text-left"
            ><Avatar size="size-8" src={row.image ?? undefined} name={row.nickname} /></td
          >
          <td class="text-left">{row.nickname}</td>
          <td class="text-left">{row.firstName}</td>
          <td class="text-left">{row.lastName}</td>
          <td class="text-right">
            <div class="flex flex-row justify-end">
              <button
                class="btn-icon"
                onclick={() =>
                  openEditAuthorModal(
                    row.id,
                    row.nickname,
                    row.firstName ?? '',
                    row.lastName ?? '',
                    row.image,
                  )}><Pencil /></button
              >
              <button class="btn-icon" onclick={() => deleteAuthor(row.id)}><Trash /></button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</AdministrationCard>

<AuthorFormModal
  title={m.createAuthor()}
  action="?/create"
  callback={async () => (createModalOpen = false)}
  successMessage={m.authorCreationSuccessful()}
  bind:modalOpen={createModalOpen}
  bind:nickname={formNickname}
  bind:firstName={formFirstName}
  bind:lastName={formLastName}
  bind:image={formImage}
  bind:id={formId}
  bind:imageFile={formImageFile}
/>

<AuthorFormModal
  title={m.editAuthor()}
  action="?/edit"
  callback={async () => (editModalOpen = false)}
  successMessage={m.successfulModification()}
  bind:modalOpen={editModalOpen}
  bind:nickname={formNickname}
  bind:firstName={formFirstName}
  bind:lastName={formLastName}
  bind:image={formImage}
  bind:id={formId}
  bind:imageFile={formImageFile}
/>
