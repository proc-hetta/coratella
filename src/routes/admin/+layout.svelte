<script lang="ts">
  import { AppBar, Navigation } from '@skeletonlabs/skeleton-svelte';

  import { Tag, Book, User, LogOut, BookHeart, ChartColumnStacked } from '@lucide/svelte';

  import { m } from '$lib/paraglide/messages';

  import Logo from '$lib/images/logo.svg';

  let { children, data } = $props();
</script>

<div class="grid min-h-screen grid-rows-[1fr_auto]">
  <div class="grid h-full grid-cols-[1fr_minmax(0,_auto)_1fr] grid-rows-[auto_1fr]">
    <header class="sticky top-0 z-10 col-span-full">
      <AppBar background="bg-transparent md:bg-surface-900">
        {#snippet lead()}
          <a class="flex items-center" href="/admin#">
            <img class="h-10" src={Logo} alt="logo" />
          </a>
          <div class="hidden md:block">
            <a class="btn hover:preset-tonal" href="/admin/posts">{m.posts()}</a>
            <a class="btn hover:preset-tonal" href="/admin/tags">{m.tags()}</a>
            <a class="btn hover:preset-tonal" href="/admin/categories">{m.categories()}</a>
            <a class="btn hover:preset-tonal" href="/admin/users">{m.users()}</a>
            <a class="btn hover:preset-tonal" href="/admin/authors">{m.authors()}</a>
          </div>
        {/snippet}
        {#snippet trail()}
          <a href="/admin/profile" class="btn preset-tonal-surface-900">{data.user.username}</a>
          <div class="flex items-center">
            <a href="/logout" class="btn-icon">
              <LogOut />
            </a>
          </div>
        {/snippet}
      </AppBar>
    </header>
    <main class="col-span-full w-screen p-4 lg:col-2 lg:max-w-5xl">
      {@render children()}
    </main>
  </div>

  <div class="sticky bottom-0 md:hidden">
    <Navigation.Bar>
      <Navigation.Tile label={m.posts()} href="/admin/posts"><Book /></Navigation.Tile>
      <Navigation.Tile label={m.tags()} href="/admin/tags"><Tag /></Navigation.Tile>
      <Navigation.Tile label={m.categories()} href="/admin/categories"
        ><ChartColumnStacked /></Navigation.Tile
      >
      <Navigation.Tile label={m.users()} href="/admin/users"><User /></Navigation.Tile>
      <Navigation.Tile label={m.authors()} href="/admin/authors"><BookHeart /></Navigation.Tile>
    </Navigation.Bar>
  </div>
</div>
