import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
import type { Edge, Node } from '@xyflow/svelte';
export type GraphData = { label: string };

export type FileNode = {
  name: string;
  path: string;
  type: 'File' | 'Directory';
  children?: FileNode[];
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const toInitialGraph = (roots: FileNode[]) => {
  const initNodes: Node<GraphData>[] = [];
  const initEdges: Edge[] = [];

  const walk = (node: FileNode, parentId?: string) => {
    initNodes.push({
      id: node.path,
      data: { label: node.name },
      position: { x: 0, y: 0 }
    } satisfies Node<GraphData>);

    if (parentId) {
      initEdges.push({
        id: `${parentId}-${node.path}`,
        source: parentId,
        target: node.path
      } satisfies Edge);
    }

    node.children?.forEach((c) => walk(c, node.path));
  };

  roots.forEach((r) => walk(r));
  return { initNodes, initEdges };
};
