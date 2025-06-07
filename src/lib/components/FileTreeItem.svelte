<script lang="ts">
  import { Checkbox }from '$lib/components/ui/checkbox';
  import { Label } from '$lib/components/ui/label';
    import FileIcon from '@lucide/svelte/icons/file';
    import FolderIcon from '@lucide/svelte/icons/folder';
    import ChevronRight from '@lucide/svelte/icons/chevron-right';
    import * as Collapsible from '$lib/components/ui/collapsible';
    import Self from '$lib/components/FileTreeItem.svelte';

    type FileTreeNode = {
    name: string;
    path:string;
    type: 'File' | 'Dir',
    selected?: boolean,
    children?: FileTreeNode[]
  }
  
    let { node } = $props();


  const cascadeSelection = (isChecked: boolean, node: FileTreeNode) => {
    node.selected = isChecked;
    node.children?.forEach(node => cascadeSelection(isChecked, node));
  };

  const onToggle = (checked: boolean) => {
    node.selected = checked;
    if (node.type === 'Dir') 
    cascadeSelection(checked, node);
  };
  </script>
  

  {#if node.type === 'File'}
    <li class="flex items-center gap-2 pt-1">
      <Checkbox bind:checked={node.selected} onCheckedChange={onToggle}  />
      <FileIcon  class="size-5" />
      <Label>{node.name}</Label>
    </li>
  {:else}
    <Collapsible.Root
    class="group/collapsible flex flex-col"
    open={false}
    >
    <Collapsible.Trigger>
      <li class="flex items-center gap-2 flex-row">
        <ChevronRight class="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
        <Checkbox bind:checked={node.selected} onCheckedChange={onToggle} onclick={(e)=>e.stopPropagation()}
        />
        <FolderIcon class="size-6" />
        <Label class="select-none cursor-pointer flex-1">
          {node.name}
        </Label>
      </li>
    </Collapsible.Trigger>
      <Collapsible.Content>
        {#if node.children?.length}
          <ul class="pl-10 space-y-1">
            {#each node.children as child (child.path)}
            <Self node={child} />
            {/each}
          </ul>
        {/if}
      </Collapsible.Content>
    </Collapsible.Root>
  {/if}
  