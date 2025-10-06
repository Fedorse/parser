<script lang="ts">
  import { formatFileSize } from '$lib/utils';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import { ChevronRight } from '@lucide/svelte';
  import FileText from '@lucide/svelte/icons/file-text';
  import Button from '$lib/components/ui/button/button.svelte';
  import type { SavedFiles } from '$lib/tauri';

  let { limit = 3, files = [] as SavedFiles[] } = $props<any>();

  let open = $state(true);
  let loading = $state(false);

  const recent = $derived(files.slice(0, limit));

  const toggle = () => (open = !open);
</script>

<Collapsible.Root bind:open class="w-full ">
  <div class="flex items-center justify-between">
    <button class="flex items-center gap-2" type="button" onclick={toggle}>
      <ChevronRight
        class="text-muted-foreground size-5 shrink-0 transition-transform data-[state=open]:rotate-90"
        data-state={open ? 'open' : 'closed'}
      />
      <div class="text-sm font-medium">Recent files</div>
    </button>
    <Button href="/files" variant="link">Show all files</Button>
  </div>

  <Collapsible.Content>
    <div class="pt-3">
      {#if loading}
        <div class="bg-muted/40 h-16 w-full animate-pulse rounded-md" />
      {:else if recent.length}
        <ul class="divide-border border-border/70 divide-y rounded-md border">
          {#each recent as f}
            <li>
              <a href="/files" class="hover:bg-muted/40 flex items-center gap-3 px-3 py-2">
                <FileText class="text-muted-foreground size-4" />
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-medium">{f.name}</div>
                  <div class="text-muted-foreground truncate text-xs">{f.path}</div>
                </div>
                <div class="text-muted-foreground text-xs">{formatFileSize(f.size)}</div>
              </a>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="text-muted-foreground rounded-md border border-dashed p-4 text-center text-xs">
          No saved files
        </div>
      {/if}
    </div>
  </Collapsible.Content>
</Collapsible.Root>
