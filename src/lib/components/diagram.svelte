<script lang="ts">
  import {
    SvelteFlow,
    Background,
    Panel,
    useSvelteFlow,
    Controls,
    MarkerType,
    type Edge,
    type Node,
    type NodeTypes,
    type DefaultEdgeOptions,
    ControlButton
  } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import Dagre from '@dagrejs/dagre';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import { onMount } from 'svelte';
  import { mode } from 'mode-watcher';
  import CustomNode from '$lib/components/node.svelte';
  import { getCurrentWindow } from '@tauri-apps/api/window';

  import type { FileNode, GraphData } from '$lib/utils';
  import { ArrowLeftRight, ArrowUpDown, Fullscreen } from '@lucide/svelte';
  type Direction = 'TB' | 'LR';
  type WithMeasured<T> = T & { measured?: { width?: number; height?: number } };

  const WIDTH_NODE = 160;
  const HEIGHT_NODE = 46;

  const { roots = [] } = $props<{ roots?: FileNode[] }>();

  const { fitView } = useSvelteFlow();

  let direction = $state<Direction>('TB');
  let expandedDirs = $state<Set<string>>(new Set());
  let parentEl = null as HTMLElement | null;

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

  for (const r of roots) if (r.type === 'Directory') expandedDirs.add(r.path);

  const toggleDir = (path: string) => {
    const next = expandedDirs;
    next.has(path) ? next.delete(path) : next.add(path);
    expandedDirs = next;
    rebuildAndLayout();
  };

  const buildNode = (file: FileNode): Node<GraphData> => ({
    id: file.path,
    type: 'fileNode',
    data: {
      label: file.name,
      type: file.type === 'Directory' ? 'dir' : 'file',
      path: file.path,
      onToggle: file.type === 'Directory' ? toggleDir : undefined,
      open: file.type === 'Directory' ? expandedDirs.has(file.path) : undefined,
      dir: direction
    },
    position: { x: 0, y: 0 }
  });

  const buildEdge = (parentPath: string, childPath: string): Edge => ({
    id: `${parentPath}-${childPath}`,
    source: parentPath,
    target: childPath
  });

  function collectVisible(input: FileNode[]) {
    const outNodes: Node[] = [];
    const outEdges: Edge[] = [];

    const walk = (n: FileNode, parentId?: string) => {
      outNodes.push(buildNode(n));
      if (parentId) outEdges.push(buildEdge(parentId, n.path));

      if (n.type === 'Directory' && expandedDirs.has(n.path)) {
        n.children?.forEach((c) => walk(c, n.path));
      }
    };

    input.forEach((r) => walk(r));
    return { outNodes, outEdges };
  }

  let nodes = $state.raw<Node<GraphData>[]>([]);
  let edges = $state.raw<Edge[]>([]);

  const getLayoutedElements = (
    nodesIn: WithMeasured<Node<GraphData>>[],
    edgesIn: Edge[],
    options: { direction: Direction }
  ) => {
    const isHorizontal = options.direction === 'LR';
    const graphDagre = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    graphDagre.setGraph({
      rankdir: options.direction,
      nodesep: isHorizontal ? 50 : 40,
      ranksep: isHorizontal ? 60 : 60,
      marginx: 20,
      marginy: 20
    });
    edgesIn.forEach((edge) => graphDagre.setEdge(edge.source, edge.target));
    nodesIn.forEach((node) => {
      const width = node.measured?.width ?? WIDTH_NODE;
      const height = node.measured?.height ?? HEIGHT_NODE;
      graphDagre.setNode(node.id, { ...node, width, height });
    });

    Dagre.layout(graphDagre);

    const layoutedNodes = nodesIn.map((node) => {
      const pos = graphDagre.node(node.id) as { x: number; y: number } | undefined;
      const x = (pos?.x ?? 0) - (node.measured?.width ?? WIDTH_NODE) / 2;
      const y = (pos?.y ?? 0) - (node.measured?.height ?? HEIGHT_NODE) / 2;
      return { ...node, position: { x, y } };
    });

    const layoutedEdges = edgesIn.map((e) => ({
      ...e,
      sourceHandle: isHorizontal ? 'out-right' : 'out-bottom',
      targetHandle: isHorizontal ? 'in-left' : 'in-top'
    }));

    return { nodes: layoutedNodes, edges: layoutedEdges };
  };

  const rebuildAndLayout = () => {
    const { outNodes, outEdges } = collectVisible(roots);
    const { nodes: n, edges: e } = getLayoutedElements(outNodes, outEdges, { direction });
    nodes = n;
    edges = e;
  };

  const toggleLayout = (dir: Direction) => {
    direction = dir;
    fitView({ duration: 100 });
    rebuildAndLayout();
  };
  const toggleFullscreen = async () => {
    const win = getCurrentWindow();
    const is = await win.isFullscreen();
    await win.setFullscreen(!is);

    fitView?.({ duration: 120 });
  };
  onMount(rebuildAndLayout);
</script>

<div class="w-full" bind:this={parentEl}>
  <SvelteFlow bind:nodes bind:edges {nodeTypes} colorMode={mode.current} {defaultEdgeOptions}>
    <Controls position="bottom-left">
      <ControlButton title="Toggle Fullscreen" onclick={() => toggleFullscreen()}
        ><Fullscreen /></ControlButton
      >
    </Controls>
    <Panel position="top-right" class="flex gap-2">{@render layoutSwitch()}</Panel>
    <Background bgColor="var(--background)" size={1} />
  </SvelteFlow>
</div>

{#snippet layoutSwitch()}
  <Tabs.Root bind:value={direction}>
    <Tabs.List class="h-10! gap-2">
      <Tabs.Trigger
        value="LR"
        class="inline-flex items-center gap-2"
        onclick={(e) => toggleLayout('LR')}
        title="Horizontal layout"
      >
        <ArrowLeftRight class="size-4" />
        <span class="inline">Horizontal</span>
      </Tabs.Trigger>

      <Tabs.Trigger
        value="TB"
        class="inline-flex items-center gap-2"
        onclick={(e) => toggleLayout('TB')}
        title="Vertical layout"
      >
        <ArrowUpDown class="size-4" />
        <span class="inline">Vertical</span>
      </Tabs.Trigger>
    </Tabs.List>
  </Tabs.Root>
{/snippet}
