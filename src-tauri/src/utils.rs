use crate::consts::{
    APP_NAME, DEFAULT_PRESETS_PATH, PARSED_FILES_DIR, PRESETS_FILE_NAME, PREVIEW_LINE_LIMIT,
};
use anyhow;
use chrono::Local;
use dirs;
use globset::{Glob, GlobSetBuilder};
use serde::Serialize;
use serde_json;
use std::{
    collections::HashMap,
    fs::{self, File},
    io::Write,
    path::{Path, PathBuf},
    process::Command,
};

#[derive(Serialize)]
pub struct FilePreview {
    path: String,
    name: String,
    preview: String,
    size: u64,
}

pub fn init_app_structure() -> anyhow::Result<()> {
    let app_dir = get_app_dir()?;

    if app_dir.exists() {
        return Ok(());
    }

    fs::create_dir(&app_dir)?;
    fs::create_dir(&app_dir.join(PARSED_FILES_DIR))?;

    let mut preset_file = fs::File::create(app_dir.join(PRESETS_FILE_NAME))?;
    let default_presets = fs::read_to_string(DEFAULT_PRESETS_PATH)?;

    preset_file.write_all(default_presets.as_bytes())?;

    Ok(())
}

pub fn create_output_file() -> anyhow::Result<File> {
    let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();
    let file_name = format!("{}.txt", timestamp);
    let file_path = get_app_dir()?.join(PARSED_FILES_DIR).join(file_name);
    let file = fs::File::create(file_path)?;
    Ok(file)
}

pub fn write_parsed_files(paths: Vec<PathBuf>, output_file: &mut File) -> anyhow::Result<()> {
    let combined_content = paths
        .into_iter()
        .filter_map(|path| {
            fs::read_to_string(&path)
                .map(|content| format!("===== {} =====\n{}", path.display(), content))
                .ok()
        })
        .collect::<Vec<_>>()
        .join("\n");

    writeln!(output_file, "{}", combined_content)?;

    Ok(())
}

pub fn get_file_preview(file_path: PathBuf) -> anyhow::Result<FilePreview> {
    let meta = fs::metadata(&file_path)?;
    let bytes = fs::read(&file_path)?;

    let preview = String::from_utf8_lossy(&bytes)
        .lines()
        .take(PREVIEW_LINE_LIMIT)
        .collect::<Vec<_>>()
        .join("\n");

    let name = file_path
        .file_name()
        .ok_or(anyhow::anyhow!("Failed to extract filename"))?
        .to_string_lossy()
        .to_string();

    Ok(FilePreview {
        name,
        preview,
        path: file_path.to_string_lossy().to_string(),
        size: meta.len(),
    })
}

pub fn parse_paths(
    paths: Vec<String>,
    ignore_patterns: Vec<String>,
) -> anyhow::Result<Vec<PathBuf>> {
    fn collect_files(directory: &PathBuf, collected: &mut Vec<PathBuf>) {
        if let Ok(entries) = fs::read_dir(directory) {
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

pub fn get_app_dir() -> anyhow::Result<PathBuf> {
    let home_dir = dirs::home_dir()
        .ok_or(anyhow::anyhow!("Can't access home dir"))?
        .join(APP_NAME);
    Ok(home_dir)
}

pub fn get_presets_map() -> anyhow::Result<HashMap<String, Vec<String>>> {
    let path = get_app_dir()?.join(PRESETS_FILE_NAME);
    let content = fs::read_to_string(path)?;
    let map = serde_json::from_str::<HashMap<String, Vec<String>>>(&content)?;

    Ok(map)
}

pub fn write_presets(map: &HashMap<String, Vec<String>>) -> anyhow::Result<()> {
    let path: PathBuf = get_app_dir()?.join(PRESETS_FILE_NAME);
    let json = serde_json::to_string_pretty(map)?;
    fs::write(path, json)?;

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

fn filter_by_preset(
    file_paths: Vec<String>,
    patterns: &[String],
) -> anyhow::Result<Vec<String>> {
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
