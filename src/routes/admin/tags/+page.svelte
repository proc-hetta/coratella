<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { Trash, Pencil, Plus } from '@lucide/svelte';

  import AdministrationCard from '#lib/components/AdministrationCard.svelte';
  import DialogModal from '#lib/components/DialogModal.svelte';
  import DeleteForm from '#lib/components/DeleteForm.svelte';
  import { coratellaFormCallback } from '#lib/utils.js';
  import { enhance } from '$app/forms';

  let { data } = $props();
  let tags = $derived(data.tags);
</script>

{#snippet tagForm(tagId: number | null, name: string)}
  {@const isNew = tagId === null}
  <DialogModal
    title={isNew ? m.createTag() : m.editTag()}
    form={`tag-form-${isNew ? 'new' : tagId}`}
    triggerClass="btn-icon {isNew ? 'w-min self-end' : ''}"
  >
    {#snippet trigger()}
      <Plus class={!isNew ? 'hidden' : ''} />
      <Pencil class={isNew ? 'hidden' : ''} />
    {/snippet}
    {#snippet content()}
      <form
        id="tag-form-{isNew ? 'new' : tagId}"
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
        </div>
        <input type="hidden" name="id" value={tagId} />
      </form>
    {/snippet}
  </DialogModal>
{/snippet}

<AdministrationCard title={m.tags()}>
  {#snippet addElement()}
    {@render tagForm(null, '')}
  {/snippet}
  <table class="table whitespace-nowrap">
    <thead>
      <tr>
        <th>Id</th>
        <th>{m.name()}</th>
        <th class="!text-right">{m.actions()}</th>
      </tr>
    </thead>
    <tbody class="[&>tr]:hover:preset-tonal-primary">
      {#each tags as row (row.id)}
        <tr>
          <td class="text-left">{row.id}</td>
          <td class="text-left">{row.name}</td>
          <td class="text-right">
            <div class="flex flex-row justify-end">
              {@render tagForm(row.id, row.name)}
              <DeleteForm id="delete-tag-{row.id}" value={row.id} successMessage={m.tagDeleted()} />
              <DialogModal title={m.deleteTag()} form="delete-tag-{row.id}" triggerClass="btn-icon">
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
