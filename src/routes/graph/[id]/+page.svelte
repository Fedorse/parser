<script lang="ts">
  import { SvelteFlowProvider } from '@xyflow/svelte';
  import Diagram from '@/routes/graph/diagram.svelte';

  let { data } = $props();
</script>

<SvelteFlowProvider>
  <Diagram tree={data.tree} fileId={data.metadata.id} metadata={data.metadata} />
</SvelteFlowProvider>
