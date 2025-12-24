use anyhow::{self, Context, Result};
use chrono::{DateTime, Local};
use content_inspector::{inspect, ContentType};
use dirs;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{
    collections::HashSet,
    fs::{self, File},
    io::{self, Read, Write},
    path::{Path, PathBuf},
    process::Command,
};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{App, Runtime, AppHandle, Emitter, Manager};
use uuid::Uuid;

pub const APP_NAME: &str = "parser-ai";
pub const PARSED_FILES_DIR: &str = "parsed-files";
pub const CONTENT_FILENAME: &str = "content.txt";
pub const METADATA_FILENAME: &str = "metadata.json";
pub const TREE_FILENAME: &str = "tree.json";
pub const TEMP_REPOS_DIR: &str = "temp-repos";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileMetadata {
    pub path: String,
    pub name: String,
    pub size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseMetadata {
    pub id: String,
    pub name: String,
    pub path: String,
    pub created_at: DateTime<Local>,
    pub updated_at: DateTime<Local>,
    pub files_count: usize,
    pub total_size: u64,
    pub remote_url: String,
}

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

impl ParsedPath {
    pub fn path(&self) -> &str {
        match self {
            ParsedPath::File { path, .. } => path,
            ParsedPath::Directory { path, .. } => path,
        }
    }
}

// /////////////////////////////////////////////////////////////////////////////
// App Initialization & Directories
// /////////////////////////////////////////////////////////////////////////////

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

pub fn get_app_dir() -> Result<PathBuf> {
    Ok(dirs::home_dir()
        .ok_or(anyhow::anyhow!("No home dir"))?
        .join(APP_NAME))
}

pub fn get_parse_dir(dir_name: &str) -> Result<PathBuf> {
    Ok(get_app_dir()?.join(PARSED_FILES_DIR).join(dir_name))
}

pub fn get_content_path(parse_dir: &Path) -> PathBuf {
    parse_dir.join(CONTENT_FILENAME)
}

pub fn get_metadata_path(parse_dir: &Path) -> PathBuf {
    parse_dir.join(METADATA_FILENAME)
}

fn create_parse_directory(remote_url: &str) -> Result<(PathBuf, File, String)> {
    let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();

    let parse_id = if !remote_url.is_empty() {
        let safe_name = sanitize_repo_url(remote_url);
        format!("{}_{}", safe_name, timestamp)
    } else {
        timestamp
    };

    let parse_dir = get_app_dir()?.join(PARSED_FILES_DIR).join(&parse_id);
    fs::create_dir_all(&parse_dir)?;

    let content_path = parse_dir.join(CONTENT_FILENAME);
    let content_file = File::create(&content_path)?;
    Ok((parse_dir, content_file, parse_id))
}

// /////////////////////////////////////////////////////////////////////////////
// Git & Remote Handling
// /////////////////////////////////////////////////////////////////////////////

pub fn clone_git_repo(url: &str) -> Result<PathBuf> {
    let app_dir = get_app_dir()?;
    let temp_dir = app_dir.join(TEMP_REPOS_DIR);
    if !temp_dir.exists() {
        fs::create_dir_all(&temp_dir)?;
    }

    let folder_name = format!("{}_{}", Uuid::new_v4(), "repo");
    let target_path = temp_dir.join(&folder_name);

    let status = Command::new("git")
        .args(["clone", "--depth", "1", url, target_path.to_str().unwrap()])
        .status()
        .map_err(|e| anyhow::anyhow!("Failed to execute git clone: {}", e))?;

    if !status.success() {
        return Err(anyhow::anyhow!("Git clone failed"));
    }

    Ok(target_path)
}

fn sanitize_repo_url(input: &str) -> String {
    let clean_url = input
        .trim_start_matches("https://")
        .trim_start_matches("http://");

    let sanitized: String = clean_url
        .chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '_'
            }
        })
        .collect();

    if sanitized.chars().count() > 80 {
        sanitized.chars().take(80).collect()
    } else {
        sanitized
    }
}

