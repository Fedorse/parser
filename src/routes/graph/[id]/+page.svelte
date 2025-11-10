<script lang="ts">
  import { SvelteFlowProvider } from '@xyflow/svelte';
  import Diagram from '@/lib/components/diagram.svelte';

  let { data } = $props();
  console.log(data);
</script>

<SvelteFlowProvider>
  <Diagram roots={data.roots} />
</SvelteFlowProvider>
