<script lang="ts">
  import { SvelteFlow, Controls, Background, MiniMap, type Node, type Edge } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';

  type TreeNode = {
    name: string;
    path: string;
    type: 'Directory' | 'File';
    children?: TreeNode[];
  };

  let { roots = [] as TreeNode[] } = $props();
  // 2) Реактивные массивы без смены ссылок
  let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);

  // 3) Простейший DFS-«лестничный» лэйаут
  const X_GAP = 220;
  const Y_GAP = 90;

  function buildGraph(roots: TreeNode[]) {
    const n: Node[] = [];
    const e: Edge[] = [];
    let row = 0;

    const walk = (node: TreeNode, depth: number, parentId?: string) => {
      const id = node.path;
      n.push({
        id,
        data: { label: node.name },
        position: { x: depth * X_GAP, y: row * Y_GAP }
      });
      if (parentId) e.push({ id: `${parentId}->${id}`, source: parentId, target: id });
      row++;
      node.children?.forEach((child) => walk(child, depth + 1, id));
    };

    roots.forEach((r) => walk(r, 0));
    return { n, e };
  }

  // 4) Строим граф один раз
  $effect(() => {
    const { n, e } = buildGraph(roots);

    nodes.splice(0, nodes.length, ...n);
    edges.splice(0, edges.length, ...e);
  });
</script>

<div class="h-[90vh] w-[100vw] border">
  <SvelteFlow bind:nodes bind:edges fitView>
    <Controls />
    <Background />
    <MiniMap />
  </SvelteFlow>
</div>
