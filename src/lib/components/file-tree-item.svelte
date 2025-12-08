<script lang="ts">
  // import { sumBy } from 'es-toolkit';
  import { formatFileSize } from '@/lib/utils/utils';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import { FileIcon, FolderIcon, ChevronRight, FolderOpen } from '@lucide/svelte/icons';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Label } from '$lib/components/ui/label';
  import { setSelected } from '@/lib/utils/utils';
  import Self from './file-tree-item.svelte';

  import type { FileTree } from '@/lib/type.ts';
  import { slide } from 'svelte/transition';

  let { node = $bindable(), isRoot = false } = $props();

  let isOpen = $state(isRoot && node.type === 'Directory');

  const onToggle = (checked: boolean) => {
    setSelected(node, checked);
  };

  let checkboxState = $derived.by(() => {
    if (node.type !== 'Directory' || !node.children?.length) {
      return { checked: node.selected ?? false, indeterminate: false };
    }

    const all = node.children.every((c: FileTree) => c.selected);
    const none = node.children.every((c: FileTree) => !c.selected);

    return {
      checked: all,
      indeterminate: !all && !none
    };
  });

  // const calculateSelectedSize = (node: FileTree) => {
  //   if (node.type === 'File') {
  //     return node.selected ? (node.size ?? 0) : 0;
  //   }
  //   return sumBy(node.children ?? [], calculateSelectedSize);
  // };
  // let currentSize = $derived(calculateSelectedSize(node));

  $effect(() => {
    if (node.type === 'Directory') {
      node.selected = checkboxState.checked;
    }
  });
</script>

{#if node.type === 'File'}
  <li class="hover:bg-muted/50 flex items-center gap-2 pt-1">
    <Checkbox bind:checked={node.selected} />
    <div
      class={{
        'flex w-full items-center gap-2 transition-colors duration-100': true,
        'text-primary ': node.selected,
        'text-primary/20': !node.selected
      }}
    >
      <FileIcon class="size-4.5 cursor-pointer stroke-1" />
      <Label class="flex-1 cursor-pointer select-none">
        {node.name}
      </Label>
      {#if node.size}
        <span class="pr-4 text-xs opacity-70">
          {formatFileSize(node.size)}
        </span>
      {/if}
    </div>
  </li>
{:else}
  <Collapsible.Root class="flex flex-col" bind:open={isOpen}>
    <Collapsible.Trigger>
      <li class="hover:bg-muted/50 flex flex-row items-center gap-2 transition-all">
        <ChevronRight
          class={{
            'size-4 cursor-pointer transition-transform duration-200': true,
            'rotate-90': isOpen
          }}
        />

        <Checkbox
          checked={checkboxState.checked}
          indeterminate={checkboxState.indeterminate}
          onCheckedChange={onToggle}
          onclick={(e: MouseEvent) => e.stopPropagation()}
        />

        <div
          class={{
            'flex w-full items-center gap-2 transition-all  duration-100': true,
            'text-primary': checkboxState.indeterminate || checkboxState.checked,
            'text-primary/20': !checkboxState.indeterminate && !checkboxState.checked
          }}
        >
          {#if isOpen}
            <FolderOpen class="size-5 cursor-pointer stroke-1" />
          {:else}
            <FolderIcon class="size-5 cursor-pointer stroke-1" />
          {/if}

          <Label class="flex-1 cursor-pointer select-none">
            {node.name}
          </Label>
          {#if node.size}
            <span class="ml-2 pr-4 text-xs opacity-70">
              {formatFileSize(node.size)}
            </span>
          {/if}
        </div>
      </li>
    </Collapsible.Trigger>
    <Collapsible.Content forceMount>
      {#if isOpen && node.children?.length}
        <ul
          class="border-border relative ml-1 space-y-1 border-l pl-8"
          transition:slide={{ duration: 200 }}
        >
          {#each node.children as child, i (child.path)}
            <Self bind:node={node.children[i]} />
          {/each}
        </ul>
      {/if}
    </Collapsible.Content>
  </Collapsible.Root>
{/if}
