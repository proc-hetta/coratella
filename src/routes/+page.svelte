<script lang="ts">
  import Logo from '$lib/images/logo.svg';
  import { Avatar } from '@skeletonlabs/skeleton-svelte';

  let { data } = $props();
  let posts = $state(
    data.posts
      .filter((p) => !p.draft)
      .toSorted((p1, p2) => p2.ctime!.getTime() - p1.ctime!.getTime()),
  );

  const minId = posts[0]?.id;
  const maxId = posts.at(-1)?.id;
</script>

<div>
  <div>
    <a class="flex w-full items-center justify-center" href="/">
      <img class="" src={Logo} alt="logo" />
    </a>
    <h1 class="h1 mb-10 text-center">/proc/hetta</h1>
  </div>
</div>

<div class="m-10 flex flex-col gap-0 p-5">
  <h2 class="h2 mb-5 text-center">Posts</h2>
  <div class="flex flex-col justify-center gap-5">
    {#each posts as post (post.id)}
      <a href="/posts/{post.id}">
        <div class="card preset-filled-surface-100-900 flex w-full flex-col gap-10 px-8">
          <div class="w-full py-8">
            <div class="flex">
              <div class="w-full">
                <h3 class="h3 w-full">{post.title}</h3>
                <div class="flex flex-col gap-0">
                  <div
                    class="mt-2 mb-2 flex h-min w-fit max-w-3xs flex-wrap justify-end gap-2 md:hidden md:min-w-50"
                  >
                    {#each post.categories as category}
                      <div class="badge preset-filled-primary-500 h-fit">{category.name}</div>
                    {/each}
                  </div>
                  <div>Created at: {post.ctime.toDateString()}</div>
                  <div class="items-top my-2 hidden justify-start gap-2 divide-x md:flex">
                    {#each post.tags as tag}
                      <div class="badge preset-outlined-primary-500 h-fit">#{tag.name}</div>
                    {/each}
                  </div>
                </div>
                <div class="items-top mt-2 flex flex-wrap justify-start gap-4">
                  {#each post.authors as author}
                    <div class="card preset-filled-surface-400-600 flex items-center gap-2 p-1.25">
                      <Avatar
                        size="size-8"
                        src={author.image ?? undefined}
                        name="{author.firstName} {author.lastName}"
                      />
                      <div class="max-w-30 overflow-x-scroll md:max-w-fit md:overflow-x-hidden">
                        {author.nickname}
                      </div>
                    </div>
                  {/each}
                </div>
                <div class="items-top my-2 mt-5 flex justify-start gap-2 divide-x md:hidden">
                  {#each post.tags as tag}
                    <div class="badge preset-outlined-primary-500 h-fit">#{tag.name}</div>
                  {/each}
                </div>
              </div>
              <div
                class="hidden h-min w-fit max-w-3xs flex-wrap justify-end gap-2 md:flex md:min-w-50"
              >
                {#each post.categories as category}
                  <div class="badge preset-filled-primary-500 h-fit">{category.name}</div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
