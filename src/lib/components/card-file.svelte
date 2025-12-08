<script lang="ts">
  import { goto, pushState } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { openFileInfolder } from '$lib/tauri';
  import { formatFileSize, formatDate } from '@/lib/utils/utils';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import ConfirmDialog from '$lib/components/confirm-dialog.svelte';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import { Button } from '$lib/components/ui/button/index';
  import { Badge } from '@/lib/components/ui/badge/index.js';

  import {
    Trash2,
    Code,
    FolderOpenDot,
    Network,
    Clock,
    Ellipsis,
    Pencil
  } from '@lucide/svelte/icons';

  import type { File } from '@/lib/type.ts';

  const THIRTY_MB_SIZE = 30 * 1024 * 1024;

  type Props = {
    file: File;
    handleDelete: (file: File) => void;
  };

  let { file, handleDelete }: Props = $props();

  let open = $state(false);
  let isLargeFile = $derived(file.file_size > THIRTY_MB_SIZE);

  const menuItems = [
    { label: 'Edit', action: () => openEditor(file), icon: Code },
    { label: 'View graph', action: () => gotoGraph(file), icon: Network },
    { label: 'Open folder', action: () => handleOpenDir(file), icon: FolderOpenDot },
    { label: 'Rename file', action: () => editFileName(file), icon: Pencil, separator: true },
    {
      label: 'Delete',
      action: () => handleDelete(file),
      icon: Trash2,
      variant: 'destructive',
      separator: true
    }
  ];

  const handleOpenDir = async (file: File) => {
    try {
      await openFileInfolder(file);
    } catch (err) {
      console.error('Failed to open file:', err);
      toast.error('Failed to open file');
    }
  };

  const gotoGraph = (file: { id: string }) => goto(`/graph/${file.id}`);
  const openEditor = (file: File) => pushState('', { editFile: { id: file.id } });
  const editFileName = (file: File) =>
    pushState('', { editFile: { id: file.id }, focus: 'rename' });
</script>

<Card.Root class="bg-card/20 hover:bg-card/30  group max-w-96 gap-2 pb-2">
  <Card.Header>
    <Card.Title class="max-w-80 truncate">
      {file.name}
    </Card.Title>

    <Card.Description>
      <p class="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Clock class="size-3" />
        <span>{formatDate(file.updated_at)}</span>
      </p>
    </Card.Description>
  </Card.Header>

  <Card.Content
    class="flex cursor-pointer flex-col items-center py-4"
    onclick={() => openEditor(file)}
    title="Edit file"
  >
    <div
      class="mb-2 font-mono text-3xl font-bold tracking-tight transition-all duration-300 group-hover:scale-110"
    >
      {file.files_count}
    </div>
    <div class="text-muted-foreground mb-2 text-sm">files parsed</div>
    <div>
      <Badge variant="outline" class="text-muted-foreground ">
        Size {formatFileSize(file.file_size)}
      </Badge>
      {#if isLargeFile}
        <span class="text-border">•</span>
        <Badge variant="secondary" class="text-warn ">Large file</Badge>
      {/if}
    </div>
  </Card.Content>
  <Separator />
  <Card.Footer class="flex justify-between px-10">
    {@render controls()}
  </Card.Footer>
</Card.Root>

<ConfirmDialog
  confirmDialogOpen={open}
  dialogTitle="Delete file?"
  dialogDescription={`Are you sure you want to delete file ${file.name}? This action cannot be undone.`}
  handleCancel={() => (open = false)}
  handleConfirm={() => handleDelete(file)}
/>

{#snippet controls()}
  <Tooltip.Root>
    <Tooltip.Trigger>
      <Button variant="ghost" onclick={() => openEditor(file)}>
        <Code class="size-4 stroke-1" />
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>Edit file</Tooltip.Content>
  </Tooltip.Root>

  <Separator orientation="vertical" />
  <Tooltip.Root>
    <Tooltip.Trigger>
      <Button size="icon" variant="ghost" onclick={() => gotoGraph(file)}>
        <Network class="size-4 stroke-1" />
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>View graph</Tooltip.Content>
  </Tooltip.Root>
  <Separator orientation="vertical" />
  <Tooltip.Root>
    <Tooltip.Content>
      <p>Open file in your file manager</p>
    </Tooltip.Content>
  </Tooltip.Root>
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Button variant="link" size="icon" class="size-10">
        <Ellipsis class="size-5 stroke-1" />
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="center" class="bg-background">
      {#each menuItems as item}
        {#if item.separator}
          <DropdownMenu.Separator />
        {/if}
        <DropdownMenu.Item
          onclick={item.action}
          class={item.variant === 'destructive' ? 'text-destructive' : ''}
        >
          <item.icon class="mr-1 size-4 stroke-1" />
          {item.label}
        </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/snippet}
