<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Code, Copy, FileText, Route } from '@lucide/svelte/icons';
  import { Button } from '$lib/components/ui/button/index';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import MonacoEditor from '$lib/components/monaco-editor/monaco-editor.svelte';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import ConfirmDialog from '$lib/components/confirm-dialog.svelte';
  import { fly } from 'svelte/transition';
  import { renameFile } from '$lib/tauri';
  import { invalidateAll } from '$app/navigation';
  import { Input } from '$lib/components/ui/input/index.js';

  let {
    fileContent = '',
    selectedFile,
    updateFileContent,
    isCodeDialogOpen = $bindable(false)
  } = $props();

  let isCopied = $state(false);
  let confirmOpen = $state(false);
  let snapshot = $state<string>(fileContent);
  let rename = $state<string>(selectedFile?.name ?? '');
  let inputEl = $state<HTMLInputElement | null>(null);

  const isTainted = $derived(fileContent !== snapshot);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      isCopied = true;
      setTimeout(() => (isCopied = false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const handleRename = async () => {
    if (rename.trim() === selectedFile?.name) return;
    try {
      console.log('rename call', rename);
      await renameFile(selectedFile, rename.trim());
      invalidateAll();
    } catch (err) {
      console.error('Failed to rename file:', err);
    }
  };

  const onRenameKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputEl?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      rename = selectedFile?.name;
      inputEl?.blur();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isTainted) {
      isCodeDialogOpen = true;
      confirmOpen = true;
    } else {
      isCodeDialogOpen = open;
    }
  };
  const save = async () => {
    await updateFileContent(fileContent);
    snapshot = fileContent;
    confirmOpen = false;
  };

  const saveAndClose = async () => {
    await updateFileContent(fileContent);
    snapshot = fileContent;
    confirmOpen = false;
    isCodeDialogOpen = false;
  };
  const discard = () => {
    isCodeDialogOpen = false;
    confirmOpen = false;
    snapshot = fileContent;
  };
</script>

<Dialog.Root bind:open={isCodeDialogOpen} onOpenChange={handleOpenChange}>
  <Dialog.Content class="flex h-[90vh] w-[90vw] flex-col ">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        <Code class="size-4" />
        <!-- <FileText class="size-5" /> -->

        <Input
          bind:value={rename}
          onblur={handleRename}
          class="bg-background! max-w-[30vw] border-none"
          onkeydown={onRenameKeydown}
          bind:ref={inputEl}
          tabindex="-1"
        />

        {#if isTainted && isCodeDialogOpen}
          <span transition:fly class="text-muted-foreground text-xs">Edited</span>
        {/if}
      </Dialog.Title>
    </Dialog.Header>

    <div class="flex min-h-0 flex-1 flex-col">
      <div class="mb-1 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Route class="size-4" />
          <Badge variant="secondary">
            {selectedFile?.path}
          </Badge>
        </div>

        <div class="mb-1.5 flex items-center gap-2 pr-2">
          <Button variant="outline" size="sm" onclick={() => handleCopy(fileContent)}
            >{#if !isCopied}
              <Copy class="mr-2 h-4 w-4" />
              Copy
            {:else}
              <Copy class="mr-2 h-4 w-4 text-green-700" />
              <span class="text-green-700"> Copied </span>
            {/if}</Button
          >
          <Button variant="default" size="sm" disabled={!isTainted} onclick={() => save()}
            >Save</Button
          >
        </div>
      </div>

      <div class=" border-border min-h-0 flex-1 rounded-md border">
        <MonacoEditor bind:value={fileContent} />
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>

<ConfirmDialog
  confirmDialogOpen={confirmOpen}
  handleCancel={() => (confirmOpen = false)}
  dialogTitle="Unsaved changes"
  dialogDescription={`You have unsaved changes in ${selectedFile?.name ?? 'this file'} file.`}
  cancelText="Edit"
>
  {#snippet Confirm()}
    <AlertDialog.Cancel onclick={discard}>Discard</AlertDialog.Cancel>
    <AlertDialog.Action onclick={() => saveAndClose()}>Save & Close</AlertDialog.Action>
  {/snippet}
</ConfirmDialog>
