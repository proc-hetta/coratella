<script lang="ts">
  import Color from 'color';

  let { text = $bindable(), colorText = $bindable() } = $props();
</script>

<div
  class="badge preset-filled-primary-500 h-fit"
  style="background-color: {Color(colorText).hex()}; color: {Color(colorText).isDark()
    ? Color('white').hex()
    : Color('black').hex()};"
>
  {text}
</div>
