<script lang="ts">
  import File from '@lucide/svelte/icons/file-text';
  import Card from '@/lib/components/card-file.svelte';
  import { toast } from 'svelte-sonner';
  import { invalidateAll } from '$app/navigation';
  import { deleteFile } from '$lib/tauri';

  import type { SavedFiles } from '$lib/tauri';

  let { data, children } = $props();

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
</script>

<div class="flex w-full flex-col px-10">
  <div class="mb-6">
    <h1 class="text-xl font-semibold">Saved Files</h1>
    <p class="text-muted-foreground">Manage your saved files and documents</p>
  </div>
  {#if data?.files?.length === 0}
    <div class="flex h-full w-full flex-col items-center justify-center">
      <File class=" text-muted-foreground mb-4 size-12" />
      <h3 class="mb-2 text-lg font-medium">No files found</h3>
      <p class="text-muted-foreground">You saved files will appear when you parse them</p>
    </div>
  {/if}

  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
    {#each data?.files as file (file.path)}
      <Card {file} {handleDelete} />
    {/each}
  </div>
</div>

{@render children()}
