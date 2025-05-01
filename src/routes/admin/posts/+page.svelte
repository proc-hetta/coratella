<script lang="ts">
  import { toaster, toasterOptions } from '$lib/toaster.js';
  import { m } from '$lib/paraglide/messages.js';
  import { goto, invalidateAll } from '$app/navigation';
  import { Trash, Pencil, Check } from '@lucide/svelte';

  import AdministrationCard from '$lib/components/AdministrationCard.svelte';

  let { data } = $props();
  let posts = $state(data.posts);

  // https://www.reddit.com/r/sveltejs/comments/1gx65ho/proper_page_data_and_reactivity_pattern_in_svelte/
  $effect(() => {
    posts = data.posts;
  });

  function createNewPost() {
    goto(`/admin/posts/new`);
  }

  function editPost(id: number) {
    goto(`/admin/posts/${id}`);
  }

  async function deletePost(id: number) {
    const response = await fetch(`/admin/posts/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      toaster.success({
        title: m.success(),
        description: m.postDeleted(),
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

<AdministrationCard title={m.posts()} addButtonAction={createNewPost}>
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
            {#each post.authors as author (author.id)}
              {author.nickname}{author.id === post.authors.at(-1)!.id ? '' : ','}
            {/each}
          </td>
          <td class="text-left">
            {#each post.categories as category (category.id)}
              {category.name}{category.id === post.categories.at(-1)!.id ? '' : ','}
            {/each}
          </td>
          <td class="text-left">
            {#each post.tags as tag (tag.id)}
              {tag.name}{!post.tags || tag.id === post.tags.at(-1)!.id ? '' : ','}
            {/each}
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
              <button class="btn-icon" onclick={() => deletePost(post.id)}>
                <Trash />
              </button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</AdministrationCard>
