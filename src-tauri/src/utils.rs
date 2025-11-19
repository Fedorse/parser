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
pub const PREVIEW_LINE_LIMIT: usize = 150;
pub const CONTENT_FILENAME: &str = "content.txt";
pub const METADATA_FILENAME: &str = "metadata.json";

// ============================================================================
// DATA STRUCTURES
// ============================================================================

/// Metadata for a single parsed file
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileMetadata {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub last_modified: DateTime<Local>,
}

/// Complete metadata for a parse operation
#[derive(Debug, Serialize, Deserialize)]
pub struct ParseMetadata {
    /// Unique ID (directory name, typically timestamp)
    pub id: String,
    /// User-friendly name (can be changed via rename)
    pub name: String,
    /// When this parse was created
    pub created_at: DateTime<Local>,
    /// Total number of files successfully parsed
    pub files_count: usize,
    /// Total size of all original parsed files in bytes
    pub total_size: u64,
    /// List of all files that were parsed
    pub files: Vec<FileMetadata>,
    /// Tree structure of parsed paths
    pub file_tree: Vec<ParsedPath>,
}

/// Tree structure for files and directories
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ParsedPath {
    File {
        name: String,
        path: String,
        size: u64,
        last_modified: DateTime<Local>,
    },
    Directory {
        name: String,
        path: String,
        size: u64,
        children: Vec<ParsedPath>,
    },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
///// QUEUE
///
/// use tauri::AppHandle;

/// Parse files with event-based progress updates

/// Parse files with event-based progress updates
pub async fn parse_files_async(
    paths: Vec<String>,
    app: AppHandle,
) -> Result<ParseMetadata> {
    let (parse_dir, mut output_file, parse_id) = create_parse_directory()?;

    let total_files = count_text_files(&paths)?;

    // Emit initial progress with parse_id
    let _ = app.emit("parse-progress", json!({
        "parse_id": parse_id,
        "parse_progress": 0.0,
        "files_amount": total_files,
        "result_file_path": serde_json::Value::Null,
    }));

    let mut parsed_files = Vec::new();
    let mut total_size = 0u64;
    let mut file_tree = Vec::new();

    // Build file tree
    for path_str in &paths {
        let path = Path::new(path_str);
        if path.exists() {
            file_tree.push(build_file_tree(&path)?);
        }
    }

    let mut current_count = 0;

    // Parse each file
    for path_str in paths {
        let path = Path::new(&path_str);

        if path.is_dir() {
            process_directory_with_progress(
                &path,
                &mut output_file,
                &mut parsed_files,
                &mut total_size,
                &mut current_count,
                total_files,
                &app,
                &parse_id,  // ✅ Pass parse_id
            )?;
        } else if is_text_file(&path)? {
            write_file_content(&path, &mut output_file)?;

            let metadata = get_file_metadata(&path)?;
            total_size += metadata.size;
            parsed_files.push(metadata);

            current_count += 1;

            // Emit progress update with parse_id
            let progress = (current_count as f32 / total_files as f32) * 100.0;
            let _ = app.emit("parse-progress", json!({
                "parse_id": parse_id,
                "parse_progress": progress,
                "files_amount": total_files,
                "result_file_path": serde_json::Value::Null,
            }));
        }
    }

    // Create metadata
    let metadata = ParseMetadata {
        id: parse_id.clone(),
        name: parse_id.clone(),
        created_at: Local::now(),
        files_count: parsed_files.len(),
        total_size,
        files: parsed_files,
        file_tree,
    };

    // Save metadata
    let metadata_path = parse_dir.join(METADATA_FILENAME);
    save_metadata(&metadata_path, &metadata)?;

    // Emit completion with file path and parse_id
    let content_path = get_content_path(&parse_dir);
    let _ = app.emit("parse-progress", json!({
        "parse_id": parse_id,  // ✅ Add this
        "parse_progress": 100.0,
        "files_amount": total_files,
        "result_file_path": content_path.to_string_lossy().to_string(),
    }));

    Ok(metadata)
}

/// Process directory with progress events
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

            if path.is_dir() {
                process_directory_with_progress(
                    &path,
                    output_file,
                    parsed_files,
                    total_size,
                    current_count,
                    total_files,
                    app,
                    parse_id,
                )?;
            } else if is_text_file(&path)? {
                write_file_content(&path, output_file)?;

                let metadata = get_file_metadata(&path)?;
                *total_size += metadata.size;
                parsed_files.push(metadata);

                *current_count += 1;

                let progress = (*current_count as f32 / total_files as f32) * 100.0;
                let _ = app.emit("parse-progress", json!({
                    "parse_id": parse_id,
                    "parse_progress": progress,
                    "files_amount": total_files,
                    "result_file_path": serde_json::Value::Null,
                }));
            }
        }
    }
    Ok(())
}

