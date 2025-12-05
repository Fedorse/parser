<script lang="ts">
  import { pushState } from '$app/navigation';
  import { parseQueue } from '$lib/state-utils/store-parse-queue.svelte';
  import * as Sheet from '$lib/components/ui/sheet';
  import * as ScrollArea from '$lib/components/ui/scroll-area';
  import { Button } from '$lib/components/ui/button';
  import { Progress } from '$lib/components/ui/progress';
  import { Terminal, Trash2, Hash, X, FileText } from '@lucide/svelte/icons';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import CubeLoader from '$lib/components/cube-loader.svelte';
  import { Switch } from '$lib/components/ui/switch';
  import type { ParseProgress } from '$lib/state-utils/store-parse-queue.svelte';

  type PropsCardQueue = { item: ParseProgress; isDone: boolean };

  let hasCompleted = $derived(parseQueue.completedParses.length > 0);

  const openEdit = (parseId: string) => {
    parseQueue.setOpen(false);
    pushState('', { editFile: { id: parseId } });
  };
</script>

<Sheet.Root bind:open={parseQueue.isSideBarOpen}>
  <Sheet.Content
    side="right"
    class="flex w-[500px] flex-col rounded-tl-xl rounded-bl-xl sm:w-[450px] 2xl:w-[600px] "
  >
    <Sheet.Header class="border-b pt-6 pr-2 pl-8">
      <Sheet.Title class="text-lg">System Activity</Sheet.Title>
      <Sheet.Description>Current parsing queue status.</Sheet.Description>
    </Sheet.Header>

    {#if parseQueue.size === 0 && parseQueue.pendingCount === 0}
      <div class="flex flex-1 flex-col items-center justify-center p-6 text-center opacity-50">
        <div class="bg-muted mb-4 rounded-full p-4">
          <Terminal class="size-8 stroke-1" />
        </div>
        <p class="text-sm font-medium">No active pars</p>
        <p class="text-muted-foreground mt-1 text-xs">Processed files log will appear here.</p>
      </div>
    {:else}
      {#if parseQueue.pendingCount > 0}
        {#each Array(parseQueue.pendingCount) as _, i (i)}
          <div class="border-b px-4 py-4">
            <div class="flex items-center gap-3">
              <Skeleton class="bg-muted/80 h-4 w-4 rounded" />
              <div class="flex w-full flex-col gap-1.5">
                <Skeleton class="bg-muted/80 h-4 w-3/4" />
                <Skeleton class="bg-muted/80 h-3 w-1/2" />
              </div>
            </div>
            <Skeleton class="bg-muted/80 mt-3 h-1.5 w-full" />
          </div>
        {/each}
      {/if}
      <ScrollArea.Root class="flex-1">
        <div class="flex flex-col px-2">
          {#each Array.from(parseQueue.queue.values()).reverse() as item (item.parse_id)}
            {@const isDone = item.parse_progress === 100}

            {@render CardQueue({ item, isDone })}
          {/each}
        </div>
      </ScrollArea.Root>
    {/if}

    <Sheet.Footer class="flex flex-row justify-between border-t  p-4">
      <div class="flex items-center gap-3">
        <label
          class="group border-border bg-background hover:bg-accent hover:border-accent-foreground/20 flex cursor-pointer items-center gap-3 rounded-md border py-1.5 pr-1.5 pl-4 transition-all active:scale-95"
        >
          <span
            class={{
              'text-foreground group-hover:text-foreground text-xs transition-colors select-none': true,
              'text-muted-foreground': !parseQueue.autoOpen
            }}
          >
            Auto-open system activity
          </span>
          <div class="bg-border mx-0.5 h-4 w-[1px]"></div>

          <Switch
            checked={parseQueue.autoOpen}
            onCheckedChange={() => parseQueue.toggleAutoOpen()}
            class="data-[state=checked]:bg-primary scale-90 shadow-none"
          />
        </label>
      </div>

      {#if hasCompleted}
        <Button
          variant="ghost"
          size="sm"
          class="text-muted-foreground hover:text-destructive h-8 flex-1 gap-2 text-xs"
          onclick={() => parseQueue.clearCompleted()}
        >
          <Trash2 class="size-3.5" />
          Clear Done
        </Button>
      {/if}
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>

{#snippet CardQueue({ item, isDone }: PropsCardQueue)}
  <div
    class="hover:bg-muted/30 flex flex-col gap-2 border-b px-4 py-4 transition-colors last:border-0"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        {#if isDone}
          <CubeLoader class="h-full w-full" size="16px" variant="success" />
        {:else}
          <CubeLoader class="h-full w-full" size="16px" variant="loading" />
        {/if}

        <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-2">
            <span class="flex items-center gap-0.5 truncate text-sm">
              Task <span><Hash class="size-3 stroke-2" /></span>{item.parse_id.split('_')[1] ||
                'Unknown'}
            </span>
          </div>
          <p class="text-muted-foreground flex gap-1 truncate text-xs">
            {#if isDone}
              <span class="text-success/60 font-medium">Success</span>
            {:else}
              <span class="text-warn font-medium">Processing</span>
            {/if}
            <span class="text-muted-foreground/50">|</span>
            {item.files_amount} files
          </p>
        </div>
      </div>

      {#if isDone}
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            class="text-muted-foreground/50 hover:text-primary size-10 shrink-0"
            onclick={() => openEdit(item.parse_id)}
            title="Open in Editor"
          >
            <FileText class="text-muted-foreground size-6 stroke-1" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="text-muted-foreground/50 hover:text-destructive size-4 shrink-0 self-center"
            onclick={() => parseQueue.remove(item.parse_id)}
          >
            <X class="size-4" />
          </Button>
        </div>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      <Progress value={item.parse_progress} class="bg-secondary h-1.5" />
      <p class="text-muted-foreground text-xs tabular-nums">
        {Math.round(item.parse_progress)}%
      </p>
    </div>
  </div>
{/snippet}
