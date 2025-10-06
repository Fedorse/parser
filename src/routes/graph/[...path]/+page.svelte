<script lang="ts">
  import { SvelteFlowProvider } from '@xyflow/svelte';
  import Diagram from '@/lib/components/diagram.svelte';

  let { data } = $props();
</script>

<SvelteFlowProvider>
  <Diagram roots={data.roots} />
</SvelteFlowProvider>
