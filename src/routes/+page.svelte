<script lang="ts">
  import { invoke } from '@tauri-apps/api/core';
  import { open } from '@tauri-apps/plugin-dialog';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';

  // ============================================================================
  // TYPES
  // ============================================================================

  type ParsedFileListItem = {
    id: string;
    name: string;
    directory_path: string;
    file_size: number;
    files_count: number;
    total_size: number;
    created_at: string;
    last_modified: string;
  };

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

  type FileMetadata = {
    path: string;
    name: string;
    size: number;
    last_modified: string;
  };

  type ParsedPath =
    | { type: 'File'; name: string; path: string; size: number; last_modified: string }
    | { type: 'Directory'; name: string; path: string; children: ParsedPath[] };

  // ============================================================================
  // STATE
  // ============================================================================

  let parsedFiles = $state<ParsedFileListItem[]>([]);
  let selectedFile = $state<ParsedFileDetail | null>(null);
  let isLoading = $state(false);
  let isParsingPreview = $state(false);
  let isParsing = $state(false);

  // Dialog states
  let showDetailDialog = $state(false);
  let showEditDialog = $state(false);
  let showRenameDialog = $state(false);
  let showDeleteDialog = $state(false);
  let showPreviewDialog = $state(false);

  // Form states
  let editedContent = $state('');
  let newName = $state('');
  let fileToDelete = $state<ParsedFileListItem | null>(null);
  let fileToRename = $state<ParsedFileListItem | null>(null);
  let previewTree = $state<ParsedPath[]>([]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }

  // ============================================================================
  // TAURI COMMANDS
  // ============================================================================

  // 1. GET ALL FILES
  async function loadParsedFiles() {
    isLoading = true;
    try {
      parsedFiles = await invoke<ParsedFileListItem[]>('get_files');
      toast.success(`Loaded ${parsedFiles.length} parsed files`);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast.error('Failed to load parsed files');
    } finally {
      isLoading = false;
    }
  }

  // 2. GET PREVIEW TREE
  async function handleOpenForPreview() {
    const selected = await open({ multiple: true, directory: true });
    if (!selected) return;

    isParsingPreview = true;
    try {
      const paths = Array.isArray(selected) ? selected : [selected];
      previewTree = await invoke<ParsedPath[]>('get_preview_tree', { paths });
      showPreviewDialog = true;
      toast.success('Preview loaded');
    } catch (error) {
      console.error('Failed to get preview:', error);
      toast.error('Failed to load preview');
    } finally {
      isParsingPreview = false;
    }
  }

  // 3. PARSE FILES
  async function handleParse(paths: string[]) {
    isParsing = true;
    try {
      const metadata = await invoke('parse', { paths });
      toast.success('Files parsed successfully!');
      showPreviewDialog = false;
      await loadParsedFiles();
    } catch (error) {
      console.error('Parse failed:', error);
      toast.error('Failed to parse files');
    } finally {
      isParsing = false;
    }
  }

  // Quick parse without preview
  async function handleQuickParse() {
    const selected = await open({ multiple: true, directory: true });
    if (!selected) return;

    const paths = Array.isArray(selected) ? selected : [selected];
    await handleParse(paths);
  }

  // 4. GET FILE DETAIL
  async function viewFileDetail(file: ParsedFileListItem) {
    isLoading = true;
    try {
      selectedFile = await invoke<ParsedFileDetail>('get_file_detail', {
        dirName: file.id
      });
      showDetailDialog = true;
    } catch (error) {
      console.error('Failed to load file detail:', error);
      toast.error('Failed to load file details');
    } finally {
      isLoading = false;
    }
  }

  // 5. GET FILE CONTENT (alternative to detail)
  async function loadContentOnly(dirName: string) {
    try {
      const content = await invoke<string>('get_file_content', { dirName });
      console.log('Content loaded:', content.substring(0, 100) + '...');
      return content;
    } catch (error) {
      console.error('Failed to load content:', error);
      throw error;
    }
  }

  // 6. GET FILE METADATA (alternative to detail)
  async function loadMetadataOnly(dirName: string) {
    try {
      const metadata = await invoke('get_file_metadata', { dirName });
      console.log('Metadata loaded:', metadata);
      return metadata;
    } catch (error) {
      console.error('Failed to load metadata:', error);
      throw error;
    }
  }

  // 7. UPDATE FILE CONTENT
  async function handleUpdateContent() {
    if (!selectedFile) return;

    isLoading = true;
    try {
      await invoke('update_file', {
        dirName: selectedFile.id,
        content: editedContent
      });
      toast.success('Content updated successfully');
      showEditDialog = false;
      // Reload detail
      await viewFileDetail({ id: selectedFile.id } as ParsedFileListItem);
    } catch (error) {
      console.error('Failed to update content:', error);
      toast.error('Failed to update content');
    } finally {
      isLoading = false;
    }
  }

  // 8. RENAME FILE
  async function handleRename() {
    if (!fileToRename || !newName.trim()) return;

    isLoading = true;
    try {
      await invoke('rename_file', {
        dirName: fileToRename.id,
        newName: newName.trim()
      });
      toast.success('File renamed successfully');
      showRenameDialog = false;
      await loadParsedFiles();
    } catch (error) {
      console.error('Failed to rename:', error);
      toast.error('Failed to rename file');
    } finally {
      isLoading = false;
      newName = '';
      fileToRename = null;
    }
  }

  // 9. DELETE FILE
  async function handleDelete() {
    if (!fileToDelete) return;

    isLoading = true;
    try {
      await invoke('delete_file', { dirName: fileToDelete.id });
      toast.success('File deleted successfully');
      showDeleteDialog = false;
      await loadParsedFiles();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete file');
    } finally {
      isLoading = false;
      fileToDelete = null;
    }
  }

  // 10. OPEN IN DEFAULT EDITOR
  async function handleOpenInEditor(dirName: string) {
    try {
      await invoke('open_in_default_editor', { dirName });
      toast.success('Opened in default editor');
    } catch (error) {
      console.error('Failed to open editor:', error);
      toast.error('Failed to open in editor');
    }
  }

  // 11. OPEN IN FOLDER
  async function handleOpenInFolder(dirName: string) {
    try {
      await invoke('open_in_folder', { dirName });
      toast.success('Opened in file explorer');
    } catch (error) {
      console.error('Failed to open folder:', error);
      toast.error('Failed to open folder');
    }
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  onMount(() => {
    loadParsedFiles();
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function openEditDialog(file: ParsedFileDetail) {
    editedContent = file.content;
    showEditDialog = true;
  }

  function openRenameDialog(file: ParsedFileListItem) {
    fileToRename = file;
    newName = file.name;
    showRenameDialog = true;
  }

  function openDeleteDialog(file: ParsedFileListItem) {
    fileToDelete = file;
    showDeleteDialog = true;
  }

  // Recursive tree renderer helper
  function renderTree(node: ParsedPath, depth: number = 0): string {
    const indent = '  '.repeat(depth);
    if (node.type === 'File') {
      return `${indent}📄 ${node.name} (${formatBytes(node.size)})`;
    } else {
      let result = `${indent}📁 ${node.name}/\n`;
      for (const child of node.children) {
        result += renderTree(child, depth + 1) + '\n';
      }
      return result;
    }
  }
</script>

<!-- ============================================================================ -->
<!-- MAIN LAYOUT -->
<!-- ============================================================================ -->

<main class="container mx-auto max-w-7xl space-y-6 p-4">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">File Parser Dashboard</h1>
      <p class="text-muted-foreground mt-1">
        Manage your parsed files - {parsedFiles.length} total
      </p>
    </div>
    <div class="flex gap-2">
      <Button onclick={handleOpenForPreview} disabled={isParsingPreview}>
        {isParsingPreview ? 'Loading...' : '📋 Preview & Parse'}
      </Button>
      <Button variant="outline" onclick={handleQuickParse}>⚡ Quick Parse</Button>
      <Button variant="outline" onclick={loadParsedFiles} disabled={isLoading}>🔄 Refresh</Button>
    </div>
  </div>

  <!-- Files Grid -->
  {#if isLoading && parsedFiles.length === 0}
    <div class="text-muted-foreground flex h-64 items-center justify-center">
      <p>Loading parsed files...</p>
    </div>
  {:else if parsedFiles.length === 0}
    <Card.Root class="border-dashed">
      <Card.Content class="flex h-64 flex-col items-center justify-center gap-4">
        <div class="text-7xl">📂</div>
        <div class="text-center">
          <h3 class="text-lg font-semibold">No parsed files yet</h3>
          <p class="text-muted-foreground text-sm">
            Click "Preview & Parse" or "Quick Parse" to get started
          </p>
        </div>
      </Card.Content>
    </Card.Root>
  {:else}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each parsedFiles as file (file.id)}
        <Card.Root class="hover:border-primary transition-all hover:shadow-md">
          <Card.Header>
            <Card.Title class="flex items-center justify-between">
              <span class="truncate">{file.name}</span>
              <Badge variant="secondary">{file.files_count} files</Badge>
            </Card.Title>
            <Card.Description class="space-y-1 text-xs">
              <div>📦 Content: {formatBytes(file.file_size)}</div>
              <div>📊 Total: {formatBytes(file.total_size)}</div>
              <div>🕒 {formatDate(file.created_at)}</div>
            </Card.Description>
          </Card.Header>

          <Card.Content class="flex flex-wrap gap-2">
            <Button size="sm" onclick={() => viewFileDetail(file)}>👁️ View</Button>
            <Button size="sm" variant="outline" onclick={() => handleOpenInEditor(file.id)}>
              ✏️ Edit
            </Button>
            <Button size="sm" variant="outline" onclick={() => openRenameDialog(file)}>
              🏷️ Rename
            </Button>
            <Button size="sm" variant="outline" onclick={() => handleOpenInFolder(file.id)}>
              📁 Open
            </Button>
            <Button size="sm" variant="destructive" onclick={() => openDeleteDialog(file)}>
              🗑️ Delete
            </Button>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}
</main>

<!-- ============================================================================ -->
<!-- PREVIEW DIALOG -->
<!-- ============================================================================ -->

<Dialog.Root bind:open={showPreviewDialog}>
  <Dialog.Content class="max-w-3xl">
    <Dialog.Header>
      <Dialog.Title>Preview Files to Parse</Dialog.Title>
      <Dialog.Description>Review the file structure before parsing</Dialog.Description>
    </Dialog.Header>

    <div class="bg-muted max-h-96 overflow-auto rounded-lg p-4 font-mono text-sm">
      {#if previewTree.length > 0}
        <pre class="whitespace-pre">{previewTree.map((node) => renderTree(node)).join('\n')}</pre>
      {:else}
        <p class="text-muted-foreground">No files to preview</p>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (showPreviewDialog = false)}>Cancel</Button>
      <Button
        onclick={() => {
          // Extract paths from preview tree
          const paths: string[] = [];
          function extractPaths(node: ParsedPath) {
            if (node.type === 'File') {
              paths.push(node.path);
            } else {
              paths.push(node.path);
              node.children.forEach(extractPaths);
            }
          }
          previewTree.forEach(extractPaths);
          handleParse([...new Set(paths)]); // Remove duplicates
        }}
        disabled={isParsing}
      >
        {isParsing ? 'Parsing...' : '✅ Parse Files'}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- ============================================================================ -->
<!-- DETAIL VIEW DIALOG -->
<!-- ============================================================================ -->

<Dialog.Root bind:open={showDetailDialog}>
  <Dialog.Content class="max-w-5xl">
    {#if selectedFile}
      <Dialog.Header>
        <Dialog.Title>{selectedFile.name}</Dialog.Title>
        <Dialog.Description>
          {selectedFile.metadata.files_count} files •
          {formatBytes(selectedFile.metadata.total_size)} • Created {formatDate(
            selectedFile.metadata.created_at
          )}
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <!-- File Tree -->
        <div>
          <h4 class="mb-2 font-semibold">File Structure:</h4>
          <div class="bg-muted max-h-48 overflow-auto rounded-lg p-3 font-mono text-xs">
            <pre>{selectedFile.metadata.file_tree.map((node) => renderTree(node)).join('\n')}</pre>
          </div>
        </div>

        <!-- Parsed Files List -->
        <div>
          <h4 class="mb-2 font-semibold">Parsed Files ({selectedFile.metadata.files.length}):</h4>
          <div class="bg-muted max-h-32 space-y-1 overflow-auto rounded-lg p-3 text-xs">
            {#each selectedFile.metadata.files as file}
              <div class="flex justify-between">
                <span class="truncate">{file.name}</span>
                <span class="text-muted-foreground">{formatBytes(file.size)}</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Content Preview -->
        <div>
          <h4 class="mb-2 font-semibold">Content Preview:</h4>
          <div class="bg-muted max-h-64 overflow-auto rounded-lg p-3 font-mono text-xs">
            <pre class="whitespace-pre-wrap">{selectedFile.content.substring(0, 1000)}{selectedFile
                .content.length > 1000
                ? '\n\n... (truncated)'
                : ''}</pre>
          </div>
        </div>
      </div>

      <Dialog.Footer class="gap-2">
        <Button variant="outline" onclick={() => (showDetailDialog = false)}>Close</Button>
        <Button onclick={() => openEditDialog(selectedFile)}>✏️ Edit Content</Button>
        <Button variant="outline" onclick={() => handleOpenInEditor(selectedFile.id)}>
          📝 Open in Editor
        </Button>
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<!-- ============================================================================ -->
<!-- EDIT CONTENT DIALOG -->
<!-- ============================================================================ -->

<Dialog.Root bind:open={showEditDialog}>
  <Dialog.Content class="max-w-4xl">
    <Dialog.Header>
      <Dialog.Title>Edit Content</Dialog.Title>
      <Dialog.Description>Make changes to the parsed file content</Dialog.Description>
    </Dialog.Header>

    <textarea
      bind:value={editedContent}
      class="font-mono text-sm"
      rows={20}
      placeholder="Edit content here..."
    ></textarea>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (showEditDialog = false)}>Cancel</Button>
      <Button onclick={handleUpdateContent} disabled={isLoading}>
        {isLoading ? 'Saving...' : '💾 Save Changes'}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- ============================================================================ -->
<!-- RENAME DIALOG -->
<!-- ============================================================================ -->

<Dialog.Root bind:open={showRenameDialog}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Rename File</Dialog.Title>
      <Dialog.Description>
        Enter a new name for "{fileToRename?.name}"
      </Dialog.Description>
    </Dialog.Header>

    <Input
      bind:value={newName}
      placeholder="New name..."
      onkeydown={(e) => e.key === 'Enter' && handleRename()}
    />

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (showRenameDialog = false)}>Cancel</Button>
      <Button onclick={handleRename} disabled={isLoading || !newName.trim()}>
        {isLoading ? 'Renaming...' : '✅ Rename'}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- ============================================================================ -->
<!-- DELETE CONFIRMATION DIALOG -->
<!-- ============================================================================ -->

<AlertDialog.Root bind:open={showDeleteDialog}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This will permanently delete "{fileToDelete?.name}" and all its contents. This action cannot
        be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel onclick={() => (showDeleteDialog = false)}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={handleDelete} disabled={isLoading}>
        {isLoading ? 'Deleting...' : '🗑️ Delete'}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
