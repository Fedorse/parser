<script lang="ts">
  import {
    SvelteFlow,
    Background,
    Panel,
    useSvelteFlow,
    Controls,
    MiniMap,
    useNodesInitialized,
    type Edge,
    type Node,
    type Position
  } from '@xyflow/svelte';
  import { Button } from '$lib/components/ui/button';
  import '@xyflow/svelte/dist/style.css';
  import Dagre from '@dagrejs/dagre';
  import type { FileNode, GraphData } from '$lib/utils.ts';
  import { toInitialGraph } from '$lib/utils';

  const { roots = [] } = $props<{ roots?: FileNode[] }>();

  const { fitView } = useSvelteFlow();
  const nodesReady = useNodesInitialized();

  const { initEdges, initNodes } = toInitialGraph(roots);

  type WithMeasured<T> = T & { measured?: { width?: number; height?: number } };

  let nodes = $state.raw<WithMeasured<Node<GraphData>>[]>([...initNodes]);
  let edges = $state.raw<Edge[]>([...initEdges]);

  type Direction = 'TB' | 'LR';

  const getLayoutedElements = (
    nodesIn: WithMeasured<Node<GraphData>>[],
    edgesIn: Edge[],
    options: { direction: Direction }
  ): { nodes: WithMeasured<Node<GraphData>>[]; edges: Edge[] } => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: options.direction });

    edgesIn.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodesIn.forEach((node) => {
      const width = node.measured?.width ?? 0;
      const height = node.measured?.height ?? 0;
      g.setNode(node.id, { ...node, width, height });
    });

    Dagre.layout(g);

    const layoutedNodes = nodesIn.map((node) => {
      const pos = g.node(node.id) as { x: number; y: number } | undefined;

      const x = (pos?.x ?? 0) - (node.measured?.width ?? 0) / 2;
      const y = (pos?.y ?? 0) - (node.measured?.height ?? 0) / 2;

      const sourcePosition = options.direction === 'LR' ? 'right' : 'bottom';
      const targetPosition = options.direction === 'LR' ? 'left' : 'top';

      return {
        ...node,
        position: { x, y },
        sourcePosition,
        targetPosition
      };
    });

    return { nodes: layoutedNodes, edges: edgesIn };
  };

  const onLayout = (direction: Direction) => {
    const layouted = getLayoutedElements(nodes, edges, { direction });
    nodes = [...layouted.nodes];
    edges = [...layouted.edges];
    fitView({ duration: 100 });
  };

  let didInitialLayout = false;

  $effect(() => {
    if (!didInitialLayout && nodesReady.current) {
      didInitialLayout = true;
      onLayout('TB');
    }
  });
</script>

<SvelteFlow bind:nodes bind:edges>
  <Controls />
  <MiniMap />
  <Panel position="top-left">
    <Button variant="default" size="sm" onclick={() => onLayout('TB')}>vertical</Button>
    <Button variant="default" size="sm" onclick={() => onLayout('LR')}>horizontal</Button>
  </Panel>
  <Background />
</SvelteFlow>
