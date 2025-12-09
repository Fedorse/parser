<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { invoke } from '@tauri-apps/api/core';
  import { onMount } from 'svelte';

  // --- Types ---
  type ParsedPath = {
    type: 'File' | 'Directory';
    name: string;
    path: string;
    size: number;
    children?: ParsedPath[];
    isExpanded?: boolean; // UI state
  };

  type HistoryItem = {
    id: string;
    name: string;
    remote_url: string; // Added this field
    created_at: string;
  };

  // --- State ---
  let previewTree = $state<ParsedPath[]>([]);
  let historyList = $state<HistoryItem[]>([]);
  let parsedTree = $state<ParsedPath[]>([]);
  let currentParsedId = $state<string>('');

  $effect(() => {
    console.log('preview-tree', previewTree);
  });

  // Remote / Cloning State
  let repoUrl = $state('');
  let isCloning = $state(false);
  let isParsing = $state(false);

  // --- 1. SELECTION PHASE ---

  // Option A: Local Files
  async function selectLocalFiles() {
    // 1. Clear Remote state to ensure we are in "Local Mode"
    repoUrl = '';

    console.log('1. Opening Dialog...');
    const selected = await open({ multiple: true, directory: true });

    if (selected) {
      console.log('2. Selected Local Paths:', selected);
      // Shallow Load from OS
      const res = await invoke<ParsedPath[]>('get_preview_tree', { paths: selected });
      previewTree = res;
    }
  }

  // Option B: Remote GitHub
  async function cloneRepo() {
    if (!repoUrl) return alert('Please enter a GitHub URL');

    isCloning = true;
    previewTree = []; // Clear previous tree

    try {
      console.log(`Cloning ${repoUrl}...`);

      // 1. Call Rust to clone. Returns the temp folder path.
      const tempPath = await invoke<string>('parse_repository', { url: repoUrl });
      console.log('Cloned to temp path:', tempPath);

      // 2. Load shallow preview of that temp folder just like a local folder
      const res = await invoke<ParsedPath[]>('get_preview_tree', { paths: [tempPath] });
      previewTree = res;
    } catch (e) {
      console.error('Clone failed:', e);
      alert('Failed to clone repository');
    } finally {
      isCloning = false;
    }
  }

  // Common: Expand Folders (Works for both Local and Temp/Remote paths)
  async function expandSystemFolder(node: ParsedPath) {
    if (node.type !== 'Directory') return;
    if (node.isExpanded) {
      node.isExpanded = false;
      return;
    }

    try {
      const children = await invoke<ParsedPath[]>('expand_folder', { path: node.path });
      node.children = children;
      node.isExpanded = true;
    } catch (e) {
      console.error('Expand Error', e);
    }
  }

  // --- 2. PARSING PHASE ---

  async function runParse() {
    const pathsToParse = previewTree.map((n) => n.path);
    if (pathsToParse.length === 0) {
      alert('No files to parse');
      return;
    }

    isParsing = true;
    console.log('Parsing paths:', pathsToParse);

    try {
      // If we cloned a repo, `repoUrl` is set.
      // Rust uses this to tag metadata and trigger auto-cleanup of the temp folder.
      const res = await invoke('parse', {
        paths: pathsToParse,
        app: null,
        remoteUrl: repoUrl || null
      });

      console.log('Parse success:', res);

      // Reset UI
      previewTree = [];
      repoUrl = '';
      await loadHistory();
    } catch (e) {
      console.error('Parse Error', e);
      alert('Parse failed');
    } finally {
      isParsing = false;
    }
  }

  // --- 3. HISTORY PHASE ---

  async function loadHistory() {
    const res = await invoke<HistoryItem[]>('get_files', { limit: 10 });
    historyList = res;
  }

  async function loadParsedTree(id: string) {
    currentParsedId = id;
    try {
      // Shallow load from JSON structure
      const res = await invoke<ParsedPath[]>('get_parsed_preview_tree', { dirName: id });
      parsedTree = res;
    } catch (e) {
      console.error(e);
    }
  }

  async function expandParsedFolder(node: ParsedPath) {
    if (node.type !== 'Directory') return;
    if (node.isExpanded) {
      node.isExpanded = false;
      return;
    }

    try {
      const children = await invoke<ParsedPath[]>('expand_parsed_folder', {
        dirName: currentParsedId,
        path: node.path
      });
      node.children = children;
      node.isExpanded = true;
    } catch (e) {
      console.error('Expand Error', e);
    }
  }

  async function openFolder(id: string) {
    await invoke('open_in_folder', { dirName: id });
  }

  onMount(() => {
    loadHistory();
  });
</script>

<!-- --- UI --- -->

