<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { ModeWatcher } from 'mode-watcher';
  import NavBar from '$lib/components/app-navbar.svelte';
  import FileDialogEdit from '$lib/components/file-dialog-edit.svelte';
  import ParseQueueSideBar from '@/lib/components/parse-queue-side-bar.svelte';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { Toaster } from '$lib/components/ui/sonner/index.js';
  import PageTranstion from '@/lib/components/page-transtion.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { parseQueue } from '$lib/state-utils/store-parse-queue.svelte';

  let { children } = $props();

  const editFile = $derived(page.state.editFile);

  const handleCloseEditor = () => {
    history.back();
  };

  onMount(() => {
    parseQueue.mount();
  });

  onDestroy(() => {
    parseQueue.unmount();
  });
</script>

<Tooltip.Provider delayDuration={1000}>
  <Toaster richColors={true} position="bottom-right" />
  <div class="flex h-screen w-screen flex-col">
    <NavBar />
    <ModeWatcher />
    <PageTranstion>
      {@render children?.()}
    </PageTranstion>
    {#if editFile}
      <FileDialogEdit
        fileId={editFile.id}
        searchPath={editFile.searchPath}
        onClose={() => handleCloseEditor()}
      />
    {/if}
    <ParseQueueSideBar />
  </div>
</Tooltip.Provider>
