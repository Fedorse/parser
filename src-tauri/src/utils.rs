use std::fs;
use std::io::{self, Error, ErrorKind, Write};
use std::path::PathBuf;
use directories::ProjectDirs;
use chrono::Local;

use crate::consts::{APP_NAME, PRESETS_FILE_NAME, PARSED_FILES_DIR, PRESETS, SavedPreset};

pub fn get_new_file_name() -> String {
    let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();

    return format!("{}.txt", timestamp);
}

pub fn get_app_dir() -> Result<PathBuf, io::Error> {
    match ProjectDirs::from("", "", APP_NAME) {
        Some(proj_dirs) => {
            let path = proj_dirs.data_local_dir();
            fs::create_dir_all(path)?;
            Ok(path.to_path_buf())
        }
        None => Err(Error::new(ErrorKind::NotFound, "Failed to locate project directory")),
    }
}

pub fn join_app_dir(path: &str) -> PathBuf {
    let app_dir = get_app_dir().unwrap();
    return app_dir.join(path);
}

pub fn get_default_presets() -> Vec<SavedPreset> {
    PRESETS
        .iter()
        .map(|preset| SavedPreset {
            name: preset.name.to_string(),
            ignore_patterns: preset
                .ignore_patterns
                .iter()
                .map(|pattern| pattern.to_string())
                .collect(),
        })
        .collect()
}

pub fn get_saved_presets() -> Result<Vec<SavedPreset>, String> {
    let preset_path = join_app_dir(PRESETS_FILE_NAME);

    if let Ok(content) = fs::read_to_string(preset_path) {
        let presets: Vec<SavedPreset> = serde_json::from_str(&content).unwrap();
        Ok(presets)
    } else {
        Err("Failed to read presets".to_string())
    }
}

pub fn get_parsed_files() -> Result<Vec<String>, String> {
    let files_dir = join_app_dir(PARSED_FILES_DIR);
    let entries = fs::read_dir(files_dir).map_err(|e| e.to_string())?;
    let mut file_list = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_file() {
            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                file_list.push(file_name.to_string());
            } else {
                return Err("Failed to parse files".to_string());
            }
        }
    }

    Ok(file_list)
}

pub fn get_file_path(file_name: String, folder_name: &str) -> Result<PathBuf, String> {
    let project_dir = get_app_dir().map_err(|e| e.to_string())?;
    let file_path = project_dir.join(folder_name). join(file_name);

    if file_path.exists() {
        Ok(file_path)
    } else {
        Err("File not found".to_string())
    }
}

