<script lang="ts">
  import { enhance } from '$app/forms';
  import { coratellaFormCallback } from '#lib/utils.ts';

  // A hidden form deleting the resource `value` through the page's `?/delete` action.
  let {
    id,
    value,
    successMessage,
  }: { id: string; value: string | number; successMessage: string } = $props();
</script>

<form
  {id}
  method="POST"
  action="?/delete"
  hidden
  use:enhance={coratellaFormCallback({ successMessage, refreshAll: true })}
>
  <input type="hidden" name="id" {value} />
</form>
