<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  let { form } = $props();
</script>

<div class="flex h-screen w-screen items-center justify-center">
  <div class="card md:preset-filled-surface-100-900 max-w-md p-4 text-center">
    <form method="POST" class="flex flex-col items-center justify-center gap-2">
      <input class="input" type="password" placeholder={m.password()} name="password" />
      {#if form?.message}
        <p class="text-error-500">{form.message}</p>
      {/if}
      <button type="submit" class="btn preset-filled-primary-500 w-full md:w-min">{m.save()}</button
      >
    </form>
  </div>
</div>
