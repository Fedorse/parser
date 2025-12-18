<script lang="ts">
  import { toast } from 'svelte-sonner';
  import { deleteFile } from '@/lib/tauri.js';
  import CardSkeleton from '@/lib/components/card-file-skeleton.svelte';
  import Files from '@lucide/svelte/icons/file-text';
  import Card from '@/lib/components/card-file.svelte';

  import type { File } from '@/lib/type.ts';

  let { data } = $props();

  let localFiles = $state<File[]>([]);

  const handleDelete = async (file: File) => {
    try {
      localFiles = localFiles.filter((f) => f.id !== file.id);
      await deleteFile(file);
      localStorage.setItem('files-count', localFiles.length.toString());
      toast.success('File deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete file');
    }
  };

  $effect(() => {
    data.files.then((files) => (localFiles = files));
  });
</script>

<div class="flex h-full w-full flex-col py-8">
  {#await data.files}
    <div
      class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
    >
      {#each Array(data.skeletonCount) as _, i (i)}
        <CardSkeleton />
      {/each}
    </div>
  {:then files}
    {#if files?.length === 0}
      <div class="flex h-full w-full flex-col items-center justify-center">
        <Files class=" text-muted-foreground mb-4 size-12 stroke-1" />
        <h3 class="mb-2 text-lg font-medium">No files found</h3>
        <p class="text-muted-foreground text-sm">You saved files will appear when you parse them</p>
      </div>
    {:else}
      <div
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
      >
        {#each localFiles as file}
          <Card {file} {handleDelete} />
        {/each}
      </div>
    {/if}
  {/await}
</div>
