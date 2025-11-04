import type { LayoutLoad } from './$types';
import { getSavedFiles } from '$lib/tauri';

export const load: LayoutLoad = ({ depends }) => {
  depends('app:files');
  const savedCount = parseInt(localStorage.getItem('files-count') || '4', 10);
  const filesPromise = getSavedFiles()
    .then((files) => {
      const filtered = files.filter((file) => !file.name.startsWith('.DS_Store'));

      localStorage.setItem('files-count', filtered.length.toString());

      return filtered;
    })
    .catch((err) => {
      console.error('Failed to load files:', err);
      return [];
    });

  return {
    files: filesPromise,
    skeletonCount: savedCount
  };
};
