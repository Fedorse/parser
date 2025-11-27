<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { ModeWatcher } from 'mode-watcher';
  import NavBar from '$lib/components/app-navbar.svelte';
  import FileDialogEdit from '$lib/components/file-dialog-edit.svelte';
  import ParseQueueSideBar from '@/lib/components/parse-queue-side-bar.svelte';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { Toaster } from '$lib/components/ui/sonner/index.js';
  import { fly } from 'svelte/transition';
  import { expoOut, expoIn, sineIn } from 'svelte/easing';

  let { children } = $props();
  const editFile = $derived(page.state.editFile);

  const handleCloseEditor = () => {
    history.back();
  };

  // 1
  //   in:fly={{ y: 20, duration: 200, easing: cubicOut, delay: 200 }}
  // out:fly={{ y: -20, duration: 200, easing: sineIn }}
</script>

<Tooltip.Provider delayDuration={1000}>
  <Toaster richColors={true} position="bottom-right" />
  <div class="flex h-screen w-screen flex-col">
    <NavBar />
    <ModeWatcher />

    <main class=" grid flex-1">
      {#key page.url.pathname}
        <div
          class="col-start-1 row-start-1 h-full w-full"
          in:fly={{ x: 20, duration: 200, easing: expoOut, delay: 200 }}
          out:fly={{ x: -20, duration: 200, easing: sineIn }}
        >
          {@render children?.()}
        </div>
      {/key}
    </main>

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
