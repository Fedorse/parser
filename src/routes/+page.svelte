<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { Button } from '$lib/components/ui/button/index';
  import FolderInput from '@lucide/svelte/icons/folder-input';
  import { invoke } from '@tauri-apps/api/core';
  import { getCurrentWebview } from '@tauri-apps/api/webview';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import FileDialogTree from '$lib/components/file-dialog-tree.svelte';

  type DragEventPayload = {
    type: 'over' | 'drop' | 'leave' | 'enter';
    position: { x: number; y: number };
    paths: string[];
  };
  type FileTreeNode = {
    name: string;
    path: string;
    type: 'File' | 'Directory';
    selected?: true;
    children?: FileTreeNode[];
  };

  let filesTreeNodes = $state<FileTreeNode[]>([]);

  let isDialogOpen = $state(true);
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
      if (unlistenDrag) {
        unlistenDrag();
      }
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

    if (paths.length === 0) return;
    isLoading = true;
    try {
      await invoke('parse', { paths });
      toast.success('Parse completed successfully');
      isDialogOpen = false;
      filesTreeNodes = [];
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
      const tree = await invoke<FileTreeNode[]>('get_preview_tree', {
        paths: selected
      });
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

<main class="flex flex-col items-center justify-center w-full">
  <div
    class={{
      'bg-card p-4 rounded-sm ': true,
      '': isDragging
    }}
  >
    <div
      class={{
        'border border-border border-dashed flex flex-col items-center justify-center rounded-sm w-2xl h-96': true,
        'border-highlight  bg-input': isDragging,
        'bg-muted': !isDragging,
        'animate-pulse border-highlight ': isLoading
      }}
    >
      {#if isDragging}
        <div class="text-center">
          <div class="text-7xl mb-2">📂</div>
          <p class="text-xl font-medium text-accent-foreground">Drop files here to parse</p>
          <p class="text-sm text-card-foreground">Release to select files</p>
        </div>
      {:else}
        <div class="text-center">
          <div class="text-7xl mb-2">📁</div>
          <p class="text-xl">Drag and drop files here</p>
          <p class="text-sm text-card-foreground mt-1">or use the button below</p>
        </div>
      {/if}

      <div
        class={{
          'pt-6 transition-opacity duration-200': true,
          'opacity-0 pointer-events-none': isDragging,
          'opacity-100': !isDragging
        }}
      >
        <Button variant="outline" onclick={() => handleOpenFiles(true)}>
          {#if isLoading}
            <div class="flex items-center gap-2">
              <span class="text-sm">Uploading files...</span>
            </div>
          {:else}
            <FolderInput class="mr-2 size-5" />
            Upload Files
          {/if}
        </Button>
      </div>
    </div>
  </div>
  {#if filesTreeNodes.length > 0}
    <FileDialogTree {filesTreeNodes} bind:open={isDialogOpen} onParse={parseSelectedNodes} />
  {/if}
</main>
