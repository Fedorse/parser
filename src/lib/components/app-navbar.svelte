<script lang="ts">
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { onMount } from 'svelte';
  import { type } from '@tauri-apps/plugin-os';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import ToggleThemeButton from '$lib/components/theme-switch-button.svelte';
  import {
    Settings,
    Monitor,
    ChevronLeft,
    Square,
    Minus,
    X,
    SquaresExclude
  } from '@lucide/svelte/icons';
  import { parseQueue } from '$lib/state-utils/store-parse-queue.svelte';
  import { Button } from '$lib/components/ui/button/index';
  import { Badge } from '@/lib/components/ui/badge/index.js';

  let isFullscreen = $state(false);
  let isMaximized = $state(false);
  let osType = $state<string | null>(null);
  const isMac = $derived(osType === 'macos');

  const appWindow = getCurrentWindow();

  const isHome = $derived(page.url.pathname === '/');

  const getParentPath = (currentPath: string): string | null => {
    if (currentPath === '/') return null;
    if (currentPath.includes('/files/') && currentPath.endsWith('/edit')) return '/files';
    if (currentPath.startsWith('/graph/')) return '/files';
    if (currentPath === '/files') return '/';
    return '/';
  };

  const parentPath = $derived(getParentPath(page.url.pathname));

  function minimize() {
    appWindow.minimize();
  }
  function maximize() {
    appWindow.toggleMaximize();
  }
  function close() {
    appWindow.close();
  }

  const goBack = () => {
    if (parentPath) goto(parentPath);
  };

  const toggleSidebar = () => {
    parseQueue.setOpen(!parseQueue.isSideBarOpen);
  };

  const checkStateScreen = async () => {
    isMaximized = await appWindow.isMaximized();
    isFullscreen = await appWindow.isFullscreen();
  };

  onMount(() => {
    let unlistenResize: () => void;
    const init = async () => {
      osType = await type();
      await checkStateScreen();
      unlistenResize = await appWindow.onResized(async () => {
        checkStateScreen();
      });
    };

    init();
    return () => {
      if (unlistenResize) return unlistenResize();
    };
  });
</script>

<nav
  class={{
    'border-border bg-card/20 supports-[backdrop-filter]:bg-background/60 flex min-h-10 w-full items-center  justify-between border-b backdrop-blur select-none': true,
    'pl-18': !isFullscreen && isMac,
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

  <div class="flex items-center gap-3">
    {@render controlSystemActiv()}

    <ToggleThemeButton />
    {#if !isMac}
      <div class=" border-border/40 no-drag flex">
        <button onclick={minimize} title="Minimize" class="px-3">
          <Minus size={16} />
        </button>

        <button onclick={maximize} title="Maximize" class="px-3">
          {#if isMaximized}
            <SquaresExclude size={14} />
          {:else}
            <Square size={14} />
          {/if}
        </button>

        <button onclick={close} class=" w-full p-3 hover:bg-red-600 hover:text-white" title="Close">
          <X size={18} class="stroke-1" />
        </button>
      </div>
    {/if}
  </div>
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
