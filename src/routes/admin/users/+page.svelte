<script lang="ts">
  import { deleteResource } from '#lib/admin.ts';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { m } from '#lib/paraglide/messages.js';
  import { Trash, Pencil, Plus } from '@lucide/svelte';
  import AdministrationCard from '#lib/components/AdministrationCard.svelte';
  import DialogModal from '#lib/components/DialogModal.svelte';
  import { coratellaFormCallback } from '#lib/utils.ts';
  import { enhance } from '$app/forms';

  let { data } = $props();
  let users = $derived(data.users);
  let user = $derived(data.user);

  function deleteUser(id: string) {
    return deleteResource(`/admin/users/${id}`, m.userDeleted());
  }
</script>

{#snippet userForm(userId: string | null, username: string)}
  {@const isNew = userId === null}
  <DialogModal
    title={isNew ? m.createUser() : m.editUser()}
    form={`user-form-${isNew ? 'new' : userId}`}
    triggerClass="btn-icon {isNew ? 'w-min self-end' : ''}"
  >
    {#snippet trigger()}
      <Plus class={!isNew ? 'hidden' : ''} />
      <Pencil class={isNew ? 'hidden' : ''} />
    {/snippet}
    {#snippet content()}
      <form
        id="user-form-{isNew ? 'new' : userId}"
        method="POST"
        action={isNew ? '?/create' : '?/edit'}
        class="flex flex-col items-center justify-center gap-2"
        use:enhance={coratellaFormCallback({
          successMessage: isNew ? m.userCreationSuccessful() : m.successfulModification(),
          refreshAll: true,
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
                <button class="btn-icon" onclick={() => goto(resolve('/admin/profile'))}
                  ><Pencil /></button
                >
              {:else}
                {@render userForm(row.id, row.username)}
              {/if}
              <DialogModal
                title={m.deleteUser()}
                onAccept={() => deleteUser(row.id)}
                triggerClass="btn-icon"
                triggerDisabled={row.id == user.id}
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
