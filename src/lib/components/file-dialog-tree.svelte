<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Separator } from '$lib/components/ui/separator';
  import * as Dialog from '$lib/components/ui/dialog';
  import FileTreeItem from '$lib/components/file-tree-item.svelte';
  import type { FileTreeNode } from '$lib/tauri.ts';

  type Props = { filesTreeNodes: FileTreeNode[]; open: boolean; onParse: () => void };
  let { filesTreeNodes, open = $bindable(false), onParse }: Props = $props();

  let allSelected = $state(true);

  const setAll = (nodes: FileTreeNode[], v: boolean) => {
    for (const n of nodes) {
      n.selected = v;
      if (n.type === 'Directory' && n.children) setAll(n.children, v);
    }
  };

  const toggleAll = () => {
    allSelected = !allSelected;
    setAll(filesTreeNodes, allSelected);
  };
</script>

<Dialog.Root {open} onOpenChange={() => (open = false)}>
  <Dialog.Content class="flex h-[70%] w-[60vw] flex-col">
    <Dialog.Header class="flex items-start justify-between gap-2">
      <div>
        <Dialog.Title>Select to parse files</Dialog.Title>
        <Dialog.Description>Choose which files you want to parse.</Dialog.Description>
      </div>
    </Dialog.Header>

    <ul class=" h-full w-full flex-1 space-y-1 overflow-y-auto pr-2 text-sm">
      {#each filesTreeNodes as node (node.path)}
        <FileTreeItem {node} isRoot={true} />
      {/each}
    </ul>

    <Separator orientation="horizontal" />

    <div class="flex gap-4">
      <Button variant="outline" onclick={toggleAll}>
        {allSelected ? 'Deselect All' : 'Select All'}
      </Button>
      <Button onclick={onParse}>Parse</Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
