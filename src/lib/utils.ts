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
import type { FileTreeNode } from './tauri';
export type GraphData = {
  label: string;
  type: 'file' | 'dir';
  path: string;
  onToggle?: (p: string) => void;
  open?: boolean;
  dir: 'TB' | 'LR';
};
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

export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  return 'just now';
}

export const setSelected = (node: FileTreeNode, value: boolean) => {
  node.selected = value;
  if (node.type === 'Directory' && node.children) {
    node.children.forEach((child) => setSelected(child, value));
  }
};

export const setSelectedAll = (nodes: FileTreeNode[], value: boolean) => {
  nodes.forEach((n) => setSelected(n, value));
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
