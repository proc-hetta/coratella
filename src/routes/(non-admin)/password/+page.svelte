<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  let { data } = $props();
</script>

<div class="flex h-screen w-screen items-center justify-center">
  <div class="card md:preset-filled-surface-100-900 max-w-md p-4 text-center">
    <form action={`/posts/${data.postId}`} class="flex flex-col items-center justify-center gap-2">
      <input class="input" type="text" placeholder={m.password()} name="password" />
      <button type="submit" class="btn preset-filled-primary-500 w-full md:w-min">{m.save()}</button
      >
    </form>
  </div>
</div>
