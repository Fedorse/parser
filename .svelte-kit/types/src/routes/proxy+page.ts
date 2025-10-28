// @ts-nocheck
import { getSavedFiles } from '@/lib/tauri';
import type { PageLoad } from './$types';

export const load = async () => {
  try {
    const files = await getSavedFiles();
    const filtred = files.filter((file) => !file.name.startsWith('.DS_Store'));
    return { recentFiles: filtred };
  } catch (error) {
    console.error('Failed to load recent files:', error);
    return { recentFiles: [] };
  }
};
;null as any as PageLoad;