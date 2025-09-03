<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import type { Author, Category, Tag } from '$lib/server/db/schema.js';
  import { Tabs } from '@skeletonlabs/skeleton-svelte';
  import DOMPurify from 'isomorphic-dompurify';
  import { ProgressRing } from '@skeletonlabs/skeleton-svelte';
  import { getMarkdownProcessors } from '$lib/marked.js';
  import { type FullPost } from '$lib/server/db/posts.js';
  import { goto, invalidateAll } from '$app/navigation';
  import { toaster, toasterOptions } from '$lib/toaster.js';
  import { dev } from '$app/environment';
  import { PUBLIC_WS_PORT } from "$env/static/public";
  import { fail } from '@sveltejs/kit';

  if (PUBLIC_WS_PORT !== undefined && !isNaN(Number(PUBLIC_WS_PORT))) {
    fail(500);
  }

  const WS_URL: string = 'ws://localhost:' + PUBLIC_WS_PORT;
  const socket = new WebSocket(WS_URL);

  const defaultPost = {
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
  };
  let { data } = $props();
  let post: FullPost = $state(data.post ?? defaultPost);
  let tags = $state(data.tags);
  let categories = $state(data.categories);
  let authors = $state(data.authors);
  let { marked, remark } = $derived(getMarkdownProcessors(post.math, post.toc));
  let remoteEditing = $state(false);

  let group = $state('editor');

  // Connection opened
  socket.addEventListener('open', function (event) {
    if (dev) {
      console.log('Editor is connected');
    }
  });

  // Listen for messages
  socket.addEventListener('message', function (event) {
    remoteEditing = true;
    if (typeof event.data === 'string') {
      if (event.data === 'EOL') {
        if (dev) {
          console.warn('A client has closed its connection');
        }
        remoteEditing = false;
        return;
      }
      post.content = event.data;
    } else {
      if (dev) {
        console.warn('Received %s : %s', typeof event.data, event.data);
      }
    }
  });

  socket.addEventListener('error', console.error);

  socket.addEventListener('close', (_) => {
    // this could trigger a "save as draft" for final manual review
    // so we could support remote editing.
    if (dev) {
      console.log('Editor is closed');
    }
  });

  function testTag(tag: Tag) {
    return post.tags.some((e) => e.id == tag.id);
  }

  function setTag(tag: Tag, checked: boolean) {
    if (checked) {
      post.tags.push(tag);
    } else {
      post.tags = post.tags.filter((e) => e.id != tag.id);
    }
  }

  function testCategory(category: Category) {
    return post.categories.some((e) => e.id == category.id);
  }

  function setCategory(category: Category, checked: boolean) {
    if (checked) {
      post.categories.push(category);
    } else {
      post.categories = post.categories.filter((e) => e.id != category.id);
    }
  }

  function testAuthor(author: Author) {
    return post.authors.some((e) => e.id == author.id);
  }

  function setAuthor(author: Author, checked: boolean) {
    if (checked) {
      post.authors.push(author);
    } else {
      post.authors = post.authors.filter((e) => e.id != author.id);
    }
  }

  async function savePosts(id: number) {
    let response;
    if (id === -1) {
      response = await fetch('/admin/posts', {
        method: 'POST',
        body: JSON.stringify(post),
      });
    } else {
      response = await fetch(`/admin/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(post),
      });
    }
    if (response.ok) {
      toaster.success({
        title: m.success(),
        description: m.postSaved(),
        ...toasterOptions,
      });
      await invalidateAll();
      goto('/admin/posts');
    } else {
      toaster.error({
        title: m.error(),
        description: m.errorWhileSaving(),
        ...toasterOptions,
      });
    }
  }
</script>

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
      <fieldset class="col-span-full">
        <legend class="label-text">{m.tags()}</legend>
        <div class="col-span-full columns-3xs">
          {#each tags as tag (tag.id)}
            <label class="flex items-center space-x-2">
              <input
                class="checkbox"
                type="checkbox"
                checked={testTag(tag)}
                onchange={(e) => setTag(tag, e.currentTarget.checked)}
              />
              <p>
                {tag.name}
              </p>
            </label>
          {/each}
        </div>
      </fieldset>
      <fieldset class="col-span-full">
        <legend class="label-text">{m.categories()}</legend>
        <div class="col-span-full columns-3xs">
          {#each categories as category (category.id)}
            <label class="flex items-center space-x-2">
              <input
                class="checkbox"
                type="checkbox"
                checked={testCategory(category)}
                onchange={(e) => setCategory(category, e.currentTarget.checked)}
              />
              <p>
                {category.name}
              </p>
            </label>
          {/each}
        </div>
      </fieldset>
      <fieldset class="col-span-full">
        <legend class="label-text">{m.authors()}</legend>
        <div class="col-span-full columns-3xs">
          {#each authors as author (author.id)}
            <label class="flex items-center space-x-2">
              <input
                class="checkbox"
                type="checkbox"
                checked={testAuthor(author)}
                onchange={(e) => setAuthor(author, e.currentTarget.checked)}
              />
              <p>
                {author.nickname}
              </p>
            </label>
          {/each}
        </div>
      </fieldset>
      <div>
        <button
          class="btn preset-filled-primary-500"
          onclick={(_) => {
            post.draft = true;
            savePosts(post.id);
          }}
        >
          {m.saveAsDraft()}
        </button>
        <button
          class="btn preset-filled-primary-500"
          onclick={(_) => {
            post.draft = false;
            savePosts(post.id);
          }}
        >
          {m.save()}
        </button>
      </div>
    </form>
  </div>
  <Tabs value={group} onValueChange={(e) => (group = e.value)}>
    {#snippet list()}
      <Tabs.Control value="editor">Editor</Tabs.Control>
      <Tabs.Control value="preview">Preview</Tabs.Control>
    {/snippet}
    {#snippet content()}
      <Tabs.Panel value="editor"
        ><textarea disabled={remoteEditing} bind:value={post.content} class="textarea" rows="30" placeholder={m.content()}
        ></textarea></Tabs.Panel
      >
      <Tabs.Panel value="preview">
        {#await marked.parse(String(remark.processSync(post.content)))}
          <ProgressRing value={null} />
        {:then processed}
          <div class="prose prose-neutral prose-invert max-w-none">
            {@html DOMPurify.sanitize(processed)}
          </div>
        {:catch e}
          <h1 class="h1">{m.error()}</h1>
        {/await}
      </Tabs.Panel>
    {/snippet}
  </Tabs>
</div>
