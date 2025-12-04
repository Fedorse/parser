export type NodeType = 'File' | 'Directory';

export type FileTree = {
  name: string;
  path: string;
  type: NodeType;
  selected?: boolean;
  children?: FileTree[];
  size?: number;
  lastModified?: string;
};

export type FileMetadata = {
  id: string;
  name: string;
  path?: string;
  files_count: number;
  total_size: number;
  created_at: string;
  updated_at: string;
};

export type File = {
  id: string;
  name: string;
  directory_path: string;
  file_size: number;
  files_count: number;
  total_size: number;
  created_at: string;
  updated_at: string;
};

export type DragEventType = 'over' | 'drop' | 'leave' | 'enter';

export type Vec2 = { x: number; y: number };

export type DragEventPayload = {
  type: DragEventType;
  position: Vec2;
  paths: string[];
};

export type Direction = 'TB' | 'LR';

export type WithMeasured<T> = T & { measured?: { width?: number; height?: number } };

export type GraphData = {
  label: string;
  type: NodeType;
  path: string;
  onToggle?: (p: string) => void;
  open?: boolean;
  dir: Direction;
  openEditor?: (path: string) => void;
  largeFile?: boolean;
};
