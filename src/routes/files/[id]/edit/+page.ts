import { getFileContent, getFileDetail, getFileMetadata } from '$lib/tauri';
import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

const THIRTY_MB_SIZE = 30 * 1024 * 1024;

export const load: PageLoad = async ({ params }) => {
  const fileId = params.id;

  console.time('load');

  const file = await getFileDetail(fileId);
  console.timeEnd('load');

  if (!file) {
    redirect(302, '/');
  }
  let content = '';
  if (file.metadata.total_size <= THIRTY_MB_SIZE) {
    try {
      content = await getFileContent(file);
    } catch (err) {
      console.error('Failed to load file content:', err);
    }
  }

  return { file, content };
};
