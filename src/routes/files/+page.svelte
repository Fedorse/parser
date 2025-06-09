<script lang="ts">
    import {invoke} from '@tauri-apps/api/core';
    import * as Card from "$lib/components/ui/card/index.js";
    import {Button} from '$lib/components/ui/button/index'
    import Delete from '@lucide/svelte/icons/trash-2'
    import OpenFolder from '@lucide/svelte/icons/folder-open-dot'
    import File from '@lucide/svelte/icons/file-text'
    type SavedFiles = {
        name: string;
        path: string;
        preview: string;
        size: number;
    };
    let savedFiles = $state<SavedFiles[]>([])


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
    const handleRename = async (file: SavedFiles, newName: string) => {
        try {
            await invoke('rename_file', { filePath: file.path, newName: newName })
            loadFiles()
        } catch (err) {
            console.error('Failed to rename file:', err);
        }
    }

    $effect(() => {
        loadFiles()
    })

</script>

<div class="continer mx-auto p-6">
    <div class="mb-6">
        <h1 class="text-3xl font-bold tracking-tight">Saved Files</h1>
        <p class="text-muted-foreground">Manage your saved files and documents</p>
    </div>
    <div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
        {#each savedFiles as file (file.path)}
        <Card.Root class='max-w-sm'>
          <Card.Header>
            <Card.Title>
                {file.name}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <p class="line-clamp-[10]">{file.preview}</p>
          </Card.Content>
          <Card.Footer>
            <div class="flex justify-between w-full"> 
              <Button variant='link' class=size-4 onclick={()=> handleOpenDir(file)}><OpenFolder/></Button>
              <Button variant='link' onclick={()=> handleDelete(file)}><Delete/></Button>
            </div>
          </Card.Footer>
        </Card.Root>
      {/each}
      </div>
      {#if savedFiles.length === 0} 
        <div class="text-center py-12">
            <File class='mx-auto mb-4 text-muted-foreground size-12'/>
            <h3 class="text-lg font-medium mb-2">No files found</h3>
            <p class="text-muted-foreground">You saved files will appear when you parse them</p>
        </div>
      {/if}
</div>


