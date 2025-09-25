import { invoke } from '@tauri-apps/api/core';

export const load = async () => {
  try {
    const recentFiles = await invoke('get_files');
    return { recentFiles };
  } catch {
    return { recentFiles: [] };
  }
};
