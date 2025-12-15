<script lang="ts">
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { asyncNoop } from 'es-toolkit';
  import { onMount } from 'svelte';
  import Dagre from '@dagrejs/dagre';
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
  import { getFileTree, expandParsedFolder } from '$lib/tauri';
  import '@xyflow/svelte/dist/style.css';
  import { pushState } from '$app/navigation';
  import { mode } from 'mode-watcher';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import CustomNode from '@/routes/graph/node.svelte';
  import { ArrowLeftRight, ArrowUpDown, Fullscreen } from '@lucide/svelte';

  import type { FileTree, GraphData, Direction, WithMeasured, FileMetadata } from '@/lib/type';

  const WIDTH_NODE = 180;
  const HEIGHT_NODE = 46;
  const THIRTY_MB_SIZE = 30 * 1024 * 1024;

  type Props = { fileId: string; metadata?: FileMetadata };

  const { fileId, metadata }: Props = $props();
  const isLargeFile = $derived(metadata ? metadata.total_size > THIRTY_MB_SIZE : false);

  const { fitView } = useSvelteFlow();

  let direction = $state<Direction>('TB');
  let expandedDirs = $state<Set<string>>(new Set());
  let tree = $state<FileTree[]>([]);
  let loadingDirs = $state<Set<string>>(new Set());

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

  const findNode = (path: string) => {
    const walk = (nodes: FileTree[]): FileTree | undefined => {
      for (const n of nodes) {
        if (n.path === path) return n;
        if (n.children?.length) {
          const found = walk(n.children);
          if (found) return found;
        }
      }
    };
    return walk(tree);
  };

  const toggleDir = async (path: string) => {
    const next = new Set(expandedDirs);
    if (next.has(path)) {
      next.delete(path);
      expandedDirs = next;
      rebuildAndLayout();
      return;
    }

    const nextLoading = new Set(loadingDirs);
    nextLoading.add(path);
    loadingDirs = nextLoading;
    nodes = nodes.map((node) => {
      if (node.id === path) {
        return {
          ...node,
          data: { ...node.data, loading: true }
        };
      }
      return node;
    });

    try {
      const dirNode = findNode(path);
      if (dirNode && (!dirNode.children || dirNode.children.length === 0)) {
        const children = await expandParsedFolder(path, fileId);
        dirNode.children = children;
      }
      next.add(path);
      expandedDirs = next;
    } catch (e) {
      console.error('expand error', e);
    } finally {
      const nextLoading = new Set(loadingDirs);
      nextLoading.delete(path);
      loadingDirs = nextLoading;
      rebuildAndLayout();
    }
  };

  const openInEditor = (path: string) => {
    pushState('', { editFile: { id: fileId, searchPath: path } });
  };

  const buildNode = (file: FileTree): Node<GraphData> => ({
    id: file.path,
    type: 'fileNode',
    data: {
      label: file.name,
      type: file.type,
      path: file.path,
      onToggle: file.type === 'Directory' ? toggleDir : asyncNoop,
      open: file.type === 'Directory' ? expandedDirs.has(file.path) : undefined,
      dir: direction,
      openEditor: openInEditor,
      largeFile: isLargeFile,
      loading: file.type === 'Directory' ? loadingDirs.has(file.path) : false
    },
    position: { x: 0, y: 0 }
  });

  const buildEdge = (parentPath: string, childPath: string): Edge => ({
    id: `${parentPath}-${childPath}`,
    source: parentPath,
    target: childPath
  });

  function collectVisible(input: FileTree[]) {
    const outNodes: Node<GraphData>[] = [];
    const outEdges: Edge[] = [];

    const walk = (n: FileTree, parentId?: string) => {
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
    const { outNodes, outEdges } = collectVisible(tree);
    const { nodes: n, edges: e } = getLayoutedElements(outNodes, outEdges, { direction });
    nodes = n;
    edges = e;
    fitView({ duration: 200 });
  };

  const toggleLayout = (dir: Direction) => {
    direction = dir;
    fitView({ duration: 120 });
    rebuildAndLayout();
  };
  const toggleFullscreen = async () => {
    const win = getCurrentWindow();
    const is = await win.isFullscreen();
    await win.setFullscreen(!is);

    fitView?.({ duration: 120 });
  };
  onMount(async () => {
    const root = await getFileTree(fileId);
    tree = root;
    rebuildAndLayout();
  });
</script>

<div class="h-full min-h-[450px] w-full">
  <SvelteFlow
    bind:nodes
    bind:edges
    {nodeTypes}
    colorMode={mode.current}
    {defaultEdgeOptions}
    fitView
  >
    <Controls position="bottom-left">
      <ControlButton title="Toggle Fullscreen" onclick={() => toggleFullscreen()}
        ><Fullscreen /></ControlButton
      >
    </Controls>
    <Panel position="top-right" class="flex gap-2">{@render layoutSwitch()}</Panel>
    <Background bgColor="var(--background)" size={0.7} />
  </SvelteFlow>
</div>

{#snippet layoutSwitch()}
  <Tabs.Root bind:value={direction}>
    <Tabs.List class="bg-card/20 h-10! gap-2">
      <Tabs.Trigger
        value="LR"
        class="inline-flex items-center gap-2"
        onclick={() => toggleLayout('LR')}
        title="Horizontal layout"
      >
        <ArrowLeftRight class="size-4" />
        <span class="inline">Horizontal</span>
      </Tabs.Trigger>

      <Tabs.Trigger
        value="TB"
        class="inline-flex items-center gap-2"
        onclick={() => toggleLayout('TB')}
        title="Vertical layout"
      >
        <ArrowUpDown class="size-4" />
        <span class="inline">Vertical</span>
      </Tabs.Trigger>
    </Tabs.List>
  </Tabs.Root>
{/snippet}

<style>
  :global(.svelte-flow__panel.svelte-flow__attribution) {
    display: none;
  }

  :global(.svelte-flow__controls) {
    background: var(--card/20);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  :global(.svelte-flow__controls button) {
    background: transparent;
    color: var(--card-foreground);
    border-bottom: 1px solid var(--border);
    gap: 0.35rem;
    padding: 0.45rem 0.6rem;
    width: 100%;
    transition:
      background-color 140ms ease,
      color 140ms ease,
      transform 100ms ease,
      box-shadow 140ms ease;
  }

  :global(.svelte-flow__controls button:hover) {
    background-color: color-mix(in oklab, var(--card) 75%, var(--foreground) 25%);
  }

  :global(.svelte-flow__controls button:first-child) {
    border-radius: calc(var(--radius, 0.625rem) - 2px) calc(var(--radius, 0.625rem) - 2px) 0 0;
  }

  :global(.svelte-flow__controls button:last-child) {
    border-bottom: 1px solid var(--border);
    border-radius: 0 0 calc(var(--radius, 0.625rem) - 2px) calc(var(--radius, 0.625rem) - 2px);
  }

  :global(.svelte-flow__controls button path) {
    fill: currentColor;
  }
</style>