pub fn write_parsed_file(path: &PathBuf, content: &str) -> Result<(), String> {
    let mut file = fs::File::create(&path).map_err(|e| e.to_string())?;

    file.write_all(content.as_bytes()).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn read_parsed_file(file_name: String) -> Result<String, String> {
    let file_path = get_file_path(file_name, PARSED_FILES_DIR).map_err(|e| e.to_string())?;

    match fs::read_to_string(file_path) {
        Ok(content) => Ok(content),
        Err(_) => Err("Failed to read file".to_string()),
    }
}

pub fn remove_parsed_file(file_name: String) -> Result<(), String> {
    let file_path = get_file_path(file_name, PARSED_FILES_DIR).map_err(|e| e.to_string())?;

    match fs::remove_file(file_path) {
        Ok(_) => Ok(()),
        Err(_) => Err("Failed to remove file".to_string())
    }
}

pub fn update_parsed_file(file_name: String, content: String) -> Result<(), String> {
    let file_path = get_file_path(file_name, PARSED_FILES_DIR).map_err(|e| e.to_string())?;

    match fs::write(file_path, content) {
        Ok(_) => Ok(()),
        Err(_) => Err("Failed to update file".to_string())
    }
}

pub fn update_saved_preset(new_preset: SavedPreset) -> Result<(), String> {
    let preset_path = get_file_path(PRESETS_FILE_NAME.to_string(), "")?;

    if !preset_path.exists() {
        fs::write(&preset_path, "[]").map_err(|e| e.to_string())?;
    }

    let mut existing_presets: Vec<SavedPreset> = serde_json::from_str(
        &fs::read_to_string(&preset_path).unwrap_or_else(|_| "[]".to_string())
    ).unwrap_or_else(|_| vec![]);

    existing_presets.push(new_preset);

    let presets_json = serde_json::to_string_pretty(&existing_presets).map_err(|e| e.to_string())?;

    fs::write(preset_path, presets_json).map_err(|e| e.to_string())?;

    Ok(())
}

/// Delete a user-defined preset from the local presets.json.
pub fn delete_saved_preset(preset: SavedPreset) -> Result<(), String> {
    let preset_path = get_file_path(PRESETS_FILE_NAME.to_string(), "")?;

    if !preset_path.exists() {
        return Err("Presets file not found".to_string());
    }

    let mut existing_presets: Vec<SavedPreset> = serde_json::from_str(
        &fs::read_to_string(&preset_path).unwrap_or_else(|_| "[]".to_string())
    ).unwrap_or_else(|_| vec![]);

    // Retain all presets that do not match the name of the preset to be deleted
    existing_presets.retain(|p| p.name != preset.name);

    let presets_json = serde_json::to_string_pretty(&existing_presets).map_err(|e| e.to_string())?;
    fs::write(preset_path, presets_json).map_err(|e| e.to_string())?;

    Ok(())
}

/// Merge patterns from user input / saved presets with default presets, if referenced.
pub fn resolve_patterns(ignore_patterns: String) -> String {
    let mut resolved_patterns: Vec<String> = Vec::new();
    let mut patterns = ignore_patterns
        .split(',')
        .map(|s| s.trim().to_string())
        .collect::<Vec<_>>();

    // Combine user-saved presets + default presets:
    let all_presets: Vec<SavedPreset> = get_saved_presets().unwrap_or_else(|_| vec![])
        .into_iter()
        .chain(get_default_presets().into_iter())
        .collect();

    while let Some(pattern) = patterns.pop() {
        // If the pattern is the name of a preset, then pull in that preset's ignore_patterns:
        if let Some(resolved_preset) = all_presets.iter().find(|p| p.name == pattern) {
            patterns.extend(
                resolved_preset
                    .ignore_patterns
                    .iter()
                    .map(|s| s.trim().to_string())
            );
        } else {
            // Otherwise, it's a direct pattern.
            resolved_patterns.push(pattern);
        }
    }

    let resolved_patterns_str = resolved_patterns.join(",");
    log::info!("Resolved patterns: {:?}", resolved_patterns_str);

    resolved_patterns_str
}


pub fn parse_files_with_patterns(file_paths: Vec<String>, ignore_patterns: Vec<String>) -> Result<String, String> {
    let mut concatenated_content = String::new();

    for path in file_paths {
        let path_buf = PathBuf::from(&path);

        log::info!("Checking file: {:?}", path_buf);

        let file_name = path_buf.file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("");

        log::info!("File name: {:?}", file_name);
        log::info!("Ignore patterns: {:?}", ignore_patterns);

        // Skip if the file name is in the ignore patterns
        if ignore_patterns.iter().any(|pattern| pattern == file_name) {
            log::info!("Skipping ignored file: {}", path);
            continue;
        }

        match fs::read_to_string(&path_buf) {
            Ok(content) => concatenated_content.push_str(&content),
            Err(_) => return Err(format!("Failed to parse file: {}", path)),
        }
    }

    Ok(concatenated_content)
}

/// Setup
pub fn setup_app_structure() -> Result<(), String> {
    let app_dir = get_app_dir().map_err(|e| e.to_string())?;

    let parsed_files_path = app_dir.join(PARSED_FILES_DIR);
    if !parsed_files_path.exists() {
        fs::create_dir_all(&parsed_files_path)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    let presets_file_path = app_dir.join(PRESETS_FILE_NAME);
    if !presets_file_path.exists() {
        let mut file = fs::File::create(&presets_file_path)
            .map_err(|e| format!("Failed to create presets.json: {}", e))?;
        file.write_all(b"[]")
            .map_err(|e| format!("Failed to write empty presets.json: {}", e))?;
    }

    Ok(())
}