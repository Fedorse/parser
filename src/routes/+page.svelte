<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { getCurrentWebview } from '@tauri-apps/api/webview';
  import { onDestroy, onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { collectSelectedPath, parsePaths, getPreviewTreeUI } from '$lib/tauri';
  import FileDialogTree from '$lib/components/file-dialog-tree.svelte';
  import * as Card from '$lib/components/ui/card';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import RecentFiles from '$lib/components/collaps-files.svelte';
  import ParseQueue from '$lib/components/card-queue.svelte';
  import { Button } from '$lib/components/ui/button/index';
  import { Spinner } from '$lib/components/ui/spinner/index.js';

  import type { FileTree, DragEventPayload } from '$lib/type';

  let { data } = $props();

  let filesTreeNodes = $state<FileTree[]>([]);

  let isDialogOpen = $state(false);
  let isDragging = $state(false);
  let isLoadingPreview = $state(false);

  let unlistenDrag: () => void;

  const handleDroppedFiles = async (paths: string[]) => {
    if (paths.length === 0) return;

    try {
      isLoadingPreview = true;
      filesTreeNodes = await getPreviewTreeUI(paths);
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
      await parsePaths(paths);
      toast.success('Parse successfully completed');
    } catch (err) {
      console.error(err);
      toast.error('Parse failed');
    }
  };

  const handleOpenFiles = async () => {
    const selected = await open({ multiple: true, directory: true });

    if (!selected) return;

    try {
      isLoadingPreview = true;
      filesTreeNodes = await getPreviewTreeUI(selected);

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
          'w-full rounded-2xl border border-dashed  text-center transition-all ': true,
          'border-border border-[1.5px]': !isDragging,
          'bg-input border-highlight ring-primary/40 ring-2': isDragging,
          'p-0': isLoadingPreview,
          'p-10': !isLoadingPreview
        }}
      >
        <div class="">
          {#if isDragging}
            <div class="flex flex-col items-center gap-2">
              <div class="mb-1 text-7xl leading-none">📂</div>
            </div>
          {:else if isLoadingPreview}
            {@render loadingTree()}
          {:else}
            <div class="flex flex-col items-center gap-2">
              <div class="mb-1 text-7xl leading-none">📁</div>
            </div>
          {/if}
        </div>
      </div>
    </Card.Content>

    <ParseQueue />
    <div class="border-border border-t px-6 pt-4">
      <RecentFiles files={data.recentFiles} />
    </div>
  </Card.Root>

  {#if filesTreeNodes.length > 0}
    <FileDialogTree
      filesTree={filesTreeNodes}
      bind:open={isDialogOpen}
      onParse={parseSelectedNodes}
    />
  {/if}
</main>

{#snippet loadingTree()}
  <Empty.Root class="w-full">
    <Empty.Header>
      <Empty.Media variant="default">
        <Spinner size="6" />
      </Empty.Media>
      <Empty.Title>Processing files.</Empty.Title>
      <Empty.Description>Please wait while we process scanning files.</Empty.Description>
    </Empty.Header>
  </Empty.Root>
{/snippet}
