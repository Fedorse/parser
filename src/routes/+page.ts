import { invoke } from '@tauri-apps/api/core';

export const load = async () => {
  try {
    const recentFiles = await invoke('get_files');
    return { recentFiles };
  } catch (error) {
    console.error('Failed to load recent files:', error);
    return { recentFiles: [] };
  }
};
