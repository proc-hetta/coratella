<script lang="ts">
  import { toaster, toasterOptions } from '$lib/toaster.js';
  import { m } from '$lib/paraglide/messages';
  import { invalidateAll } from '$app/navigation';
  import { Trash, Pencil, Plus } from '@lucide/svelte';

  import AdministrationCard from '$lib/components/AdministrationCard.svelte';
  import DialogModal from '$lib/components/DialogModal.svelte';
  import { coratellaFormCallback } from '$lib/utils.js';
  import { enhance } from '$app/forms';

  let { data } = $props();
  let tags = $derived(data.tags);

  let formName: string = $state('');
  let formId: number | null = $state(null);

  async function deleteTag(id: number) {
    const response = await fetch(`/admin/tags/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (response.ok) {
      toaster.success({
        title: m.success(),
        description: m.tagDeleted(),
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

{#snippet tagForm(tagId: number, name: string)}
  <DialogModal
    title={Number.isNaN(tagId) ? m.createTag() : m.editTag()}
    onAccept={async () => {
      const form = document.getElementById(
        `tag-form-${Number.isNaN(tagId) ? 'new' : tagId}`,
      ) as HTMLFormElement;
      form.requestSubmit();
    }}
    triggerClass="btn-icon {Number.isNaN(tagId) ? 'w-min self-end' : ''}"
  >
    {#snippet trigger()}
      <Plus class={!Number.isNaN(tagId) ? 'hidden' : ''} />
      <Pencil class={Number.isNaN(tagId) ? 'hidden' : ''} />
    {/snippet}
    {#snippet content()}
      <form
        id="tag-form-{Number.isNaN(tagId) ? 'new' : tagId}"
        method="POST"
        action={Number.isNaN(tagId) ? '?/create' : '?/edit'}
        class="flex flex-col items-center justify-center gap-2"
        use:enhance={coratellaFormCallback({
          successMessage: Number.isNaN(tagId)
            ? m.tagCreationSuccessful()
            : m.successfulModification(),
          invalidateAll: true,
          callback: async () => {},
          preHook: () => {},
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
    {@render tagForm(NaN, '')}
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
              <DialogModal
                title={m.deleteTag()}
                onAccept={() => deleteTag(row.id)}
                triggerClass="btn-icon"
              >
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
