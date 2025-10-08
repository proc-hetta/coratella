<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { toaster, toasterOptions } from '$lib/toaster';
  import { m } from '$lib/paraglide/messages';
  import { Trash, Pencil } from '@lucide/svelte';
  import AdministrationCard from '$lib/components/AdministrationCard.svelte';
  import UserFormModal from '$lib/components/UserFormModal.svelte';
  import DialogModal from '$lib/components/DialogModal.svelte';

  let { data } = $props();
  let users = $state(data.users);
  let user = $state(data.user);

  // https://www.reddit.com/r/sveltejs/comments/1gx65ho/proper_page_data_and_reactivity_pattern_in_svelte/
  $effect(() => {
    users = data.users;
    user = data.user;
  });

  let createModalOpen = $state(false);
  let editModalOpen = $state(false);

  let formUsername: string = $state('');
  let formPassword: string = $state('');
  let formId: string = $state('');

  let selected_user = $state('');
  let selected_username = $state('');
  let dialog: HTMLDialogElement | undefined = $state();
  let dialogOpen = $state(false);

  async function deleteUser(id: string) {
    const response = await fetch(`/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (response.ok) {
      toaster.success({
        title: m.success(),
        description: m.userDeleted(),
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

  function openCreateUserModal() {
    formUsername = '';
    formPassword = '';
    formId = '';
    createModalOpen = true;
  }

  function openEditUserModal(id: string, username: string) {
    formUsername = username;
    formPassword = '';
    formId = id;
    editModalOpen = true;
  }
</script>

<DialogModal
  title={m.deleteUser()}
  {dialog}
  prompt={m.deletePrompt({ parameter: selected_username })}
  onAccept={() => deleteUser(selected_user)}
  onClose={() => (dialogOpen = false)}
  {dialogOpen}
></DialogModal>

<AdministrationCard title={m.users()} addButtonAction={openCreateUserModal}>
  <table class="table whitespace-nowrap">
    <thead>
      <tr>
        <th>Id</th>
        <th>{m.username()}</th>
        <th class="!text-right">{m.actions()}</th>
      </tr>
    </thead>
    <tbody class="[&>tr]:hover:preset-tonal-primary">
      {#each users as row (row.id)}
        <tr class={row.id === user.id ? 'preset-tonal-surface' : ''}>
          <td class="text-left">{row.id}</td>
          <td class="text-left">{row.username}</td>
          <td class="text-right">
            <div class="flex flex-row justify-end">
              <button
                class="btn-icon"
                onclick={() =>
                  row.id === user.id
                    ? goto('/admin/profile')
                    : openEditUserModal(row.id, row.username)}><Pencil /></button
              >
              <button
                class="btn-icon"
                onclick={() => {
                  selected_user = row.id;
                  selected_username = row.username;
                  dialogOpen = true;
                  dialog?.showModal();
                }}
                disabled={row.id === user.id}><Trash /></button
              >
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</AdministrationCard>

<UserFormModal
  title={m.createUser()}
  action="?/create"
  callback={async () => (createModalOpen = false)}
  successMessage={m.userCreationSuccessful()}
  bind:modalOpen={createModalOpen}
  bind:username={formUsername}
  bind:password={formPassword}
  bind:id={formId}
/>

<UserFormModal
  title={m.editUser()}
  action="?/edit"
  callback={async () => (editModalOpen = false)}
  successMessage={m.successfulModification()}
  bind:modalOpen={editModalOpen}
  bind:username={formUsername}
  bind:password={formPassword}
  bind:id={formId}
/>
