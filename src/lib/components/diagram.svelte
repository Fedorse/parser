<script lang="ts">
  import {
    SvelteFlow,
    Background,
    Panel,
    useSvelteFlow,
    Controls,
    MarkerType,
    BackgroundVariant,
    type Edge,
    type Node,
    type NodeTypes,
    type DefaultEdgeOptions
  } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import Dagre from '@dagrejs/dagre';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import { onMount } from 'svelte';
  import { mode } from 'mode-watcher';
  import CustomNode from '$lib/components/node.svelte';

  import type { FileNode, GraphData } from '$lib/utils';
  type Direction = 'TB' | 'LR';
  type WithMeasured<T> = T & { measured?: { width?: number; height?: number } };

  const WIDTH_NODE = 160;
  const HEIGHT_NODE = 46;

  const { roots = [] } = $props();

  const { fitView } = useSvelteFlow();

  let direction = $state<Direction>('TB');

  const nodeTypes: NodeTypes = {
    fileNode: CustomNode
  };

  const defaultEdgeOptions: DefaultEdgeOptions = {
    type: 'smoothstep',
    interactionWidth: 16,

    animated: false,
    class: 'edge-default',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'var(--chart-2)',
      width: 18,
      height: 18
    }
  };

  const buildNode = (file: FileNode): Node<GraphData> => {
    return {
      id: file.path,
      type: 'fileNode',
      data: { label: file.name, type: file.type === 'Directory' ? 'dir' : 'file' },

      position: { x: 0, y: 0 }
    };
  };

  const buildEdge = (parentPath: string, childPath: string): Edge => {
    return {
      id: `${parentPath}-${childPath}`,
      source: parentPath,
      target: childPath
    };
  };

  const initNodes: Node<GraphData>[] = [];
  const initEdges: Edge[] = [];

  const walk = (node: FileNode, parentId?: string) => {
    initNodes.push(buildNode(node));
    if (parentId) initEdges.push(buildEdge(parentId, node.path));
    node.children?.forEach((c) => walk(c, node.path));
  };
  roots.forEach((r) => walk(r));

  let nodes = $state.raw<Node<GraphData>[]>([...initNodes]);
  let edges = $state.raw<Edge[]>([...initEdges]);

  const getLayoutedElements = (
    nodesIn: WithMeasured<Node<GraphData>>[],
    edgesIn: Edge[],
    options: { direction: Direction }
  ) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: options.direction,
      nodesep: options.direction === 'LR' ? 50 : 40,
      ranksep: options.direction === 'LR' ? 60 : 60,
      marginx: 20,
      marginy: 20
    });
    edgesIn.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodesIn.forEach((node) => {
      const width = node.measured?.width ?? WIDTH_NODE;
      const height = node.measured?.height ?? HEIGHT_NODE;
      g.setNode(node.id, { ...node, width, height });
    });

    Dagre.layout(g);

    const layoutedNodes = nodesIn.map((node) => {
      const pos = g.node(node.id) as { x: number; y: number } | undefined;
      const x = (pos?.x ?? 0) - (node.measured?.width ?? WIDTH_NODE) / 2;
      const y = (pos?.y ?? 0) - (node.measured?.height ?? HEIGHT_NODE) / 2;

      return {
        ...node,
        position: { x, y }
      };
    });
    const layoutedEdges = edgesIn.map((e) => ({
      ...e,
      sourceHandle: options.direction === 'LR' ? 'out-right' : 'out-bottom',
      targetHandle: options.direction === 'LR' ? 'in-left' : 'in-top'
    }));

    return { nodes: layoutedNodes, edges: layoutedEdges };
  };

  const onLayout = (direction: Direction) => {
    const { nodes: n, edges: e } = getLayoutedElements(nodes, edges, { direction });
    nodes = [...n];
    edges = [...e];
    fitView({ duration: 100 });
  };

  onMount(() => {
    onLayout(direction);
  });
</script>

<SvelteFlow bind:nodes bind:edges {nodeTypes} colorMode={mode.current} {defaultEdgeOptions}>
  <Controls />
  <Panel position="top-right" class="flex gap-2">
    <Tabs.Root bind:value={direction}>
      <Tabs.List>
        <Tabs.Trigger value="TB" onclick={() => onLayout(direction)}>vertical</Tabs.Trigger>
        <Tabs.Trigger value="LR" onclick={() => onLayout(direction)}>horizontal</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  </Panel>
  <Background bgColor="var(--background)" size={1} />
</SvelteFlow>