fn cleanup_temp_repos(paths: &[String]) -> Result<()> {
    let app_dir = get_app_dir()?;
    let temp_repos_root = app_dir.join(TEMP_REPOS_DIR);

    if !temp_repos_root.exists() {
        return Ok(());
    }

    let mut roots_to_delete = HashSet::new();

    for path_str in paths {
        let path = Path::new(path_str);

        if let Ok(stripped) = path.strip_prefix(&temp_repos_root) {
            if let Some(first_component) = stripped.components().next() {
                let repo_root = temp_repos_root.join(first_component.as_os_str());
                if repo_root.exists() {
                    roots_to_delete.insert(repo_root);
                }
            }
        }
    }

    for root in roots_to_delete {
        if let Err(e) = fs::remove_dir_all(&root) {
            eprintln!("Failed to remove temp repo {:?}: {}", root, e);
        }
    }

    Ok(())
}

// /////////////////////////////////////////////////////////////////////////////
// Main Parsing Logic
// /////////////////////////////////////////////////////////////////////////////
fn is_valid_path(path: &Path) -> bool {
    let file_name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
    path.exists() && !path.is_symlink() && !file_name.starts_with('.')
}

pub fn parse_files(
    paths: Vec<String>,
    app: AppHandle,
    remote_url: Option<String>,
) -> Result<ParseMetadata> {
    let remote_url_str = remote_url.unwrap_or_default();
    let (parse_dir, mut output_file, parse_id) = create_parse_directory(&remote_url_str)?;

    let total_files = count_text_files(&paths)?;
    emit_progress(&app, &parse_id, 0, total_files, None);

    let mut parsed_files = Vec::new();
    let mut total_size = 0u64;
    let mut current_count = 0;
    let mut file_tree = Vec::new();

    for path_str in &paths {
        let path = Path::new(path_str);
        if is_valid_path(path) {
            file_tree.push(build_file_tree(&path)?);
        }
    }

    for path_str in &paths {
        let path = Path::new(&path_str);
        if !is_valid_path(&path){
            continue;
        }

        if path.is_dir() {
            process_directory_with_progress(
                &path,
                &mut output_file,
                &mut parsed_files,
                &mut total_size,
                &mut current_count,
                total_files,
                &app,
                &parse_id,
            )?;
        } else if process_single_text_file(
            &path,
            &mut output_file,
            &mut parsed_files,
            &mut total_size,
        )? {
            current_count += 1;
            emit_progress(&app, &parse_id, current_count, total_files, None);
        }
    }

    cleanup_temp_repos(&paths)?;

    let now = Local::now();

    let metadata = ParseMetadata {
        id: parse_id.clone(),
        name: parse_id.clone(),
        path: parse_dir.to_string_lossy().to_string(),
        remote_url: remote_url_str,
        created_at: now,
        updated_at: now,
        files_count: parsed_files.len(),
        total_size,
    };

    let metadata_path = parse_dir.join(METADATA_FILENAME);
    let meta_file = File::create(&metadata_path)?;
    serde_json::to_writer_pretty(meta_file, &metadata)?;

    let tree_path = parse_dir.join(TREE_FILENAME);
    let tree_file = File::create(&tree_path)?;
    serde_json::to_writer_pretty(tree_file, &file_tree)?;

    let content_path = get_content_path(&parse_dir);
    emit_progress(
        &app,
        &parse_id,
        total_files,
        total_files,
        Some(content_path.display().to_string()),
    );

    Ok(metadata)
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

            if !is_valid_path(&path){
                continue;
            }

            if path.is_dir() {
                let _ = process_directory_with_progress(
                    &path,
                    output_file,
                    parsed_files,
                    total_size,
                    current_count,
                    total_files,
                    app,
                    parse_id,
                );
            } else {
                if let Ok(processed) =
                    process_single_text_file(&path, output_file, parsed_files, total_size)
                {
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

fn process_single_text_file(
    path: &Path,
    output_file: &mut File,
    parsed_files: &mut Vec<FileMetadata>,
    total_size: &mut u64,
) -> Result<bool> {
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
        }
        Err(e) => {
            eprintln!("Skipping file due to read/write error: {:?} - {}", path, e);
            Ok(false)
        }
    }
}

// /////////////////////////////////////////////////////////////////////////////
// File System & Tree Building
// /////////////////////////////////////////////////////////////////////////////
fn get_recursive_dir_size(path: &Path) -> u64 {
    let mut total_size = 0;
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let child_path = entry.path();

            if !is_valid_path(&child_path) {
                continue;
            }

            if child_path.is_dir() {
                total_size += get_recursive_dir_size(&child_path);
            } else if let Ok(metadata) = fs::metadata(&child_path) {
                total_size += metadata.len();
            }
        }
    }
    total_size
}

