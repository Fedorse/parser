<script lang="ts">
  import { formatFileSize } from '@/lib/utils/utils';
  import FileTreeItem from '$lib/components/file-tree-item.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Separator } from '$lib/components/ui/separator';
  import { HardDrive } from '@lucide/svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';

  import type { FileTree } from '$lib/type';

  type Props = { filesTree: FileTree[]; open: boolean; onParse: () => void };

  let { filesTree = $bindable(), open = $bindable(false), onParse }: Props = $props();

  const calculateSelectedSize = (nodes: FileTree[]): number => {
    let total = 0;

    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        total += calculateSelectedSize(node.children);
      } else if (node.selected) {
        total += node.size ?? 0;
      }
    }

    return total;
  };

  let totalSize = $derived(calculateSelectedSize(filesTree));
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
      <FileTreeItem bind:nodes={filesTree} />
    </ul>

    <Separator orientation="horizontal" />

    <div class="flex items-center justify-between">
      <div class="flex gap-3">
        <Badge variant="outline" class="h-8 min-w-[140px] text-xs ">
          <HardDrive class="text-muted-foreground size-3.5 stroke-1" />
          <span class="text-muted-foreground">Size:</span>
          <span class="text-foreground">
            {formatFileSize(totalSize)}
          </span>
        </Badge>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
        <Button onclick={onParse} disabled={totalSize === 0}>Parse</Button>
      </div>
    </div></Dialog.Content
  >
</Dialog.Root>
