<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { parseQueue } from '$lib/state-utils/store-parse-queue.svelte';
  import { Settings, Monitor, ChevronLeft } from '@lucide/svelte/icons';
  import ToggleThemeButton from '$lib/components/theme-switch-button.svelte';
  import { Button } from '$lib/components/ui/button/index';
  import { Badge } from '@/lib/components/ui/badge/index.js';

  const isHome = $derived(page.url.pathname === '/');

  const getParentPath = (currentPath: string): string | null => {
    if (currentPath === '/') return null;
    if (currentPath.includes('/files/') && currentPath.endsWith('/edit')) return '/files';
    if (currentPath.startsWith('/graph/')) return '/files';
    if (currentPath === '/files') return '/';
    return '/';
  };

  const parentPath = $derived(getParentPath(page.url.pathname));

  const goBack = () => {
    if (parentPath) goto(parentPath);
  };

  const toggleSidebar = () => {
    parseQueue.setOpen(!parseQueue.isSideBarOpen);
  };
</script>

<nav class="flex h-20 w-full items-center justify-between px-6 py-10">
  <div>
    {#if !isHome}
      <button
        type="button"
        class="text-muted-foreground hover:text-foreground inline-flex items-center transition"
        onclick={goBack}
      >
        <ChevronLeft class="size-6" />
        <span class="text-xs">Back</span>
      </button>
    {/if}
  </div>

  <div class="flex items-center gap-3">
    {@render controlSystemActiv()}
    <ToggleThemeButton />
  </div>
</nav>

{#snippet controlSystemActiv()}
  <Button onclick={toggleSidebar} variant="nav" class="cursor-pointer p-5" size="icon">
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
