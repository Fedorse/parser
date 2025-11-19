<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Label } from '$lib/components/ui/label';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import Self from '$lib/components/file-tree-item.svelte';
  import { setSelected } from '@/lib/utils/utils';
  import type { FileTreeNode } from '$lib/tauri.ts';

  import { FileIcon, FolderIcon, ChevronRight, FolderOpen } from '@lucide/svelte/icons';
  import { formatFileSize } from '@/lib/utils/utils';

  let { node, isRoot = false } = $props();

  let isOpen = $state(isRoot && node.type === 'Directory');

  const onToggle = (checked: boolean) => {
    setSelected(node, checked);
  };

  let checkboxState = $derived.by(() => {
    if (node.type !== 'Directory' || !node.children?.length) {
      return { isChecked: node.selected, isIndeterminate: false };
    }

    const allChildrenChecked = node.children.every((child: FileTreeNode) => child.selected);
    const noChildrenChecked = node.children.every((child: FileTreeNode) => !child.selected);

    return {
      isChecked: allChildrenChecked,
      isIndeterminate: !allChildrenChecked && !noChildrenChecked
    };
  });
</script>

{#if node.type === 'File'}
  <li class=" hover:bg-muted/50 flex items-center gap-2 pt-1 transition-all">
    <Checkbox bind:checked={node.selected} onCheckedChange={onToggle} />
    <div
      class={{
        'flex w-full items-center gap-2': true,
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
      <li class="hover:bg-muted/50 flex flex-row items-center gap-2 transition-colors">
        <ChevronRight
          class={{
            'size-4 cursor-pointer transition-transform duration-200': true,
            'rotate-90': isOpen
          }}
        />
        <Checkbox
          checked={checkboxState.isChecked}
          onCheckedChange={onToggle}
          indeterminate={checkboxState.isIndeterminate}
          onclick={(e) => e.stopPropagation()}
        />
        <div
          class={{
            'flex w-full items-center gap-2': true,
            'text-primary': node.selected,
            'text-primary/20': !node.selected
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
    <Collapsible.Content>
      {#if isOpen && node.children?.length}
        <ul class="border-border relative ml-1 space-y-1 border-l pl-8">
          {#each node.children as child (child.path)}
            <Self node={child} />
          {/each}
        </ul>
      {/if}
    </Collapsible.Content>
  </Collapsible.Root>
{/if}
