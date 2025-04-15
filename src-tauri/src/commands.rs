use std::fs::{read_dir, read_to_string, remove_file, rename, File};
use std::io::Write;
use std::path::PathBuf;
use std::process::Command;
use crate::utils::{FilePreview, create_output_file, get_file_preview, parse_paths, write_parsed_files, get_app_dir, get_presets_map, write_presets};
use crate::consts::{PRESETS_FILE_NAME, PARSED_FILES_DIR};

#[tauri::command]
pub fn parse(paths: Vec<String>, ignore_patterns: Vec<String>) -> Result<(), String> {
    let mut output_file = create_output_file().map_err(|e| e.to_string())?;
    let parsed_paths = parse_paths(paths, ignore_patterns).map_err(|e| e.to_string())?;

    write_parsed_files(parsed_paths, &mut output_file)?;

    Ok(())
}

#[tauri::command]
pub fn get_files() -> Result<Vec<FilePreview>, String> {
    let parsed_files_dir = get_app_dir()?.join(PARSED_FILES_DIR);
    let mut previews = Vec::new();

    for entry in read_dir(parsed_files_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let file_path = entry.path();
        let preview = get_file_preview(file_path).map_err(|e| e.to_string())?;
        previews.push(preview);
    }

    Ok(previews)
}

#[tauri::command]
pub fn get_file_content(file_path: String) -> Result<String, String> {
    let file_content: String = read_to_string(file_path).map_err(|e| e.to_string())?;

    Ok(file_content)
}

#[tauri::command]
pub fn get_presets() -> Result<String, String> {
    let presets_file = get_app_dir()?.join(PRESETS_FILE_NAME);
    let presets: String = read_to_string(presets_file).map_err(|e| e.to_string())?;

    Ok(presets)
}

#[tauri::command]
pub fn update_file(file_path: String, content: String) -> Result<(), String> {
    let mut file = File::create(file_path).map_err(|e| e.to_string())?;
    file.write_all(content.as_bytes()).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn rename_file(file_path: String, new_name: String) -> Result<(), String> {
    let old_path = PathBuf::from(&file_path);
    let new_path = old_path.parent().ok_or("Failed to get parrent dir")?.join(new_name);

    rename(&old_path, &new_path).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_file(path: String) -> Result<(), String> {
    let file_path = get_app_dir().map_err(|e| e.to_string())?.join(PARSED_FILES_DIR).join(path);
    remove_file(file_path).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_preset(name: String, ignore_patterns: Vec<String>) -> Result<(), String> {
    let mut presets = get_presets_map()?;

    presets.insert(name, ignore_patterns);
    write_presets(&presets)?;

    Ok(())
}

#[tauri::command]
pub fn delete_preset(name: String) -> Result<(), String> {
    let mut presets = get_presets_map()?;

    presets.remove(&name);
    write_presets(&presets)?;

    Ok(())
}

#[tauri::command]
pub fn open_in_folder(file_path: String) -> Result<(), String> {
    let path = std::path::Path::new(&file_path);

    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        Command::new("open")
            .arg("-R")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open in Finder: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        Command::new("explorer")
            .arg("/select,")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open in Explorer: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        use std::process::Command;
        Command::new("xdg-open")
            .arg(path.parent().ok_or("No parent directory found")?)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn open_in_default_editor(file_path: String) -> Result<(), String> {
        #[cfg(target_os = "windows")]
        {
            Command::new("cmd")
                .args(["/C", "start", "", &file_path.to_string_lossy()])
                .spawn()
                .map_err(|e| format!("Failed to open file: {}", e))?;
        }

        #[cfg(target_os = "macos")]
        {
            Command::new("open")
                .arg(file_path)
                .spawn()
                .map_err(|e| format!("Failed to open file: {}", e))?;
        }

        #[cfg(target_os = "linux")]
        {
            Command::new("xdg-open")
                .arg(file_path)
                .spawn()
                .map_err(|e| format!("Failed to open file: {}", e))?;
        }

        Ok(())
    }
