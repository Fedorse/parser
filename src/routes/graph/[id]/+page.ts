import { redirect } from '@sveltejs/kit';
import { getFileMetadata } from '$lib/tauri';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const metadata = await getFileMetadata(String(params.id));

  if (!metadata) {
    redirect(302, '/files');
  }

  return { metadata, tree: metadata.file_tree };
};
