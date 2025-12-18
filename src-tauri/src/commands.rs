use crate::error::CommandError;
use crate::utils::{self, ParseMetadata, ParsedPath, PARSED_FILES_DIR};
use anyhow::Result;
use chrono::{DateTime, Local};
use futures::future::join_all;
use std::fs;
use std::path::PathBuf;
use tokio::fs as tokio_fs;

#[derive(serde::Serialize)]
pub struct ParsedFileListItem {
    pub id: String,
    pub name: String,
    pub directory_path: String,
    pub remote_url: String, // Added matching utils::ParseMetadata to avoid data loss
    pub file_size: u64,
    pub files_count: usize,
    pub total_size: u64,
    pub created_at: DateTime<Local>,
    pub updated_at: DateTime<Local>,
}

// /////////////////////////////////////////////////////////////////////////////
// Core Parsing Commands
// /////////////////////////////////////////////////////////////////////////////

#[tauri::command]
pub async fn parse(
    paths: Vec<String>,
    remote_url: Option<String>,
    app: tauri::AppHandle,
) -> Result<ParseMetadata, CommandError> {
    let result =
        tauri::async_runtime::spawn_blocking(move || utils::parse_files(paths, app, remote_url))
            .await
            .map_err(|e| CommandError::from(anyhow::anyhow!("Thread join error: {}", e)))?
            .map_err(CommandError::from)?;

    Ok(result)
}

#[tauri::command]
pub async fn parse_repository(url: String) -> Result<String, CommandError> {
    let result = tauri::async_runtime::spawn_blocking(move || -> anyhow::Result<String> {
        let path = utils::clone_git_repo(&url)?;
        Ok(path.to_string_lossy().to_string())
    })
    .await
    .map_err(|e| CommandError::from(anyhow::anyhow!("Thread join error: {}", e)))?
    .map_err(CommandError::from)?;

    Ok(result)
}

// /////////////////////////////////////////////////////////////////////////////
// File System Preview & Expansion
// /////////////////////////////////////////////////////////////////////////////

#[tauri::command]
pub async fn get_preview_tree(paths: Vec<String>) -> Result<Vec<ParsedPath>, CommandError> {
    let mut result = Vec::new();

    let tasks: Vec<_> = paths
        .into_iter()
        .map(|input| {
            tokio::task::spawn_blocking(move || {
                let path = PathBuf::from(input);
                if path.exists() {
                    return Some(utils::build_file_tree_shallow(&path));
                }
                None
            })
        })
        .collect();

    let results = join_all(tasks).await;

    for res in results {
        if let Ok(Some(Ok(tree))) = res {
            result.push(tree);
        }
    }

    Ok(result)
}

#[tauri::command]
pub async fn expand_folder(path: String) -> Result<Vec<ParsedPath>, CommandError> {
    let result = tauri::async_runtime::spawn_blocking(move || {
        let path_buf = PathBuf::from(path);

        let mut children = Vec::new();
        if path_buf.is_dir() {
            if let Ok(entries) = fs::read_dir(&path_buf) {
                for entry in entries.flatten() {
                    let child_path = entry.path();
                    if child_path.is_symlink() {
                        continue;
                    }

                    if let Ok(_node) = utils::build_file_tree_shallow(&child_path) {
                        if let Ok(node) = utils::create_shallow_node(&child_path) {
                            children.push(node);
                        }
                    }
                }
            }
        }

        children.sort_by(|a, b| {
            let is_a_dir = matches!(a, ParsedPath::Directory { .. });
            let is_b_dir = matches!(b, ParsedPath::Directory { .. });
            match (is_a_dir, is_b_dir) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a.path().cmp(b.path()),
            }
        });

        children
    })
    .await
    .map_err(|e| CommandError::from(anyhow::anyhow!("Thread join error: {}", e)))?;

    Ok(result)
}

// /////////////////////////////////////////////////////////////////////////////
// Parsed Data Access (Lists, Content, Metadata)
// /////////////////////////////////////////////////////////////////////////////