fn build_file_tree(path: &Path) -> Result<ParsedPath> {
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
                let child_path = entry.path();

                if !is_valid_path(&path) {
                    continue;
                }

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

pub fn build_file_tree_shallow(path: &Path) -> Result<ParsedPath> {
    let name = path
        .file_name()
        .ok_or(anyhow::anyhow!("Failed to extract filename"))?
        .to_string_lossy()
        .to_string();
    let file_path = path.to_string_lossy().to_string();

    if path.is_dir() {
        let mut children = Vec::new();
        let mut current_level_size = 0u64;

        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let child_path = entry.path();

                if !is_valid_path(&child_path) {
                    continue;
                }

                let child_node = create_shallow_node(&child_path)?;

                match &child_node {
                    ParsedPath::File { size, .. } | ParsedPath::Directory { size, .. } => {
                        current_level_size += *size;
                    }
                }

                children.push(child_node);
            }
        }

        children.sort_by(|a, b| match (a, b) {
            (ParsedPath::Directory { .. }, ParsedPath::File { .. }) => std::cmp::Ordering::Less,
            (ParsedPath::File { .. }, ParsedPath::Directory { .. }) => std::cmp::Ordering::Greater,
            _ => a.path().cmp(b.path()),
        });

        Ok(ParsedPath::Directory {
            name,
            children,
            path: file_path,
            size: current_level_size,
        })
    } else {
        let metadata = get_file_metadata(path)?;
        Ok(ParsedPath::File {
            name,
            size: metadata.size,
            path: file_path,
        })
    }
}

pub fn create_shallow_node(path: &Path) -> Result<ParsedPath> {
    let name = path
        .file_name()
        .ok_or(anyhow::anyhow!("Failed to extract filename"))?
        .to_string_lossy()
        .to_string();
    let file_path = path.to_string_lossy().to_string();

    if path.is_dir() {
        let size = get_recursive_dir_size(path);

        Ok(ParsedPath::Directory {
            name,
            path: file_path,
            size,
            children: Vec::new(),
        })
    } else {
        let metadata = fs::metadata(path)?;
        Ok(ParsedPath::File {
            name,
            path: file_path,
            size: metadata.len(),
        })
    }
}

pub fn find_children_in_tree(tree: &[ParsedPath], target_path: &str) -> Option<Vec<ParsedPath>> {
    for node in tree {
        if node.path() == target_path {
            if let ParsedPath::Directory { children, .. } = node {
                return Some(children.iter().map(to_shallow_node).collect());
            }
        }

        if let ParsedPath::Directory { children, .. } = node {
            if let Some(result) = find_children_in_tree(children, target_path) {
                return Some(result);
            }
        }
    }
    None
}

pub fn to_shallow_node(node: &ParsedPath) -> ParsedPath {
    match node {
        ParsedPath::File { .. } => node.clone(),
        ParsedPath::Directory {
            name, path, size, ..
        } => ParsedPath::Directory {
            name: name.clone(),
            path: path.clone(),
            size: *size,
            children: Vec::new(),
        },
    }
}

// /////////////////////////////////////////////////////////////////////////////
// IO & Content Management
// /////////////////////////////////////////////////////////////////////////////

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

pub fn update_content(parse_dir: &Path, content: &str) -> Result<()> {
    let content_path = get_content_path(parse_dir);
    let mut file = File::create(content_path)?;
    file.write_all(content.as_bytes())?;

    let mut metadata = load_metadata(parse_dir)?;
    metadata.updated_at = Local::now();
    save_metadata(&get_metadata_path(parse_dir), &metadata)?;

    Ok(())
}

pub fn save_metadata(path: &Path, metadata: &ParseMetadata) -> Result<()> {
    let file = File::create(path)?;
    let writer = io::BufWriter::new(file);
    serde_json::to_writer_pretty(writer, metadata)?;
    Ok(())
}

