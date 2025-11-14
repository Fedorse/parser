<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import { FileClock, FileCheck } from '@lucide/svelte/icons';
  import { Button } from '$lib/components/ui/button';
  import ToggleThemeButton from '$lib/components/theme-switch-button.svelte';
  import { parseQueue } from '$lib/state-utils/store-parse-queue.svelte';
  import { X } from '@lucide/svelte/icons';

  const isHome = $derived(page.url.pathname === '/');

  const getParentPath = (currentPath: string): string | null => {
    if (currentPath === '/') return null;

    if (currentPath.includes('/files/') && currentPath.endsWith('/edit')) {
      return '/files';
    }

    if (currentPath.startsWith('/graph/')) {
      return '/files';
    }

    if (currentPath === '/files') {
      return '/';
    }

    return '/';
  };

  const parentPath = $derived(getParentPath(page.url.pathname));

  const goBack = () => {
    if (parentPath) {
      goto(parentPath);
    }
  };
</script>

<nav class="flex h-20 w-full items-center justify-between px-6 py-10">
  <div>
    {#if !isHome}
      <button
        type="button"
        class="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition"
        onclick={goBack}
      >
        <ArrowLeft class="size-5" />
        <span class="text-sm">Back</span>
      </button>
    {/if}
  </div>

  <div class="flex items-center gap-2">
    {#if parseQueue.size > 0}
      <div class="bg-card/80 flex items-center gap-3 rounded-lg border px-3 py-1">
        <div
          class={{
            'text-warn': parseQueue.hasActiveParsing,
            'text-chart-2': !parseQueue.hasActiveParsing
          }}
        >
          {#if parseQueue.hasActiveParsing}
            <FileClock class="size-4.5 stroke-1" />
          {:else}
            <FileCheck class="size-4.5 stroke-1" />
          {/if}
        </div>

        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-xs tracking-tight">
              {parseQueue.hasActiveParsing ? 'Parsing in progress' : 'Parses completed'}
            </span>
            {#if parseQueue.activeParses.length > 0}
              <div class="relative flex size-1.5">
                <span
                  class="bg-warn/50 absolute inline-flex h-full w-full animate-ping rounded-full"
                />
                <span class="bg-warn relative inline-flex size-1.5 rounded-full" />
              </div>
            {/if}
          </div>
          <p class="text-muted-foreground truncate text-[11px]">
            {parseQueue.size} queue • {parseQueue.completedParses.length} completed
          </p>
        </div>

        {#if parseQueue.completedParses.length > 0}
          <button
            class="text-muted-foreground hover:text-foreground"
            onclick={() => parseQueue.clearCompleted()}
          >
            <X class="size-4" />
          </button>
        {/if}
      </div>
    {/if}

    <ToggleThemeButton />
  </div>
</nav>
