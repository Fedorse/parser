import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

export type FileTreeNode = {
  name: string;
  path: string;
  type: 'File' | 'Directory';
  selected?: boolean;
  children?: FileTreeNode[];
};

export type FileTree = {
  name: string;
  path: string;
  type: 'File' | 'Directory';
  selected?: boolean;
  children?: FileTree[];
  size?: number;
  lastModified?: string;
  totalSize?: number; // сумма размеров всех файлов внутри (рекурсивно)
  filesCount?: number; // количество файлов внутри (рекурси
};

type ParsedFileListItem = {
  id: string;
  name: string;
  directory_path: string;
  file_size: number;
  files_count: number;
  total_size: number;
  created_at: string;
  last_modified: string;
};
export type SavedFiles = { name: string; path: string; preview: string; size: number; id: number };

export const annotateAggregates = (
  nodes: FileTree[]
): { totalSize: number; filesCount: number } => {
  let totalSize = 0;
  let filesCount = 0;

  for (const n of nodes) {
    if (n.type === 'File') {
      const s = n.size ?? 0;
      totalSize += s;
      filesCount += 1;
    } else {
      const { totalSize: t, filesCount: c } = annotateAggregates(n.children ?? []);
      n.totalSize = t;
      n.filesCount = c;
      totalSize += t;
      filesCount += c;
    }
  }
  return { totalSize, filesCount };
};

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
  const tree = await getPreviewTree(paths);
  // ensureChildrenArrays(tree);
  setSelectedRecursive(tree, true);
  annotateAggregates(tree);
  return tree;
};

export const getSavedFiles = async (): Promise<ParsedFileListItem[]> => {
  const files = await invoke<ParsedFileListItem[]>('get_files');
  return files;
};

export const parsePaths = async (paths: string[]) => {
  await invoke('parse', { paths });
};

export const deleteFile = async (file: SavedFiles) => {
  await invoke('delete_file', { dirName: file.id });
};

export const updateFile = async (content: string, selectedFile: SavedFiles | null) => {
  await invoke('update_file', { dirName: selectedFile?.id, content: content });
};

export const getFileContent = async (file: SavedFiles): Promise<string> => {
  return await invoke('get_file_content', { dirName: file.id });
};

export const openDefaultEditor = async (file: string) => {
  await invoke('open_in_default_editor', { dirName: file.id });
  const window = await getCurrentWindow();
  const isFullScreen = await window.isFullscreen();
  if (isFullScreen) {
    await window.setFullscreen(false);
  }
};

export const openFileInfolder = async (file: SavedFiles) => {
  await invoke('open_in_folder', { dirName: file.id });
  const window = await getCurrentWindow();
  const isFullScreen = await window.isFullscreen();
  if (isFullScreen) {
    await window.setFullscreen(false);
  }
};

export const renameFile = async (file: SavedFiles, newName: string) => {
  await invoke('rename_file', { dirName: file.id, newName: newName });
};

export const getFileDetail = async (file) => {
  const detail = await invoke('get_file_detail', {
    dirName: file.id
  });
  return detail;
};

export const getFileMetadata = async (dirName) => {
  const metadata = await invoke('get_file_metadata', { dirName });
  return metadata;
};
