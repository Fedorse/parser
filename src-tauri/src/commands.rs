use std::fs::{self, File};
use std::fmt;
use std::io::Write;
use std::path::PathBuf;
use std::process::Command;
use serde::{Deserialize, Serialize};
use anyhow::{self, Result};

use crate::utils::{self, FilePreview};
use crate::consts::{PRESETS_FILE_NAME, PARSED_FILES_DIR};

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandError {
    message: String,
}

impl fmt::Display for CommandError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl From<anyhow::Error> for CommandError {
    fn from(err: anyhow::Error) -> Self {
        Self {
            message: err.to_string(),
        }
    }
}

impl From<std::io::Error> for CommandError {
    fn from(err: std::io::Error) -> Self {
        Self {
            message: err.to_string(),
        }
    }
}


impl From<String> for CommandError {
    fn from(err: String) -> Self {
        Self {
            message: err.to_string(),
        }
    }
}

impl From<&str> for CommandError {
    fn from(err: &str) -> Self {
        Self {
            message: err.to_string(),
        }
    }
}

#[tauri::command]
pub fn parse(paths: Vec<String>, ignore_patterns: Vec<String>) -> Result<(), CommandError> {
    let mut output_file = utils::create_output_file()?;
    let parsed_paths = utils::parse_paths(paths, ignore_patterns)?;

    utils::write_parsed_files(parsed_paths, &mut output_file)?;

    Ok(())
}

#[tauri::command]
pub fn get_files() -> Result<Vec<FilePreview>, CommandError> {
    let parsed_files_dir = utils::get_app_dir()?.join(PARSED_FILES_DIR);
    let mut previews = Vec::new();

    for entry in fs::read_dir(parsed_files_dir)? {
        let entry = entry?;
        let file_path = entry.path();
        let preview = utils::get_file_preview(file_path)?;
        previews.push(preview);
    }

    Ok(previews)
}

#[tauri::command]
pub fn get_file_content(file_path: String) -> Result<String, CommandError> {
    let file_content: String = fs::read_to_string(file_path)?;

    Ok(file_content)
}

#[tauri::command]
pub fn get_presets() -> Result<String, CommandError> {
    let presets_file = utils::get_app_dir()?.join(PRESETS_FILE_NAME);
    let presets = fs::read_to_string(presets_file)?;

    Ok(presets)
}

#[tauri::command]
pub fn update_file(file_path: String, content: String) -> Result<(), CommandError> {
    let mut file = File::create(file_path)?;
    file.write_all(content.as_bytes())?;

    Ok(())
}

#[tauri::command]
pub fn rename_file(file_path: String, new_name: String) -> Result<(), CommandError> {
    let old_path = PathBuf::from(&file_path);
    let new_path = old_path.parent().ok_or("Failed to get parrent dir")?.join(new_name);

    fs::rename(&old_path, &new_path)?;

    Ok(())
}

#[tauri::command]
pub fn delete_file(path: String) -> Result<(), CommandError> {
    let file_path = utils::get_app_dir()?.join(PARSED_FILES_DIR).join(path);
    fs::remove_file(file_path)?;

    Ok(())
}

#[tauri::command]
pub fn update_preset(name: String, ignore_patterns: Vec<String>) -> Result<(), CommandError> {
    let mut presets = utils::get_presets_map()?;

    presets.insert(name, ignore_patterns);
    utils::write_presets(&presets)?;

    Ok(())
}

#[tauri::command]
pub fn delete_preset(name: String) -> Result<(), CommandError> {
    let mut presets = utils::get_presets_map()?;

    presets.remove(&name);
    utils::write_presets(&presets)?;

    Ok(())
}

#[tauri::command]
pub fn open_in_folder(file_path: String) -> Result<(), CommandError> {
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
pub fn open_in_default_editor(file_path: String) -> Result<(), CommandError> {
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
