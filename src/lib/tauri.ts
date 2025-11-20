import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

import type { File, FileDetail, FileTree } from '@/lib/type.ts';

export const ensureChildrenArrays = (nodes: FileTree[]): FileTree[] => {
  for (const n of nodes) {
    if (!n.children) n.children = [];
    else ensureChildrenArrays(n.children);
  }
  return nodes;
};

export const setSelectedRecursive = (nodes: FileTree[], value = true): FileTree[] => {
  for (const n of nodes) {
    n.selected = value;
    if (n.type === 'Directory' && n.children?.length) setSelectedRecursive(n.children, value);
  }
  return nodes;
};

// export const collectSelectedPath = (nodes: FileTreeNode[]): string[] => {
//   const paths: string[] = [];
//   for (const n of nodes) {
//     if (n.type === 'File') {
//       if (n.selected) paths.push(n.path);
//     } else if (n.children?.length) {
//       paths.push(...collectSelectedPath(n.children));
//     }
//   }
//   return paths;
// };

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

export const getPreviewTree = async (paths: string[]): Promise<FileTree[]> => {
  const tree = await invoke<FileTree[]>('get_preview_tree', { paths });
  return Array.isArray(tree) ? tree : [];
};

export const getPreviewTreeUI = async (paths: string[]): Promise<FileTree[]> => {
  const tree = await getPreviewTree(paths);
  // ensureChildrenArrays(tree);
  setSelectedRecursive(tree, true);
  return tree;
};

export const getSavedFiles = async (limit?: number): Promise<File[]> => {
  const files = await invoke<File[]>('get_files', { limit });
  return files;
};

export const parsePaths = async (paths: string[]) => {
  await invoke('parse', { paths });
};

export const deleteFile = async (file: File) => {
  await invoke('delete_file', { dirName: file.id });
};

export const updateFile = async (content: string, file: FileDetail | null) => {
  await invoke('update_file', { dirName: file?.id, content: content });
};

export const getFileContent = async (file: FileDetail): Promise<string> => {
  return await invoke('get_file_content', { dirName: file.id });
};

export const openDefaultEditor = async (file: FileDetail) => {
  await invoke('open_in_default_editor', { dirName: file.id });
  const window = await getCurrentWindow();
  const isFullScreen = await window.isFullscreen();
  if (isFullScreen) {
    await window.setFullscreen(false);
  }
};

export const openFileInfolder = async (file: File | FileDetail) => {
  await invoke('open_in_folder', { dirName: file.id });
  const window = await getCurrentWindow();
  const isFullScreen = await window.isFullscreen();
  if (isFullScreen) {
    await window.setFullscreen(false);
  }
};

export const renameFile = async (file: FileDetail, newName: string) => {
  await invoke('rename_file', { dirName: String(file.id), newName: newName });
};

export const getFileDetail = async (fileId: string) => {
  const detail = await invoke<FileDetail>('get_file_detail', {
    dirName: fileId
  });
  return detail;
};

export const getFileMetadata = async (dirName: string) => {
  const metadata = await invoke('get_file_metadata', { dirName });
  return metadata;
};
