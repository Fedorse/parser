// @ts-nocheck
import type { PageLoad } from './$types';

import { getSavedFiles, getFileContent, type SavedFiles } from '$lib/tauri';
import { redirect } from '@sveltejs/kit';
const THIRTY_MB_SIZE = 30 * 1024 * 1024;

export const load = async ({ params }: Parameters<PageLoad>[0]) => {
  const filePath = params.path;
  const all = await getSavedFiles();
  const file = all.find((f) => f.path === filePath) as SavedFiles | undefined;

  if (!file) {
    redirect(302, '/');
  }
  let content = '';
  if (file.size <= THIRTY_MB_SIZE) {
    content = await getFileContent(file);
  }

  return { file, content };
};
