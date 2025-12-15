<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { getCurrentWebview } from '@tauri-apps/api/webview';
  import { uniq } from 'es-toolkit';
  import { onDestroy, onMount } from 'svelte';
  import { invalidate } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { gitRepoSchema } from '$lib/shemas';
  import FileDialogTree from '$lib/components/file-dialog-tree.svelte';
  import * as Card from '$lib/components/ui/card';
  import RecentFiles from '$lib/components/collaps-files.svelte';
  import { Button } from '$lib/components/ui/button/index';
  import {
    Folder,
    FolderOpen,
    Github,
    InfoIcon,
    Upload,
    HardDrive,
    CornerDownLeft,
    CircleX
  } from '@lucide/svelte';
  import CubeLoader from '@/lib/components/cube-loader.svelte';
  import { parseQueue } from '@/lib/state-utils/store-parse-queue.svelte';
  import { getPreviewTreeNodes, parseNodes, parseGitRepo } from '@/lib/tauri';
  import { collectSelectedPathsRecursive } from '@/lib/utils/utils';
  import * as InputGroup from '$lib/components/ui/input-group/index.js';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';

  import type { FileTree, DragEventPayload } from '$lib/type';

  import { fade } from 'svelte/transition';

  let { data } = $props();

  let filesTreeNodes = $state<FileTree[]>([]);

  let isDialogOpen = $state(false);
  let isDragging = $state(false);
  let isLoadingPreview = $state(false);
  let repoUrl = $state('');
  let isCloning = $state(false);
  let activeTab = $state<'local' | 'remote'>('local');
  let repoError = $state<string | null>(null);

  let unlistenDrag: () => void;

  const handleDroppedFiles = async (paths: string[]) => {
    if (paths.length === 0) return;
    const uniquePaths = uniq(paths);
    try {
      isLoadingPreview = true;
      filesTreeNodes = await getPreviewTreeNodes(uniquePaths);
      isDialogOpen = true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to open selected file');
    } finally {
      isLoadingPreview = false;
    }
  };

  const parseSelectedNodes = async () => {
    const paths = collectSelectedPathsRecursive(filesTreeNodes);
    if (paths.length === 0) {
      toast.error('No files selected');
      return;
    }

    isDialogOpen = false;
    filesTreeNodes = [];

    try {
      parseQueue.addPendingRequest();
      await parseNodes(paths);
      invalidate('app:recent-files');
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
      filesTreeNodes = await getPreviewTreeNodes(selectedPaths);
      isDialogOpen = true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to open selected file');
    } finally {
      isLoadingPreview = false;
    }
  };

  const handleCloneRepo = async () => {
    repoError = null;
    const inputRaw = repoUrl.trim();
    if (!inputRaw) return;

    const result = gitRepoSchema.safeParse(inputRaw);

    if (!result.success) {
      repoError = result.error.issues[0]?.message ?? 'Invalid URL';
      return;
    }
    const validUrl = result.data;

    isCloning = true;
    isLoadingPreview = true;
    try {
      const tempPath = await parseGitRepo(validUrl);

      const res = await getPreviewTreeNodes([tempPath]);
      isDialogOpen = true;
      filesTreeNodes = res;
      repoUrl = '';
    } catch (e) {
      console.error('Clone failed:', e);
      toast.error('Repository not found or invalid URL');
    } finally {
      isLoadingPreview = false;
      isCloning = false;
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
  const onInput = () => {
    if (repoError) repoError = null;
  };

  onMount(() => {
    initDragAndDrop();
  });

  onDestroy(() => {
    if (unlistenDrag) unlistenDrag();
  });
</script>

<div
  class="flex w-full flex-col items-center gap-4 overflow-y-auto pt-6 sm:pt-8 md:pt-10 lg:pt-24 xl:pt-32 2xl:pt-40
"
>
  <Tabs.Root bind:value={activeTab} class="flex w-full items-center">
    <Card.Root class="bg-card/20 w-full max-w-5xl justify-between py-8" data-tauri-drag-region>
      <Card.Header class="flex justify-between">
        <div class="flex flex-col gap-2">
          <Card.Title>
            <p>Quick Start</p>
          </Card.Title>

          <Card.Description>
            {#if activeTab === 'local'}
              <p>Drag & drop or choose a source. All files are pre-selected by default.</p>
            {:else}
              <p>Enter a repository URL to clone and parse the project structure.</p>
            {/if}
          </Card.Description>
        </div>

        {@render controls()}
      </Card.Header>
      <Card.Content class="relative grid h-48 w-full grid-cols-1 grid-rows-1 overflow-hidden">
        {#if activeTab === 'local'}
          <div
            class="col-start-1 row-start-1 h-full w-full"
            in:fade={{ duration: 250, delay: 100 }}
            out:fade={{ duration: 150 }}
          >
            {@render local()}
          </div>
        {:else}
          <div
            class="col-start-1 row-start-1 h-full w-full"
            in:fade={{ duration: 250, delay: 100 }}
            out:fade={{ duration: 150 }}
          >
            {@render gitHub()}
          </div>
        {/if}
      </Card.Content>

      <div class="border-border border-t px-6 pt-4">
        <RecentFiles files={data.recentFiles} />
      </div>
    </Card.Root>
  </Tabs.Root>

  {#if filesTreeNodes.length > 0}
    <FileDialogTree
      bind:filesTree={filesTreeNodes}
      bind:open={isDialogOpen}
      onParse={parseSelectedNodes}
    />
  {/if}
</div>

{#snippet gitHub()}
  <div class="border-border flex h-full w-full items-center justify-center rounded-2xl border">
    <div class="w-full max-w-md space-y-2">
      <div>
        <span class="text-muted-foreground text-sm"> Repository URL </span>
      </div>

      <InputGroup.Root
        class=" bg-transparent!
                      transition-colors
                      focus-within:border-blue-900
                      focus-within:ring-0!
                      focus-within:ring-offset-0!
                      hover:border-blue-900!"
      >
        <InputGroup.Addon>
          <Github />
        </InputGroup.Addon>
        <InputGroup.Input
          placeholder="https://github.com/user/repo"
          id="repo-url"
          bind:value={repoUrl}
          onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleCloneRepo()}
          oninput={onInput}
        />
        <InputGroup.Addon align="inline-end">
          {#if isCloning}
            <CubeLoader size="16px" variant="default" />
          {:else}
            <button
              onclick={handleCloneRepo}
              disabled={!repoUrl}
              class="bg-muted/50 text-muted-foreground hover:bg-foreground hover:text-background flex size-6 items-center justify-center rounded-sm border transition-all disabled:opacity-30"
              title="Press Enter to Clone"
            >
              <CornerDownLeft class="size-3.5 stroke-1" />
            </button>
          {/if}
        </InputGroup.Addon>
      </InputGroup.Root>

      <div class="flex items-center gap-2">
        {#if repoError}
          <div
            class="text-destructive animate-in slide-in-from-left-1 fade-in flex items-center gap-2 duration-200"
          >
            <CircleX class="size-3.5 stroke-1" />
            <p class="text-[10px] font-medium">{repoError}</p>
          </div>
        {:else}
          <InfoIcon class="text-muted-foreground size-3 stroke-1" />
          <p class="text-muted-foreground text-[10px]">
            Supports GitHub, GitLab, and standard .git repositories.
          </p>
        {/if}
      </div>
    </div>
  </div>
{/snippet}

{#snippet local()}
  <div
    class={{
      'h-full min-h-48 w-full rounded-2xl border  border-dashed text-center transition-all': true,
      'border-border border-[1.5px]': !isDragging,
      'bg-card/40 border-highlight ring-primary/40 ring-2': isDragging
    }}
  >
    <div class="flex h-full w-full items-center justify-center">
      {#if isLoadingPreview}
        {@render loadingTree()}
      {:else}
        <div class="group flex flex-col items-center justify-center">
          <button
            onclick={handleOpenFiles}
            class="bg-muted/30 group-hover:bg-muted rounded-full p-4 transition-all duration-300 group-hover:scale-110"
          >
            {#if isDragging}
              <FolderOpen class="text-primary size-16 stroke-1" />
            {:else}
              <Folder
                class="text-muted-foreground/80 group-hover:text-foreground size-12 stroke-1 transition-colors"
              />
            {/if}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet loadingTree()}
  <div
    class="animate-in fade-in zoom-in-95 flex h-full w-full flex-col items-center justify-center py-6 duration-300"
  >
    <CubeLoader class="h-full w-full" size="32px" variant="default" />

    <div class="flex flex-col items-center gap-1 pt-6 text-center">
      <h3 class="text-foreground text-sm font-semibold tracking-tight">
        {'Scanning Directory Structure...'}
      </h3>
      <p class="text-muted-foreground max-w-[260px] text-xs">
        {'Large directories may take a moment.'}
      </p>
    </div>
  </div>
{/snippet}

{#snippet controls()}
  <div class="flex items-center gap-1 rounded-lg border p-1 shadow-sm">
    <Button
      variant="ghost"
      size="sm"
      class="hover:bg-background animate-in slide-in-from-left-2 fade-in h-8 min-w-24 px-3 text-xs hover:shadow-sm"
      onclick={activeTab === 'local' ? handleOpenFiles : handleCloneRepo}
      disabled={isLoadingPreview || (activeTab === 'remote' && !repoUrl)}
    >
      <Upload class="mr-1 size-3.5" />
      {activeTab === 'local' ? 'Upload' : 'Clone'}
    </Button>
    <div class="bg-border animate-in fade-in zoom-in-95 mx-1 h-4 w-[1px]"></div>

    <Tabs.List class="h-8 bg-transparent p-0">
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Tabs.Trigger
            value="remote"
            class="data-[state=active]:bg-background h-8 px-3 text-xs data-[state=active]:shadow-sm"
          >
            <Github class="start-1 size-4" />
          </Tabs.Trigger>
        </Tooltip.Trigger>

        <Tooltip.Content>Remote repository</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Tabs.Trigger
            value="local"
            class=" h-8 px-3 text-xs data-[state=active]:shadow-sm"
            title="System"
          >
            <HardDrive class="start-1 size-4" />
          </Tabs.Trigger>
        </Tooltip.Trigger>

        <Tooltip.Content>System files</Tooltip.Content>
      </Tooltip.Root>
    </Tabs.List>
  </div>
{/snippet}
