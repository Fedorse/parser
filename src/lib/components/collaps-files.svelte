<script lang="ts">
  import { formatFileSize } from '@/lib/utils/utils';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import { ChevronRight } from '@lucide/svelte';
  import FileText from '@lucide/svelte/icons/file-text';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { pushState } from '$app/navigation';

  import type { File } from '@/lib/type.ts';

  type Props = {
    files: Promise<File[]>;
  };

  let { files }: Props = $props();

  let open = $state(true);

  const toggle = () => (open = !open);

  const openEdit = (file: File) => {
    pushState('', { editFile: { id: file.id } });
  };
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

  <Collapsible.Content
    class="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden"
  >
    <div class="pt-3">
      {#await files}
        <div class="divide-border border-border/70 divide-y rounded-md border">
          {#each Array(3) as _}
            <div class="flex items-center gap-3 px-3 py-2">
              <Skeleton class="bg-muted/80 h-6 w-6 rounded" />
              <div class="min-w-0 flex-1 space-y-2">
                <Skeleton class="bg-muted/80 h-4 w-2/4" />
                <Skeleton class="bg-muted/80 h-3 w-3/4" />
              </div>
              <Skeleton class="bg-muted/80 h-3 w-12" />
            </div>
          {/each}
        </div>
      {:then resolvedFiles}
        <ul class="divide-border border-border/70 divide-y rounded-md border">
          {#if resolvedFiles.length > 0}
            {#each resolvedFiles as f}
              <li>
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  class="hover:bg-muted/40 flex cursor-pointer items-center gap-3 px-3 py-2"
                  onclick={() => openEdit(f)}
                >
                  <FileText class="text-muted-foreground size-5 stroke-1" />
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-medium">{f.name}</div>
                    <div class="text-muted-foreground truncate text-xs">{f.directory_path}</div>
                  </div>
                  <div class="text-muted-foreground text-xs">
                    {formatFileSize(f.total_size)}
                  </div>
                </div>
              </li>
            {/each}
          {:else}
            <div class="text-muted-foreground divide-border rounded-md p-4 text-center text-xs">
              No saved files
            </div>
          {/if}
        </ul>
      {/await}
    </div>
  </Collapsible.Content>
</Collapsible.Root>