fn write_file_content(path: &Path, output_file: &mut File) -> Result<()> {
    let mut file = File::open(&path).with_context(|| format!("Opening {}", path.display()))?;
    let mut content = String::new();

    file.read_to_string(&mut content)
        .with_context(|| format!("File is not valid UTF-8: {}", path.display()))?;

    writeln!(output_file, "===== {} =====", path.display())?;

    output_file.write_all(content.as_bytes())?;

    writeln!(output_file)?;

    Ok(())
}


// /////////////////////////////////////////////////////////////////////////////
// System Actions (Open, Reveal)
// /////////////////////////////////////////////////////////////////////////////

pub enum OpenAction {
    OpenFile(PathBuf),
    RevealInFolder(PathBuf),
}

pub fn open_with_default_app(action: OpenAction) -> Result<()> {
    match action {
        OpenAction::OpenFile(p) => {
            open::that(p)?;
            Ok(())
        }
        OpenAction::RevealInFolder(p) => reveal_in_folder(&p),
    }
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
        Command::new("explorer").arg("/select,").arg(path).spawn()?;
    }

    #[cfg(target_os = "linux")]
    {
        if let Some(parent) = path.parent() {
            Command::new("xdg-open").arg(parent).spawn()?;
        }
    }

    Ok(())
}

// /////////////////////////////////////////////////////////////////////////////
// Helper Utils (Private)
// /////////////////////////////////////////////////////////////////////////////

fn emit_progress(
    app: &AppHandle,
    parse_id: &str,
    current: usize,
    total: usize,
    file_path: Option<String>,
) {
    let progress = if total > 0 {
        (current as f32 / total as f32) * 100.0
    } else {
        0.0
    };
    let _ = app.emit(
        "parse-progress",
        json!({
            "parse_id": parse_id,
            "parse_progress": progress,
            "files_amount": total,
            "result_file_path": file_path.unwrap_or(serde_json::Value::Null.to_string()),
        }),
    );
}

fn count_text_files(paths: &[String]) -> Result<usize> {
    let mut count = 0;
    for path_str in paths {
        let path = Path::new(path_str);
        if path.is_dir() {
            count += count_text_files_in_dir(path)?;
        } else if is_text_file(path) {
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
            } else if is_text_file(&path) {
                count += 1;
            }
        }
    }
    Ok(count)
}

fn is_text_file(path: &Path) -> bool {
    if !path.is_file() {
        return false;
    }

    let mut file = match File::open(path) {
        Ok(f) => f,
        Err(_) => return false,
    };

    let mut buf = [0u8; 8192];
    let sample_len = match file.read(&mut buf) {
        Ok(len) => len,
        Err(_) => return false,
    };

    if sample_len == 0 {
        return true;
    }

    !matches!(inspect(&buf[..sample_len]), ContentType::BINARY)
}

fn get_file_metadata(path: &Path) -> Result<FileMetadata> {
    let metadata = fs::metadata(path)?;
    Ok(FileMetadata {
        path: path.to_string_lossy().to_string(),
        name: path
            .file_name()
            .ok_or(anyhow::anyhow!("Failed to extract filename"))?
            .to_string_lossy()
            .to_string(),
        size: metadata.len(),
    })
}

// Tray Setup
pub fn setup_tray<R: Runtime>(app: &App<R>) -> Result<(), tauri::Error> {
    // Define Menu Items
    let open_local = MenuItem::with_id(app, "open_local", "Parse Local Folder", true, None::<&str>)?;
    let open_github = MenuItem::with_id(app, "open_github", "Parse GitHub Repo", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;

    let menu = Menu::with_items(app, &[
        &open_local,
        &open_github,
        &separator,
        &quit
    ])?;

    // Build the Tray
    let _tray = TrayIconBuilder::with_id("main-tray")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(cfg!(target_os = "macos"))
        .on_menu_event(|app, event| {
            match event.id.as_ref() {
                "quit" => app.exit(0),
                id => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.unminimize();
                        let _ = window.set_focus();
                    }
                    let _ = app.emit("tray-event", id);
                }
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.unminimize();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}