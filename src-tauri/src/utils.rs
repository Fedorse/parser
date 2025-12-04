use anyhow::{self, Context, Result};
use chrono::{DateTime, Local};
use content_inspector::{inspect, ContentType};
use dirs;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{
    fs::{self, File},
    io::{self, Read, Write},
    path::{Path, PathBuf},
    process::Command,
};
use tauri::{AppHandle, Emitter};

// ============================================================================
// CONSTANTS
// ============================================================================

pub const APP_NAME: &str = "parser-ai";
pub const PARSED_FILES_DIR: &str = "parsed-files";
pub const CONTENT_FILENAME: &str = "content.txt";
pub const METADATA_FILENAME: &str = "metadata.json";
pub const TREE_FILENAME: &str = "tree.json";

// ============================================================================
// DATA STRUCTURES
// ============================================================================

/// Metadata for a single file inside the tree (Streamlined)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileMetadata {
    pub path: String,
    pub name: String,
    pub size: u64,
}

/// Session Metadata (Saved to metadata.json)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseMetadata {
    pub id: String,
    pub name: String,
    pub path: String,
    pub created_at: DateTime<Local>,
    pub updated_at: DateTime<Local>,
    pub files_count: usize,
    pub total_size: u64,
}

/// Combined struct for the Frontend Detail View
#[derive(Debug, Serialize, Deserialize)]
pub struct CompleteParseDetail {
    #[serde(flatten)]
    pub metadata: ParseMetadata,
    pub tree: Vec<ParsedPath>,
}

/// Tree structure for files and directories
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ParsedPath {
    File {
        name: String,
        path: String,
        size: u64,
    },
    Directory {
        name: String,
        path: String,
        size: u64,
        children: Vec<ParsedPath>,
    },
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

pub fn parse_files(
    paths: Vec<String>,
    app: AppHandle,
) -> Result<ParseMetadata> {
    let (parse_dir, mut output_file, parse_id) = create_parse_directory()?;

    // Safety: count_text_files now handles is_text_file correctly
    let total_files = count_text_files(&paths)?;

    emit_progress(&app, &parse_id, 0, total_files, None);

    let mut parsed_files = Vec::new();
    let mut total_size = 0u64;
    let mut current_count = 0;
    let mut file_tree = Vec::new();

    // Building Tree
    for path_str in &paths {
        let path = Path::new(path_str);
        if path.exists() {
            if path.is_symlink() { continue; }
            file_tree.push(build_file_tree(&path)?);
        }
    }

    // Processing Files
    for path_str in paths {
        let path = Path::new(&path_str);

        // Skip symlinks
        if path.is_symlink() { continue; }

        if path.is_dir() {
            process_directory_with_progress(
                &path, &mut output_file, &mut parsed_files, &mut total_size,
                &mut current_count, total_files, &app, &parse_id,
            )?;
        } else if process_single_text_file(&path, &mut output_file, &mut parsed_files, &mut total_size)? {
            current_count += 1;
            emit_progress(&app, &parse_id, current_count, total_files, None);
        }
    }

    let now = Local::now();

    // 3. Create Lightweight Metadata
    let metadata = ParseMetadata {
        id: parse_id.clone(),
        name: parse_id.clone(),
        path: parse_dir.to_string_lossy().to_string(),
        created_at: now,
        updated_at: now,
        files_count: parsed_files.len(),
        total_size,
    };

    // 5. Save Files
    let metadata_path = parse_dir.join(METADATA_FILENAME);
    let meta_file = File::create(&metadata_path)?;
    serde_json::to_writer_pretty(meta_file, &metadata)?;

    let tree_path = parse_dir.join(TREE_FILENAME);
    let tree_file = File::create(&tree_path)?;
    serde_json::to_writer_pretty(tree_file, &file_tree)?;

    let content_path = get_content_path(&parse_dir);
    emit_progress(&app, &parse_id, total_files, total_files, Some(content_path.display().to_string()));

    Ok(metadata)
}
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

fn process_single_text_file(
    path: &Path,
    output_file: &mut File,
    parsed_files: &mut Vec<FileMetadata>,
    total_size: &mut u64,
) -> Result<bool> {
    // FIX: Removed '?' because is_text_file now returns bool
    if !is_text_file(path) {
        return Ok(false);
    }

    match write_file_content(path, output_file) {
        Ok(_) => {
            if let Ok(metadata) = get_file_metadata(path) {
                *total_size += metadata.size;
                parsed_files.push(metadata);
                Ok(true)
            } else {
                Ok(false)
            }
        },
        Err(e) => {
            eprintln!("Skipping file due to read/write error: {:?} - {}", path, e);
            Ok(false)
        }
    }
}

fn process_directory_with_progress(
    dir: &Path,
    output_file: &mut File,
    parsed_files: &mut Vec<FileMetadata>,
    total_size: &mut u64,
    current_count: &mut usize,
    total_files: usize,
    app: &AppHandle,
    parse_id: &str,
) -> Result<()> {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();

            if path.is_symlink() { continue; }

            if path.is_dir() {
                let _ = process_directory_with_progress(
                    &path, output_file, parsed_files, total_size,
                    current_count, total_files, app, parse_id,
                );
            } else {
                if let Ok(processed) = process_single_text_file(&path, output_file, parsed_files, total_size) {
                    if processed {
                        *current_count += 1;
                        emit_progress(app, parse_id, *current_count, total_files, None);
                    }
                }
            }
        }
    }
    Ok(())
}

