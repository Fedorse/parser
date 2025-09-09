<script lang="ts">
  // --- существующие импорты / логика ---
  import { open } from '@tauri-apps/plugin-dialog';
  import { Button } from '$lib/components/ui/button/index';
  import { invoke } from '@tauri-apps/api/core';
  import { getCurrentWebview } from '@tauri-apps/api/webview';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import FileDialogTree from '$lib/components/file-dialog-tree.svelte';

  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
  } from '$lib/components/ui/card';
  import { Separator } from '$lib/components/ui/separator';
  import { Badge } from '$lib/components/ui/badge';

  import { FolderOpen, FileUp, Play, Settings2, BarChart3 } from '@lucide/svelte';

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
      if (node.type === 'Directory' && node.children) {
        selectAllNodes(node.children);
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

  // --- заглушки для блока Recent ---
  const recentSources = [
    { path: '/Users/you/projects/app', time: 'Today, 12:04' },
    { path: '/Users/you/Desktop/data', time: 'Yesterday, 18:22' },
    { path: 'README.md', time: 'Aug 31, 14:10' }
  ];
</script>

<div class="min-h-screen w-full items-center">
  <!-- Header -->
  <div class="mb-6 flex items-center justify-between gap-3">
    <div class="flex items-center gap-3">
      <h1 class="text-xl font-semibold tracking-tight">Parser</h1>
      <span class="text-muted-foreground text-sm">v0.1 (UI-only)</span>
    </div>
  </div>

  <Card class="md:col-span-2 xl:col-span-3 border-border bg-card/30 max-w-6xl w-full">
    <CardHeader class="pb-3">
      <CardTitle class="text-lg">Quick Start</CardTitle>
      <CardDescription>
        Drag & drop or choose a source. All files are pre-selected by default.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div
        class={{
          ' w-full rounded-2xl p-6 transition-all': true,
          'ring-2 ring-primary/40': isDragging,
          'opacity-60 pointer-events-none select-none animate-pulse': isLoading
        }}
      >
        <div class={{ 'font-mono text-sm text-muted-foreground': true }}>
          <div class={{ 'mt-4 text-foreground text-lg': true }}>
            {isDragging ? '➜ release to add' : '➜ drag & drop here'}
          </div>

          <div class={{ 'mt-6 flex flex-wrap gap-2': true }}>
            <Button variant="outline" onclick={() => handleOpenFiles(false)} disabled={isLoading}>
              <FileUp class="mr-2 size-4" />
              {isLoading ? '…' : 'Choose files'}
            </Button>
            <Button variant="outline" onclick={() => handleOpenFiles(true)} disabled={isLoading}>
              <FolderOpen class="mr-2 size-4" />
              {isLoading ? '…' : 'Choose folder'}
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <div class="mt-8">
    <Card class="border-border bg-card/30">
      <CardHeader class="pb-2">
        <CardTitle class="text-lg">Recent Sources</CardTitle>
        <CardDescription>Quick access</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        {#each recentSources as r}
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="truncate text-sm font-medium">{r.path}</div>
              <div class="text-xs text-muted-foreground">{r.time}</div>
            </div>
            <Button size="sm" variant="outline">Open</Button>
          </div>
        {/each}
      </CardContent>
      <CardFooter>
        <Button variant="outline" class="w-full">Show all</Button>
      </CardFooter>
    </Card>
  </div>

  <!-- Диалог дерева (твой) -->
  {#if filesTreeNodes.length > 0}
    <FileDialogTree {filesTreeNodes} bind:open={isDialogOpen} onParse={parseSelectedNodes} />
  {/if}
</div>
