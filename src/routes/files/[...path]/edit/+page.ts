import { getSavedFiles, getFileContent } from '$lib/tauri';
import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

const THIRTY_MB_SIZE = 30 * 1024 * 1024;

export const load: PageLoad = async ({ params }) => {
  const filePath = params.path;
  const all = await getSavedFiles();
  const file = all.find((f) => f.path === filePath);

  if (!file) {
    redirect(302, '/');
  }
  let content = '';
  if (file.size <= THIRTY_MB_SIZE) {
    content = await getFileContent(file);
  }

  return { file, content };
};
