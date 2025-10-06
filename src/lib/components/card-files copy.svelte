<script lang="ts">
  import { Trash2, Code, FolderOpenDot } from '@lucide/svelte/icons';

  import * as Card from '$lib/components/ui/card/index.js';
  import Input from './ui/input/input.svelte';
  import Badge from './ui/badge/badge.svelte';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { Button } from '$lib/components/ui/button/index';
  import { formatFileSize } from '$lib/utils';
  import { openDefaultEditor, openFileInfolder, renameFile } from '$lib/tauri';
  import { goto } from '$app/navigation';
  import { SvelteFlowProvider } from '@xyflow/svelte';
  import RoadMap from '$lib/components/road-map.svelte';

  import { invalidateAll } from '$app/navigation';

  import type { SavedFiles } from '$lib/tauri';

  const mockRoots: FileNode[] = [
    {
      name: 'src',
      path: '/project/src',
      type: 'Directory',
      children: [
        { name: 'main.ts', path: '/project/src/main.ts', type: 'File' },
        {
          name: 'app',
          path: '/project/src/app',
          type: 'Directory',
          children: [
            { name: 'App.svelte', path: '/project/src/app/App.svelte', type: 'File' },
            { name: 'Header.svelte', path: '/project/src/app/Header.svelte', type: 'File' },
            { name: 'Footer.svelte', path: '/project/src/app/Footer.svelte', type: 'File' }
          ]
        },
        {
          name: 'lib',
          path: '/project/src/lib',
          type: 'Directory',
          children: [
            { name: 'utils.ts', path: '/project/src/lib/utils.ts', type: 'File' },
            {
              name: 'stores',
              path: '/project/src/lib/stores',
              type: 'Directory',
              children: [
                { name: 'user.ts', path: '/project/src/lib/stores/user.ts', type: 'File' },
                { name: 'theme.ts', path: '/project/src/lib/stores/theme.ts', type: 'File' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'public',
      path: '/project/public',
      type: 'Directory',
      children: [
        { name: 'favicon.ico', path: '/project/public/favicon.ico', type: 'File' },
        { name: 'robots.txt', path: '/project/public/robots.txt', type: 'File' }
      ]
    },
    { name: 'package.json', path: '/project/package.json', type: 'File' },
    { name: 'tsconfig.json', path: '/project/tsconfig.json', type: 'File' }
  ];

  const THIRTY_MB_SIZE = 30 * 1024 * 1024;

  type Props = {
    file: SavedFiles;
    handleDelete: (file: SavedFiles) => void;
    openDialogEditor: (file: SavedFiles) => void;
  };

  let { file, handleDelete, openDialogEditor }: Props = $props();

  const openRoadmap = (file: { path: string }) => goto(`/graph/${file.path}`);

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
</script>

<div class=" border-border flex h-64 w-[800px] gap-6 rounded-2xl border p-4">
  <div class="boredr-border line-clamp-6 flex-1 overflow-hidden rounded-2xl border p-2">
    <SvelteFlowProvider>
      <RoadMap roots={mockRoots} />
    </SvelteFlowProvider>
  </div>
  <div class="flex-1">
    <div class="flex flex-col gap-1">
      <span class="text-muted-foreground">File name</span>
      <span>{file.name}</span>
    </div>
    <Button variant="secondary" size="sm" onclick={() => openRoadmap(file)}>Open roadmap</Button>
  </div>
</div>

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