// Keep the count helper functions...
fn count_text_files(paths: &[String]) -> Result<usize> {
    let mut count = 0;
    for path_str in paths {
        let path = Path::new(path_str);
        if path.is_dir() {
            count += count_text_files_in_dir(path)?;
        } else if is_text_file(path)? {
            count += 1;
        }
    }
    Ok(count)
}

fn count_text_files_in_dir(dir: &Path) -> Result<usize> {
    let mut count = 0;
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                count += count_text_files_in_dir(&path)?;
            } else if is_text_file(&path)? {
                count += 1;
            }
        }
    }
    Ok(count)
}
//////

/// Check if a file is text by inspecting first 8KB
fn is_text_file(path: &Path) -> Result<bool> {
    if !path.is_file() {
        return Ok(false);
    }

    let mut file = File::open(path)
        .with_context(|| format!("Opening {}", path.display()))?;

    let mut buf = [0u8; 8192];
    let sample = file
        .read(&mut buf)
        .with_context(|| format!("Reading sample from {}", path.display()))?;

    Ok(!matches!(inspect(&buf[..sample]), ContentType::BINARY))
}

/// Extract metadata from a file
fn get_file_metadata(path: &Path) -> Result<FileMetadata> {
    let metadata = fs::metadata(path)?;
    let modified = metadata.modified()?;
    let datetime: DateTime<Local> = modified.into();

    Ok(FileMetadata {
        path: path.to_string_lossy().to_string(),
        name: path
            .file_name()
            .ok_or(anyhow::anyhow!("Failed to extract filename"))?
            .to_string_lossy()
            .to_string(),
        size: metadata.len(),
        last_modified: datetime,
    })
}

/// Write a single file's content to the output with separator
fn write_file_content(path: &Path, output_file: &mut File) -> Result<()> {
    writeln!(output_file, "===== {} =====", path.display())?;

    let mut file = File::open(&path)
        .with_context(|| format!("Opening {}", path.display()))?;

    io::copy(&mut file, output_file)
        .with_context(|| format!("Copying contents of {}", path.display()))?;

    writeln!(output_file)?;
    Ok(())
}


/// Save metadata to JSON file
pub fn save_metadata(path: &Path, metadata: &ParseMetadata) -> Result<()> {
    let file = File::create(path)?;
    let writer = io::BufWriter::new(file);
    serde_json::to_writer_pretty(writer, metadata)?;
    Ok(())
}

// ============================================================================
// PUBLIC API - APP STRUCTURE
// ============================================================================

/// Initialize app directory structure
pub fn init_app_structure() -> Result<()> {
    let app_dir = get_app_dir()?;

    if !app_dir.exists() {
        fs::create_dir(&app_dir)?;
    }

    let parsed_dir = app_dir.join(PARSED_FILES_DIR);
    if !parsed_dir.exists() {
        fs::create_dir(&parsed_dir)?;
    }

    Ok(())
}

