// @ts-nocheck
import { getSavedFiles } from '@/lib/tauri';
import type { PageLoad } from './$types';

export const load = async () => {
  try {
    const files = await getSavedFiles();
    return { recentFiles: files };
  } catch (error) {
    console.error('Failed to load recent files:', error);
    return { recentFiles: [] };
  }
};
;null as any as PageLoad;