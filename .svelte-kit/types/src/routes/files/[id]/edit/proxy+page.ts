// @ts-nocheck
import { getFileContent, getSavedFiles } from '$lib/tauri';
import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

const THIRTY_MB_SIZE = 30 * 1024 * 1024;

export const load = async ({ params }: Parameters<PageLoad>[0]) => {
  const fileId = params.id;
  const allFiles = await getSavedFiles();
  const file = allFiles.find((f) => f.id === fileId);

  if (!file) {
    redirect(302, '/');
  }
  let content = '';
  if (file.file_size <= THIRTY_MB_SIZE) {
    content = await getFileContent(file);
  }

  return { file, content };
};
