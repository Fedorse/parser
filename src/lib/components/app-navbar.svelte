<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import ToggleThemeButton from '$lib/components/theme-switch-button.svelte';

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
    <ToggleThemeButton />
  </div>
</nav>
