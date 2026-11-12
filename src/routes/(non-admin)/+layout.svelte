<script lang="ts">
  import { GripVerticalIcon, XIcon } from '@lucide/svelte';
  import { FloatingPanel, Portal } from '@skeletonlabs/skeleton-svelte';
  import { Paintbrush } from '@lucide/svelte';
  import ThemeSwitcher from '#lib/components/ThemeSwitcher.svelte';

  let { children } = $props();
</script>

<div class="group fixed inset-y-1/2 -left-3 z-0 rounded-full">
  <FloatingPanel resizable={false} closeOnEscape={true}>
    <FloatingPanel.Trigger
      class="btn preset-filled m-3 h-5 origin-center -translate-x-[30px] rounded-r-full transition-transform duration-100 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-0 group-hover:scale-200"
    >
      <Paintbrush size={10} class="opacity-0 transition-opacity group-hover:opacity-100"
      ></Paintbrush>
    </FloatingPanel.Trigger>
    <Portal>
      <FloatingPanel.Positioner class="z-50">
        <FloatingPanel.Content class="h-auto!">
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
