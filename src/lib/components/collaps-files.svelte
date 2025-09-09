<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import { ChevronRight } from '@lucide/svelte';
  import FileText from '@lucide/svelte/icons/file-text';
  import Button from '$lib/components/ui/button/button.svelte';
  import { formatFileSize } from '$lib/utils';
  import { invoke } from '@tauri-apps/api/core';
  import { toast } from 'svelte-sonner';

  type SavedFiles = {
    name: string;
    path: string;
    preview: string;
    size: number;
  };

  let isRecentOpen = $state(true);
  let savedFiles = $state<SavedFiles[]>([]);

  const recentFiles = $derived(savedFiles?.slice(0, 3) ?? []);

  const loadFiles = async () => {
    try {
      const files = await invoke<SavedFiles[]>('get_files');
      savedFiles = files;
    } catch (err) {
      console.error('Failed to load files:', err);
      toast.error('Failed to load files');
    }
  };

  $effect(() => {
    loadFiles();
  });
</script>

<Card.Root class="bg-card/40 w-full max-w-5xl py-4">
  <Collapsible.Root bind:open={isRecentOpen} class="w-full">
    <Card.Header class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Collapsible.Trigger class="flex items-center gap-2">
          <ChevronRight
            class="text-muted-foreground size-5 shrink-0 transition-transform data-[state=open]:rotate-90"
            data-state={isRecentOpen ? 'open' : 'closed'}
          />
          <Card.Title>Recent files</Card.Title>
        </Collapsible.Trigger>
        <!-- <Card.Description>Последние добавленные файлы (топ-3)</Card.Description> -->
      </div>
      <div>
        <Button href="/files" variant="link">Show all files</Button>
      </div>
    </Card.Header>

    <Card.Content
      class={{
        'pt-4': isRecentOpen,
        'pt-0': !isRecentOpen
      }}
    >
      <Collapsible.Content>
        {#if recentFiles.length > 0}
          <ul class="divide-border border-border/70 divide-y rounded-md border">
            {#each recentFiles as f}
              <a href="/files" class="flex items-center gap-3 px-3 py-2">
                <FileText class="text-muted-foreground size-4 shrink-0" />
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-medium">{f.name}</div>
                  <div class="text-muted-foreground truncate text-xs">{f.path}</div>
                </div>
                <div class="text-muted-foreground text-xs">{formatFileSize(f.size)}</div>
              </a>
            {/each}
          </ul>
        {:else}
          <div
            class="border-border/70 text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm"
          >
            No have saved files
          </div>
        {/if}
      </Collapsible.Content>
    </Card.Content>
  </Collapsible.Root>
</Card.Root>
