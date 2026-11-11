<script lang="ts">
  import { PUBLIC_LOGO, PUBLIC_LOGODARK, PUBLIC_LOGOLIGHT } from '$app/env/public';
  import logoLight from '#lib/images/logolight.svg';
  import logoDark from '#lib/images/logodark.svg';

  // The `dark:` variant also follows the OS preference in system mode.
  let { class: className = '', alt }: { class?: string; alt: string } = $props();
</script>

<img class="{className} dark:hidden" src={PUBLIC_LOGOLIGHT ?? PUBLIC_LOGO ?? logoLight} {alt} />
<img class="{className} hidden dark:block" src={PUBLIC_LOGODARK ?? PUBLIC_LOGO ?? logoDark} {alt} />