<div class="mx-auto max-w-5xl space-y-8 p-8 font-mono text-sm text-gray-800">
  <!-- SECTION A: SOURCE SELECTION -->
  <section class="rounded border border-gray-200 bg-gray-50 p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-bold text-gray-900">1. Select Source</h2>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      <!-- Option 1: Local -->
      <div class="space-y-2">
        <h3 class="font-bold text-gray-700">Option A: Local Files</h3>
        <p class="text-xs text-gray-500">Select files from your computer.</p>
        <button
          onclick={selectLocalFiles}
          disabled={isCloning || isParsing}
          class="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          Select Local Paths
        </button>
      </div>

      <!-- Option 2: Remote -->
      <div class="space-y-2 border-l border-gray-300 pl-8">
        <h3 class="font-bold text-gray-700">Option B: GitHub Repo</h3>
        <p class="text-xs text-gray-500">Clone a public repository temporarily.</p>
        <div class="flex gap-2">
          <input
            type="text"
            bind:value={repoUrl}
            disabled={isCloning || isParsing}
            placeholder="https://github.com/user/repo"
            class="flex-1 rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            onclick={cloneRepo}
            disabled={isCloning || isParsing || !repoUrl}
            class="min-w-[100px] rounded bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            {isCloning ? 'Cloning...' : 'Load'}
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION B: PREVIEW & PARSE -->
  <section class="rounded border border-gray-200 bg-gray-50 p-6 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-gray-900">2. Preview & Parse</h2>
        {#if repoUrl}
          <span class="text-xs font-bold text-purple-600">Active Mode: Remote Repo</span>
        {:else if previewTree.length > 0}
          <span class="text-xs font-bold text-blue-600">Active Mode: Local Files</span>
        {/if}
      </div>

      <button
        onclick={runParse}
        disabled={previewTree.length === 0 || isParsing || isCloning}
        class="rounded bg-green-600 px-6 py-2 font-bold text-white transition hover:bg-green-700 disabled:bg-gray-400"
      >
        {isParsing ? 'PARSING...' : 'RUN PARSE'}
      </button>
    </div>

    <!-- File Tree -->
    <div
      class="max-h-[300px] min-h-[150px] overflow-auto rounded border border-gray-200 bg-white p-4"
    >
      {#if previewTree.length === 0}
        <div class="flex h-full items-center justify-center text-gray-400 italic">
          No source loaded yet. Select Local Files or Clone a Repo.
        </div>
      {:else}
        <ul>
          {#each previewTree as node}
            {@render treeNode(node, 'system')}
          {/each}
        </ul>
      {/if}
    </div>
  </section>

  <!-- SECTION C: HISTORY -->
  <section class="rounded border border-gray-200 bg-gray-50 p-6 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold text-gray-900">3. Parsed History</h2>
      <button onclick={loadHistory} class="text-xs text-blue-600 hover:underline"
        >Refresh List</button
      >
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- List -->
      <div class="h-[400px] overflow-auto rounded border border-gray-200 bg-white p-2">
        <h3 class="mb-2 border-b p-1 text-xs font-bold text-gray-500 uppercase">
          Available Parsings
        </h3>
        <ul>
          {#each historyList as item}
            <li class="mb-2 border-b pb-2 last:border-0">
              <div class="flex items-start justify-between">
                <button
                  onclick={() => loadParsedTree(item.id)}
                  class="w-full rounded p-1 text-left transition hover:bg-blue-50"
                  class:bg-blue-100={currentParsedId === item.id}
                >
                  <div class="font-bold text-gray-800">{item.name}</div>
                  {#if item.remote_url}
                    <div class="max-w-[200px] truncate text-xs text-purple-600">
                      {item.remote_url}
                    </div>
                  {/if}
                  <div class="text-[10px] text-gray-400">{item.created_at}</div>
                </button>
                <button
                  onclick={() => openFolder(item.id)}
                  title="Open in Folder"
                  class="ml-2 rounded p-1 text-gray-500 hover:bg-gray-200"
                >
                  📂
                </button>
              </div>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Tree View -->
      <div class="h-[400px] overflow-auto rounded border border-gray-200 bg-white p-2">
        <h3 class="mb-2 border-b p-1 text-xs font-bold text-gray-500 uppercase">
          Structure Preview {currentParsedId ? `(${currentParsedId.substring(0, 8)}...)` : ''}
        </h3>
        {#if parsedTree.length === 0}
          <div class="mt-10 text-center text-xs text-gray-400 italic">
            Select an item from the left to view structure
          </div>
        {:else}
          <ul>
            {#each parsedTree as node}
              {@render treeNode(node, 'parsed')}
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </section>
</div>

<!-- --- RECURSIVE TREE NODE SNIPPET --- -->
{#snippet treeNode(node: ParsedPath, mode: 'system' | 'parsed')}
  <li class="my-1 border-l border-gray-200 pl-4">
    <div class="flex items-center gap-2 text-sm">
      <!-- Folder -->
      {#if node.type === 'Directory'}
        <button
          class="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-300"
          onclick={() => (mode === 'system' ? expandSystemFolder(node) : expandParsedFolder(node))}
        >
          {node.isExpanded ? '-' : '+'}
        </button>
        <span class="font-semibold text-blue-800">📂 {node.name}</span>

        <!-- File -->
      {:else}
        <span class="h-5 w-5"></span>
        <!-- Spacer for alignment -->
        <span class="text-gray-700">📄 {node.name}</span>
        <span class="text-xs text-gray-400">({node.size} b)</span>
      {/if}
    </div>

    <!-- Children (Recursive) -->
    {#if node.isExpanded && node.children}
      <ul class="ml-2 transition-all">
        {#each node.children as child}
          {@render treeNode(child, mode)}
        {/each}
      </ul>
    {/if}
  </li>
{/snippet}
