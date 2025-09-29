import { invoke } from '@tauri-apps/api/core';

export type FileTreeNode = {
  name: string;
  path: string;
  type: 'File' | 'Directory';
  selected?: boolean;
  children?: FileTreeNode[];
};
export type SavedFiles = { name: string; path: string; preview: string; size: number };

export const ensureChildrenArrays = (nodes: FileTreeNode[]): FileTreeNode[] => {
  for (const n of nodes) {
    if (!n.children) n.children = [];
    else ensureChildrenArrays(n.children);
  }
  return nodes;
};

export const setSelectedRecursive = (nodes: FileTreeNode[], value = true): FileTreeNode[] => {
  for (const n of nodes) {
    n.selected = value;
    if (n.type === 'Directory' && n.children?.length) setSelectedRecursive(n.children, value);
  }
  return nodes;
};

export const collectSelectedPath = (nodes: FileTreeNode[]): string[] => {
  const paths: string[] = [];
  for (const n of nodes) {
    if (n.type === 'File') {
      if (n.selected) paths.push(n.path);
    } else if (n.children?.length) {
      paths.push(...collectSelectedPath(n.children));
    }
  }
  return paths;
};

export const getPreviewTree = async (paths: string[]): Promise<FileTreeNode[]> => {
  const tree = await invoke<FileTreeNode[]>('get_preview_tree', { paths });
  return Array.isArray(tree) ? tree : [];
};

export const getPreviewTreeUI = async (paths: string[]): Promise<FileTreeNode[]> => {
  const tree = await getPreviewTree(paths); //
  ensureChildrenArrays(tree);
  setSelectedRecursive(tree, true);
  return tree;
};

export const getSavedFiles = async (): Promise<SavedFiles[]> => {
  const files = await invoke<SavedFiles[]>('get_files');
  return Array.isArray(files) ? files : [];
};

export const parsePaths = async (paths: string[]): Promise<void> => {
  await invoke('parse', { paths });
};

export const deleteFile = async (file: SavedFiles) => {
  await invoke('delete_file', { path: file.path });
};

export const updateFile = async (content: string, selectedFile: SavedFiles | null) => {
  await invoke('update_file', { filePath: selectedFile?.path, content: content });
};

export const getFileContent = async (file: SavedFiles): Promise<string> => {
  return await invoke('get_file_content', { filePath: file.path });
};

export const openDefaultEditor = async (path: string) => {
  await invoke('open_in_default_editor', { filePath: path });
};

export const openFileInfolder = async (file: SavedFiles) => {
  await invoke('open_in_folder', { filePath: file.path });
};

export const renameFile = async (file: SavedFiles, newName: string) => {
  await invoke('rename_file', { filePath: file.path, newName: newName });
};
