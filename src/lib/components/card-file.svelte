<script lang="ts">
  import {
    Trash2,
    Code,
    FolderOpenDot,
    Network,
    Clock,
    Ellipsis,
    Pencil
  } from '@lucide/svelte/icons';

  import * as Card from '$lib/components/ui/card/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import Input from './ui/input/input.svelte';
  import Badge from './ui/badge/badge.svelte';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { Button } from '$lib/components/ui/button/index';
  import { formatFileSize } from '$lib/utils';
  import { openFileInfolder } from '$lib/tauri';
  import ConfirmDialog from '$lib/components/confirm-dialog.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

  import type { FileNode } from '$lib/utils';

  import { goto } from '$app/navigation';

  import type { SavedFiles } from '$lib/tauri';

  const THIRTY_MB_SIZE = 30 * 1024 * 1024;

  type Props = {
    file: SavedFiles;
    handleDelete: (file: SavedFiles) => void;
    openDialogEditor: (file: SavedFiles) => void;
    roots: FileNode[];
    previews: string[];
  };

  let { file, handleDelete }: Props = $props();

  let open = $state(false);
  let isLargeFile = $derived(file.size > THIRTY_MB_SIZE);

  const handleOpenDir = async (file: SavedFiles) => {
    try {
      await openFileInfolder(file);
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };
  const gotoGraph = (file: { path: string }) => goto(`/graph/${file.path}`);
  const gotoEdit = (file: SavedFiles) => goto(`/files/${encodeURIComponent(file.path)}/edit`);
  const gotoEditRename = (file: SavedFiles) =>
    goto(`/files/${encodeURIComponent(file.path)}/edit`, {
      state: { focus: 'rename' }
    });
</script>

<Card.Root class="bg-muted/30 max-w-96  gap-2 pb-2">
  <Card.Header>
    <Card.Title class="max-w-80 truncate">
      {file.name}
    </Card.Title>

    <Card.Description>
      <p class="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Clock class="size-3" />
        <span>Updated 2h ago</span>
      </p>
    </Card.Description>
  </Card.Header>
  <!-- <Card.Content class="grid grid-cols-2 gap-3">
    <div class="bg-muted/50 rounded-lg border p-3">
      <div class="text-muted-foreground text-xs">Files</div>
      <div class="mt-1 font-mono text-2xl font-semibold">1,890</div>
    </div>
    <div class="bg-muted/50 rounded-lg border p-3">
      <div class="text-muted-foreground text-xs">Size</div>
      <div class="mt-1 text-sm font-medium">{formatFileSize(file.size)}</div>
    </div>
  </Card.Content> -->

  <!-- <Card.Content class="grid grid-cols-2 gap-2  text-sm">
    <div class="bg-muted/50 flex items-center gap-2 rounded-md p-2">
      <div class="bg-primary/10 rounded p-1.5">
        <FileText class="text-primary h-4 w-4" />
      </div>
      <div>
        <div class="font-semibold">1,890</div>
        <div class="text-muted-foreground text-xs">files</div>
      </div>
    </div>
    <div class="bg-muted/50 flex items-center gap-2 rounded-md p-2">
      <div class="bg-primary/10 rounded p-1.5">
        <HardDrive class="text-primary h-4 w-4" />
      </div>
      <div>
        <div class="text-muted-foreground text-xs">Size</div>
        <div class="font-mono text-xs">{formatFileSize(file.size)}</div>
      </div>
    </div>
  </Card.Content> -->

  <Card.Content class="py-4 text-center">
    <div class="mb-2 font-mono text-3xl font-bold tracking-tight">1,890</div>
    <div class="text-muted-foreground mb-2 text-sm">files parsed</div>

    <Badge variant="outline" class="text-muted-foreground ">
      Size {formatFileSize(file.size)}
    </Badge>
    {#if isLargeFile}
      <span class="text-border">•</span>
      <Badge variant="secondary" class="text-amber-600 dark:text-amber-400 ">Large file</Badge>
    {/if}
  </Card.Content>
  <Separator />
  <Card.Footer class="flex justify-between px-10">
    <Button variant="ghost" size="icon" onclick={() => gotoEdit(file)}>
      <Code class="size-4" />
    </Button>
    <Separator orientation="vertical" />
    <Button size="icon" variant="ghost" onclick={() => gotoGraph(file)}>
      <Network class="size-4" /></Button
    >
    <Separator orientation="vertical" />
    <Tooltip.Root>
      <Tooltip.Content>
        <p>Open file in your file manager</p>
      </Tooltip.Content>
    </Tooltip.Root>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="link" size="icon" class="size-10">
          <Ellipsis class="size-5" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item onclick={() => gotoEdit(file)}>
          <Code class="mr-2 size-4" />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={() => gotoGraph(file)}>
          <Network class="mr-2 size-4" />
          View graph
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={() => handleOpenDir(file)}>
          <FolderOpenDot class="mr-2 size-4" />
          Open folder
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onclick={() => gotoEditRename(file)}>
          <Pencil class="mr-2 size-4" />
          Rename file
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onclick={() => (open = !open)}
          class="text-destructive focus:text-destructive"
        >
          <Trash2 class="mr-2 size-4" />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Card.Footer>
</Card.Root>

<ConfirmDialog
  confirmDialogOpen={open}
  dialogTitle="Delete file?"
  dialogDescription={`Are you sure you want to delete file ${file.name}? This action cannot be undone.`}
  handleCancel={() => (open = false)}
  handleConfirm={() => handleDelete(file)}
/>
