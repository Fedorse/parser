import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { getCurrentWebview } from "@tauri-apps/api/webview";

type Preset = {
  name: string;
  ignorePatterns: string;
};

function useDragDrop(parseCB) {
  const [dragState, setDragState] = useState({
    isDragging: false,
    position: null,
    files: [],
  });

  const unlistenRef = useRef(null);

  useEffect(() => {
    // Get the current webview window
    const currentWindow = getCurrentWebview();

    const setupListener = async () => {
      try {
        unlistenRef.current = await currentWindow.onDragDropEvent((event) => {
          const { type, position, paths } = event.payload;

          console.log(`Drag event: ${type}`);

          switch (type) {
            case "over":
              console.log("Hover position:", position);
              setDragState({
                isDragging: true,
                position,
                files: [],
              });
              break;

            case "drop":
              console.log("Files dropped:", paths);
              setDragState({
                isDragging: false,
                position,
                files: paths,
              });

              parseCB(paths);

              break;
            case "leave":
              console.log("Drag operation cancelled");
              setDragState({
                isDragging: false,
                position: null,
                files: [],
              });
              break;

            default:
              console.log("Unknown drag event type:", type);
          }
        });

        console.log("Drag and drop listener set up successfully");
      } catch (error) {
        console.error("Failed to set up drag and drop listener:", error);
      }
    };

    setupListener();

    // Properly clean up the listener when the component unmounts
    return () => {
      if (unlistenRef.current) {
        console.log("Cleaning up drag and drop listener");
        unlistenRef.current();
      }
    };
  }, []);

  return dragState;
}

function DropZone({ isDragging, files }) {
  return (
    <div
      className={`drop-zone ${isDragging ? "active" : ""}`}
      style={{
        padding: "2rem",
        border: `2px dashed ${isDragging ? "#4a90e2" : "#ccc"}`,
        borderRadius: "4px",
        textAlign: "center",
        transition: "all 0.2s ease",
        backgroundColor: isDragging ? "rgba(74, 144, 226, 0.1)" : "transparent",
      }}
    >
      {isDragging ? (
        <p>Drop files here...</p>
      ) : files.length > 0 ? (
        <div>
          <p>Files dropped:</p>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Drag files here to upload</p>
      )}
    </div>
  );
}

