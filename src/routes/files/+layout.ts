import type { LayoutLoad } from './$types';
import { getSavedFiles } from '$lib/tauri';

export const load: LayoutLoad = async () => {
  try {
    const files = await getSavedFiles();
    const filtred = files.filter((faile) => !faile.name.startsWith('.DS_Store'));
    return { files: filtred };
  } catch (err) {
    console.error('Failed to load files:', err);
    return { files: [] };
  }
};
