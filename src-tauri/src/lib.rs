// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod utils;
pub mod commands;
pub mod error;

use tauri_plugin_log;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(e) = utils::init_app_structure() {
        eprintln!("Error setting up app structure: {}", e);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::get_preview_tree,
            commands::parse,
            commands::get_files,
            commands::get_file_detail,
            commands::get_file_content,
            commands::get_file_metadata,
            commands::update_file,
            commands::rename_file,
            commands::delete_file,
            commands::open_in_default_editor,
            commands::open_in_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
