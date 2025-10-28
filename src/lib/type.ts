export type FileTree = {
  name: string;
  path: string;
  type: 'File' | 'Directory';
  selected?: boolean;
  children?: FileTree[];
};

export type File = { name: string; path: string; preview: string; size: number };
