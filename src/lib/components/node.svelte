<script lang="ts">
  import type { NodeProps } from '@xyflow/svelte';
  import { Handle, Position } from '@xyflow/svelte';

  // ожидаем data: { label: string; kind: 'dir'|'file'; expanded?: boolean }
  let { selected, data }: NodeProps = $props();
</script>

<div
  class="bg-card text-card-foreground flex min-h-[40px] min-w-[160px] items-center justify-start
         gap-2 rounded-md border px-3 py-2 text-sm shadow-sm
         {selected ? 'ring-primary ring-2' : ''}"
>
  {#if data.type === 'dir'}
    <span>📁</span>
  {:else}
    <span>📄</span>
  {/if}
  <span class="truncate">{data.label}</span>
</div>

<!-- handles -->
<Handle id="in-top" type="target" position={Position.Top} class="opacity-0" />
<Handle id="in-left" type="target" position={Position.Left} class="opacity-0" />
<Handle id="out-bottom" type="source" position={Position.Bottom} class="opacity-0" />
<Handle id="out-right" type="source" position={Position.Right} class="opacity-0" />
