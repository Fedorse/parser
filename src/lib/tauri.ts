import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { orderBy } from 'es-toolkit';

import type { File, FileTree, FileMetadata } from '@/lib/type.ts';

export const ensureChildrenArrays = (nodes: FileTree[]): FileTree[] => {
  for (const n of nodes) {
    if (!n.children) n.children = [];
    else ensureChildrenArrays(n.children);
  }
  return nodes;
};

export const setSelectedRecursive = (nodes: FileTree[]): FileTree[] => {
  for (const n of nodes) {
    n.selected = true;
    if (n.type === 'Directory' && n.children?.length) setSelectedRecursive(n.children);
  }
  return nodes;
};

export const collectSelectedPath = (nodes: FileTree[]): string[] => {
  const paths: string[] = [];

  for (const n of nodes) {
    if (n.selected) {
      paths.push(n.path);
      continue;
    }

    if (n.type === 'Directory' && n.children?.length) {
      paths.push(...collectSelectedPath(n.children));
    }
  }

  return paths;
};

export const sortTreeRecursive = (nodes: FileTree[]): FileTree[] => {
  const sorted = orderBy(
    nodes,
    [(node) => (node.type === 'Directory' ? '0' : '1'), (node) => node.name.toLowerCase()],
    ['asc', 'asc']
  );

  for (const node of sorted) {
    if (node.children && node.children.length > 0) {
      node.children = sortTreeRecursive(node.children);
    }
  }
  return sorted;
};

export const getPreviewTree = async (paths: string[]): Promise<FileTree[]> => {
  const tree = await invoke<FileTree[]>('get_preview_tree', { paths });
  return Array.isArray(tree) ? tree : [];
};
export const getFileTree = async (dirName: string): Promise<FileTree[]> => {
  const tree = await invoke<FileTree[]>('get_file_tree', { dirName });
  return tree;
};

export const getPreviewTreeUI = async (paths: string[]): Promise<FileTree[]> => {
  let pathsTree = await getPreviewTree(paths);
  setSelectedRecursive(pathsTree);
  pathsTree = sortTreeRecursive(pathsTree);
  return pathsTree;
};

export const getSavedFiles = async (limit?: number): Promise<File[]> => {
  const files = await invoke<File[]>('get_files', { limit });
  return files;
};

export const parsePaths = async (paths: string[]): Promise<void> => {
  await invoke('parse', { paths });
};

export const deleteFile = async (file: File): Promise<void> => {
  await invoke('delete_file', { dirName: file.id });
};

export const updateFile = async (content: string, file: FileMetadata | null): Promise<void> => {
  await invoke('update_file', { dirName: file?.id, content: content });
};

export const getFileContent = async (file: FileMetadata): Promise<string> => {
  return await invoke('get_file_content', { dirName: file.id });
};

export const openDefaultEditor = async (file: FileMetadata): Promise<void> => {
  await invoke('open_in_default_editor', { dirName: file.id });
  const window = await getCurrentWindow();
  const isFullScreen = await window.isFullscreen();
  if (isFullScreen) {
    await window.setFullscreen(false);
  }
};

type FileWithId = { id: string };

export const openFileInfolder = async (file: FileWithId): Promise<void> => {
  await invoke('open_in_folder', { dirName: file.id });
  const window = await getCurrentWindow();
  const isFullScreen = await window.isFullscreen();
  if (isFullScreen) {
    await window.setFullscreen(false);
  }
};

export const renameFile = async (file: FileMetadata, newName: string): Promise<void> => {
  await invoke('rename_file', { dirName: String(file.id), newName: newName });
};

export const getFileDetail = async (fileId: string): Promise<FileMetadata | null> => {
  const detail = await invoke<FileMetadata>('get_file_detail', {
    dirName: fileId
  });
  return detail;
};

export const getFileMetadata = async (dirName: string): Promise<FileMetadata | null> => {
  const metadata = await invoke<FileMetadata>('get_file_metadata', { dirName });
  return metadata;
};