#[tauri::command]
pub async fn get_files(limit: Option<usize>) -> Result<Vec<ParsedFileListItem>, CommandError> {
    let parsed_files_dir = utils::get_app_dir()?.join(PARSED_FILES_DIR);
    if !parsed_files_dir.exists() {
        return Ok(Vec::new());
    }

    let mut entries = tokio_fs::read_dir(&parsed_files_dir)
        .await
        .map_err(|e| CommandError::from(anyhow::anyhow!(e)))?;

    let mut dir_entries = Vec::new();

    while let Some(entry) = entries
        .next_entry()
        .await
        .map_err(|e| CommandError::from(anyhow::anyhow!(e)))?
    {
        let path = entry.path();
        if path.is_dir() {
            if let Ok(metadata) = entry.metadata().await {
                if let Ok(modified) = metadata.modified() {
                    let modified: DateTime<Local> = modified.into();
                    dir_entries.push((path, modified));
                }
            }
        }
    }

    dir_entries.sort_by(|a, b| b.1.cmp(&a.1));

    if let Some(limit) = limit {
        dir_entries.truncate(limit);
    }

    let tasks: Vec<_> = dir_entries
        .into_iter()
        .map(|(path, _)| tokio::spawn(async move { load_list_item(path).await }))
        .collect();

    let results = join_all(tasks).await;

    let mut files_list = Vec::new();
    for res in results {
        if let Ok(Ok(item)) = res {
            files_list.push(item);
        }
    }

    Ok(files_list)
}

async fn load_list_item(path: PathBuf) -> Result<ParsedFileListItem, anyhow::Error> {
    let metadata_path = path.join(utils::METADATA_FILENAME);
    let content_path = path.join(utils::CONTENT_FILENAME);

    let file_size = match tokio_fs::metadata(&content_path).await {
        Ok(m) => m.len(),
        Err(_) => 0,
    };

    let content = tokio_fs::read_to_string(&metadata_path).await?;
    let metadata: ParseMetadata = serde_json::from_str(&content)?;

    Ok(ParsedFileListItem {
        id: metadata.id,
        name: metadata.name,
        directory_path: path.to_string_lossy().to_string(),
        remote_url: metadata.remote_url,
        file_size,
        files_count: metadata.files_count,
        total_size: metadata.total_size,
        created_at: metadata.created_at,
        updated_at: metadata.updated_at,
    })
}

#[tauri::command]
pub fn get_file_content(dir_name: String) -> Result<String, CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    Ok(utils::load_content(&parse_dir)?)
}

#[tauri::command]
pub fn get_file_metadata(dir_name: String) -> Result<ParseMetadata, CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    Ok(utils::load_metadata(&parse_dir)?)
}

#[tauri::command]
pub fn update_file(dir_name: String, content: String) -> Result<(), CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    utils::update_content(&parse_dir, &content)?;
    Ok(())
}

#[tauri::command]
pub fn rename_file(dir_name: String, new_name: String) -> Result<(), CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    let mut metadata = utils::load_metadata(&parse_dir)?;
    metadata.name = new_name;
    utils::save_metadata(&utils::get_metadata_path(&parse_dir), &metadata)?;
    Ok(())
}

#[tauri::command]
pub fn delete_file(dir_name: String) -> Result<(), CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    fs::remove_dir_all(parse_dir)?;
    Ok(())
}

// /////////////////////////////////////////////////////////////////////////////
// Parsed Tree Expansion & Preview
// /////////////////////////////////////////////////////////////////////////////

#[tauri::command]
pub fn expand_parsed_folder(
    dir_name: String,
    path: String,
) -> Result<Vec<ParsedPath>, CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    let full_tree = utils::load_tree(&parse_dir)?;

    match utils::find_children_in_tree(&full_tree, &path) {
        Some(children) => Ok(children),
        None => Ok(Vec::new()),
    }
}

#[tauri::command]
pub fn get_parsed_preview_tree(dir_name: String) -> Result<Vec<ParsedPath>, CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    let full_tree = utils::load_tree(&parse_dir)?;

    let shallow_tree: Vec<ParsedPath> = full_tree.iter().map(utils::to_shallow_node).collect();

    Ok(shallow_tree)
}

// /////////////////////////////////////////////////////////////////////////////
// System Actions
// /////////////////////////////////////////////////////////////////////////////

#[tauri::command]
pub fn open_in_default_editor(dir_name: String) -> Result<(), CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    utils::open_with_default_app(utils::OpenAction::OpenFile(utils::get_content_path(
        &parse_dir,
    )))?;
    Ok(())
}

#[tauri::command]
pub fn open_in_folder(dir_name: String) -> Result<(), CommandError> {
    let parse_dir = utils::get_parse_dir(&dir_name)?;
    utils::open_with_default_app(utils::OpenAction::RevealInFolder(parse_dir))?;
    Ok(())
}
