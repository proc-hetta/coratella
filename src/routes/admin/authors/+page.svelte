<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { Trash, Pencil, Plus } from '@lucide/svelte';

  import AdministrationCard from '#lib/components/AdministrationCard.svelte';
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import DialogModal from '#lib/components/DialogModal.svelte';
  import DeleteForm from '#lib/components/DeleteForm.svelte';
  import { coratellaFormCallback } from '#lib/utils.ts';
  import { enhance } from '$app/forms';
  import ImageFrame from '#lib/components/ImageFrame.svelte';

  let { data } = $props();
  let authors = $derived(data.authors);

  let imageFile: File | null = $state(null);
  let profileImage: string | null = $state(null);
</script>

{#snippet authorForm(
  authorId: number | null,
  nickname: string,
  firstName: string,
  lastName: string,
  image: string | null,
  email: string | null,
)}
  {@const isNew = authorId === null}
  <DialogModal
    title={isNew ? m.createAuthor() : m.editAuthor()}
    form={`author-form-${isNew ? 'new' : authorId}`}
    triggerClass="btn-icon {isNew ? 'w-min self-end' : ''}"
    onClick={() => {
      profileImage = image;
      imageFile = null;
    }}
  >
    {#snippet trigger()}
      <Plus class={!isNew ? 'hidden' : ''} />
      <Pencil class={isNew ? 'hidden' : ''} />
    {/snippet}
    {#snippet content()}
      <form
        id="author-form-{isNew ? 'new' : authorId}"
        method="POST"
        enctype="multipart/form-data"
        action={isNew ? '?/create' : '?/edit'}
        class="flex flex-col items-center justify-center gap-2"
        use:enhance={coratellaFormCallback({
          successMessage: isNew ? m.authorCreationSuccessful() : m.successfulModification(),
          refreshAll: true,
          preHook: ({ formData }) => {
            if (imageFile) formData.set('imageFile', imageFile);
          },
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
            <input class="input" type="email" value={email} name="email" />
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
    {@render authorForm(null, '', '', '', null, '')}
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
              <DeleteForm
                id="delete-author-{row.id}"
                value={row.id}
                successMessage={m.authorDeleted()}
              />
              <DialogModal
                title={m.deleteAuthor()}
                form="delete-author-{row.id}"
                triggerClass="btn-icon"
              >
                {#snippet trigger()}
                  <Trash />
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
