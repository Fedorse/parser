use std::fs;
use std::io;
use std::path::PathBuf;

let SAVE_PATH = '/'

fn parse_files(file_paths: Vec<String>) -> Result<String, io::Error> {
    let mut concatenated_content = String::new();

    for path in file_paths {
        let file = fs::read_to_string(path);
        match file {
            Ok(content) => {
                concatenated_content.push_str(&content);
            },
            Err(error) => {
                return Err(error);
            }
        }
    }

    return concatenated_content
}
