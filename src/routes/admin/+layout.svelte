<script lang="ts">
  import { AppBar, Navigation } from '@skeletonlabs/skeleton-svelte';
  import { Tag, Book, User, LogOut, BookHeart, ChartColumnStacked } from '@lucide/svelte';
  import { m } from '$lib/paraglide/messages';
  import Logo from '$lib/images/logo.svg';

  let { children, data } = $props();
  let sections = $derived([
    { title: m.posts(), href: '/admin/posts', icon: Book },
    { title: m.tags(), href: '/admin/tags', icon: Tag },
    { title: m.categories(), href: '/admin/categories', icon: ChartColumnStacked },
    { title: m.users(), href: '/admin/users', icon: User },
    { title: m.authors(), href: '/admin/authors', icon: BookHeart },
  ]);
</script>

<div class="grid min-h-screen grid-rows-[1fr_auto]">
  <div class="grid h-full grid-cols-[1fr_minmax(0,_auto)_1fr] grid-rows-[auto_1fr]">
    <header class="sticky top-0 z-10 col-span-full">
      <AppBar class="md:bg-surface-900 bg-transparent">
        <AppBar.Toolbar class="grid-cols-[auto_auto]">
          <AppBar.Lead>
            <div class="flex flex-row gap-4">
              <a class="flex items-center" href="/admin#">
                <img class="h-10" src={Logo} alt="logo" />
              </a>
              <div class="hidden md:block">
                {#each sections as section}
                  <a class="btn hover:preset-tonal" href={section.href}>{section.title}</a>
                {/each}
              </div>
            </div>
          </AppBar.Lead>
          <AppBar.Trail>
            <a href="/admin/profile" class="btn preset-tonal-surface-900">{data.user.username}</a>
            <div class="flex items-center">
              <a href="/logout" class="btn-icon">
                <LogOut />
              </a>
            </div>
          </AppBar.Trail>
        </AppBar.Toolbar>
      </AppBar>
    </header>
    <main class="col-span-full w-screen p-4 lg:col-2 lg:max-w-5xl">
      {@render children()}
    </main>
  </div>

  <div class="sticky bottom-0 md:hidden">
    <Navigation layout="bar">
      <Navigation.Menu class="grid grid-cols-{sections.length} gap-2">
        {#each sections as section}
          {@const Icon = section.icon}
          <Navigation.TriggerAnchor href={section.href}>
            <Icon class="size-5" />
            <Navigation.TriggerText>{section.title}</Navigation.TriggerText>
          </Navigation.TriggerAnchor>
        {/each}
      </Navigation.Menu>
    </Navigation>
  </div>
</div>
