use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug, Serialize, Deserialize)]
#[error("{message}")]
pub struct CommandError {
    message: String,
}

impl From<anyhow::Error> for CommandError {
    fn from(err: anyhow::Error) -> Self {
        Self {
            message: err.to_string(),
        }
    }
}

impl From<std::io::Error> for CommandError {
    fn from(err: std::io::Error) -> Self {
        Self {
            message: err.to_string(),
        }
    }
}

impl From<serde_json::Error> for CommandError {
    fn from(err: serde_json::Error) -> Self {
        Self {
            message: err.to_string(),
        }
    }
}
