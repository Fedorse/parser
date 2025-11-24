<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';
  import { Folder, File, ChevronRight, FolderOpen, SearchCode } from '@lucide/svelte';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';

  import type { GraphData } from '@/lib/type';

  type Props = {
    data: GraphData;
  };

  let { data }: Props = $props();

  const isDir = $derived(data?.type === 'Directory');
  const isOpen = $derived(Boolean(isDir && data?.open));
  const isHorizontal = $derived(data?.dir === 'LR');
</script>

<div
  class={{
    'bg-card/40 text-card-foreground   flex max-h-[46px] min-h-[40px] max-w-[180px] min-w-[180px] items-center justify-between gap-1 rounded-md border px-3 py-2 text-sm  ': true,
    ' border-success shadow-success/50 shadow-lg': isOpen
  }}
>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->

  <Tooltip.Root>
    <div
      class={{
        'text-primary flex min-w-0 items-center gap-2 ': true,
        'text-primary/20': isDir && !isOpen
      }}
      onclick={() => isDir && data?.onToggle?.(data.path)}
    >
      {#if !isOpen}
        <Folder class="size-4 shrink-0" />
      {:else if isOpen}
        <FolderOpen class="size-4 shrink-0" />
      {:else}
        <File class="size-4 shrink-0" />
      {/if}

      <Tooltip.Trigger class=" truncate">
        <span>{data.label}</span>
      </Tooltip.Trigger>
      <Tooltip.Content><span>{data.label}</span></Tooltip.Content>
    </div>
  </Tooltip.Root>

  <div class="flex flex-1 justify-end gap-1">
    {#if !data.largeFile}
      <button
        class="hover:bg-background inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5
               transition"
        onclick={() => data?.openEditor?.(data.path)}
        title={`Find "${data.label}" in file`}
      >
        <SearchCode class="size-3.5" />
      </button>
    {/if}
    {#if isDir}
      <button
        class="hover:bg-background inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5
               transition"
        onclick={() => data?.onToggle?.(data.path)}
        title={isOpen ? 'Collapse' : 'Expand'}
      >
        <ChevronRight
          class={{
            'size-3.5 transition-transform duration-200': true,
            'rotate-90': (isHorizontal && !isOpen) || (!isHorizontal && isOpen),
            'rotate-0': (isHorizontal && isOpen) || (!isHorizontal && !isOpen)
          }}
        />
      </button>
    {/if}
  </div>
</div>

<!-- handles -->
<Handle id="in-top" type="target" position={Position.Top} class="opacity-0" />
<Handle id="in-left" type="target" position={Position.Left} class="opacity-0" />
<Handle id="out-bottom" type="source" position={Position.Bottom} class="opacity-0" />
<Handle id="out-right" type="source" position={Position.Right} class="opacity-0" />
