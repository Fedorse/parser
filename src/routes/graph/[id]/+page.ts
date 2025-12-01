import { redirect } from '@sveltejs/kit';
import { getFileMetadata, getFileTree } from '$lib/tauri';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const metadata = await getFileMetadata(String(params.id));
  const tree = await getFileTree(String(params.id));

  if (!metadata) {
    redirect(302, '/files');
  }

  return { metadata, tree: tree };
};
