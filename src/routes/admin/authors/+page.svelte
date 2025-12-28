<script lang="ts">
  import { toaster, toasterOptions } from '$lib/toaster.js';
  import { m } from '$lib/paraglide/messages';
  import { invalidateAll } from '$app/navigation';
  import { Trash, Pencil, Plus } from '@lucide/svelte';

  import AdministrationCard from '$lib/components/AdministrationCard.svelte';
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import DialogModal from '$lib/components/DialogModal.svelte';
  import { coratellaFormCallback } from '$lib/utils';
  import { enhance } from '$app/forms';
  import ImageFrame from '$lib/components/ImageFrame.svelte';
  import { tick } from 'svelte';

  let { data } = $props();
  let authors = $derived(data.authors);

  let imageFile: File | null = $state(null);
  let profileImage: string | null = $state(null);

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
</script>

{#snippet authorForm(
  authorId: number,
  nickname: string,
  firstName: string,
  lastName: string,
  image: string | null,
  email: string | null,
)}
  <DialogModal
    title={Number.isNaN(authorId) ? m.createAuthor() : m.editAuthor()}
    onAccept={async () => {
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
        profileImage = await response.headers.get('Location')!;
        await tick();
      }

      const form = document.getElementById(
        `tag-form-${Number.isNaN(authorId) ? 'new' : authorId}`,
      ) as HTMLFormElement;
      form.requestSubmit();
    }}
    triggerClass="btn-icon {Number.isNaN(authorId) ? 'w-min self-end' : ''}"
    onClick={() => {
      ((profileImage = image), (imageFile = null));
    }}
  >
    {#snippet trigger()}
      <Plus class={!Number.isNaN(authorId) ? 'hidden' : ''} />
      <Pencil class={Number.isNaN(authorId) ? 'hidden' : ''} />
    {/snippet}
    {#snippet content()}
      <form
        id="tag-form-{Number.isNaN(authorId) ? 'new' : authorId}"
        method="POST"
        action={Number.isNaN(authorId) ? '?/create' : '?/edit'}
        class="flex flex-col items-center justify-center gap-2"
        use:enhance={coratellaFormCallback({
          successMessage: Number.isNaN(authorId)
            ? m.authorCreationSuccessful()
            : m.successfulModification(),
          invalidateAll: true,
          callback: async () => {},
          preHook: () => {},
        })}
      >
        <div class="size-64">
          <ImageFrame
            src={imageFile ? URL.createObjectURL(imageFile) : (profileImage ?? undefined)}
            onFileAccept={(file) => (imageFile = file)}
            onRemove={() => {
              imageFile = null;
              profileImage = null;
            }}
          />
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <label class="label">
            <span class="label-text text-left">{m.nickname()}</span>
            <input class="input" type="text" value={nickname} name="nickname" />
          </label>
          <label class="label">
            <span class="label-text text-left">{m.email()}</span>
            <input class="input" type="text" value={email} name="email" />
          </label>
          <label class="label">
            <span class="label-text text-left">{m.firstName()}</span>
            <input class="input" type="text" value={firstName} name="firstName" />
          </label>
          <label class="label">
            <span class="label-text text-left">{m.lastName()}</span>
            <input class="input" type="text" value={lastName} name="lastName" />
          </label>
        </div>
        <input type="hidden" name="id" value={authorId} />
        <input type="hidden" name="image" bind:value={profileImage} />
      </form>
    {/snippet}
  </DialogModal>
{/snippet}

<AdministrationCard title={m.authors()}>
  {#snippet addElement()}
    {@render authorForm(NaN, '', '', '', null, '')}
  {/snippet}
  <table class="table whitespace-nowrap">
    <thead>
      <tr>
        <th>Id</th>
        <th>{m.image()}</th>
        <th>{m.nickname()}</th>
        <th>{m.email()}</th>
        <th>{m.firstName()}</th>
        <th>{m.lastName()}</th>
        <th class="!text-right">{m.actions()}</th>
      </tr>
    </thead>
    <tbody class="[&>tr]:hover:preset-tonal-primary">
      {#each authors as row (row.id)}
        <tr>
          <td class="text-left">{row.id}</td>
          <td class="text-left">
            <Avatar class="size-8">
              <Avatar.Image src={row.image ?? undefined} alt="base" />
              <Avatar.Fallback>{row.firstName?.[0]}{row.lastName?.[0]}</Avatar.Fallback>
            </Avatar>
          </td>
          <td class="text-left">{row.nickname}</td>
          <td class="text-left">{row.email}</td>
          <td class="text-left">{row.firstName}</td>
          <td class="text-left">{row.lastName}</td>
          <td class="text-right">
            <div class="flex flex-row justify-end">
              {@render authorForm(
                row.id,
                row.nickname,
                row.firstName ?? '',
                row.lastName ?? '',
                row.image,
                row.email,
              )}
              <DialogModal
                title={m.deleteAuthor()}
                onAccept={() => deleteAuthor(row.id)}
                triggerClass="btn-icon"
              >
                {#snippet trigger()}
                  <button class="btn-icon">
                    <Trash />
                  </button>
                {/snippet}
                {#snippet content()}
                  <p>{m.deletePrompt({ parameter: row.nickname })}</p>
                {/snippet}
              </DialogModal>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</AdministrationCard>
