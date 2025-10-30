<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Separator } from '$lib/components/ui/separator';
  import * as Dialog from '$lib/components/ui/dialog';
  import FileTreeItem from '$lib/components/file-tree-item.svelte';
  import { setSelectedAll } from '$lib/utils';
  import type { FileTree } from '$lib/type';

  type Props = { filesTree: FileTree[]; open: boolean; onParse: () => void };

  let { filesTree, open = $bindable(false), onParse }: Props = $props();

  let allSelected = $state(true);

  const toggleAll = () => {
    allSelected = !allSelected;
    setSelectedAll(filesTree, allSelected);
  };
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="flex h-[70%] w-[60vw] flex-col">
    <Dialog.Header class="flex items-start justify-between gap-2">
      <div>
        <Dialog.Title>Select to parse files</Dialog.Title>
        <Dialog.Description>Choose which files you want to parse.</Dialog.Description>
      </div>
    </Dialog.Header>

    <ul class=" h-full w-full flex-1 space-y-1 overflow-y-auto pr-2 text-sm">
      {#each filesTree as node (node.path)}
        <FileTreeItem {node} isRoot={true} />
      {/each}
    </ul>

    <Separator orientation="horizontal" />

    <div class="flex gap-4">
      <Button onclick={onParse}>Parse</Button>
      <Button variant="secondary" class="self-end" onclick={toggleAll}>
        {allSelected ? 'Deselect All' : 'Select All'}
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
