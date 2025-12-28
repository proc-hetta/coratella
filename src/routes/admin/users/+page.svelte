<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { toaster, toasterOptions } from '$lib/toaster';
  import { m } from '$lib/paraglide/messages';
  import { Trash, Pencil, Plus } from '@lucide/svelte';
  import AdministrationCard from '$lib/components/AdministrationCard.svelte';
  import DialogModal from '$lib/components/DialogModal.svelte';
  import { coratellaFormCallback } from '$lib/utils';
  import { enhance } from '$app/forms';

  let { data } = $props();
  let users = $derived(data.users);
  let user = $derived(data.user);

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
  }
</script>

{#snippet userForm(userId: string | null, username: string)}
  <DialogModal
    title={userId === null ? m.createUser() : m.editUser()}
    onAccept={async () => {
      const form = document.getElementById(
        `user-form-${userId === null ? 'new' : userId}`,
      ) as HTMLFormElement;
      form.requestSubmit();
    }}
    triggerClass="btn-icon {userId === null ? 'w-min self-end' : ''}"
  >
    {#snippet trigger()}
      <Plus class={userId !== null ? 'hidden' : ''} />
      <Pencil class={userId === null ? 'hidden' : ''} />
    {/snippet}
    {#snippet content()}
      <form
        id="user-form-{userId === null ? 'new' : userId}"
        method="POST"
        action={userId === null ? '?/create' : '?/edit'}
        class="flex flex-col items-center justify-center gap-2"
        use:enhance={coratellaFormCallback({
          successMessage: userId === null ? m.userCreationSuccessful() : m.successfulModification(),
          invalidateAll: true,
          callback: async () => {},
          preHook: () => {},
        })}
      >
        <div class="flex flex-wrap items-center justify-center gap-2">
          <label class="label max-w-md">
            <span class="label-text text-left">{m.username()}</span>
            <input class="input" type="text" value={username} name="username" />
          </label>
          <label class="label max-w-md">
            <span class="label-text text-left">{m.newPassword()}</span>
            <input class="input" type="password" value="" placeholder="*********" name="password" />
          </label>
        </div>
        <input type="hidden" name="id" value={userId} />
      </form>
    {/snippet}
  </DialogModal>
{/snippet}

<AdministrationCard title={m.users()}>
  {#snippet addElement()}
    {@render userForm(null, '')}
  {/snippet}
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
              {#if row.id === user.id}
                <button class="btn-icon" onclick={() => goto('/admin/profile')}><Pencil /></button>
              {:else}
                {@render userForm(row.id, row.username)}
              {/if}
              <DialogModal
                title={m.deleteUser()}
                onAccept={() => deleteUser(row.id)}
                triggerClass="btn-icon"
              >
                {#snippet trigger()}
                  <Trash />
                {/snippet}
                {#snippet content()}
                  <p>{m.deletePrompt({ parameter: row.username })}</p>
                {/snippet}
              </DialogModal>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</AdministrationCard>

<!-- <UserFormModal
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
-->
