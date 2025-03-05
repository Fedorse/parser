// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod utils;
pub mod commands;
pub mod consts;

use tauri_plugin_log;
use crate::utils::setup_app_structure;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(e) = setup_app_structure() {
        eprintln!("Error setting up app structure: {}", e);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::parse,
            commands::parse_files,
            commands::parse_directories,
            commands::get_files,
            commands::get_file_content,
            commands::remove_file,
            commands::update_file,
            commands::get_presets,
            commands::save_preset,
            commands::delete_preset,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
