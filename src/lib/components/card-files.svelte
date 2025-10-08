<script lang="ts">
  import { Trash2, Code, FolderOpenDot, Network } from '@lucide/svelte/icons';

  import * as Card from '$lib/components/ui/card/index.js';
  import Input from './ui/input/input.svelte';
  import Badge from './ui/badge/badge.svelte';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { Button } from '$lib/components/ui/button/index';
  import { formatFileSize } from '$lib/utils';
  import { openDefaultEditor, openFileInfolder, renameFile } from '$lib/tauri';

  import type { FileNode } from '$lib/utils';

  import { invalidateAll, goto } from '$app/navigation';

  import type { SavedFiles } from '$lib/tauri';

  const THIRTY_MB_SIZE = 30 * 1024 * 1024;

  type Props = {
    file: SavedFiles;
    handleDelete: (file: SavedFiles) => void;
    openDialogEditor: (file: SavedFiles) => void;
    roots: FileNode[];
    previews: string[];
  };

  let { file, handleDelete, openDialogEditor, previews = [] }: Props = $props();

  let draftName = $state<string>('');
  let renamingPath = $state<string | null>(null);
  let isDeleteDialogOpen = $state(false);

  const isLargeFile = $derived(file.size > THIRTY_MB_SIZE);

  const canSave = $derived(() => {
    const name = draftName.trim();
    return name.length > 0 && name !== file.name;
  });

  const isRenaming = $derived(renamingPath === file.path);

  const startRename = () => {
    renamingPath = file.path;
    draftName = file.name;
  };

  const handleEdit = () => {
    if (isLargeFile) {
      openEditor(file.path);
    } else {
      openDialogEditor(file);
    }
  };

  const cancelRename = () => {
    renamingPath = null;
    draftName = '';
  };

  const onRenameKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleRename(file);
    else if (e.key === 'Escape') cancelRename();
  };

  const handleRename = async (file: SavedFiles) => {
    if (!canSave) return;
    try {
      await renameFile(file, draftName);
      invalidateAll();
      file.name = draftName;
      file.path = file.path.replace(/[^\\/]+$/, draftName);
      cancelRename();
    } catch (err) {
      console.error('Failed to rename file:', err);
    }
  };

  const openEditor = async (path: string) => {
    try {
      await openDefaultEditor(path);
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
  const gotoGraph = (file: { path: string }) => goto(`/graph/${file.path}`);
</script>

<Card.Root class="bg-muted/30 w-full max-w-sm">
  <Card.Header>
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Card.Title class="flex items-center justify-between gap-4">
          {#if isRenaming}
            <Input
              class="flex-1"
              autofocus
              bind:value={draftName}
              onkeydown={onRenameKeydown}
              onblur={() => {
                handleRename(file);
                renamingPath = null;
              }}
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              onclick={() => {
                handleRename(file);
              }}>Saved</Button
            >
          {:else}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span class="max-w-64 flex-1 truncate text-left" onclick={startRename}
              >{file.name}
            </span>
          {/if}
        </Card.Title>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Rename file</p>
      </Tooltip.Content>
    </Tooltip.Root>
    <Card.Description>
      <Badge variant="outline" class="text-muted-foreground">
        {formatFileSize(file.size)}
      </Badge>
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <div class="grid grid-cols-2 gap-x-4 gap-y-1">
      {#each previews as name}
        <div class="truncate font-mono text-sm" title={name}>{name}</div>
      {/each}
    </div>
  </Card.Content>

  <Card.Footer class="border-text-muted-foreground/20 flex w-full justify-between border-t  ">
    <div class="flex gap-2">
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button variant="outline" size="sm" onclick={handleEdit}>
            <Code class="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>{file.size > THIRTY_MB_SIZE ? 'Edit in default editor' : 'Edit file'}</p>
        </Tooltip.Content>
      </Tooltip.Root>
      <Button size="sm" variant="outline" onclick={() => gotoGraph(file)}
        ><Network class="size-4" /></Button
      >
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button variant="ghost" size="sm" onclick={() => handleOpenDir(file)}>
            <FolderOpenDot class="h-4 w-4 " />
            Open
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Open file in your file manager</p>
        </Tooltip.Content>
      </Tooltip.Root>
    </div>

    <div class="flex">
      <Button
        variant="destructive"
        size="sm"
        onclick={() => (isDeleteDialogOpen = !isDeleteDialogOpen)}
      >
        <Trash2 class="h-4 w-4" />
      </Button>
    </div>
  </Card.Footer>
</Card.Root>

<AlertDialog.Root bind:open={isDeleteDialogOpen}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete file?</AlertDialog.Title>
      <AlertDialog.Description>
        Are you sure you want to delete <strong>{file.name}</strong>? This action cannot be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <Button variant="destructive" onclick={() => handleDelete(file)}>Delete</Button>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
