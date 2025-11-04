export type FileTree = {
  name: string;
  path: string;
  type: 'File' | 'Directory';
  selected?: boolean;
  children?: FileTree[];
  size?: number;
  lastModified?: string;
};

export type File = {
  id: string;
  name: string;
  directory_path: string;
  file_size: number;
  files_count: number;
  total_size: number;
  created_at: string;
  last_modified: string;
};
