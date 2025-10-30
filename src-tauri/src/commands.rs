use crate::consts::PARSED_FILES_DIR;
use crate::error::CommandError;
use crate::utils::{self, ParseMetadata, ParsedPath};
use anyhow::Result;
use chrono::{DateTime, Local};
use std::fs;
use std::path::PathBuf;

// ============================================================================
// PARSE OPERATIONS
// ============================================================================

/// Parse files asynchronously
#[tauri::command]
pub async fn parse(paths: Vec<String>) -> Result<ParseMetadata, CommandError> {
    let metadata = utils::parse_files_async(paths).await?;
    Ok(metadata)
}

/// Get preview tree before parsing
#[tauri::command]
pub async fn get_preview_tree(
    paths: Vec<String>,
) -> Result<Vec<ParsedPath>, CommandError> {
    let mut result = Vec::new();

    for input in paths {
        let path = PathBuf::from(input);
        if path.exists() {
            result.push(utils::build_file_tree(&path)?);
        }
    }

    Ok(result)
}

// ============================================================================
// FILE LISTING
// ============================================================================

/// Lightweight list item for displaying parsed files
#[derive(serde::Serialize)]
pub struct ParsedFileListItem {
    /// Directory name (unique identifier)
    pub id: String,
    /// User-friendly name
    pub name: String,
    /// Full path to parse directory
    pub directory_path: String,
    /// Size of the content.txt file in bytes
    pub file_size: u64,
    /// Number of files that were parsed
    pub files_count: usize,
    /// Total size of all original files in bytes
    pub total_size: u64,
    /// When this parse was created
    pub created_at: DateTime<Local>,
    /// Last modification time of the directory
    pub last_modified: DateTime<Local>,
}

/// Get all parsed files (lightweight list)
///
/// **Fast operation:**
/// - Only reads metadata.json (small)
/// - Does NOT load content.txt
#[tauri::command]
pub async fn get_files() -> Result<Vec<ParsedFileListItem>, CommandError> {
    let parsed_files_dir = utils::get_app_dir()?.join(PARSED_FILES_DIR);
    let mut files_list = Vec::new();

    for entry in fs::read_dir(parsed_files_dir)? {
        let entry = entry?;
        let path = entry.path();

        // Only process directories
        if path.is_dir() {
            // Get directory metadata for last_modified
            let dir_metadata = fs::metadata(&path)?;
            let dir_modified: DateTime<Local> = dir_metadata.modified()?.into();

            // Load parse metadata
            let metadata = utils::load_metadata(&path)?;

            // Get content file size
            let content_path = utils::get_content_path(&path);
            let content_size = fs::metadata(&content_path)?.len();

            let dir_name = path
                .file_name()
                .and_then(|s| s.to_str())
                .unwrap_or("unknown")
                .to_string();

            files_list.push(ParsedFileListItem {
                id: dir_name,
                name: metadata.name,
                directory_path: path.to_string_lossy().to_string(),
                file_size: content_size,
                files_count: metadata.files_count,
                total_size: metadata.total_size,
                created_at: metadata.created_at,
                last_modified: dir_modified,
            });
        }
    }

    // Sort by created_at descending - newest first
    files_list.sort_by(|a, b| b.created_at.cmp(&a.created_at));

    Ok(files_list)
}

// ============================================================================
// FILE DETAIL VIEW
// ============================================================================

/// Complete detail for a parsed file
#[derive(serde::Serialize)]
pub struct ParsedFileDetail {
    /// Directory name (unique identifier)
    pub id: String,
    /// User-friendly name
    pub name: String,
    /// Full content of the parsed file
    pub content: String,
    /// Complete metadata including file tree
    pub metadata: ParseMetadata,
}

/// Get complete details for a specific parsed file
///
/// **Loads everything:**
/// - Full content.txt
/// - Full metadata with file tree
#[tauri::command]
pub async fn get_file_detail(dir_name: String) -> Result<ParsedFileDetail, CommandError> {
    let parse_dir = utils::get_app_dir()?.join(PARSED_FILES_DIR).join(&dir_name);

    // Load content
    let content = utils::load_content(&parse_dir)?;

    // Load metadata
    let metadata = utils::load_metadata(&parse_dir)?;

    Ok(ParsedFileDetail {
        id: dir_name,
        name: metadata.name.clone(),
        content,
        metadata,
    })
}

/// Get only content (alternative to get_file_detail)
#[tauri::command]
pub fn get_file_content(dir_name: String) -> Result<String, CommandError> {
    let parse_dir = utils::get_app_dir()?.join(PARSED_FILES_DIR).join(dir_name);
    let content = utils::load_content(&parse_dir)?;
    Ok(content)
}

/// Get only metadata (alternative to get_file_detail)
#[tauri::command]
pub fn get_file_metadata(dir_name: String) -> Result<ParseMetadata, CommandError> {
    let parse_dir = utils::get_app_dir()?.join(PARSED_FILES_DIR).join(dir_name);
    let metadata = utils::load_metadata(&parse_dir)?;
    Ok(metadata)
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/// Update parsed file content
#[tauri::command]
pub fn update_file(dir_name: String, content: String) -> Result<(), CommandError> {
    let parse_dir = utils::get_app_dir()?.join(PARSED_FILES_DIR).join(dir_name);
    utils::update_content(&parse_dir, &content)?;
    Ok(())
}

/// Rename a parsed file
///
/// **Atomic operation:**
/// - Renames entire directory
/// - Updates metadata.name
#[tauri::command]
pub fn rename_file(dir_name: String, new_name: String) -> Result<(), CommandError> {
    let parsed_files_dir = utils::get_app_dir()?.join(PARSED_FILES_DIR);
    let old_dir = parsed_files_dir.join(&dir_name);
    let new_dir = parsed_files_dir.join(&new_name);

    // Atomic rename of entire directory
    fs::rename(&old_dir, &new_dir)?;

    // Update metadata to reflect new name
    let mut metadata = utils::load_metadata(&new_dir)?;
    metadata.name = new_name;

    // Save using helper function
    let metadata_path = utils::get_metadata_path(&new_dir);
    utils::save_metadata(&metadata_path, &metadata)?;

    Ok(())
}

/// Delete a parsed file
///
/// **Atomic operation:**
/// - Deletes entire directory and all contents
#[tauri::command]
pub fn delete_file(dir_name: String) -> Result<(), CommandError> {
    let parse_dir = utils::get_app_dir()?.join(PARSED_FILES_DIR).join(dir_name);
    fs::remove_dir_all(parse_dir)?;
    Ok(())
}

// ============================================================================
// SYSTEM OPERATIONS
// ============================================================================

/// Open content.txt in default editor
#[tauri::command]
pub fn open_in_default_editor(dir_name: String) -> Result<(), String> {
    let parse_dir = utils::get_app_dir()
        .map_err(|e| e.to_string())?
        .join(PARSED_FILES_DIR)
        .join(dir_name);

    let content_path = utils::get_content_path(&parse_dir);

    utils::open_with_default_app(utils::OpenAction::OpenFile(content_path))
        .map_err(|e| e.to_string())
}

/// Reveal parse directory in file explorer
#[tauri::command]
pub fn open_in_folder(dir_name: String) -> Result<(), String> {
    let parse_dir = utils::get_app_dir()
        .map_err(|e| e.to_string())?
        .join(PARSED_FILES_DIR)
        .join(dir_name);

    utils::open_with_default_app(utils::OpenAction::RevealInFolder(parse_dir))
        .map_err(|e| e.to_string())
}
