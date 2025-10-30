use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;
use std::process::Command;
use anyhow::{self, Result};

use crate::utils::{self, FilePreview};
use crate::consts::{PARSED_FILES_DIR};
use crate::error::CommandError;

#[tauri::command]
pub fn parse(paths: Vec<String>) -> Result<(), CommandError> {
    let mut output_file = utils::create_output_file()?;
    utils::write_parsed_files(paths, &mut output_file)?;

    Ok(())
}

#[tauri::command]
pub fn get_preview_tree(paths: Vec<String>) -> Result<Vec<utils::ParsedPath>, CommandError> {
    let mut result = Vec::new();

    for input in paths {
        let path = PathBuf::from(input);
        if path.exists() {
            result.push(utils::build_file_tree(&path)?);
        }
    }

    Ok(result)
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
pub fn open_in_default_editor(file_path: String) -> Result<(), String> {
    utils::open_with_default_app(utils::OpenAction::OpenFile(PathBuf::from(file_path)))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_in_folder(file_path: String) -> Result<(), String> {
    utils::open_with_default_app(utils::OpenAction::RevealInFolder(PathBuf::from(file_path)))
        .map_err(|e| e.to_string())
}

