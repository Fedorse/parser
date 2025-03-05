use std::path::Path;
use crate::utils::*;
use crate::consts::{PresetResponse, SavedPreset, PARSED_FILES_DIR};

#[tauri::command]
pub fn parse(paths: Vec<String>, ignore_patterns: Vec<String>) -> Result<String, String> {
    if paths.is_empty() {
        return Err("No paths provided".to_string());
    }

    // Check if the first path is a directory or a file
    let first_path = &paths[0];
    let path = Path::new(first_path);

    if !path.exists() {
        return Err(format!("Path does not exist: {}", first_path));
    }

    if path.is_dir() {
        // If it's a directory, use parse_directories
        log::info!("First path is a directory, using parse_directories");
        parse_directories(paths, ignore_patterns)
    } else if path.is_file() {
        // If it's a file, use parse_files
        log::info!("First path is a file, using parse_files");
        parse_files(paths, ignore_patterns)
    } else {
        // Neither a file nor a directory (unusual, but possible for special file types)
        Err(format!("Path is neither a file nor a directory: {}", first_path))
    }
}

#[tauri::command]
pub fn parse_files(file_paths: Vec<String>, ignore_patterns: Vec<String>) -> Result<String, String> {
    // let _ignore_patterns = ignore_patterns.unwrap_or_else(|| "".to_string());
    let concatenated_content = parse_files_with_patterns(file_paths, ignore_patterns)?;

    let save_path = get_app_dir()
        .map_err(|e| format!("Failed to get app directory: {}", e))?
        .join(PARSED_FILES_DIR)
        .join(get_new_file_name());

    write_parsed_file(&save_path, &concatenated_content)?;

    Ok(save_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn parse_directories(dir_paths: Vec<String>, ignore_patterns: Vec<String>) -> Result<String, String> {
    let mut concatenated_content = String::new();

    for dir_path in dir_paths {
        match parse_directory_recursively(&dir_path, &ignore_patterns) {
            Ok(content) => concatenated_content.push_str(&content),
            Err(e) => log::warn!("Failed to process directory {}: {}", dir_path, e),
        }
    }

    log::info!("Concatenated content length: {} bytes", concatenated_content.len());

    // Save the result to a new file
    let save_path = get_app_dir()
        .map_err(|e| format!("Failed to get app directory: {}", e))?
        .join(PARSED_FILES_DIR)
        .join(get_new_file_name());

    write_parsed_file(&save_path, &concatenated_content)?;

    Ok(save_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn get_files() -> Result<Vec<String>, String> {
    return get_parsed_files();
}

#[tauri::command]
pub fn get_file_content(file_name: String) -> Result<String, String> {
    return read_parsed_file(file_name);
}

#[tauri::command]
pub fn remove_file(file_name: String) -> Result<(), String> {
    return remove_parsed_file(file_name);
}

#[tauri::command]
pub fn update_file(file_name: String, content: String) -> Result<(), String> {
    return update_parsed_file(file_name, content);
}

#[tauri::command]
pub fn get_presets() -> Result<PresetResponse, String> {
    let default_presets = get_default_presets();
    let saved_presets = get_saved_presets().unwrap_or_else(|_| vec![]);

    Ok(PresetResponse {
        default: default_presets,
        saved: saved_presets,
    })
}

#[tauri::command]
pub fn save_preset(preset: SavedPreset) -> Result<(), String> {
    update_saved_preset(preset)
}

#[tauri::command]
pub fn delete_preset(preset: SavedPreset) -> Result<(), String> {
    delete_saved_preset(preset)
}