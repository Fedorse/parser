import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

const THIRTY_MB_SIZE = 30 * 1024 * 1024;

type FilePreview = {
  path: string;
  name: string;
  preview: string;
  size: number;
};

type PresetMap = Record<string, string[]>;

export default function AppExample() {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [selectedFile, setSelectedFile] = useState<FilePreview | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  const [renamingFile, setRenamingFile] = useState<string | null>(null); // path
  const [newName, setNewName] = useState<string>("");

  const fetchFiles = async () => {
    try {
      const files: FilePreview[] = await invoke("get_files");
      console.log("files", files);

      setFiles(files);
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  };

  const selectFilesToParse = (previewTree: any) => {
    let paths: string[] = [];

    for (const path of previewTree) {
      if (path.type === "File") {
        paths.push(path.path);
      } else {
        const children = selectFilesToParse(path.children);
        paths = paths.concat(children);
      }
    }

    return paths;
  };

const handleOpenFiles = async (directory: boolean) => {
    const selected = await open({
      multiple: true,
      directory,
    });

    if (!selected) return;

    try {
      // Get preview tree
      // TODO: visually show selection of the files to parse
      const res = await invoke("get_preview_tree", {
        paths: selected,
      });

      // TODO: select files manually
      const filesPaths = selectFilesToParse(res);

      // Parse selected files
      await invoke("parse", { paths: filesPaths });

      await fetchFiles();
    } catch (err) {
      console.error("Parse failed:", err);
    }
  };

  const handleSelectFile = async (filePreview) => {
    try {
      const content = await invoke("get_file_content", {
        filePath: filePreview.path,
      });
      setSelectedFile(filePreview);
      setFileContent(content);
    } catch (err) {
      console.error("Failed to get file:", err);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      await invoke("update_file", {
        filePath: selectedFile.path,
        content: fileContent,
      });
      await fetchFiles();
    } catch (err) {
      console.error("Failed to save file:", err);
    }
  };

  const handleDelete = async (file: FilePreview) => {
    const fileName = file.name;
    try {
      await invoke("delete_file", { path: fileName });
      setFiles((prev) => prev.filter((f) => f.path !== file.path));
      if (selectedFile?.path === file.path) {
        setSelectedFile(null);
        setFileContent("");
      }
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  const handleOpenDir = (file: FilePreview) => {
    invoke("open_in_folder", { filePath: file.path });
  };

  const openInEditor = async (file: FilePreview) => {
    await invoke("open_in_default_editor", { filePath: file.path });
  };

  const handleRenameFile = async (file: FilePreview, newName: string) => {
    if (!newName || newName === file.name) return;
    try {
      await invoke("rename_file", {
        filePath: file.path,
        newName: newName,
      });
      await fetchFiles();
      setRenamingFile(null);
    } catch (err) {
      console.error("Failed to rename file:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Top Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleOpenFiles(false)}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Open Files
        </button>
        <button
          onClick={() => handleOpenFiles(true)}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Open Folder
        </button>
      </div>

      {/* File preview cards */}
      <div className="grid grid-cols-2 gap-4">
        {files.map((file) => (
          <div key={file.path} className="rounded border p-4 relative group">
            <div
              className="cursor-pointer"
              onClick={() => {
                if (file.size > THIRTY_MB_SIZE) {
                  openInEditor(file);
                } else {
                  handleSelectFile(file);
                }
              }}
            >
              {renamingFile === file.path ? (
                <input
                  className="font-semibold border rounded px-1 text-sm"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => handleRenameFile(file, newName)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRenameFile(file, newName);
                    }
                  }}
                  autoFocus
                />
              ) : (
                <p
                  className="font-semibold cursor-pointer"
                  onClick={() => {
                    setRenamingFile(file.path);
                    setNewName(file.name);
                  }}
                >
                  {file.name}
                </p>
              )}
              <pre className="text-xs text-gray-600 max-h-24 overflow-hidden whitespace-pre-wrap">
                {file.preview}
              </pre>
            </div>

            {/* Delete button */}
            <button
              onClick={() => handleOpenDir(file)}
              className="absolute top-2 right-5 opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700"
              title="Delete File"
            >
              Folder
            </button>

            <button
              onClick={() => handleDelete(file)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
              title="Delete File"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Editor */}
      {selectedFile && (
        <div className="flex flex-col gap-4 mt-6">
          <h2 className="text-lg font-bold">Editing: {selectedFile.name}</h2>
          <textarea
            className="w-full min-h-[300px] border rounded p-3 font-mono text-sm"
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="w-fit self-end rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
