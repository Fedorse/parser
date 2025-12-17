<script lang="ts">
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { onDestroy, onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import ToggleThemeButton from '$lib/components/theme-switch-button.svelte';
  import { Settings, Monitor, ChevronLeft, Minus, Square, X } from '@lucide/svelte/icons';
  import { parseQueue } from '$lib/state-utils/store-parse-queue.svelte';
  import { Button } from '$lib/components/ui/button/index';
  import { Badge } from '@/lib/components/ui/badge/index.js';

  let isFullscreen = $state(false);

  const appWindow = getCurrentWindow();

  const isHome = $derived(page.url.pathname === '/');
  const isMac = typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');

  const getParentPath = (currentPath: string): string | null => {
    if (currentPath === '/') return null;
    if (currentPath.includes('/files/') && currentPath.endsWith('/edit')) return '/files';
    if (currentPath.startsWith('/graph/')) return '/files';
    if (currentPath === '/files') return '/';
    return '/';
  };

  function minimize() {
    appWindow.minimize();
  }
  function maximize() {
    appWindow.toggleMaximize();
  }
  function close() {
    appWindow.close();
  }

  const parentPath = $derived(getParentPath(page.url.pathname));

  const goBack = () => {
    if (parentPath) goto(parentPath);
  };

  const toggleSidebar = () => {
    parseQueue.setOpen(!parseQueue.isSideBarOpen);
  };

  onMount(async () => {
    isFullscreen = await appWindow.isFullscreen();
    const unlisten = await appWindow.onResized(async () => {
      isFullscreen = await appWindow.isFullscreen();
    });
    return () => {
      unlisten();
    };
  });
</script>

<nav
  class={{
    'border-border bg-card/20 supports-[backdrop-filter]:bg-background/60 z-50 flex min-h-10 w-full items-center  justify-between border-b backdrop-blur select-none': true,
    'pl-18': !isFullscreen,
    'pl-2': isFullscreen
  }}
  data-tauri-drag-region
>
  <div class="flex">
    {#if !isHome}
      <Button
        variant="ghost"
        onclick={goBack}
        class="text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <ChevronLeft class="size-4" />
        <span class="text-[10px]">Back</span>
      </Button>
    {/if}
  </div>

  <div class="flex items-center gap-3 pr-4">
    {@render controlSystemActiv()}
    <!-- <Separator orientation="vertical" class="text-muted-foreground mx-1 h-full w-1" /> -->
    <ToggleThemeButton />
  </div>
  {#if !isMac}
    <div class="bg-border mx-1 h-4 w-[1px]"></div>
    <div class="flex h-10 items-start">
      <button onclick={minimize} class="win-btn" title="Minimize">
        <Minus size={16} />
      </button>
      <button onclick={maximize} class="win-btn" title="Maximize">
        <Square size={14} />
      </button>
      <button onclick={close} class="win-btn hover:bg-red-600 hover:text-white" title="Close">
        <X size={16} />
      </button>
    </div>
  {/if}
</nav>

{#snippet controlSystemActiv()}
  <Button
    onclick={toggleSidebar}
    variant="ghost"
    class="text-muted-foreground hover:text-foreground cursor-pointer "
    size="icon"
  >
    <div class="relative">
      <Monitor class="size-4" />
      {#if parseQueue.completedParses.length > 0 && !parseQueue.hasActiveParsing}
        <div
          class={{
            'bg-background absolute -top-2.5 -right-1.5 rounded-full ': true
          }}
        >
          <Badge class="h-3 w-3 rounded-full p-1  text-[10px] tabular-nums"
            >{parseQueue.completedParses.length}</Badge
          >
        </div>
      {:else}
        <div
          class={{
            'bg-background absolute -top-1.5 -right-1.5 rounded-full p-[1px]': true
          }}
        >
          <Settings
            class={{
              ' size-3': true,
              'text-warn animate-spin': parseQueue.hasActiveParsing,
              'text-foreground': !parseQueue.hasActiveParsing
            }}
          />
        </div>
      {/if}
    </div>
  </Button>
{/snippet}
