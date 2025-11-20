<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { ModeWatcher } from 'mode-watcher';
  import NavBar from '$lib/components/app-navbar.svelte';
  import FileDialogEdit from '$lib/components/file-dialog-edit.svelte';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { Toaster } from '$lib/components/ui/sonner/index.js';

  let { children } = $props();
  const editFile = $derived(page.state.editFile);

  const handleCloseEditor = () => {
    history.back();
  };
</script>

<!-- {#if loading.inProgress}
  <div
    class="bg-muted fixed top-0 right-0 left-0 z-50 h-0.5"
    role="progressbar"
    aria-label="Page loading progress"
    aria-valuemax="100"
    aria-valuemin="0"
    aria-valuenow={Math.round(loading.progress?.current || 0)}
  >
    <div
      style="width: {loading.progress?.current || 0}%"
      class="bg-primary h-full transition-all duration-100"
    />
  </div>
{/if} -->

<Tooltip.Provider delayDuration={1000}>
  <Toaster richColors={true} position="bottom-right" />
  <div class="flex h-screen flex-col">
    <NavBar />
    <main class="flex flex-1 p-4">
      <ModeWatcher />
      {@render children?.()}
    </main>
    {#if editFile}
      <FileDialogEdit
        fileId={editFile.id}
        searchPath={editFile.searchPath}
        onClose={() => handleCloseEditor()}
      />
    {/if}
  </div>
</Tooltip.Provider>
