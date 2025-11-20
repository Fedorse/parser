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

export type DragEventPayload = {
  type: 'over' | 'drop' | 'leave' | 'enter';
  position: { x: number; y: number };
  paths: string[];
};

// export type FilesTree = {
//   last_modified: string;
//   name: string;
//   path: string;
//   size: number;
// };

export type FileMetadata = {
  created_at: string;
  files_count: number;
  total_size: number;
  files: File[];
  file_tree: FileTree[];
};

export type FileDetail = {
  id: string;
  name: string;
  content: string;
  metadata: {
    id: string;
    name: string;
    created_at: string;
    files_count: number;
    total_size: number;
    files: FileMetadata[];
    file_tree: FileTree[];
  };
};
