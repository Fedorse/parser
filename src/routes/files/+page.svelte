<script lang="ts">
  import File from '@lucide/svelte/icons/file-text';
  import EditModal from '$lib/components/edit-modal.svelte';
  import CardFiles from '$lib/components/card-files.svelte';
  import { toast } from 'svelte-sonner';
  import { invalidateAll } from '$app/navigation';
  import { deleteFile, updateFile, getFileContent } from '$lib/tauri';

  import type { SavedFiles } from '$lib/tauri';

  let { data } = $props();

  let isCodeDialogOpen = $state(false);
  let fileContent = $state<string>('');
  let selectedFile = $state<SavedFiles | null>(null);

  const openDialogEditor = async (file: SavedFiles) => {
    selectedFile = file;
    isCodeDialogOpen = true;
    try {
      fileContent = await getFileContent(file);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load file content');
      fileContent = 'Error loading file content';
    }
  };

  const handleDelete = async (file: SavedFiles) => {
    try {
      await deleteFile(file);
      invalidateAll();
      toast.success('File deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete file');
    }
  };

  const updateFileContent = async (content: string) => {
    isCodeDialogOpen = false;
    try {
      await updateFile(content, selectedFile);
      toast.success('File updated successfully');
      invalidateAll();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update file content');
    }
  };
</script>

<div class="flex w-full flex-col px-10">
  <div class="mb-6">
    <h1 class="text-3xl font-bold tracking-tight">Saved Files</h1>
    <p class="text-muted-foreground">Manage your saved files and documents</p>
  </div>
  {#if data?.files?.length === 0}
    <div class="flex h-full w-full flex-col items-center justify-center">
      <File class=" text-muted-foreground mb-4 size-12" />
      <h3 class="mb-2 text-lg font-medium">No files found</h3>
      <p class="text-muted-foreground">You saved files will appear when you parse them</p>
    </div>
  {/if}

  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
    {#each data.files as file (file.path)}
      <CardFiles {file} {handleDelete} {openDialogEditor} />
    {/each}
  </div>
  <EditModal {fileContent} {selectedFile} {updateFileContent} bind:isCodeDialogOpen />
</div>
