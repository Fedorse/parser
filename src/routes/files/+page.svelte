<script lang="ts">
    import {invoke} from '@tauri-apps/api/core';
    import * as Card from "$lib/components/ui/card/index.js";
    import {Button} from '$lib/components/ui/button/index'
    import Delete from '@lucide/svelte/icons/trash-2'
    import OpenFolder from '@lucide/svelte/icons/folder-open-dot'
    import File from '@lucide/svelte/icons/file-text'
    import Input from '$lib/components/ui/input/input.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import Code2 from '@lucide/svelte/icons/code-2'
    import Code from '@lucide/svelte/icons/code'
    import { Copy } from '@lucide/svelte/icons';
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";




    const THIRTY_MB_SIZE = 30 * 1024 * 1024;


    type SavedFiles = {
        name: string;
        path: string;
        preview: string;
        size: number;
    };

    let savedFiles = $state<SavedFiles[]>([])
    let newName = $state<string>('')
    let rename = $state<string | null>(null)
    let isCodeDialogOpen = $state(false);
    let fileContent = $state<string>('');
    let selectedFile = $state<SavedFiles | null>(null);
    let isCopied = $state(false);


    

    const openDialogCode = async (file: SavedFiles)=>{
        selectedFile = file
        isCodeDialogOpen = true
        try {
            const content = await invoke<string>('get_file_content', { filePath: file.path })
            fileContent = content
        } catch (err) {
            console.error('Failed to load file content:', err)
            fileContent = 'Error loading file content'
        }
    }


    const loadFiles = async () => {
        try {
            const files = await invoke<SavedFiles[]>('get_files')
            savedFiles = files
        } catch (err) {
            console.error('Failed to load files:', err)
        }
    }

    const handleDelete = async (file: SavedFiles) => {
        try {
            await invoke('delete_file', { path: file.path });
            loadFiles()
        } catch (err) {
            console.error('Failed to delete file:', err);
        }
    }

    const handleOpenDir = async (file: SavedFiles) => {
        try {
            await invoke('open_in_folder', { filePath: file.path });
        } catch (err) {
            console.error('Failed to open file:', err);
        }
    }
    const handleRename = async (file: SavedFiles) => {
        if(!newName || newName === file.name) return
        try {
            await invoke('rename_file', { filePath: file.path, newName: newName })
            rename = null
            newName = ''
            loadFiles()
        } catch (err) {
            console.error('Failed to rename file:', err);
        }
    }

    const updateFileContent = async (content: string) => {
        isCodeDialogOpen = false
        try {
            await invoke('update_file', { filePath: selectedFile?.path, content: content })            
            loadFiles()
        } catch (err) {
            console.error('Failed to update file content:', err);
        }
    }
    
    const openDefaultEditor = async (path: string) => {
        try {
            await invoke('open_in_default_editor', { filePath: path });
        } catch (err) {
            console.error('Failed to open file in editor:', err);
        }
    }

    const handleCopy = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            isCopied = true
            setTimeout(()=> isCopied = false, 2000)
        } catch (err) {
            console.error('Failed to copy content:', err);
        }

    }



    export const formatFileSize = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};


    $effect(() => {
        loadFiles()
    })

</script>

<div class="px-10">
    <div class="mb-6">
        <h1 class="text-3xl font-bold tracking-tight">Saved Files</h1>
        <p class="text-muted-foreground">Manage your saved files and documents</p>
    </div>
    <div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4'>
        {#each savedFiles as file (file.path)}
        <Card.Root class='max-w-sm'>
          <Card.Header>
            <Card.Title class='flex items-center gap-4 justify-between ' >
                {#if rename === file.path}
                <Input class='flex-1' autofocus  bind:value={newName}  onkeydown={(e) => {
                    if(e.key === 'Enter') handleRename(file)
                    else if(e.key === 'Escape') rename = null;
                }}
                onblur={()=>{
                    handleRename(file)
                    rename = null
                    }}
            />
                <Button variant='default' size='sm' onclick={()=>{handleRename(file)}}>Saved</Button>
                {:else}
              <span class="flex-1 max-w-64 truncate" onclick={()=> {
                rename = file.path
                newName = file.name
            }}>{file.name} </span>
                {/if}
            </Card.Title>
            <Card.Description >
                <Badge variant='outline' class='text-muted-foreground'>
                    {formatFileSize(file.size)}
                </Badge>
                </Card.Description>
          </Card.Header>
          <Card.Content class='min-h-80 overflow-hidden'>
            <p class="line-clamp-[13] text-balance">{file.preview}</p>
          </Card.Content>
          <Card.Footer class='flex justify-between w-full border-t border-text-muted-foreground/20  '>
            <div class="flex gap-2">
                <Button variant='outline' size='sm' onclick={()=> {
                    if (file.size > THIRTY_MB_SIZE) {
                        openDefaultEditor(file.path)
                    } else {
                   openDialogCode(file)} 

                }}>
                    <Code class="h-4 w-4 mr-2" />
                    Edit
                </Button>
                <Button variant='ghost' size='sm' onclick={()=> handleOpenDir(file)}>
                    <OpenFolder class="h-4 w-4 mr-2" />
                    Open
                </Button>
            </div>
            
            <div class="flex"> 
              <Button variant='destructive' size='sm' onclick={()=> handleDelete(file)}>
                <Delete class="h-4 w-4" />
              </Button>
            </div>
          </Card.Footer>
        </Card.Root>
      {/each}
      </div>

          {#if savedFiles.length === 0} 
            <div class="text-center">
                <File class='mx-auto mb-4 text-muted-foreground size-12'/>
                <h3 class="text-lg font-medium mb-2">No files found</h3>
                <p class="text-muted-foreground">You saved files will appear when you parse them</p>
            </div>
          {/if}

          <Dialog.Root open={isCodeDialogOpen} onOpenChange={(v) => (isCodeDialogOpen = v)}>
            <Dialog.Content class="w-[80vw] h-[90vh] flex flex-col">
                <Dialog.Header>
                    <Dialog.Title class="flex items-center gap-2">
                        <Code2 class="h-5 w-5" />
                        {selectedFile?.name || 'File Content'}
                    </Dialog.Title>
                </Dialog.Header>
                
                <div class="flex-1 flex flex-col min-h-0">
                    <div class="flex justify-between items-center mb-3">
                        <Badge variant="secondary">
                            {selectedFile?.path}
                        </Badge>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onclick={()=>handleCopy(fileContent)}

                        >{#if !isCopied}
                            <Copy class="h-4 w-4 mr-2" />
                            Copy
                        {:else}
                        <Copy class="h-4 w-4 mr-2 text-green-700" />
                        <span class="text-green-700">
                            Copied
                        </span>
                        {/if}</Button>
                    </div>
                    
                    <div class="flex-1 min-h-0 border rounded-md bg-muted/50 ">
                        <textarea bind:value={fileContent} class="p-4 text-sm overflow-auto h-full w-full whitespace-pre-wrap font-mono">
                            <code>{fileContent}</code>
                        </textarea>
                    </div>
                </div>
                
                <div class="flex justify-end pt-4">
                    <Button variant="outline" onclick={() => updateFileContent(fileContent)}>
                        Save
                    </Button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
</div>