/// MODIFIED: Returns bool directly, swallows errors as "false"
fn is_text_file(path: &Path) -> bool {
    if !path.is_file() { return false; }

    // Try to open. If fails (permission, lock), return false (Skip)
    let mut file = match File::open(path) {
        Ok(f) => f,
        Err(_) => return false,
    };

    let mut buf = [0u8; 8192];

    // Try to read. If fails, return false (Skip)
    let sample_len = match file.read(&mut buf) {
        Ok(len) => len,
        Err(_) => return false,
    };

    // If empty file, technically it's text, but do we want to parse it?
    // Let's say yes, or it returns valid non-binary content.
    if sample_len == 0 { return true; }

    // Perform the binary check
    !matches!(inspect(&buf[..sample_len]), ContentType::BINARY)
}

/// MODIFIED: Separated logic to distinguish read errors from write errors better
fn write_file_content(path: &Path, output_file: &mut File) -> Result<()> {
    // Try opening source again.
    let mut file = File::open(&path).with_context(|| format!("Opening {}", path.display()))?;

    // We strictly catch errors writing the HEADER to output
    writeln!(output_file, "===== {} =====", path.display())?;

    // Copy content.
    // If `io::copy` fails, it might be the Source reading OR Output writing.
    io::copy(&mut file, output_file)?;

    // Write footer
    writeln!(output_file)?;

    Ok(())
}

fn get_file_metadata(path: &Path) -> Result<FileMetadata> {
    let metadata = fs::metadata(path)?;
    // We removed last_modified from here as requested
    Ok(FileMetadata {
        path: path.to_string_lossy().to_string(),
        name: path.file_name()
            .ok_or(anyhow::anyhow!("Failed to extract filename"))?
            .to_string_lossy().to_string(),
        size: metadata.len(),
    })
}

pub fn build_file_tree(path: &Path) -> Result<ParsedPath> {
    let name = path.file_name()
        .ok_or(anyhow::anyhow!("Failed to extract filename"))?
        .to_string_lossy().to_string();
    let file_path = path.to_string_lossy().to_string();

    if path.is_dir() {
        let mut children = Vec::new();
        let mut total_size = 0u64;

        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let child_path = entry.path();
                // FIX: Symlink check added
                if child_path.is_symlink() { continue; }

                if let Ok(tree) = build_file_tree(&child_path) {
                    total_size += match &tree {
                        ParsedPath::File { size, .. } => *size,
                        ParsedPath::Directory { size, .. } => *size,
                    };
                    children.push(tree);
                }
            }
        }
        Ok(ParsedPath::Directory {
            name,
            children,
            path: file_path,
            size: total_size,
        })
    } else {
        let metadata = get_file_metadata(path)?;
        let size = if is_text_file(path) { metadata.size } else { 0 };

        Ok(ParsedPath::File {
            name,
            size,
            path: file_path,
        })
    }
}


/// Update content in a parse directory AND update the metadata timestamp
pub fn update_content(parse_dir: &Path, content: &str) -> Result<()> {
    // 1. Write Content
    let content_path = get_content_path(parse_dir);
    let mut file = File::create(content_path)?;
    file.write_all(content.as_bytes())?;

    // 2. Update Metadata Timestamp
    let mut metadata = load_metadata(parse_dir)?;
    metadata.updated_at = Local::now();
    save_metadata(&get_metadata_path(parse_dir), &metadata)?;

    Ok(())
}

