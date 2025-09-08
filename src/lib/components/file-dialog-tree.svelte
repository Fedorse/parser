<script lang="ts">
  import { Button } from '$lib/components/ui/button/index';
  import { Separator } from '$lib/components/ui/separator/index';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import FileTreeItem from '$lib/components/file-tree-item.svelte';

  type FileTreeNode = {
    name: string;
    path: string;
    type: 'File' | 'Directory';
    selected?: true;
    children?: FileTreeNode[];
  };

  type Props = {
    filesTreeNodes: FileTreeNode[];
    open: boolean;
    onParse: () => void;
  };

  let { filesTreeNodes, open = $bindable(false), onParse }: Props = $props();
</script>

<Dialog.Root {open}>
  <Dialog.Content class="w-[60vw] flex flex-col  h-[70%]">
    <Dialog.Header>
      <Dialog.Title>Select to parse files</Dialog.Title>
      <Dialog.Description>
        Choose which files you want to parse. All files are select by default.
      </Dialog.Description>
    </Dialog.Header>
    <ul class="mt-4 flex-1 pr-2 space-y-1 text-sm w-full overflow-y-auto h-full">
      {#each filesTreeNodes as node (node.path)}
        <FileTreeItem {node} isRoot={true} />
      {/each}
    </ul>
    <Separator orientation="horizontal" />
    <div class="flex justify-between">
      <!-- <Button onclick={()=> selectAllNodes(filesTreeNodes)}>Select All</Button> -->
      <Button onclick={onParse}>Parse</Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
