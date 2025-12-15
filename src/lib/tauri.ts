import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { setSelectedRecursive } from '@/lib/utils/utils';

import type { File, FileTree, FileMetadata } from '@/lib/type.ts';

type FileWithId = { id: string };

export const getPreviewTreeNodes = async (paths: string[]): Promise<FileTree[]> => {
  const nodes = await invoke<FileTree[]>('get_preview_tree', { paths });
  return nodes.map((node) => {
    const selectedNode = setSelectedRecursive(node);
    return {
      ...selectedNode,
      isExpanded: true
    };
  });
};

export const expandNode = async (path: string): Promise<FileTree[]> => {
  try {
    const children = await invoke<FileTree[]>('expand_folder', { path });

    return children.map((n) => ({ ...n, isExpanded: false, selected: true }));
  } catch (e) {
    console.error(`Failed to expand ${path}`, e);
    return [];
  }
};

export const expandParsedFolder = async (path: string, dirName: string) => {
  const children = await invoke<FileTree[]>('expand_parsed_folder', {
    dirName: dirName,
    path: path
  });
  return children;
};

export const getFileTree = async (dirName: string): Promise<FileTree[]> => {
  const tree = await invoke<FileTree[]>('get_parsed_preview_tree', { dirName });
  return tree;
};

export const getSavedFiles = async (limit?: number): Promise<File[]> => {
  const files = await invoke<File[]>('get_files', { limit });
  return files;
};

export const parseNodes = async (paths: string[], remoteUrl?: string): Promise<void> => {
  await invoke('parse', { paths, app: null, remoteUrl: remoteUrl ?? null });
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

export const parseGitRepo = async (repoUrl: string): Promise<string> => {
  return await invoke<string>('parse_repository', { url: repoUrl });
};
