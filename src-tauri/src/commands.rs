use std::fs::{self, File};
use std::io::{self, Write};
use std::path::PathBuf;
use chrono::Local;
use directories::ProjectDirs;

const APP_NAME: &str = "parser-ai";

fn get_project_dir() -> Result<PathBuf, io::Error> {
    match ProjectDirs::from("", "", APP_NAME) {
        Some(proj_dirs) => {
            let path = proj_dirs.data_local_dir();
            fs::create_dir_all(path)?;
            Ok(path.to_path_buf())
        }
        None => Err(io::Error::new(io::ErrorKind::NotFound, "Failed to locate project directory")),
    }
}

#[tauri::command]
pub fn parse_files(file_paths: Vec<String>, title: String) -> Result<String, String> {
    let mut concatenated_content = String::new();

    for path in file_paths {
        match fs::read_to_string(&path) {
            Ok(content) => concatenated_content.push_str(&content),
            Err(_) => return Err("Failed to parse files".to_string())
        }
    }

    let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();

    let filename = format!("{}_{}.txt", title, timestamp);

    let save_path = get_project_dir().map_err(|e| e.to_string())?.join(&filename);
    let mut file = File::create(&save_path).map_err(|e| e.to_string())?;

    file.write_all(concatenated_content.as_bytes()).map_err(|e| e.to_string())?;

    Ok(save_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn get_files() -> Result<Vec<String>, String> {
    let mut file_list = Vec::new();

    let project_dir = get_project_dir().map_err(|e| e.to_string())?;
    let entries = fs::read_dir(project_dir).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_file() {
            file_list.push(path.to_string_lossy().to_string());
        }
    }

    Ok(file_list)
}

#[tauri::command]
pub fn get_file_content(file_path: String) -> Result<String, String> {
    print!("{}",file_path);
    match fs::read_to_string(file_path) {
        Ok(content) => Ok(content),
        Err(_) => Err("Failed to read file".to_string())
    }
}

#[tauri::command]
pub fn remove_file(file_path: String) -> Result<(), String> {
    match fs::remove_file(file_path) {
        Ok(_) => Ok(()),
        Err(_) => Err("Failed to remove file".to_string())
    }
}