/// Get the app's data directory
pub fn get_app_dir() -> Result<PathBuf> {
    let home_dir = dirs::home_dir()
        .ok_or(anyhow::anyhow!("Can't access home dir"))?
        .join(APP_NAME);
    Ok(home_dir)
}

pub fn get_parse_dir(dir_name: &str) -> Result<PathBuf> {
    Ok(get_app_dir()?
        .join(PARSED_FILES_DIR)
        .join(dir_name))
}

// ============================================================================
// PUBLIC API - PARSE OPERATIONS
// ============================================================================


fn create_parse_directory() -> Result<(PathBuf, File, String)> {
    let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();
    let parse_dir = get_app_dir()?
        .join(PARSED_FILES_DIR)
        .join(&timestamp);

    // Create the directory
    fs::create_dir_all(&parse_dir)?;

    // Create content.txt file
    let content_path = parse_dir.join(CONTENT_FILENAME);
    let content_file = File::create(&content_path)?;

    Ok((parse_dir, content_file, timestamp))
}


/// Build a file tree structure recursively
pub fn build_file_tree(path: &Path) -> Result<ParsedPath> {
    let name = path
        .file_name()
        .ok_or(anyhow::anyhow!("Failed to extract filename"))?
        .to_string_lossy()
        .to_string();
    let file_path = path.to_string_lossy().to_string();

    if path.is_dir() {
        let mut children = Vec::new();
        let mut total_size = 0u64;

        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                if let Ok(tree) = build_file_tree(&entry.path()) {
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

        let size = if is_text_file(path)? {
            metadata.size
        } else {
            0
        };


        Ok(ParsedPath::File {
            name,
            size,
            path: file_path,
            last_modified: metadata.last_modified,
        })
    }
}

// ============================================================================
// PUBLIC API - FILE ACCESS
// ============================================================================

/// Get the content.txt path for a parse directory
pub fn get_content_path(parse_dir: &Path) -> PathBuf {
    parse_dir.join(CONTENT_FILENAME)
}

/// Get the metadata.json path for a parse directory
pub fn get_metadata_path(parse_dir: &Path) -> PathBuf {
    parse_dir.join(METADATA_FILENAME)
}

/// Load metadata from a parse directory
pub fn load_metadata(parse_dir: &Path) -> Result<ParseMetadata> {
    let metadata_path = get_metadata_path(parse_dir);
    let file = File::open(metadata_path)?;
    let reader = io::BufReader::new(file);
    let metadata = serde_json::from_reader(reader)?;
    Ok(metadata)
}

/// Load content from a parse directory
pub fn load_content(parse_dir: &Path) -> Result<String> {
    let content_path = get_content_path(parse_dir);
    let content = fs::read_to_string(content_path)?;
    Ok(content)
}

/// Update content in a parse directory
pub fn update_content(parse_dir: &Path, content: &str) -> Result<()> {
    let content_path = get_content_path(parse_dir);
    let mut file = File::create(content_path)?;
    file.write_all(content.as_bytes())?;
    Ok(())
}

// ============================================================================
// PUBLIC API - SYSTEM OPERATIONS
// ============================================================================

pub enum OpenAction {
    OpenFile(PathBuf),
    RevealInFolder(PathBuf),
}

pub fn open_with_default_app(action: OpenAction) -> Result<()> {
    match action {
        OpenAction::OpenFile(path) => open_file_default(&path),
        OpenAction::RevealInFolder(path) => reveal_in_folder(&path),
    }
}

fn open_file_default(path: &Path) -> Result<()> {
    open::that(path)?;
    Ok(())
}

fn reveal_in_folder(path: &Path) -> Result<()> {
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .args(["-R", &path.to_string_lossy()])
            .spawn()?;
    }
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg("/select,")
            .arg(path)
            .spawn()?;
    }
    #[cfg(target_os = "linux")]
    {
        let parent = path
            .parent()
            .ok_or_else(|| anyhow::anyhow!("No parent directory"))?;
        Command::new("xdg-open").arg(parent).spawn()?;
    }
    Ok(())
}