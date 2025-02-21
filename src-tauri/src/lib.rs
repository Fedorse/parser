// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::parse_files,
            commands::get_files,
            commands::get_file_content,
            commands::remove_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
