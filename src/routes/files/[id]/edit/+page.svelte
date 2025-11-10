<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { onMount } from 'svelte';
  import {
    updateFile,
    renameFile,
    openDefaultEditor,
    openFileInfolder,
    type SavedFiles
  } from '$lib/tauri';
  import { page } from '$app/state';
  import { formatFileSize } from '@/lib/utils';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Dialog from '$lib/components/ui/dialog';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import MonacoEditor from '$lib/components/monaco-editor/monaco-editor.svelte';
  import * as Kbd from '$lib/components/ui/kbd/index.js';
  import ConfirmDialog from '$lib/components/confirm-dialog.svelte';
  import { Route, Code, Copy, FolderOpen } from '@lucide/svelte/icons';

  import type { PageProps } from './$types';

  type ParsedFileDetail = {
    id: string;
    name: string;
    content: string;
    metadata: {
      id: string;
      name: string;
      created_at: string;
      files_count: number;
      total_size: number;
      files: FileMetadata[];
      file_tree: ParsedPath[];
    };
  };

  let { data }: PageProps = $props();

  const THIRTY_MB_SIZE = 30 * 1024 * 1024;

  let isOpen = $state(true);
  let value = $state<string>(data.content);
  let snapshot = $state<string>(data.content);
  let isCopied = $state(false);
  let rename = $state<string>(data.file.name);
  let inputEl = $state<HTMLInputElement | null>(null);
  let confirmOpen = $state(false);

  const isTainted = $derived(value !== snapshot);
  const isLargeFile = $derived(data.file.metadata.total_size > THIRTY_MB_SIZE);

  const closeModal = async () => {
    confirmOpen = false;
    isOpen = false;

    await new Promise((resolve) => setTimeout(resolve, 100));

    goto('/files', { replaceState: true });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isTainted) {
      confirmOpen = true;
      isOpen = true;
    } else {
      closeModal();
    }
  };

  const save = async () => {
    try {
      await updateFile(value, data.file);
      snapshot = value;
      toast.success('File updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update file content');
    }
  };

  const saveAndClose = async () => {
    await save();
    closeModal();
  };

  const onRenameKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputEl?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      rename = data.file.name;
      inputEl?.blur();
    }
  };

  const handleRename = async () => {
    if (rename === data.file.name) return;
    try {
      await renameFile(data.file, rename.trim());
      await invalidate('app:files');

      toast.success('Renamed file');
    } catch (e) {
      console.error(e);
      toast.error('Rename failed');
      rename = data.file.name;
    }
  };

  const openEditor = async (file) => {
    try {
      await openDefaultEditor(file);
    } catch (err) {
      console.error('Failed to open file in editor:', err);
    }
  };
  const handleOpenDir = async (file: SavedFiles) => {
    try {
      await openFileInfolder(file);
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      isCopied = true;
      setTimeout(() => (isCopied = false), 2000);
    } catch (e) {
      console.error(e);
      toast.error('Copy failed');
    }
  };

  $effect(() => {
    const state = page.state as { focus?: string };
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
        if (!isLargeFile && isTainted) save();
      }
    };

    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  });
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={handleOpenChange}>
  <Dialog.Content class=" flex h-[90vh] w-[90vw] flex-col gap-0">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2 pt-2">
        <Code class="text-muted-foreground size-4" />
        <Input
          bind:value={rename}
          onblur={handleRename}
          class="max-w-[30vw] border border-transparent bg-transparent! text-lg! hover:border-blue-900! focus-visible:border-blue-900 focus-visible:ring-0"
          onkeydown={onRenameKeydown}
          bind:ref={inputEl}
          tabindex={(page.state as { focus?: string }).focus === 'rename' ? 0 : -1}
        />
      </Dialog.Title>
    </Dialog.Header>

    <div class="flex min-h-0 flex-1 flex-col">
      <div class="mb-2 flex items-center justify-between">
        <div class="flex items-center gap-5 pt-3">
          <Route class="text-muted-foreground size-4 " />
          <Badge
            variant="secondary"
            class="max-w-lg truncate font-mono text-xs"
            title={data.file?.directory_path}
          >
            {data.file?.directory_path}
          </Badge>
          {#if isLargeFile}
            <Badge variant="secondary" class="text-warn">Large file</Badge>
          {/if}
          {#if isTainted}
            <div class="flex items-center gap-1">
              <span class="bg-warn h-1.5 w-1.5 animate-pulse rounded-full text-xs transition-all"
              ></span>
              <span class="text-muted-foreground text-xs">Edited</span>
            </div>
          {/if}
        </div>

        {#if !isLargeFile}
          {@render controls()}
        {/if}
      </div>

      <div class="min-h-0 flex-1 overflow-hidden rounded-md border">
        {#if isLargeFile}
          <div class="flex h-full w-full items-center justify-center">
            <div class="flex max-w-xs items-center gap-6">
              <div class="flex flex-col gap-4">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <h3 class="text-xl font-semibold">File Too Large to Edit</h3>
                    <Badge variant="outline">
                      Size {formatFileSize(data.file.total_size)}
                    </Badge>
                  </div>
                  <p class="text-muted-foreground text-sm">
                    This file exceeds the 30 MB limit for in-app editing. You can open it in your
                    system's default editor.
                  </p>
                </div>

                <div class="flex gap-4">
                  <Button onclick={() => openEditor(data.file)}>Open in default Editor</Button>
                  <Button variant="outline" onclick={() => handleOpenDir(data.file)}>
                    <FolderOpen class="size-4" />
                    Show in folder
                  </Button>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <MonacoEditor bind:value />
        {/if}
      </div>
    </div></Dialog.Content
  >
</Dialog.Root>

<ConfirmDialog
  confirmDialogOpen={confirmOpen}
  handleCancel={() => (confirmOpen = false)}
  dialogTitle="Unsaved changes"
  dialogDescription={`You have unsaved changes in "${data.file.name}". What would you like to do?`}
  cancelText="Continue Editing"
>
  {#snippet Confirm()}
    <Button variant="outline" onclick={() => closeModal()}>Discard Changes</Button>
    <Button onclick={saveAndClose}>Save & Close</Button>
  {/snippet}
</ConfirmDialog>

{#snippet controls()}
  <div class="flex items-center gap-2">
    <Button
      variant="outline"
      size="sm"
      onclick={() => goto(`/graph/${data.file.id}`)}
      class="text-muted-foreground">View graph</Button
    >
    <Button variant="outline" class="text-muted-foreground" size="sm" onclick={handleCopy}>
      <Copy class=" mr-2 size-4" />

      {isCopied ? 'Copied!' : 'Copy'}
    </Button>
    <Button variant="outline" size="sm" disabled={!isTainted} onclick={save}>
      Save
      {#if isTainted}
        <Kbd.Root class="text-muted-foreground">⌘ + S</Kbd.Root>
      {/if}
    </Button>
  </div>
{/snippet}
