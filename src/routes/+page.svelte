<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { invoke } from '@tauri-apps/api/core';
  import { onMount } from 'svelte';

  // --- Types matching Rust ---
  type ParsedPath = {
    type: 'File' | 'Directory';
    name: string;
    path: string;
    size: number;
    children?: ParsedPath[];
    // We add this for UI state, not from Rust initially
    isExpanded?: boolean;
  };

  type HistoryItem = {
    id: string;
    name: string;
    created_at: string;
  };

  // --- State ---
  let previewTree = $state<ParsedPath[]>([]); // Files selected from OS
  let historyList = $state<HistoryItem[]>([]); // Result of get_files
  let parsedTree = $state<ParsedPath[]>([]); // Tree of a specific parsed result
  let currentParsedId = $state<string>(''); // ID of the parsed result being viewed

  // --- 1. File Selection & System Expansion ---

  async function selectFiles() {
    console.log('1. Opening Dialog...');
    const selected = await open({ multiple: true, directory: true });

    if (selected) {
      console.log('2. Selected Paths:', selected);
      // Initial Shallow Load
      const res = await invoke<ParsedPath[]>('get_preview_tree', { paths: selected });
      console.log('3. get_preview_tree result:', res);
      previewTree = res;
    }
  }

  async function expandSystemFolder(node: ParsedPath) {
    if (node.type !== 'Directory') return;

    // Toggle close
    if (node.isExpanded) {
      node.isExpanded = false;
      return;
    }

    console.log(`> Expanding System Folder: ${node.path}`);
    try {
      // CALL RUST: expand_folder
      const children = await invoke<ParsedPath[]>('expand_folder', { path: node.path });
      console.log('< Result:', children);

      node.children = children;
      node.isExpanded = true;
    } catch (e) {
      console.error('Expand Error', e);
    }
  }

  // --- 2. Parsing ---

  async function runParse() {
    // For this test, we just parse the top-level paths found in previewTree
    const pathsToParse = previewTree.map((n) => n.path);
    if (pathsToParse.length === 0) {
      alert('No files selected');
      return;
    }

    console.log('4. Parsing paths:', pathsToParse);
    try {
      const res = await invoke('parse', { paths: pathsToParse, app: null }); // app handle usually injected by Tauri automagically or ignored in frontend args depending on setup
      console.log('5. Parse success:', res);
      await loadHistory(); // Refresh list
      previewTree = []; // Clear selection
    } catch (e) {
      console.error('Parse Error', e);
    }
  }

  // --- 3. History & Parsed Tree Expansion ---

  async function loadHistory() {
    console.log('Loading History...');
    const res = await invoke<HistoryItem[]>('get_files', { limit: 10 });
    historyList = res;
    console.log('History loaded:', res);
  }

  async function loadParsedTree(id: string) {
    console.log(`Loading Tree for ID: ${id}`);
    currentParsedId = id;
    try {
      // Initial Shallow Load of persisted tree
      const res = await invoke<ParsedPath[]>('get_file_tree', { dirName: id });
      console.log('Tree loaded:', res);
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

    console.log(`> Expanding Parsed DB Folder: ${node.path} (ID: ${currentParsedId})`);
    try {
      // CALL RUST: expand_parsed_folder
      const children = await invoke<ParsedPath[]>('expand_parsed_folder', {
        dirName: currentParsedId,
        path: node.path
      });
      console.log('< Result:', children);

      node.children = children;
      node.isExpanded = true;
    } catch (e) {
      console.error('Expand Error', e);
    }
  }

  onMount(() => {
    loadHistory();
  });
</script>

<!-- --- UI --- -->

<div class="mx-auto max-w-4xl space-y-8 p-8 font-mono text-sm">
  <!-- SECTION A: Select Files -->
  <section class="rounded border bg-gray-50 p-4">
    <h2 class="mb-4 text-lg font-bold">A. File System Selection</h2>
    <div class="mb-4 flex gap-4">
      <button
        onclick={selectFiles}
        class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        1. Select Files/Folders
      </button>
      <button
        onclick={runParse}
        class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        2. Run Parse
      </button>
    </div>

    <div class="max-h-[300px] min-h-[100px] overflow-auto border bg-white p-4">
      {#if previewTree.length === 0}
        <p class="text-gray-400 italic">No files selected</p>
      {:else}
        <!-- Render the Tree Snippet -->
        <ul>
          {#each previewTree as node}
            {@render treeNode(node, 'system')}
          {/each}
        </ul>
      {/if}
    </div>
  </section>

  <!-- SECTION B: Parsed History & Deep Inspection -->
  <section class="rounded border bg-gray-50 p-4">
    <h2 class="mb-4 text-lg font-bold">B. Parsed History (Lazy Load)</h2>
    <button onclick={loadHistory} class="mb-4 rounded bg-gray-200 px-2 py-1 text-xs"
      >Refresh List</button
    >

    <div class="grid grid-cols-2 gap-4">
      <!-- List -->
      <div class="h-[400px] overflow-auto border bg-white p-2">
        <h3 class="mb-2 border-b font-bold">History List</h3>
        <ul>
          {#each historyList as item}
            <li class="mb-2">
              <button
                onclick={() => loadParsedTree(item.id)}
                class="w-full rounded p-1 text-left text-xs hover:bg-blue-50"
                class:bg-blue-100={currentParsedId === item.id}
              >
                <div class="font-bold">{item.name}</div>
                <div class="text-gray-500">{item.id}</div>
              </button>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Tree View -->
      <div class="h-[400px] overflow-auto border bg-white p-2">
        <h3 class="mb-2 border-b font-bold">Tree View</h3>
        {#if parsedTree.length === 0}
          <p class="text-gray-400 italic">Select an item to view tree</p>
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

<!-- --- RECURSIVE SNIPPET --- -->
{#snippet treeNode(node: ParsedPath, mode: 'system' | 'parsed')}
  <li class="my-1 border-l border-gray-200 pl-4">
    <div class="flex items-center gap-2">
      <!-- Folder Toggle / File Icon -->
      {#if node.type === 'Directory'}
        <button
          class="flex h-5 w-5 items-center justify-center rounded bg-gray-200 font-bold hover:bg-gray-300"
          onclick={() => (mode === 'system' ? expandSystemFolder(node) : expandParsedFolder(node))}
        >
          {node.isExpanded ? '-' : '+'}
        </button>
        <span class="font-bold text-blue-800">📂 {node.name}</span>
      {:else}
        <span class="h-5 w-5"></span>
        <!-- Spacer -->
        <span class="text-gray-700">📄 {node.name}</span>
        <span class="text-xs text-gray-400">({node.size}b)</span>
      {/if}
    </div>

    <!-- Children (Recursive) -->
    {#if node.isExpanded && node.children}
      <ul class="ml-2">
        {#each node.children as child}
          {@render treeNode(child, mode)}
        {/each}
      </ul>
    {/if}
  </li>
{/snippet}
