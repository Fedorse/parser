import { invoke } from '@tauri-apps/api/core';

export type SavedFiles = { name: string; path: string; preview: string; size: number };

const mockSelectedNames: string[] = [
  'README.md',
  'package.json',
  'svelte.config.js',
  'tsconfig.json',
  'vite.config.ts',
  'src/app.d.ts',
  'src/routes/+layout.svelte',
  'src/routes/+page.svelte',
  'src/lib/components/CardFiles.svelte',
  'src/lib/components/EditModal.svelte',
  'src/lib/tauri/index.ts',
  'src-tauri/Cargo.toml',
  'src-tauri/src/main.rs',
  'src-tauri/tauri.conf.json',
  'src/lib/components/CardFiles.svelte',
  'src/lib/components/EditModal.svelte',
  'src/lib/tauri/index.ts',
  'src-tauri/Cargo.toml',
  'src-tauri/src/main.rs',
  'src-tauri/tauri.conf.json'
];

export const load = async () => {
  try {
    const files = await invoke<SavedFiles[]>('get_files');
    return { files: files ?? [], previews: mockSelectedNames };
  } catch (err) {
    console.error('Failed to load files:', err);
    return { files: [] as SavedFiles[] };
  }
};
