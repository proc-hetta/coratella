<script lang="ts">
  import CategoryBadge from '$lib/components/CategoryBadge.svelte';
  import Logo from '$lib/images/logo.svg';
  import { Avatar } from '@skeletonlabs/skeleton-svelte';

  let { data } = $props();
  let posts = $derived(
    data.posts
      .filter((p) => !p.draft)
      .toSorted((p1, p2) => p2.ctime!.getTime() - p1.ctime!.getTime()),
  );
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
        <div class="card preset-filled-surface-100-900 flex w-full flex-col gap-10 px-5">
          <div class="w-full py-4">
            <div class="flex">
              <div class="w-full">
                <h3 class="h3 w-full">{post.title}</h3>
                <div class="flex flex-col gap-0">
                  <div
                    class="mt-2 mb-2 flex h-min w-fit max-w-3xs flex-wrap justify-end gap-2 md:hidden md:min-w-50"
                  >
                    {#each post.categories as category}
                      <CategoryBadge text={category.name} colorText={category.color} />
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
                      <Avatar class="size-8">
                        <Avatar.Image src={author.image ?? undefined} alt="base" />
                        <Avatar.Fallback
                          >{author.firstName?.[0]} {author.lastName?.[0]}</Avatar.Fallback
                        >
                      </Avatar>
                      <p>
                        name="{author.firstName}
                        {author.lastName}"
                      </p>
                      <div class="max-w-30 overflow-x-scroll md:max-w-fit md:overflow-x-hidden">
                        {author.nickname}
                      </div>
                    </div>
                  {/each}
                </div>
                <div
                  class="items-top my-2 mt-5 flex flex-wrap justify-start gap-2 divide-x md:hidden"
                >
                  {#each post.tags as tag}
                    <div class="badge preset-outlined-primary-500 h-fit">#{tag.name}</div>
                  {/each}
                </div>
              </div>
              <div
                class="hidden h-min w-fit max-w-3xs flex-wrap items-center justify-end gap-2 py-2 md:flex md:min-w-50"
              >
                {#each post.categories as category}
                  <CategoryBadge text={category.name} colorText={category.color} />
                {/each}
              </div>
            </div>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
