<script lang="ts">
  import { Avatar, ProgressRing } from '@skeletonlabs/skeleton-svelte';
  import { getMarkdownProcessors } from '$lib/marked.js';
  import DOMPurify from 'isomorphic-dompurify';

  let { data } = $props();
  let post = data.post;
  let { marked, remark } = getMarkdownProcessors(post.math, post.toc);
</script>

<div class="grid h-full grid-cols-[1fr_minmax(0,_auto)_1fr] grid-rows-[auto_1fr] text-left">
  <div class="col-span-full w-screen p-4 lg:col-2 lg:max-w-5xl">
    <h2 class="h2 mt-5">
      {post.title}
    </h2>
    <div class="mt-5 flex w-full gap-2">
      {#each post.categories as category (category.id)}
        <div class="badge preset-filled-primary-500 h-fit">{category.name}</div>
      {/each}
    </div>
    <div class="mt-5 flex w-full flex-wrap gap-2">
      {#each post.authors as author (author.id)}
        <div class="flex items-center gap-2 p-1.25">
          <Avatar
            size="size-8"
            src={author.image ?? undefined}
            name="{author.firstName} {author.lastName}"
          />
          <div class="max-w-60 overflow-x-scroll md:max-w-fit md:overflow-x-hidden">
            {author.nickname}
          </div>
        </div>
      {/each}
    </div>
    <div class="mt-5">
      {#await marked.parse(String(remark.processSync(post.content)))}
        <ProgressRing value={null} />
      {:then processed}
        <div class="prose prose-neutral prose-invert max-w-none">
          {@html DOMPurify.sanitize(processed)}
        </div>
      {/await}
    </div>
    <footer class="mt-15 border-t-1">
      <div class="mt-5 flex w-full flex-col gap-2">
        <h4 class="h4">Authors:</h4>
        {#each post.authors as author (author.id)}
          <div class="flex items-center gap-2 p-1.25">
            <Avatar
              size="size-12"
              src={author.image ?? undefined}
              name="{author.firstName} {author.lastName}"
            />
            <div>{author.firstName} {author.lastName}</div>
          </div>
        {/each}
      </div>
      <div class="mt-5 flex gap-2">
        {#each post.tags as tag (tag.id)}
          <div>#{tag.name}</div>
        {/each}
      </div>
    </footer>
  </div>
</div>
