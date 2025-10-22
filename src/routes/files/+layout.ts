import type { LayoutLoad } from './$types';
import { getSavedFiles } from '$lib/tauri';

export const load: LayoutLoad = async () => {
  try {
    const files = await getSavedFiles();
    return { files };
  } catch (err) {
    console.error('Failed to load files:', err);
    return { files: [] };
  }
};
