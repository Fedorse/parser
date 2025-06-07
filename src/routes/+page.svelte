<script lang="ts">
  import {open} from '@tauri-apps/plugin-dialog';
  import {Button} from '$lib/components/ui/button/index'
  
  import FolderInput from '@lucide/svelte/icons/folder-input'
  import * as Card from "$lib/components/ui/card/index.js";
  import {Separator} from '$lib/components/ui/separator/index'
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import FileTreeItem from "$lib/components/FileTreeItem.svelte";
  import {invoke} from '@tauri-apps/api/core';

  type FileTreeNode = {
  name: string;
  path:string;
  type: 'File' | 'Directory',
  selected?: boolean,
  children?: FileTreeNode[]
}

type FilePreview = {
  name: string
  path: string;
  preview: string;
  size: number;
};




let filePrewiews = $state<FilePreview[]>([])
let filesTreeNodes = $state<FileTreeNode[]>([])
let isDialogOpen = $state(true)




const laodFiles = async () => {
  try {
    const files = await invoke<FilePreview[]>('get_files')
    filePrewiews = files
  } catch(err) {
    console.error('Failed to load files:', err)
  }
}

const selectAllNodes = (nodes: FileTreeNode[]) => {
  for (const node of nodes) {
    if (node.type === 'File') {
      node.selected = true;
    } else {
      node.selected = true;     
      if (node.children) {
        selectAllNodes(node.children);
      } 
    }
  }
};


const parseSelectedNodes = async () => {
  const paths = collectSelectedPath(filesTreeNodes);

  if(paths.length === 0) return;

  await invoke('parse', { paths });
  isDialogOpen = false;
  filesTreeNodes = [];
  await laodFiles();
};

const collectSelectedPath = (nodes: FileTreeNode[]): string[] => {
  const paths: string[] = [];
  for (const node of nodes) {
    if (node.type === 'File') {
      if (node.selected) paths.push(node.path);
    } else if (node.children) {
      paths.push(...collectSelectedPath(node.children));
    }
  }
  return paths;
}


const handleOpenFiles = async (selectDir: boolean) => {
  const selected = await open({multiple: true, directory: selectDir})
  if (!selected) return
  try {
    const tree = await invoke<FileTreeNode[]>('get_preview_tree', {
      paths: selected
    })
    selectAllNodes(tree)
    filesTreeNodes = tree
    isDialogOpen = true
  } catch(err) {
    console.error('Parse failed:', err)
  }
}

const handleOpenDir = async (file: FilePreview) => {
  try {
    await invoke('open_in_folder', { filePath: file.path });
  } catch (err) {
    console.error('Failed to open file:', err);
  }
};

const handleDelete = async (file: FilePreview) => {
  try {
    await invoke('delete_file', { path: file.path });
    await laodFiles();
  } catch (err) {
    console.error('Failed to delete file:', err);
  }
};



$effect(()=>{
  laodFiles()
})

</script>

<main class='w-full h-full flex items-center justify-center flex-col'>
        <div class="bg-card h-full p-4">
          <div class='border border-muted border-dashed h-1/2  bg-black  w-full flex flex-col items-center justify-center  rounded-sm'>
          <p>drag and drop files here</p>
        </div>
    <div class="pt-3 gap-2 flex justify-center items-center">
      <Separator orientation='vertical' />
      <Button variant="outline" onclick={()=> handleOpenFiles(true)}>
        <FolderInput class="mr-2 size-4"  />
        Upload Folder
      </Button>
        </div>
    </div>
        <div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-10'>
          {#each filePrewiews as file (file.path)}
          <Card.Root class='max-w-sm'>
            <Card.Header>
              <Card.Title>{file.name}</Card.Title>
            </Card.Header>
            <Card.Content>
              <p class="line-clamp-6">{file.preview}</p>
            </Card.Content>
            <Card.Footer>
              <div class="flex justify-between w-full"> 
                <Button variant="outline" onclick={()=> handleOpenDir(file)}>Open in folder</Button>
                <Button  onclick={()=> handleDelete(file)}>Delete</Button>
              </div>
            </Card.Footer>
          </Card.Root>
        {/each}
        </div>
    {#if filesTreeNodes.length > 0}
    <Dialog.Root open={isDialogOpen} onOpenChange={(v) => (isDialogOpen = v)}>
      <Dialog.Content class='w-full flex flex-col  h-[70%]' >
        <Dialog.Header>
          <Dialog.Title>Select to parse files</Dialog.Title>
          <Dialog.Description>
            Make changes to your profile here. Click parse when you're done.
          </Dialog.Description>        
        </Dialog.Header>
          <ul class="mt-4 flex  space-y-1 text-sm w-full overflow-y-auto h-full ">
            {#each filesTreeNodes as node (node.path)}
              <FileTreeItem {node}/>
            {/each}
          </ul>
        <div class="flex justify-end">
          <Button onclick={parseSelectedNodes}>Parse</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
    {/if}
</main>

