import { getFileMetadata } from '$lib/tauri';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

type FileTreeNode = {
  name: string;
  path: string;
  type: 'File' | 'Directory';
  children?: FileTreeNode[];
};

const buildTree = (files: any[]): FileTreeNode[] => {
  if (!files?.length) return [];

  const map = new Map<string, FileTreeNode>();
  const roots: FileTreeNode[] = [];

  for (const file of files) {
    map.set(file.path, {
      name: file.name,
      path: file.path,
      type: file.type,
      children: file.type === 'Directory' ? [] : undefined
    });
  }

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);ы

    for (let i = 1; i < parts.length; i++) {
      const folderPath = '/' + parts.slice(0, i).join('/');

      if (!map.has(folderPath)) {
        map.set(folderPath, {
          name: parts[i - 1],
          path: folderPath,
          type: 'Directory',
          children: []
        });
      }
    }
  }

  for (const [path, node] of map) {
    const parentPath = path.substring(0, path.lastIndexOf('/'));
    const parent = map.get(parentPath);

    if (parent?.children) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

export const load: PageLoad = async ({ params }) => {
  const metadata = await getFileMetadata(params.id);
  console.log(metadata);

  if (!metadata) {
    redirect(302, '/files');
  }

  const roots = buildTree(metadata.file_tree);

  return { metadata, roots };
};
