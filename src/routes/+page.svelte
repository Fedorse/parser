<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { getCurrentWebview } from '@tauri-apps/api/webview';
  import { uniq } from 'es-toolkit';
  import { onDestroy, onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { collectSelectedPath, parsePaths, getPreviewTreeUI } from '$lib/tauri';
  import FileDialogTree from '$lib/components/file-dialog-tree.svelte';
  import * as Card from '$lib/components/ui/card';
  import RecentFiles from '$lib/components/collaps-files.svelte';
  import { Button } from '$lib/components/ui/button/index';
  import { Folder, FolderOpen } from '@lucide/svelte';
  import CubeLoader from '@/lib/components/cube-loader.svelte';
  import { parseQueue } from '@/lib/state-utils/store-parse-queue.svelte';

  import type { FileTree, DragEventPayload } from '$lib/type';

  let { data } = $props();

  let filesTreeNodes = $state<FileTree[]>([]);

  let isDialogOpen = $state(false);
  let isDragging = $state(false);
  let isLoadingPreview = $state(false);

  let unlistenDrag: () => void;

  const handleDroppedFiles = async (paths: string[]) => {
    if (paths.length === 0) return;
    const uniquePaths = uniq(paths);
    try {
      isLoadingPreview = true;
      filesTreeNodes = await getPreviewTreeUI(uniquePaths);
      isDialogOpen = true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to open selected file');
    } finally {
      isLoadingPreview = false;
    }
  };

  const parseSelectedNodes = async () => {
    const paths = collectSelectedPath(filesTreeNodes);
    if (paths.length === 0) {
      toast.error('No files selected');
      return;
    }

    isDialogOpen = false;
    filesTreeNodes = [];

    try {
      parseQueue.addPendingRequest();
      await parsePaths(paths);
    } catch (err) {
      console.error(err);
      toast.error('Parse failed');
    }
  };

  const handleOpenFiles = async () => {
    const selectedPaths = await open({ multiple: true, directory: true });

    if (!selectedPaths) return;

    try {
      isLoadingPreview = true;
      filesTreeNodes = await getPreviewTreeUI(selectedPaths);
      isDialogOpen = true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to open selected file');
    } finally {
      isLoadingPreview = false;
    }
  };

  const initDragAndDrop = async () => {
    try {
      const webview = await getCurrentWebview();
      unlistenDrag = await webview.onDragDropEvent((event) => {
        const { type, paths } = event.payload as DragEventPayload;
        switch (type) {
          case 'enter':
            isDragging = true;
            break;
          case 'leave':
            isDragging = false;
            break;
          case 'drop':
            isDragging = false;
            handleDroppedFiles(paths);
            break;
          default:
            console.warn(`Unknown drag event type: ${type}`);
        }
      });
    } catch (error) {
      console.error('Failed to initialize drag and drop:', error);
    }
  };

  onMount(() => {
    initDragAndDrop();
  });

  onDestroy(() => {
    if (unlistenDrag) unlistenDrag();
  });
</script>

<main class="flex w-full flex-col items-center gap-4 pt-4 md:pt-8 xl:pt-28 2xl:pt-32">
  <Card.Root class="bg-card/20 w-full max-w-5xl justify-between pt-6 pb-4">
    <Card.Header class="flex justify-between">
      <div class="flex flex-col gap-2">
        <Card.Title>
          <p>Quick Start</p>
        </Card.Title>

        <Card.Description>
          <p>Drag & drop or choose a source. All files are pre-selected by default.</p>
        </Card.Description>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button
          variant="default"
          onclick={handleOpenFiles}
          disabled={isLoadingPreview}
          class="cursor-pointer"
        >
          Upload files
        </Button>
      </div>
    </Card.Header>
    <Card.Content class="py-4">
      <div
        class={{
          'h-48 w-full rounded-2xl border  border-dashed text-center transition-all ': true,
          'border-border border-[1.5px]': !isDragging,
          'bg-card/40 border-highlight ring-primary/40 ring-2': isDragging
        }}
      >
        <div
          class="animate-in fade-in zoom-in-95 flex h-full w-full flex-col items-center justify-center gap-8 py-6 duration-300"
        >
          {#if isLoadingPreview}
            {@render loadingTree()}
          {:else}
            <div class="group flex flex-col items-center transition-all">
              <button
                onclick={handleOpenFiles}
                class="bg-muted/30 group-hover:bg-muted rounded-full p-4 transition-all duration-300 group-hover:scale-110"
              >
                {#if isDragging}
                  <FolderOpen class="text-primary size-16 stroke-1" />
                {:else}
                  <Folder
                    class="text-muted-foreground/80 group-hover:text-foreground size-12 transition-colors"
                  />
                {/if}
              </button>
            </div>
          {/if}
        </div>
      </div>
    </Card.Content>

    <div class="border-border border-t px-6 pt-4">
      <RecentFiles files={data.recentFiles} />
    </div>
  </Card.Root>

  {#if filesTreeNodes.length > 0}
    <FileDialogTree
      bind:filesTree={filesTreeNodes}
      bind:open={isDialogOpen}
      onParse={parseSelectedNodes}
    />
  {/if}
</main>

{#snippet loadingTree()}
  <div
    class="animate-in fade-in zoom-in-95 flex h-full w-full flex-col items-center justify-center py-6 duration-300"
  >
    <CubeLoader class="h-full w-full" size="32px" variant="default" />

    <div class="flex flex-col items-center gap-1 pt-6 text-center">
      <h3 class="text-foreground text-sm font-semibold tracking-tight">
        Scanning Directory Structure...
      </h3>
      <p class="text-muted-foreground max-w-[260px] text-xs">
        Large directories may take a moment.
      </p>
    </div>
  </div>
{/snippet}
