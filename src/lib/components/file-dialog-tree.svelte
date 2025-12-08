<script lang="ts">
  // import { sumBy } from 'es-toolkit';
  import { setSelectedAll } from '@/lib/utils/utils';
  import FileTreeItem from '$lib/components/file-tree-item.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Separator } from '$lib/components/ui/separator';
  import { Switch } from '$lib/components/ui/switch';
  // import { HardDrive } from '@lucide/svelte';
  // import Badge from '$lib/components/ui/badge/badge.svelte';

  import type { FileTree } from '$lib/type';

  type Props = { filesTree: FileTree[]; open: boolean; onParse: () => void };

  let { filesTree = $bindable(), open = $bindable(false), onParse }: Props = $props();

  let allSelected = $state(true);

  const toggleAll = () => {
    allSelected = !allSelected;
    setSelectedAll(filesTree, allSelected);
  };

  // const calculateTotalSelectedSize = (nodes: FileTree[]): number => {
  //   return sumBy(nodes, (node) => {
  //     if (node.type === 'File') {
  //       return node.selected ? (node.size ?? 0) : 0;
  //     }
  //     return calculateTotalSelectedSize(node.children ?? []);
  //   });
  // };

  // let totalSize = $derived(calculateTotalSelectedSize(filesTree));
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="flex flex-col sm:h-[80vh] sm:w-[95vw] lg:h-[80vh] lg:w-[60vw]">
    <Dialog.Header class="flex gap-2">
      <Dialog.Title class="text-lg ">Select Files to Parse</Dialog.Title>
      <Dialog.Description class="text-xs">
        Review the directory structure and select content for parse.
      </Dialog.Description>
    </Dialog.Header>
    <!-- <Separator orientation="horizontal" /> -->

    <ul class=" h-full w-full flex-1 space-y-1 overflow-y-auto pr-2 text-sm">
      {#each filesTree as node, i (node.path)}
        <FileTreeItem bind:node={filesTree[i]} isRoot={true} />
      {/each}
    </ul>

    <Separator orientation="horizontal" />

    <div class="flex items-center justify-between">
      <div class="flex gap-3">
        <!-- <Badge variant="outline" class="h-8 min-w-[140px] text-xs ">
          <HardDrive class="text-muted-foreground size-3.5 stroke-1" />
          <span class="text-muted-foreground">Total:</span>
          <span class="text-foreground">
            {formatFileSize(totalSize)}
          </span>
        </Badge> -->
        <div class="flex items-center gap-3">
          <label
            class="group border-border bg-background hover:bg-accent hover:border-accent-foreground/20 flex cursor-pointer items-center gap-3 rounded-md border py-1.5 pr-1.5 pl-4 transition-all active:scale-95"
          >
            <span
              class="text-muted-foreground group-hover:text-foreground text-xs transition-colors select-none"
            >
              {allSelected ? 'Select All' : 'Deselect All'}
            </span>
            <div class="bg-border mx-1 h-4 w-[1px]"></div>

            <Switch
              checked={allSelected}
              onCheckedChange={toggleAll}
              class="data-[state=checked]:bg-primary scale-90 shadow-none"
            />
          </label>
        </div>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
        <Button onclick={onParse}>Start Parsing</Button>
      </div>
    </div></Dialog.Content
  >
</Dialog.Root>
