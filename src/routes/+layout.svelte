<script lang="ts">
  import '../app.css';
  import NavBar from '$lib/components/app-navbar.svelte';
  import { ModeWatcher } from 'mode-watcher';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { Toaster } from '$lib/components/ui/sonner/index.js';
  import { setLoadingContext } from '@/lib/state-utils/store-loading.svelte';

  let { children } = $props();
  let loading = setLoadingContext();
</script>

<Tooltip.Provider delayDuration={100}>
  <Toaster richColors={true} position="bottom-right" />
  <div class="flex h-screen flex-col">
    <NavBar />
    <main class="flex flex-1 p-4">
      <ModeWatcher />
      {@render children?.()}
    </main>
  </div>
</Tooltip.Provider>
