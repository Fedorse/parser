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
    getFileMetadata
  } from '$lib/tauri';
  import { renameSchema } from '$lib/shemas';
  import { formatFileSize } from '@/lib/utils/utils';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Dialog from '$lib/components/ui/dialog';
  import MonacoEditor from '$lib/components/monaco-editor/monaco-editor.svelte';
  import ConfirmDialog from '$lib/components/confirm-dialog.svelte';
  import {
    Route,
    Code,
    Copy,
    FolderOpen,
    Save,
    Network,
    Loader,
    TriangleAlert,
    CircleX,
    CircleCheck
  } from '@lucide/svelte/icons';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import Srotcuts from '$lib/components/shortcuts-help.svelte';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import { Separator } from '$lib/components/ui/separator/index.js';

  import type { FileMetadata } from '@/lib/type.ts';

  let { fileId, searchPath, onClose } = $props();

  const THIRTY_MB_SIZE = 30 * 1024 * 1024;

  let file = $state<FileMetadata | null>(null);

  let rename = $state<string | undefined>('');
  let renameError = $state<string | null>('');
  let renameSuccess = $state(false);

  let snapshot = $state<string>('');
  let value = $state<string>('');

  let isOpen = $state(true);
  let confirmOpen = $state(false);
  let isMetaLoading = $state(false);
  let isContentLoading = $state(false);
  let searchFound = $state(true);

  let inputEl = $state<HTMLInputElement | null>(null);

  const isTainted = $derived(value !== snapshot);

  const isLargeFile = $derived(file ? file.total_size > THIRTY_MB_SIZE : false);

  const saveContent = async () => {
    try {
      await updateFile(value, file);
      snapshot = value;
    } catch (err) {
      console.error(err);
      toast.error('Failed to update file content');
    }
  };

  const closeModal = async () => {
    confirmOpen = false;
    isOpen = false;
    onClose();
    if (rename !== file?.name) await invalidate('app:files');
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
      rename = file.name;
      renameError = null;
      inputEl?.blur();
    }
  };

  const loadFile = async () => {
    isMetaLoading = true;
    isContentLoading = false;
    try {
      isMetaLoading = true;
      const detail = await getFileMetadata(fileId);
      if (!detail) {
        toast.error('File not found');
        onClose();
        return;
      }
      file = detail;
      rename = detail.name;
    } catch (e) {
      console.error('Failed to load file:', e);
      toast.error('Failed to load file');
      return;
    } finally {
      isMetaLoading = false;
    }

    if (file && file.total_size <= THIRTY_MB_SIZE) {
      try {
        isContentLoading = true;
        const rawContent = await getFileContent(file);

        const normalizedContent = rawContent.replace(/\r\n/g, '\n');

        value = normalizedContent;
        snapshot = normalizedContent;
      } catch (err) {
        value = 'Failed to load file content';
        snapshot = 'Failed to load file content';

        console.error('Failed to load file content:', err);
      } finally {
        isContentLoading = false;
      }
    }
  };

  const handleRename = async () => {
    if (rename === file?.name) {
      renameError = null;
      return;
    }
    const validation = renameSchema.safeParse(rename);

    if (!validation.success) {
      renameError = validation.error.issues[0]?.message ?? 'Invalid name';
      return;
    }

    try {
      renameError = null;
      const newName = validation.data;
      await renameFile(file!, newName);
      rename = newName;
      renameSuccess = true;

      setTimeout(() => {
        renameSuccess = false;
      }, 3000);
    } catch (e) {
      console.error(e);
      renameError = 'System failed to rename file';
      rename = file?.name;
    }
  };
  const onRenameInput = () => {
    if (renameError) renameError = null;
  };

  const openEditor = async (file: FileMetadata) => {
    if (!file) return;
    try {
      await openDefaultEditor(file);
    } catch (err) {
      console.error('Failed to open file in editor:', err);
    }
  };

  const handleOpenDir = async (file: FileMetadata) => {
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
    loadFile();
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
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={handleOpenChange}>
  <Dialog.Content
    class=" flex h-[90vh] w-[90vw] max-w-[1400px] flex-col gap-0 pt-3 pb-0"
    onOpenAutoFocus={(e: Event) => {
      e.preventDefault();
    }}
  >
    <Dialog.Header class="flex flex-row items-center justify-between space-y-0  px-6 pt-1 pb-3">
      <Dialog.Title class="flex w-lg items-center gap-2 ">
        {#if isMetaLoading}
          <Skeleton class="bg-muted/80 size-8 rounded" />
          <Skeleton class="bg-muted/80 h-8 w-48 rounded" />
        {:else}
          <Code class="text-muted-foreground size-4" />
          <Input
            bind:value={rename}
            onblur={handleRename}
            oninput={onRenameInput}
            class={{
              'max-w-[30vw] text-lg! transition-colors focus-visible:ring-0': true,
              'border-destructive! text-destructive! focus-visible:border-destructive!':
                renameError,
              'border border-transparent bg-transparent! hover:border-blue-900! focus-visible:border-blue-900':
                !renameError
            }}
            onkeydown={onRenameKeydown}
            bind:ref={inputEl}
            tabindex={page.state.focus ? 0 : -1}
          />
        {/if}
      </Dialog.Title>

      {@render controls()}
    </Dialog.Header>

    <div class="flex min-h-0 flex-1 flex-col">
      <div class="min-h-0 flex-1 overflow-hidden rounded-md border">
        {#if isLargeFile}
          {@render largFileContent()}
        {:else if isContentLoading || isMetaLoading}
          <div class=" flex h-full w-full items-center justify-center">
            <div class="flex items-center gap-2">
              <Loader class="size-4 animate-spin stroke-1" />
              <span class="text-muted-foreground text-sm">Reading file...</span>
            </div>
          </div>
        {:else}
          <MonacoEditor bind:value search={searchPath} bind:searchFound />
        {/if}
      </div>
    </div>

    <div class="text-muted-foreground flex justify-between gap-3 py-2 text-xs">
      <div class="flex items-center gap-4">
        {#if isMetaLoading}
          <Skeleton class="bg-muted/80 h-4 w-md rounded" />
        {:else}
          {#if isLargeFile}
            <span class="text-warn">Large File</span>
          {:else if isTainted}
            <div class="animate-in fade-in text-warn flex items-center gap-1.5">
              <div class="bg-warn size-1.5 rounded-full"></div>
              Unsaved changes
            </div>
          {:else}
            <div class="animate-in fade-in flex items-center gap-1.5">
              <div class="bg-success size-1.5 rounded-full"></div>
              Ready
            </div>
          {/if}

          {#if file}
            <Separator orientation="vertical" class="bg-foreground/20 h-4 max-h-4" />
            <span>{formatFileSize(file.total_size)}</span>
            <Separator orientation="vertical" class="bg-foreground/20 h-4 max-h-4" />

            <div
              class="text-muted-foreground flex max-w-[200px] min-w-0 items-center gap-2 text-xs md:max-w-[300px] lg:max-w-[450px]"
            >
              <Route class="text-muted-foreground size-3 shrink-0 stroke-1" />

              <span class="min-w-0 truncate text-left" style="direction: rtl;" title={file.path}>
                &lrm;{file.path}
              </span>
            </div>

            {#if renameError}
              <div
                class="animate-in fade-in slide-in-from-left-2 text-destructive flex items-center gap-1.5"
              >
                <CircleX class="size-3.5 stroke-1" />
                <span>{renameError}</span>
              </div>
            {:else if renameSuccess}
              <div
                class="animate-in fade-in slide-in-from-left-2 text-success flex items-center gap-1.5 font-medium"
              >
                <CircleCheck class="size-3.5 stroke-1" />
                <span>Renamed successfully</span>
              </div>
            {/if}
            {#if !searchFound}
              <div class="animate-in fade-in slide-in-from-left-2 flex items-center gap-1.5">
                <TriangleAlert class="text-warn size-3.5 stroke-1" />
                <span class="text-warn">No results found</span>
              </div>
            {/if}
          {/if}
        {/if}
      </div>

      <Srotcuts />
    </div></Dialog.Content
  >
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
  <div class="bg-muted/40 flex items-center gap-1 rounded-lg border p-1">
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Button
          variant="ghost"
          disabled={isLargeFile}
          size="icon"
          class="text-muted-foreground size-8"
          onclick={() => goto(`/graph/${file?.id}`)}
        >
          <Network class="size-4" />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>View in Graph</Tooltip.Content>
    </Tooltip.Root>

    <Tooltip.Root>
      <Tooltip.Trigger>
        <Button
          disabled={isLargeFile}
          variant="ghost"
          size="icon"
          class="text-muted-foreground size-8"
          onclick={() => openFileInfolder(file!)}
        >
          <FolderOpen class="size-4" />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>Show in Finder</Tooltip.Content>
    </Tooltip.Root>

    <div class="bg-border mx-1 h-4 w-[1px]"></div>

    <Tooltip.Root>
      <Tooltip.Trigger>
        <Button
          disabled={isLargeFile}
          variant="ghost"
          size="icon"
          class="text-muted-foreground size-8"
          onclick={handleCopy}
        >
          <Copy class="size-4" />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>Copy content</Tooltip.Content>
    </Tooltip.Root>

    <Tooltip.Root>
      <Tooltip.Trigger>
        <Button
          disabled={isLargeFile || !isTainted}
          variant="ghost"
          class="text-muted-foreground"
          size="icon"
          onclick={saveContent}
        >
          <Save class="size-4" />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>Save</Tooltip.Content>
    </Tooltip.Root>
  </div>
{/snippet}

{#snippet largFileContent()}
  <div class="flex h-full w-full items-center justify-center">
    <div class="flex max-w-xs items-center gap-6">
      <div class="flex flex-col gap-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <h3 class="text-xl font-semibold">File Too Large to Edit</h3>
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
