<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { toast } from 'svelte-sonner';
  import {
    updateFile,
    renameFile,
    openDefaultEditor,
    openFileInfolder,
    getFileContent,
    getFileDetail
  } from '$lib/tauri';
  import { formatFileSize } from '@/lib/utils/utils';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Kbd from '$lib/components/ui/kbd/index.js';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import MonacoEditor from '$lib/components/monaco-editor/monaco-editor.svelte';
  import ConfirmDialog from '$lib/components/confirm-dialog.svelte';
  import { Route, Code, Copy, FolderOpen } from '@lucide/svelte/icons';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton';

  let { fileId, searchPath, onClose } = $props();

  import type { FileDetail } from '@/lib/type.ts';

  const THIRTY_MB_SIZE = 30 * 1024 * 1024;

  let file = $state<FileDetail | null>(null);
  let rename = $state<string>('');
  let snapshot = $state<string>('');
  let value = $state<string>('');
  let isOpen = $state(true);
  let confirmOpen = $state(false);
  let isMetaLoading = $state(false);
  let isContentLoading = $state(false);
  let inputEl = $state<HTMLInputElement | null>(null);

  const isTainted = $derived(value !== snapshot);
  const isLargeFile = $derived(file ? file.metadata.total_size > THIRTY_MB_SIZE : false);

  const saveContent = async () => {
    try {
      await updateFile(value, file);
      snapshot = value;
      toast.success('File updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update file content');
    }
  };

  const closeModal = async () => {
    confirmOpen = false;
    isOpen = false;
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isTainted) {
      confirmOpen = true;
      isOpen = true;
    } else {
      closeModal();
    }
  };

  const saveAndClose = async () => {
    await saveContent();
    closeModal();
  };

  const onRenameKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputEl?.blur();
    } else if (e.key === 'Escape') {
      if (!file) return;
      e.preventDefault();
      e.stopPropagation();
      rename = file.metadata.name;
      inputEl?.blur();
    }
  };

  const loadFile = async () => {
    isMetaLoading = true;
    isContentLoading = false;
    try {
      isMetaLoading = true;
      const detail = await getFileDetail(fileId);
      if (!detail) {
        toast.error('File not found');
        onClose();
        return;
      }
      file = detail;
      rename = detail.metadata.name;
    } catch (e) {
      console.error('Failed to load file:', e);
      toast.error('Failed to load file');
      onClose();
      return;
    } finally {
      isMetaLoading = false;
    }

    if (!file || file.metadata.total_size > THIRTY_MB_SIZE) {
      return;
    }

    if (file && file.metadata.total_size <= THIRTY_MB_SIZE) {
      try {
        isContentLoading = true;
        const content = await getFileContent(file);
        value = content;
        snapshot = content;
      } catch (err) {
        console.error('Failed to load file content:', err);
      } finally {
        isContentLoading = false;
      }
    }
  };

  const handleRename = async () => {
    if (!file || rename === file.name) return;
    try {
      await renameFile(file, rename.trim());
      await invalidate('app:files');

      toast.success('Renamed file');
    } catch (e) {
      console.error(e);
      toast.error('Rename failed');
      rename = file.name;
    }
  };

  const openEditor = async (file: FileDetail) => {
    if (!file) return;
    try {
      await openDefaultEditor(file);
    } catch (err) {
      console.error('Failed to open file in editor:', err);
    }
  };
  const handleOpenDir = async (file: FileDetail) => {
    if (!file) return;
    try {
      await openFileInfolder(file);
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copied to clipboard');
    } catch (e) {
      console.error(e);
      toast.error('Copy failed');
    }
  };

  $effect(() => {
    const state = page.state;
    if (state.focus === 'rename' && inputEl) {
      inputEl?.focus();
      inputEl?.setSelectionRange(inputEl.value.length, inputEl.value.length);
    }
  });
  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        if (!isLargeFile && isTainted) saveContent();
      }
    };

    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  });

  onMount(async () => {
    loadFile();
  });
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={handleOpenChange}>
  <Dialog.Content class=" flex h-[90vh] w-[90vw] flex-col gap-0 pb-0">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2 ">
        {#if isMetaLoading}
          <Skeleton class="h-9 w-7 rounded" />
          <Skeleton class="h-9 w-80 rounded" />
        {:else}
          <Code class="text-muted-foreground size-4" />
          <Input
            bind:value={rename}
            onblur={handleRename}
            class="max-w-[30vw] border border-transparent bg-transparent! text-lg! hover:border-blue-900! focus-visible:border-blue-900 focus-visible:ring-0"
            onkeydown={onRenameKeydown}
            bind:ref={inputEl}
            tabindex={page.state.focus ? 0 : -1}
          />
        {/if}
      </Dialog.Title>
    </Dialog.Header>

    <div class="flex min-h-0 flex-1 flex-col">
      <div class="mb-2 flex items-center justify-between">
        <div class="flex items-center gap-2 pt-3">
          {#if isMetaLoading}
            <Skeleton class="h-5 w-[355px] rounded" />
          {:else}
            <Badge variant="outline" class="max-w-lg truncate font-mono text-xs">
              <Route class="text-muted-foreground size-4 " />
              <!-- {data.file?.directory_path} -->
              /Users/ivans/work/parser-ai/src-tauri/src/consts.rs
            </Badge>
          {/if}

          {#if isLargeFile}
            <Badge variant="secondary" class="text-warn">Large file</Badge>
          {/if}
        </div>

        {#if !isLargeFile}
          {@render controls()}
        {/if}
      </div>

      <div class="min-h-0 flex-1 overflow-hidden rounded-md border">
        {#if isLargeFile}
          {@render largFileContent()}
        {:else if isContentLoading || isMetaLoading}
          <div class=" flex h-full w-full items-center justify-center">
            <div class="flex items-center gap-2">
              <Spinner size="6" />
              <span class="text-muted-foreground text-sm">Reading file...</span>
            </div>
          </div>
        {:else}
          <MonacoEditor bind:value search={searchPath} />
        {/if}
      </div>
    </div>
    <div class="text-muted-foreground flex justify-between gap-3 py-2 text-xs">
      <div class="flex items-center gap-4">
        {#if isMetaLoading}
          <Skeleton class="h-4 w-15 rounded" />
          <Skeleton class="h-4 w-15 rounded" />
        {:else}
          {#if isTainted}
            <div class="animate-in fade-in text-warn flex items-center gap-1.5 font-medium">
              <div class="bg-warn size-1.5 rounded-full"></div>
              Unsaved
            </div>
          {:else}
            <div class="flex items-center gap-1.5">
              <div class="bg-chart-2 size-1.5 rounded-full"></div>
              Ready
            </div>
          {/if}
          {#if file}
            <span class="text-muted-foreground/50">|</span>
            <span>{formatFileSize(file.metadata.total_size)}</span>
          {/if}
        {/if}
      </div>
      <div class="flex gap-3">
        <div class="flex items-center gap-1">
          <Kbd.Root>⌘ + F</Kbd.Root>
          <span>Search</span>
        </div>

        <div class="flex items-center gap-1">
          <Kbd.Root>⌘ + K</Kbd.Root>
          <span>Cmd</span>
        </div>

        <div class="flex items-center gap-1">
          <Kbd.Root>⌘ + S</Kbd.Root>
          <span>Save</span>
        </div>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>

<ConfirmDialog
  confirmDialogOpen={confirmOpen}
  handleCancel={() => (confirmOpen = false)}
  dialogTitle="Unsaved changes"
  dialogDescription={`You have unsaved changes in "${file?.name || 'Unknown File'}". What would you like to do?`}
  cancelText="Continue Editing"
>
  {#snippet Confirm()}
    <Button variant="outline" onclick={() => closeModal()}>Discard Changes</Button>
    <Button onclick={saveAndClose}>Save & Close</Button>
  {/snippet}
</ConfirmDialog>

{#snippet controls()}
  <div class="flex items-center gap-2">
    <Button variant="outline" class="text-muted-foreground" size="sm" onclick={handleCopy}>
      <Copy class="size-4 stroke-1" />
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => goto(`/graph/${file?.id}`)}
      class="text-muted-foreground">Graph</Button
    >

    <Button variant="outline" size="sm" disabled={!isTainted} onclick={saveContent}>Save</Button>
  </div>
{/snippet}

{#snippet largFileContent()}
  <div class="flex h-full w-full items-center justify-center">
    <div class="flex max-w-xs items-center gap-6">
      <div class="flex flex-col gap-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <h3 class="text-xl font-semibold">File Too Large to Edit</h3>
            <Badge variant="outline">
              Size {file ? formatFileSize(file.metadata.total_size) : '...'}
            </Badge>
          </div>
          <p class="text-muted-foreground text-sm">
            This file exceeds the 30 MB limit for in-app editing. You can open it in your system's
            default editor.
          </p>
        </div>

        <div class="flex gap-4">
          <Button onclick={() => openEditor(file!)}>Open in default Editor</Button>
          <Button variant="outline" onclick={() => handleOpenDir(file!)}>
            <FolderOpen class="size-4" />
            Show in folder
          </Button>
        </div>
      </div>
    </div>
  </div>
{/snippet}