fn emit_progress(app: &AppHandle, parse_id: &str, current: usize, total: usize, file_path: Option<String>) {
    let progress = if total > 0 { (current as f32 / total as f32) * 100.0 } else { 0.0 };
    let _ = app.emit("parse-progress", json!({
        "parse_id": parse_id, "parse_progress": progress, "files_amount": total,
        "result_file_path": file_path.unwrap_or(serde_json::Value::Null.to_string()),
    }));
}

fn count_text_files(paths: &[String]) -> Result<usize> {
    let mut count = 0;
    for path_str in paths {
        let path = Path::new(path_str);
        if path.is_dir() { count += count_text_files_in_dir(path)?; }
        else if is_text_file(path) { count += 1; }
    }
    Ok(count)
}

fn count_text_files_in_dir(dir: &Path) -> Result<usize> {
    let mut count = 0;
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() { count += count_text_files_in_dir(&path)?; }
            else if is_text_file(&path) { count += 1; }
        }
    }
    Ok(count)
}

pub fn save_metadata(path: &Path, metadata: &ParseMetadata) -> Result<()> {
    let file = File::create(path)?;
    let writer = io::BufWriter::new(file);
    serde_json::to_writer_pretty(writer, metadata)?;
    Ok(())
}

fn create_parse_directory() -> Result<(PathBuf, File, String)> {
    let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();
    let parse_dir = get_app_dir()?.join(PARSED_FILES_DIR).join(&timestamp);
    fs::create_dir_all(&parse_dir)?;
    let content_path = parse_dir.join(CONTENT_FILENAME);
    let content_file = File::create(&content_path)?;
    Ok((parse_dir, content_file, timestamp))
}

pub fn get_content_path(parse_dir: &Path) -> PathBuf { parse_dir.join(CONTENT_FILENAME) }
pub fn get_metadata_path(parse_dir: &Path) -> PathBuf { parse_dir.join(METADATA_FILENAME) }

pub fn load_metadata(parse_dir: &Path) -> Result<ParseMetadata> {
    let path = parse_dir.join(METADATA_FILENAME);
    let file = File::open(path)?;
    Ok(serde_json::from_reader(io::BufReader::new(file))?)
}

pub fn load_tree(parse_dir: &Path) -> Result<Vec<ParsedPath>> {
    let path = parse_dir.join(TREE_FILENAME);
    let file = File::open(path)?;
    Ok(serde_json::from_reader(io::BufReader::new(file))?)
}

pub fn load_content(parse_dir: &Path) -> Result<String> {
    Ok(fs::read_to_string(get_content_path(parse_dir))?)
}

pub fn init_app_structure() -> Result<()> {
    let app_dir = get_app_dir()?;
    if !app_dir.exists() { fs::create_dir(&app_dir)?; }
    let parsed_dir = app_dir.join(PARSED_FILES_DIR);
    if !parsed_dir.exists() { fs::create_dir(&parsed_dir)?; }
    Ok(())
}
pub fn get_app_dir() -> Result<PathBuf> {
    Ok(dirs::home_dir().ok_or(anyhow::anyhow!("No home dir"))?.join(APP_NAME))
}
pub fn get_parse_dir(dir_name: &str) -> Result<PathBuf> {
    Ok(get_app_dir()?.join(PARSED_FILES_DIR).join(dir_name))
}
pub enum OpenAction { OpenFile(PathBuf), RevealInFolder(PathBuf) }
pub fn open_with_default_app(action: OpenAction) -> Result<()> {
    match action {
        OpenAction::OpenFile(p) => { open::that(p)?; Ok(()) },
        OpenAction::RevealInFolder(p) => reveal_in_folder(&p),
    }
}
fn reveal_in_folder(path: &Path) -> Result<()> {
    #[cfg(target_os = "macos")] { Command::new("open").args(["-R", &path.to_string_lossy()]).spawn()?; }
    #[cfg(target_os = "windows")] { Command::new("explorer").arg("/select,").arg(path).spawn()?; }
    #[cfg(target_os = "linux")] { let p = path.parent().unwrap(); Command::new("xdg-open").arg(p).spawn()?; }
    Ok(())
}
