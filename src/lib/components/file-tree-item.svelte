<script lang="ts">
  import { FileIcon, FolderIcon, FolderOpen, ChevronRight } from '@lucide/svelte/icons';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { expandNode } from '@/lib/tauri';
  import type { FileTree } from '@/lib/type';
  import { slide } from 'svelte/transition';
  import { formatFileSize } from '../utils/utils';

  let { nodes = $bindable() }: { nodes: FileTree[] } = $props();

  const handleSelect = (node: FileTree, checked: boolean) => {
    node.selected = checked;

    if (node.children) {
      updateChildrenDeep(node.children, checked);
    }
  };

  const updateChildrenDeep = (list: FileTree[], val: boolean) => {
    list.forEach((item) => {
      item.selected = val;
      if (item.children) updateChildrenDeep(item.children, val);
    });
  };

  const handleExpand = async (e: MouseEvent, node: FileTree) => {
    e.stopPropagation();
    if (node.type !== 'Directory') return;

    if (node.isExpanded) {
      node.isExpanded = false;
      return;
    }

    if (node.children && node.children.length > 0) {
      node.isExpanded = true;
      return;
    }

    try {
      const loadedChildren = await expandNode(node.path);
      node.children = loadedChildren;
      node.isExpanded = true;
    } catch (err) {
      console.error(err);
    }
  };
</script>

<ul class="w-full space-y-0.5">
  {#each nodes as node (node.path)}
    {@render treeNode(node)}
  {/each}
</ul>

{#snippet treeNode(node: FileTree)}
  <li class="flex flex-col text-sm select-none">
    <div
      class="hover:bg-muted/50 group flex items-center gap-2 rounded-sm px-1 py-1 transition-colors"
    >
      <div class="flex size-5 items-center justify-center">
        {#if node.type === 'Directory'}
          <button
            onclick={(e) => handleExpand(e, node)}
            class="hover:bg-muted-foreground/20 cursor-pointer rounded p-0.5"
          >
            <ChevronRight
              class="size-4 transition-transform duration-200 {node.isExpanded ? 'rotate-90' : ''}"
            />
          </button>
        {:else}
          <span class="w-4"></span>
        {/if}
      </div>

      <Checkbox checked={node.selected} onCheckedChange={(v) => handleSelect(node, v)} />

      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex flex-1 cursor-pointer items-center gap-2 overflow-hidden"
        onclick={(e) =>
          node.type === 'Directory' ? handleExpand(e, node) : handleSelect(node, !node.selected)}
      >
        {#if node.type === 'Directory'}
          {#if node.isExpanded}
            <FolderOpen class="text-primary/80 size-4" />
          {:else}
            <FolderIcon
              class="text-muted-foreground group-hover:text-primary/80 size-4 transition-colors"
            />
          {/if}
        {:else}
          <FileIcon class="text-muted-foreground/70 size-4" />
        {/if}
        <div class="flex w-full justify-between">
          <span
            class="truncate {node.selected
              ? 'text-foreground font-medium'
              : 'text-muted-foreground'}"
          >
            {node.name}
          </span>

          <span class="ml-2 pr-4 text-xs opacity-70">
            {formatFileSize(node.size ?? 0)}
          </span>
        </div>
      </div>
    </div>

    {#if node.isExpanded && node.children}
      <ul transition:slide|local={{ duration: 150 }} class="border-border/40 ml-2 border-l pl-4">
        {#each node.children as child (child.path)}
          {@render treeNode(child)}
        {/each}
      </ul>
    {/if}
  </li>
{/snippet}
