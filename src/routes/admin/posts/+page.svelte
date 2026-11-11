<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { Trash, Pencil, Check, Plus } from '@lucide/svelte';
  import AdministrationCard from '#lib/components/AdministrationCard.svelte';
  import DialogModal from '#lib/components/DialogModal.svelte';
  import DeleteForm from '#lib/components/DeleteForm.svelte';

  let { data } = $props();
  let posts = $derived(data.posts);

  function createNewPost() {
    goto(resolve('/admin/posts/[id=numberOrNew]', { id: 'new' }));
  }

  function editPost(id: number) {
    goto(resolve('/admin/posts/[id=numberOrNew]', { id }));
  }
</script>

<AdministrationCard title={m.posts()}>
  {#snippet addElement()}
    <button class="btn-icon w-min self-end" onclick={createNewPost}>
      <Plus />
    </button>
  {/snippet}
  <table class="table whitespace-nowrap">
    <thead>
      <tr>
        <th>Id</th>
        <th>{m.name()}</th>
        <th>{m.authors()}</th>
        <th>{m.categories()}</th>
        <th>{m.tags()}</th>
        <th>{m.draft()}</th>
        <th>{m.visitors()}</th>
        <th class="!text-right">{m.actions()}</th>
      </tr>
    </thead>
    <tbody class="[&>tr]:hover:preset-tonal-primary">
      {#each posts as post (post.id)}
        <tr>
          <td class="text-left">{post.id}</td>
          <td class="text-left">{post.title}</td>
          <td class="text-left">
            {post.authors.map((author) => author.nickname).join(', ')}
          </td>
          <td class="text-left">
            {post.categories.map((category) => category.name).join(', ')}
          </td>
          <td class="text-left">
            {post.tags.map((tag) => tag.name).join(', ')}
          </td>
          <td class="text-left">
            {#if post.draft}
              <Check />
            {/if}
          </td>
          <td class="text-left">{post.visits}</td>
          <td class="text-right">
            <div class="flex flex-row justify-end">
              <button class="btn-icon" onclick={() => editPost(post.id)}>
                <Pencil />
              </button>
              <DeleteForm
                id="delete-post-{post.id}"
                value={post.id}
                successMessage={m.postDeleted()}
              />
              <DialogModal
                title={m.deletePost()}
                form="delete-post-{post.id}"
                triggerClass="btn-icon"
              >
                {#snippet trigger()}
                  <Trash />
                {/snippet}
                {#snippet content()}
                  <p>{m.deletePrompt({ parameter: post.title })}</p>
                {/snippet}
              </DialogModal>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</AdministrationCard>
