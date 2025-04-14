use std::fs::{read_to_string, read_dir,remove_file};
use crate::utils::{FilePreview, create_output_file, get_file_preview, parse_paths, write_parsed_files, update_parsed_file, get_app_dir, get_presets_map, write_presets, open_with_default_app};
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
        let file_name = entry.file_name().to_string_lossy().to_string();
        let preview = get_file_preview(file_name).map_err(|e| e.to_string())?;
        previews.push(preview);
    }

    Ok(previews)
}

#[tauri::command]
pub fn get_file(file_name: String) -> Result<String, String> {
    let file_path = get_app_dir()?.join(PARSED_FILES_DIR).join(file_name);
    let file_content = read_to_string(file_path).map_err(|e| e.to_string())?;

    Ok(file_content)
}

#[tauri::command]
pub fn get_presets() -> Result<String, String> {
    let presets_file = get_app_dir()?.join(PRESETS_FILE_NAME);
    let presets: String = read_to_string(presets_file).map_err(|e| e.to_string())?;

    Ok(presets)
}

#[tauri::command]
pub fn update_file(path: String, content: String) -> Result<(), String> {
    update_parsed_file(path, content)?;

    Ok(())
}

#[tauri::command]
pub fn open_file(file_name: String) -> Result<(), String> {
    let file_path = get_app_dir()
        .map_err(|e| e.to_string())?
        .join(PARSED_FILES_DIR)
        .join(file_name);

    open_with_default_app(&file_path)
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