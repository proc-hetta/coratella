<script lang="ts">
  import CategoryBadge from '#lib/components/CategoryBadge.svelte';
  import Logo from '#lib/components/Logo.svelte';
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import { resolve } from '$app/paths';
  import { PUBLIC_TITLE } from '$app/env/public';
  import { m } from '#lib/paraglide/messages.js';
  import { getLocale } from '#lib/paraglide/runtime.js';

  let { data } = $props();
  let posts = $derived(data.posts);
</script>

<div>
  <div>
    <a class="flex w-full items-center justify-center" href={resolve('/(non-admin)')}>
      <Logo alt="Coratella Logo" />
    </a>
    <h1 class="h1 mb-10 text-center">{PUBLIC_TITLE}</h1>
  </div>
</div>

<div class="flex flex-col gap-0 p-5 md:m-10">
  <h2 class="h2 mb-5 text-center">{m.posts()}</h2>
  <div class="flex flex-col justify-center gap-5">
    {#each posts as post (post.id)}
      <!-- Preloading would count a visit on hover -->
      <a
        href={resolve('/(non-admin)/posts/[id=number]', { id: post.id })}
        data-sveltekit-preload-data="tap"
      >
        <div class="card preset-filled-surface-100-900 flex w-full flex-col gap-10 px-5">
          <div class="w-full py-4">
            <div class="flex">
              <div class="w-full">
                <h3 class="h3 w-full overflow-clip text-ellipsis">{post.title}</h3>
                <div class="flex flex-col gap-0">
                  <div
                    class="mt-2 mb-2 flex h-min w-fit max-w-3xs flex-wrap justify-end gap-2 md:hidden md:min-w-50"
                  >
                    {#each post.categories as category (category.id)}
                      <CategoryBadge text={category.name} colorText={category.color} />
                    {/each}
                  </div>
                  <div>
                    {m.createdAt({ date: post.ctime.toLocaleDateString(getLocale()) })}
                  </div>
                  <div class="items-top my-2 hidden justify-start gap-2 divide-x md:flex">
                    {#each post.tags as tag (tag.id)}
                      <div class="badge preset-outlined-primary-500 h-fit">#{tag.name}</div>
                    {/each}
                  </div>
                </div>
                <div class="items-top mt-2 flex flex-wrap justify-start gap-4">
                  {#each post.authors as author (author.id)}
                    <div class="card preset-filled-surface-400-600 flex items-center gap-2 p-1.25">
                      <Avatar class="size-8">
                        <Avatar.Image src={author.image ?? undefined} alt="base" />
                        <Avatar.Fallback
                          >{author.firstName?.[0]} {author.lastName?.[0]}</Avatar.Fallback
                        >
                      </Avatar>
                      <div class="max-w-30 overflow-x-scroll md:max-w-fit md:overflow-x-hidden">
                        {author.nickname}
                      </div>
                    </div>
                  {/each}
                </div>
                <div
                  class="items-top my-2 mt-5 flex flex-wrap justify-start gap-2 divide-x md:hidden"
                >
                  {#each post.tags as tag (tag.id)}
                    <div class="badge preset-outlined-primary-500 h-fit">#{tag.name}</div>
                  {/each}
                </div>
              </div>
              <div
                class="hidden h-min w-fit max-w-3xs flex-wrap items-center justify-end gap-2 py-2 md:flex md:min-w-50"
              >
                {#each post.categories as category (category.id)}
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
