<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { Tabs } from '@skeletonlabs/skeleton-svelte';
  import DOMPurify from 'isomorphic-dompurify';
  import { renderMarkdown } from '#lib/marked.ts';
  import type { FullPost } from '#lib/server/db/posts.ts';
  import { goto, refreshAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { notifyError, notifySuccess } from '#lib/toaster.ts';
  import { browser } from '$app/env';

  type Option = { id: number; label: string; checked: boolean; toggle: (checked: boolean) => void };

  let { data } = $props();
  let sourcePost: FullPost | null = $derived(data.post);

  let post: FullPost = $state({
    id: -1,
    title: '',
    content: '',
    password: null,
    draft: false,
    toc: false,
    math: false,
    mtime: new Date(),
    ctime: new Date(),
    visits: 0,
    tags: [],
    categories: [],
    authors: [],
  });
  $effect(() => {
    if (!sourcePost) return;

    post.title = sourcePost.title;
    post.content = sourcePost.content;
    post.password = sourcePost.password;
    post.draft = sourcePost.draft;
    post.toc = sourcePost.toc;
    post.math = sourcePost.math;
    post.tags = [...sourcePost.tags];
    post.categories = [...sourcePost.categories];
    post.authors = [...sourcePost.authors];
  });

  function isSelected(list: { id: number }[], item: { id: number }) {
    return list.some((e) => e.id === item.id);
  }

  function toggled<T extends { id: number }>(list: T[], item: T, checked: boolean) {
    return checked ? [...list, item] : list.filter((e) => e.id !== item.id);
  }

  let tagOptions: Option[] = $derived(
    data.tags.map((tag) => ({
      id: tag.id,
      label: tag.name,
      checked: isSelected(post.tags, tag),
      toggle: (checked) => (post.tags = toggled(post.tags, tag, checked)),
    })),
  );
  let categoryOptions: Option[] = $derived(
    data.categories.map((category) => ({
      id: category.id,
      label: category.name,
      checked: isSelected(post.categories, category),
      toggle: (checked) => (post.categories = toggled(post.categories, category, checked)),
    })),
  );
  let authorOptions: Option[] = $derived(
    data.authors.map((author) => ({
      id: author.id,
      label: author.nickname,
      checked: isSelected(post.authors, author),
      toggle: (checked) => (post.authors = toggled(post.authors, author, checked)),
    })),
  );

  async function save(draft: boolean) {
    post.draft = draft;
    const isNew = post.id === -1;
    const response = await fetch(isNew ? '/admin/posts' : `/admin/posts/${post.id}`, {
      method: isNew ? 'POST' : 'PUT',
      body: JSON.stringify(post),
    });
    if (response.ok) {
      notifySuccess(m.postSaved());
      await refreshAll();
      goto(resolve('/admin/posts'));
    } else {
      notifyError(m.errorWhileSaving());
    }
  }
</script>

{#snippet selection(legend: string, options: Option[])}
  <fieldset class="col-span-full">
    <legend class="label-text">{legend}</legend>
    <div class="col-span-full columns-3xs">
      {#each options as option (option.id)}
        <label class="flex items-center space-x-2">
          <input
            class="checkbox"
            type="checkbox"
            checked={option.checked}
            onchange={(e) => option.toggle(e.currentTarget.checked)}
          />
          <p>
            {option.label}
          </p>
        </label>
      {/each}
    </div>
  </fieldset>
{/snippet}

<div class="flex flex-col items-center gap-2">
  <div class="card md:preset-filled-surface-100-900 w-full p-4 text-center">
    <form class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center justify-center gap-2">
        <label class="label md:w-max">
          <span class="label-text text-left">{m.title()}</span>
          <input
            bind:value={post.title}
            class="input"
            type="text"
            name="title"
            placeholder={m.title()}
          />
        </label>
        <label class="label md:w-max">
          <span class="label-text text-left">{m.password()}</span>
          <input
            bind:value={post.password}
            class="input"
            type="text"
            name="password"
            placeholder={m.optionalPassword()}
          />
        </label>
        <label class="label md:w-max">
          <span>Table of Contents</span><br />
          <input bind:checked={post.toc} class="checkbox" type="checkbox" />
        </label>
        <label class="label md:w-max">
          <span>Enable Math</span><br />
          <input bind:checked={post.math} class="checkbox" type="checkbox" />
        </label>
      </div>
      {@render selection(m.tags(), tagOptions)}
      {@render selection(m.categories(), categoryOptions)}
      {@render selection(m.authors(), authorOptions)}
      <div>
        <button class="btn preset-filled-primary-500" onclick={() => save(true)}>
          {m.saveAsDraft()}
        </button>
        <button class="btn preset-filled-primary-500" onclick={() => save(false)}>
          {m.save()}
        </button>
      </div>
    </form>
  </div>

  <Tabs defaultValue="editor">
    <Tabs.List>
      <Tabs.Trigger value="editor">Editor</Tabs.Trigger>
      <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="editor"
      ><textarea bind:value={post.content} class="textarea" rows="30" placeholder={m.content()}
      ></textarea></Tabs.Content
    >
    <Tabs.Content value="preview">
      {#if browser}
        <div class="prose prose-neutral prose-invert max-w-none">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by DOMPurify -->
          {@html DOMPurify.sanitize(renderMarkdown(post.content, post.math, post.toc))}
        </div>
      {/if}
    </Tabs.Content>
  </Tabs>
</div>
