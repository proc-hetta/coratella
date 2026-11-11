<script lang="ts">
  import 'katex/dist/katex.min.css';
  import { m } from '#lib/paraglide/messages.js';
  import { Tabs } from '@skeletonlabs/skeleton-svelte';
  import { renderMarkdown } from '#lib/markdown.ts';
  import { enhance } from '$app/forms';
  import { coratellaFormCallback } from '#lib/utils.ts';

  type Option = { id: number; label: string };

  let { data } = $props();

  // Kept in state for the preview; the form submits them as regular fields.
  let content = $derived(data.post?.content ?? '');
  let toc = $derived(data.post?.toc ?? false);
  let math = $derived(data.post?.math ?? false);

  const selected = (list: { id: number }[] | undefined, id: number) =>
    list?.some((item) => item.id === id) ?? false;
</script>

{#snippet selection(
  legend: string,
  name: string,
  options: Option[],
  chosen: { id: number }[] | undefined,
)}
  <fieldset class="col-span-full">
    <legend class="label-text">{legend}</legend>
    <div class="col-span-full columns-3xs">
      {#each options as option (option.id)}
        <label class="flex items-center space-x-2">
          <input
            class="checkbox"
            type="checkbox"
            {name}
            value={option.id}
            checked={selected(chosen, option.id)}
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
    <form
      id="post-form"
      method="POST"
      action="?/save"
      class="flex flex-col gap-2"
      use:enhance={coratellaFormCallback({ successMessage: m.postSaved(), refreshAll: true })}
    >
      <div class="flex flex-wrap items-center justify-center gap-2">
        <label class="label md:w-max">
          <span class="label-text text-left">{m.title()}</span>
          <input
            value={data.post?.title ?? ''}
            class="input"
            type="text"
            name="title"
            placeholder={m.title()}
          />
        </label>
        <label class="label md:w-max">
          <span class="label-text text-left">{m.password()}</span>
          <input
            class="input"
            type="password"
            name="password"
            autocomplete="new-password"
            placeholder={data.post?.hasPassword ? m.keepPassword() : m.optionalPassword()}
          />
        </label>
        {#if data.post?.hasPassword}
          <label class="label md:w-max">
            <span>{m.removePassword()}</span><br />
            <input class="checkbox" type="checkbox" name="removePassword" />
          </label>
        {/if}
        <label class="label md:w-max">
          <span>{m.tableOfContents()}</span><br />
          <input bind:checked={toc} class="checkbox" type="checkbox" name="toc" />
        </label>
        <label class="label md:w-max">
          <span>{m.enableMath()}</span><br />
          <input bind:checked={math} class="checkbox" type="checkbox" name="math" />
        </label>
      </div>
      {@render selection(
        m.tags(),
        'tags',
        data.tags.map((tag) => ({ id: tag.id, label: tag.name })),
        data.post?.tags,
      )}
      {@render selection(
        m.categories(),
        'categories',
        data.categories.map((category) => ({ id: category.id, label: category.name })),
        data.post?.categories,
      )}
      {@render selection(
        m.authors(),
        'authors',
        data.authors.map((author) => ({ id: author.id, label: author.nickname })),
        data.post?.authors,
      )}
      <div>
        <button class="btn preset-filled-primary-500" name="draft" value="true">
          {m.saveAsDraft()}
        </button>
        <button class="btn preset-filled-primary-500" name="draft" value="false">
          {m.save()}
        </button>
      </div>
    </form>
  </div>

  <Tabs defaultValue="editor">
    <Tabs.List>
      <Tabs.Trigger value="editor">{m.editor()}</Tabs.Trigger>
      <Tabs.Trigger value="preview">{m.preview()}</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="editor"
      ><textarea
        bind:value={content}
        form="post-form"
        name="content"
        class="textarea"
        rows="30"
        placeholder={m.content()}></textarea></Tabs.Content
    >
    <Tabs.Content value="preview">
      <div class="prose prose-neutral prose-invert max-w-none">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by rehype-sanitize -->
        {@html renderMarkdown(content, math, toc)}
      </div>
    </Tabs.Content>
  </Tabs>
</div>
