<script lang="ts">
  import {
    SvelteFlow,
    Background,
    useSvelteFlow,
    useNodesInitialized,
    type Edge,
    type Node
  } from '@xyflow/svelte';
  import Dagre from '@dagrejs/dagre';
  import type { FileNode, GraphData } from '$lib/utils';
  import { toInitialGraph } from '$lib/utils';
  import { mode } from 'mode-watcher';

  const { roots = [] } = $props<{ roots?: FileNode[] }>();

  const { initEdges, initNodes } = toInitialGraph(roots);

  const NODE_W = 150;
  const NODE_H = 40;

  let nodes = $state.raw<Node<GraphData>[]>([...initNodes]);
  let edges = $state.raw<Edge[]>([...initEdges]);

  const { fitView } = useSvelteFlow();
  const ready = useNodesInitialized();

  function layoutTB(nodesIn: Node[], edgesIn: Edge[]) {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR' as const, nodesep: 24, ranksep: 36 });

    edgesIn.forEach((e) => g.setEdge(e.source, e.target));
    nodesIn.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));

    Dagre.layout(g);

    return nodesIn.map((n) => {
      const pos = g.node(n.id) as { x: number; y: number } | undefined;
      return {
        ...n,
        position: {
          x: (pos?.x ?? 0) - NODE_W / 2,
          y: (pos?.y ?? 0) - NODE_H / 2
        },
        sourcePosition: 'bottom',
        targetPosition: 'top',
        draggable: false,
        selectable: false
      };
    });
  }

  let laidOut = false;
  $effect(() => {
    if (!laidOut && ready.current) {
      laidOut = true;
      nodes = layoutTB(nodes, edges);
      fitView();
    }
  });
</script>

<SvelteFlow
  colorMode={mode.current}
  bind:nodes
  bind:edges
  nodesDraggable={false}
  nodesConnectable={false}
  elementsSelectable={false}
  panOnDrag={false}
  zoomOnScroll={false}
  zoomOnPinch={false}
  zoomOnDoubleClick={false}
>
  <Background bgColor="var(--background)" size={1} />
</SvelteFlow>
