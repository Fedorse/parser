import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export default function FileUploader() {
  const [savedFiles, setSavedFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<string>("");

  const reloadFiles = async () => {
    const res = await invoke("get_files");

    setSavedFiles(res);
  };

  const handleFileClick = async (path: string) => {
    const content = await invoke("get_file_content", { filePath: path });
    setCurrentFile(content);
  };

  const handleFileRemove = async (path) => {
    await invoke("remove_file", { filePath: path });
    await reloadFiles();
  };

  const parseFiles = async (files) => {
    await invoke("parse_files", {
      filePaths: files,
      title: "Test",
    });

    await reloadFiles();
  };

  const handleFileSelect = async () => {
    const selected = await open({
      multiple: true,
      filters: [{ name: "Text", extensions: ["txt", "log", "md"] }],
    });

    let files;

    if (Array.isArray(selected)) {
      files = selected;
    } else if (selected) {
      files = selected;
    }

    await parseFiles(files);
  };

  useEffect(() => {
    reloadFiles();
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-lg">
      <button
        onClick={handleFileSelect}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Select Files
      </button>

      {savedFiles.map((filePath) => (
        <div
          onClick={() => handleFileClick(filePath)}
          className="mt-4 text-md text-gray-600 cursor-pointer gap-10"
          key={filePath}
        >
          <span className="text-ellipsis">{filePath}</span>
          <span
            className="text-red-600 text-lg"
            onClick={(e) => {
              e.stopPropagation();
              handleFileRemove(filePath);
            }}
          >
            | X |
          </span>
        </div>
      ))}

      {currentFile && (
        <div className="mt-4 text-sm text-black gap-10">
          <span>{currentFile}</span>
        </div>
      )}
    </div>
  );
}
