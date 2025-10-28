<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { getCurrentWebview } from '@tauri-apps/api/webview';
  import { onDestroy, onMount } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { collectSelectedPath, parsePaths, getPreviewTreeUI } from '$lib/tauri';
  import { Button } from '$lib/components/ui/button/index';
  import * as Card from '$lib/components/ui/card';
  import FileDialogTree from '$lib/components/file-dialog-tree.svelte';
  import RecentFiles from '$lib/components/collaps-files.svelte';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import type { FileTree } from '$lib/type';

  type DragEventPayload = {
    type: 'over' | 'drop' | 'leave' | 'enter';
    position: { x: number; y: number };
    paths: string[];
  };

  let { data } = $props();

  let filesTreeNodes = $state<FileTree[]>([]);

  let isDialogOpen = $state(false);
  let isDragging = $state(false);
  let isLoading = $state(false);
  let unlistenDrag: () => void;

  const handleDroppedFiles = async (paths: string[]) => {
    if (paths.length === 0) return;
    try {
      filesTreeNodes = await getPreviewTreeUI(paths);
      isDialogOpen = true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to load preview tree');
    }
  };

  const parseSelectedNodes = async () => {
    const paths = collectSelectedPath(filesTreeNodes);
    if (paths.length === 0) return;
    isLoading = true;
    try {
      await parsePaths(paths);
      filesTreeNodes = [];
      invalidateAll();
      toast.success('Parse completed successfully');
    } catch (err) {
      console.error(err);
      toast.error('Parse failed');
    } finally {
      isLoading = false;
    }
  };

  const handleOpenFiles = async () => {
    const selected = await open({ multiple: true, directory: true });

    if (!selected) return;
    isLoading = true;
    try {
      filesTreeNodes = await getPreviewTreeUI(selected);
      isDialogOpen = true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to open selected paths');
    } finally {
      isLoading = false;
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
  <Card.Root class="bg-card/20  w-full max-w-5xl justify-between pt-6 pb-4">
    <Card.Header class="flex justify-between">
      <div class="flex flex-col gap-2">
        <Card.Title>Quick Start</Card.Title>
        <Card.Description>
          Drag & drop or choose a source. All files are pre-selected by default.
        </Card.Description>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button variant="default" onclick={handleOpenFiles} disabled={isLoading}>
          {isLoading ? '…' : 'Upload files'}
        </Button>
      </div>
    </Card.Header>
    <Card.Content class="py-4">
      <div
        class={{
          ' w-full rounded-2xl border border-dashed p-8 text-center transition-all sm:p-10': true,
          ' border-border border-[1.5px]': !isDragging && !isLoading,
          'bg-input border-highlight ring-primary/40 ring-2': isDragging,
          'border-highlight animate-pulse select-none': isLoading
        }}
      >
        <div class="">
          {#if isDragging}
            <div class="flex flex-col items-center gap-2">
              <div class="mb-1 text-7xl leading-none">📂</div>
              <p>Drop files here to parse</p>
            </div>
          {:else if isLoading}
            <div class="flex h-20 flex-col items-center justify-center gap-2">
              <p>Parsing...</p>
              <Progress value={50} />
            </div>
          {:else}
            <div class="flex flex-col items-center gap-2">
              <div class="mb-1 text-7xl leading-none">📁</div>
            </div>
          {/if}
        </div>
      </div>
    </Card.Content>
    <div class="border-border border-t px-6 pt-4">
      <RecentFiles limit={3} files={data.recentFiles} />
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
