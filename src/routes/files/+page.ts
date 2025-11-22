import { getSavedFiles } from '$lib/tauri';

import type { PageLoad } from './$types';

export const load: PageLoad = ({ depends }) => {
  depends('app:files');
  const savedCount = parseInt(localStorage.getItem('files-count') || '4', 10);
  const filesPromise = getSavedFiles()
    .then((files) => {
      const cleanFiles = files.filter((file) => !file.name.startsWith('.DS_Store'));

      localStorage.setItem('files-count', cleanFiles.length.toString());

      return cleanFiles;
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