export default function FileUploader() {
  const [savedFiles, setSavedFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [currentFileContent, setCurrentFileContent] = useState<string>("");
  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null);
  const [savedPresets, setSavedPresets] = useState<Preset[]>([]);
  const [defaultPresets, setDefaultPresets] = useState<Preset[]>([]);

  const [newPreset, setNewPreset] = useState<Preset>({
    name: "",
    ignorePatterns: "",
  });

  const saveCurrentFile = async () => {
    await invoke("update_file", {
      fileName: currentFile,
      content: currentFileContent,
    });
  };

  const reloadFiles = async () => {
    const res = await invoke("get_files");

    setSavedFiles(res);
  };

  const handleFileClick = async (fileName: string) => {
    const content = await invoke("get_file_content", { fileName });
    setCurrentFile(fileName);

    setCurrentFileContent(content);
  };

  const handleFileRemove = async (fileName) => {
    await invoke("remove_file", { fileName });
    await reloadFiles();
  };

  const parseFiles = async (files) => {
    console.log("CURRET", currentPreset);

    const ignorePatterns = currentPreset?.ignorePatterns ?? [];

    console.log("IGNORE", ignorePatterns);

    // await invoke("parse_files", {
    //   filePaths: files,
    //   ignorePatterns,
    // });
    await invoke("parse", {
      paths: files,
      ignorePatterns,
    });

    await reloadFiles();
  };

  const handleFileSelect = async () => {
    const selected = await open({
      multiple: true,
      directory: true,
    });

    console.log("selected", selected);

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
    invoke("get_presets").then((res) => {
      const { default: defaultPresets, saved } = res;

      setDefaultPresets(
        defaultPresets.map((preset) => ({
          ...preset,
          ignorePatterns: preset.ignore_patterns,
        }))
      );
      setSavedPresets(
        saved.map((preset) => ({
          ...preset,
          ignorePatterns: preset.ignore_patterns,
        }))
      );

      console.log("SAVED", saved);
      console.log("DEFAULT", defaultPresets);
    });
  }, []);

  const savePreset = async () => {
    console.log("NEW PRESET", newPreset);

    const res = await invoke("save_preset", {
      preset: {
        ...newPreset,
        ignore_patterns: newPreset.ignorePatterns.split(","),
      },
    });
    console.log("RES", res);

    setSavedPresets([...savedPresets, newPreset]);
    setNewPreset({ name: "", ignorePatterns: "" });
  };

  const { isDragging, files } = useDragDrop(parseFiles);

  return (
    <div className="p-4 border rounded-lg shadow-lg">
      <DropZone isDragging={isDragging} files={files} />
      <button
        onClick={handleFileSelect}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Select Files
      </button>

      {savedFiles.map((fileName) => (
        <div
          onClick={() => handleFileClick(fileName)}
          className="mt-4 text-md text-gray-600 cursor-pointer gap-10"
          key={fileName}
        >
          <span className="text-ellipsis">{fileName}</span>
          <span
            className="text-red-600 text-lg"
            onClick={(e) => {
              e.stopPropagation();
              handleFileRemove(fileName);
            }}
          >
            | X |
          </span>
        </div>
      ))}

      {currentFile && (
        <div className="mt-4 text-sm text-black gap-10">
          <textarea
            value={currentFileContent}
            onChange={(e) => setCurrentFileContent(e.target.value)}
            className="w-full h-full rounded-lg border-2 border-gray-300 p-4"
          ></textarea>

          <button onClick={() => saveCurrentFile()}>Save</button>
        </div>
      )}

      {currentPreset && (
        <>
          <h3>Selected preset</h3>
          <div className="mt-4 text-sm text-black gap-10">
            {currentPreset.name}
          </div>
        </>
      )}

      <h3>PRESETS</h3>
      {savedPresets.map((preset) => (
        <div
          onClick={() => setCurrentPreset(preset)}
          className="mt-4 text-md text-gray-600 cursor-pointer gap-10"
          key={preset.name}
        >
          <span className="text-ellipsis">{preset.name}</span>
          <span className="text-red-600 text-lg">{preset.ignorePatterns}</span>
          <span
            className="text-red-600 text-lg"
            onClick={(e) => {
              e.stopPropagation();
              invoke("delete_preset", { preset });
            }}
          >
            | X |
          </span>
        </div>
      ))}
      {defaultPresets.map((preset) => (
        <div
          onClick={() => setCurrentPreset(preset)}
          className="mt-4 text-md text-gray-600 cursor-pointer gap-10"
          key={preset.name}
        >
          <span className="text-ellipsis">{preset.name}</span>
          {/* <span className="text-red-600 text-lg">{preset.ignorePatterns}</span> */}
        </div>
      ))}
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          savePreset();
        }}
      >
        <label htmlFor="preset-name" className="text-sm">
          New Presets
        </label>
        <input
          type="text"
          id="preset-name"
          className="w-full rounded-lg border-2 border-gray-300 p-4"
          value={newPreset.name}
          onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
        />
        <label htmlFor="ignore-patterns" className="text-sm">
          Files to ignore, comma separated
        </label>

        <input
          type="text"
          id="ignore-patterns"
          className="w-full rounded-lg border-2 border-gray-300 p-4"
          value={newPreset.ignorePatterns}
          onChange={(e) =>
            setNewPreset({ ...newPreset, ignorePatterns: e.target.value })
          }
        />
        <button>Add new preset</button>
      </form>
    </div>
  );
}
