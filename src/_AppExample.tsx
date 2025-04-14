import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

type FilePreview = {
  path: string;
  content: string;
};

type PresetMap = Record<string, string[]>;

export default function AppExample() {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  const [presets, setPresets] = useState<PresetMap>({});
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      const files: FilePreview[] = await invoke("get_files");
      setFiles(files);
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  };

  const fetchPresets = async () => {
    try {
      const raw = await invoke<string>("get_presets");
      const parsed = JSON.parse(raw);
      setPresets(parsed);
    } catch (err) {
      console.error("Failed to load presets:", err);
    }
  };

  const handleOpenFiles = async (directory: boolean) => {
    const selected = await open({
      multiple: true,
      directory,
    });

    if (!selected) return;

    try {
      await invoke("parse", {
        paths: selected,
        ignorePatterns: selectedPreset ? presets[selectedPreset] || [] : [],
      });
      fetchFiles();
    } catch (err) {
      console.error("Parse failed:", err);
    }
  };

  const handleSelectFile = async (filePath: string) => {
    const fileName = filePath.split("/").pop();
    if (!fileName) return;

    try {
      const content: string = await invoke("get_file", { fileName });
      setSelectedFile(fileName);
      setFileContent(content);
    } catch (err) {
      console.error("Failed to get file:", err);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    try {
      await invoke("update_file", {
        path: selectedFile,
        content: fileContent,
      });
      fetchFiles();
      alert("File saved!");
    } catch (err) {
      console.error("Failed to save file:", err);
    }
  };

  const handleDelete = async (filePath: string) => {
    const fileName = filePath.split("/").pop();
    if (!fileName) return;

    try {
      await invoke("delete_file", { path: fileName });
      setFiles((prev) => prev.filter((f) => f.path !== filePath));
      if (selectedFile === fileName) {
        setSelectedFile(null);
        setFileContent("");
      }
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchPresets();
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

        {/* Preset select */}
        <select
          value={selectedPreset || ""}
          onChange={(e) => setSelectedPreset(e.target.value || null)}
          className="border rounded px-2 py-1"
        >
          <option value="">No Preset</option>
          {Object.keys(presets).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* File preview cards */}
      <div className="grid grid-cols-2 gap-4">
        {files.map((file) => (
          <div key={file.path} className="rounded border p-4 relative group">
            <div
              className="cursor-pointer"
              onClick={() => handleSelectFile(file.path)}
            >
              <p className="font-semibold">{file.path.split("/").pop()}</p>
              <pre className="text-xs text-gray-600 max-h-24 overflow-hidden whitespace-pre-wrap">
                {file.content}
              </pre>
            </div>
            {/* Delete button */}
            <button
              onClick={() => handleDelete(file.path)}
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
          <h2 className="text-lg font-bold">Editing: {selectedFile}</h2>
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
