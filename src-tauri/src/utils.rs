use std::{
    collections::HashMap,
    error::Error,
    io,
    io::{Write, BufReader, BufRead},
    path::{PathBuf, Path},
    fs::{create_dir, read_dir, read_to_string, File, write},
    process::Command
};
use serde::Serialize;
use serde_json::{from_str, to_string_pretty};
use chrono::Local;
use globset::{Glob, GlobSetBuilder};
use dirs::home_dir;
use crate::consts::{APP_NAME, PARSED_FILES_DIR, PRESETS_FILE_NAME, DEFAULT_PRESETS_PATH, PREVIEW_LINE_LIMIT};

#[derive(Serialize)]
pub struct FilePreview {
    path: String,
    content: String,
}

pub fn init_app_structure() -> Result<(), Box<dyn Error>> {
    let app_dir = home_dir().ok_or("Failed to get home directory")?.join(APP_NAME);

    if app_dir.exists() {
        return Ok(());
    }

    create_dir(&app_dir)?;
    create_dir(&app_dir.join(PARSED_FILES_DIR))?;

    let mut preset_file = File::create(app_dir.join(PRESETS_FILE_NAME))?;
    let default_presets = read_to_string(DEFAULT_PRESETS_PATH)?;

    preset_file.write_all(default_presets.as_bytes())?;

    Ok(())
}

pub fn create_output_file() -> Result<File, String> {
    let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();
    let file_name = format!("{}.txt", timestamp);
    let file_path = get_app_dir().map_err(|e| e.to_string())?.join(PARSED_FILES_DIR).join(file_name);

    File::create(file_path).map_err(|e| e.to_string())
}

pub fn write_parsed_files(paths: Vec<PathBuf>, output_file: &mut File) -> Result<(), String> {
    for path in paths {
        match read_to_string(&path) {
            Ok(content) => {
                if let Err(e) = writeln!(output_file, "\n===== {} =====\n{}", path.display(), content) {
                    eprint!("⚠️ Failed to write to output file: {}", e);
                }
            },
            Err(e) => {
                eprintln!("⚠️ Skipping '{}': {}", path.display(), e);
            }
        }
    }

    Ok(())
}

pub fn update_parsed_file(path: String, content: String) -> Result<(), String> {
    let file_path = get_app_dir().map_err(|e| e.to_string())?
                            .join(PARSED_FILES_DIR)
                            .join(path);
    let mut file = File::create(file_path).map_err(|e| e.to_string())?;
    file.write_all(content.as_bytes()).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn get_file_preview(file_name: String) -> Result<FilePreview, String> {
    let file_path = get_app_dir().map_err(|e| e.to_string())?
                            .join(PARSED_FILES_DIR)
                            .join(file_name);
    let file = File::open(&file_path).map_err(|e| e.to_string())?;
    let reader = BufReader::new(file);

    let content: String = reader
        .lines()
        .take(PREVIEW_LINE_LIMIT)
        .collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?
        .join("\n");

    Ok(FilePreview {
        path: file_path.to_string_lossy().to_string(),
        content,
    })
}

pub fn parse_paths(paths: Vec<String>, ignore_patterns: Vec<String>) -> Result<Vec<PathBuf>, globset::Error> {
    let filtered_paths = filter_by_preset(paths, &ignore_patterns)?;
    let mut collected_paths = Vec::new();

    for entry in filtered_paths {
        let path = PathBuf::from(entry);

        if path.is_file() {
                collected_paths.push(path);
        } else if path.is_dir() {
            collect_files(&path, &mut collected_paths)
        }
    }

    Ok(collected_paths)
}

pub fn get_app_dir() -> Result<PathBuf, String> {
    home_dir()
        .map(|dir| dir.join(APP_NAME))
        .ok_or("Failed to get home directory".to_string())
}

pub fn get_presets_map() -> Result<HashMap<String, Vec<String>>, String> {
    let path = get_app_dir()?.join(PRESETS_FILE_NAME);
    let content = read_to_string(path).map_err(|e| e.to_string())?;
    let map = from_str::<HashMap<String, Vec<String>>>(&content).map_err(|e| e.to_string())?;

    Ok(map)
}

pub fn write_presets(map: &HashMap<String, Vec<String>>) -> Result<(), String> {
    let path: PathBuf = get_app_dir()?.join(PRESETS_FILE_NAME);
    let json = to_string_pretty(map).map_err(|e| e.to_string())?;
    write(path, json).map_err(|e| e.to_string())?;
    Ok(())
}


pub fn open_with_default_app(path: &Path) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", &path.to_string_lossy()])
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    Ok(())
}

fn collect_files(directory: &PathBuf, collected: &mut Vec<PathBuf>) {
    if let Ok(entries) = read_dir(directory) {
        for entry in entries.flatten() {
            let path = entry.path();

            if path.is_file() {
                collected.push(path);
            } else if path.is_dir() {
                collect_files(&path, collected);
            }
        }
    }
}

fn filter_by_preset(file_paths: Vec<String>, patterns: &[String]) -> Result<Vec<String>, globset::Error> {
    let mut builder = GlobSetBuilder::new();

    for pattern in patterns {
        builder.add(Glob::new(pattern)?);
    }

    let globset = builder.build()?;

    let filtered_paths = file_paths
        .into_iter()
        .filter(|path| !globset.is_match(path))
        .collect();

    Ok(filtered_paths)
}
