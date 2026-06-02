<script lang="ts">
  import '../../app.css';
  import { Toast } from '@skeletonlabs/skeleton-svelte';
  import { toaster } from '$lib/toaster';
  import { Circle, GripVerticalIcon, XIcon } from '@lucide/svelte';
  import { FloatingPanel, Portal } from '@skeletonlabs/skeleton-svelte';
  import { Paintbrush } from '@lucide/svelte';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
  import { fly, scale } from 'svelte/transition';
  import { bounceInOut, bounceOut, cubicIn, linear } from 'svelte/easing';
  import { Tween } from 'svelte/motion';

  let { children } = $props();
  let buttonSize = new Tween(1, {
    duration: 100,
    easing: bounceInOut,
  });
  let buttonXTranslation = new Tween(-30, {
    duration: 100,
    easing: linear,
  });
</script>

<Toast.Group {toaster}>
  {#snippet children(toast)}
    <Toast {toast}>
      <Toast.Message>
        <Toast.Title>{toast.title}</Toast.Title>
        <Toast.Description>{toast.description}</Toast.Description>
      </Toast.Message>
    </Toast>
  {/snippet}
</Toast.Group>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fixed inset-y-1/2 -left-3 z-0 rounded-full"
  onmouseenter={() => {
    buttonSize.target = 2;
    buttonXTranslation.target = 0;
  }}
  onmouseleave={() => {
    buttonSize.target = 1;
    buttonXTranslation.target = -30;
  }}
>
  <FloatingPanel resizable={false} closeOnEscape={true}>
    <FloatingPanel.Trigger
      class="btn preset-filled m-3 h-5 origin-center rounded-r-full"
      style="transform: translate({buttonXTranslation.current}px, 0px) scale({buttonSize.current})"
    >
      <Paintbrush size={10} class={[buttonSize.current < 1.3 ? 'opacity-0' : '']}></Paintbrush>
    </FloatingPanel.Trigger>
    <Portal>
      <FloatingPanel.Positioner class="z-50">
        <FloatingPanel.Content>
          <FloatingPanel.DragTrigger>
            <FloatingPanel.Header>
              <FloatingPanel.Title>
                <GripVerticalIcon class="size-4" />
                <Paintbrush></Paintbrush>
              </FloatingPanel.Title>
              <FloatingPanel.Control>
                <FloatingPanel.CloseTrigger>
                  <XIcon className="size-4" />
                </FloatingPanel.CloseTrigger>
              </FloatingPanel.Control>
            </FloatingPanel.Header>
          </FloatingPanel.DragTrigger>
          <FloatingPanel.Body>
            <ThemeSwitcher></ThemeSwitcher>
          </FloatingPanel.Body>
        </FloatingPanel.Content>
      </FloatingPanel.Positioner>
    </Portal>
  </FloatingPanel>
</div>

{@render children()}
