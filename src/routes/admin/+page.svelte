<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  let { data } = $props();
  const pageContents = $derived([
    {
      title: m.posts(),
      data: data.postsCount,
    },
    {
      title: m.tags(),
      data: data.tagsCount,
    },
    {
      title: m.categories(),
      data: data.categoriesCount,
    },
    {
      title: m.users(),
      data: data.usersCount,
    },
    {
      title: m.authors(),
      data: data.authorsCount,
    },
    {
      title: m.visitors(),
      data: data.totalVisits,
    },
  ]);
</script>

<div class="flex h-full flex-col items-center justify-center gap-15">
  <h1 class="h1 text-center">{m.dashboardTitle()}</h1>
  <div class="flex flex-wrap items-center justify-center gap-10">
    {#each pageContents as content}
      <div class="flex flex-col gap-4">
        <h5 class="h5 text-center">{content.title}</h5>
        <div class="text-center">{content.data}</div>
      </div>
    {/each}
  </div>
</div>
