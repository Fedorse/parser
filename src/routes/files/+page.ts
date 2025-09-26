import { invoke } from '@tauri-apps/api/core';
export type SavedFiles = { name: string; path: string; preview: string; size: number };

export const load = async () => {
  try {
    const files = await invoke<SavedFiles[]>('get_files');
    return { files: files ?? [] };
  } catch (err) {
    console.error('Failed to load files:', err);
    return { files: [] as SavedFiles[] };
  }
};
