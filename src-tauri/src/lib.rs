// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod commands;
pub mod error;
pub mod utils;

use tauri::Manager;
use tauri_plugin_log;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(e) = utils::init_app_structure() {
        eprintln!("Error setting up app structure: {}", e);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();


            #[cfg(target_os = "windows")]
            {
                window.set_decorations(false).unwrap();
                window.set_shadow(true).unwrap();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_preview_tree,
            commands::get_parsed_preview_tree,
            commands::parse,
            commands::parse_repository,
            commands::get_files,
            commands::get_file_content,
            commands::get_file_metadata,
            commands::update_file,
            commands::rename_file,
            commands::delete_file,
            commands::open_in_default_editor,
            commands::open_in_folder,
            commands::expand_folder,
            commands::expand_parsed_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
