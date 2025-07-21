<script lang="ts">
  import { toaster, toasterOptions } from '$lib/toaster.js';
  import { m } from '$lib/paraglide/messages';
  import { invalidateAll } from '$app/navigation';
  import { Trash, Pencil, Circle } from '@lucide/svelte';

  import AdministrationCard from '$lib/components/AdministrationCard.svelte';
  import CategoryFormModal from '$lib/components/CategoryFormModal.svelte';

  import type { HSL, RGB } from '$lib/server/db/color';

  let { data } = $props();
  let categories = $state(data.categories);

  // https://www.reddit.com/r/sveltejs/comments/1gx65ho/proper_page_data_and_reactivity_pattern_in_svelte/
  $effect(() => {
    categories = data.categories;
  });

  let createModalOpen = $state(false);
  let editModalOpen = $state(false);

  let formName: string = $state('');
  let formId: number | null = $state(null);
  let formColor: HSL | null = $state({
    h: 0,
    s: 0,
    l: 0,
  });

  async function deleteCategory(id: number) {
    const response = await fetch(`/admin/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (response.ok) {
      toaster.success({
        title: m.success(),
        description: m.categoryDeleted(),
        ...toasterOptions,
      });
      await invalidateAll();
    } else {
      toaster.error({
        title: m.error(),
        description: m.errorWhileDeleting(),
        ...toasterOptions,
      });
    }
  }

  function openCreateCategoryModal() {
    formName = '';
    formId = null;
    formColor = null;
    createModalOpen = true;
  }

  function openEditCategoryModal(id: number, name: string, color: HSL | null) {
    console.log(color);
    formName = name;
    formId = id;
    formColor = color;
    editModalOpen = true;
  }

  function rgbToHsl(color: RGB): HSL {
    let { r, g, b } = color;

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));

      if (max === r) {
        h = (g - b) / delta;
      } else if (max === g) {
        h = (b - r) / delta + 2;
      } else {
        h = (r - g) / delta + 4;
      }

      h *= 60;
      if (h < 0) {
        h += 360;
      }
    }

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  function hexToRgb(hexString: string): RGB {
    if (!hexString.match(/^#[0-9A-Fa-f]{6}$/)) {
      throw new Error('String is not a valid hexadecimal RGB color');
    }
    hexString = hexString.split('#')[1];
    const r = parseInt(hexString.substring(0, 2), 16);
    const g = parseInt(hexString.substring(2, 4), 16);
    const b = parseInt(hexString.substring(4, 6), 16);

    return { r, g, b };
  }
</script>

<AdministrationCard title={m.categories()} addButtonAction={openCreateCategoryModal}>
  <table class="table whitespace-nowrap">
    <thead>
      <tr>
        <th>Id</th>
        <th>{m.color()}</th>
        <th>{m.name()}</th>
        <th class="!text-right">{m.actions()}</th>
      </tr>
    </thead>
    <tbody class="[&>tr]:hover:preset-tonal-primary">
      {#each categories as row (row.id)}
        <tr>
          <td class="text-left">{row.id}</td>
          <td class="text-left"><Circle fill={row.color} color={row.color ?? undefined} /></td>
          <td class="text-left">{row.name}</td>
          <td class="text-right">
            <div class="flex flex-row justify-end">
              <button
                class="btn-icon"
                onclick={() =>
                  openEditCategoryModal(
                    row.id,
                    row.name,
                    rgbToHsl(hexToRgb(row.color ?? '#000000')),
                  )}><Pencil /></button
              >
              <button class="btn-icon" onclick={() => deleteCategory(row.id)}><Trash /></button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</AdministrationCard>

<CategoryFormModal
  title={m.createCategory()}
  action="?/create"
  callback={async () => (createModalOpen = false)}
  successMessage={m.categoryCreationSuccessful()}
  bind:modalOpen={createModalOpen}
  bind:name={formName}
  bind:id={formId}
  bind:color={formColor}
/>

<CategoryFormModal
  title={m.editAuthor()}
  action="?/edit"
  callback={async () => (editModalOpen = false)}
  successMessage={m.successfulModification()}
  bind:modalOpen={editModalOpen}
  bind:name={formName}
  bind:id={formId}
  bind:color={formColor}
/>
