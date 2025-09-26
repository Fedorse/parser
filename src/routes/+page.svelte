<script lang="ts" context="module">
  export type FileTreeNode = {
    name: string;
    path: string;
    type: 'File' | 'Directory';
    selected?: boolean;
    children?: FileTreeNode[];
  };

  export type DragEventPayload = {
    type: 'over' | 'drop' | 'leave' | 'enter';
    position: { x: number; y: number };
    paths: string[];
  };

  export type SavedFiles = { name: string; path: string; preview: string; size: number };
</script>

<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { Button } from '$lib/components/ui/button/index';
  import { invoke } from '@tauri-apps/api/core';
  import { getCurrentWebview } from '@tauri-apps/api/webview';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import FileDialogTree from '$lib/components/file-dialog-tree.svelte';
  import RecentFiles from '$lib/components/collaps-files.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();

  let filesTreeNodes = $state<FileTreeNode[]>([]);

  let isDialogOpen = $state(false);
  let isDragging = $state(false);
  let isLoading = $state(false);

  let unlistenDrag: () => void;
  onMount(async () => {
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
    return () => {
      if (unlistenDrag) unlistenDrag();
    };
  });

  const handleDroppedFiles = async (paths: string[]) => {
    try {
      if (paths.length === 0) return;
      const tree = await invoke<FileTreeNode[]>('get_preview_tree', { paths });
      selectAllNodes(tree);
      filesTreeNodes = tree;
      isDialogOpen = true;
    } catch (err) {
      console.error('Failed to prosses dropped files:', err);
    }
  };

  const selectAllNodes = (nodes: FileTreeNode[]) => {
    for (const node of nodes) {
      node.selected = true;
      if (node.type === 'Directory' && node.children) selectAllNodes(node.children);
    }
  };

  const parseSelectedNodes = async () => {
    const paths = collectSelectedPath(filesTreeNodes);
    if (paths.length === 0) return;
    isLoading = true;
    try {
      await invoke('parse', { paths });
      toast.success('Parse completed successfully');
      filesTreeNodes = [];
      invalidateAll();
    } catch (err) {
      console.error('Parse failed:', err);
      toast.error('Parse failed');
    } finally {
      isLoading = false;
    }
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
  };

  const handleOpenFiles = async (selectDir: boolean) => {
    const selected = await open({ multiple: true, directory: selectDir });
    if (!selected) return;
    isLoading = true;
    try {
      const tree = await invoke<FileTreeNode[]>('get_preview_tree', { paths: selected });
      selectAllNodes(tree);
      filesTreeNodes = tree;
      isDialogOpen = true;
    } catch (err) {
      console.error('Parse failed:', err);
    } finally {
      isLoading = false;
    }
  };
</script>

<main class="flex w-full flex-col items-center gap-4 pt-4 md:pt-8 xl:pt-28 2xl:pt-32">
  <Card.Root class="bg-card/40  w-full max-w-5xl justify-between pt-6 pb-4">
    <Card.Header class="flex justify-between">
      <div class="flex flex-col gap-2">
        <Card.Title>Quick Start</Card.Title>
        <Card.Description>
          Drag & drop or choose a source. All files are pre-selected by default.
        </Card.Description>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button variant="default" onclick={() => handleOpenFiles(true)} disabled={isLoading}>
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
    <FileDialogTree {filesTreeNodes} bind:open={isDialogOpen} onParse={parseSelectedNodes} />
  {/if}
</main>
