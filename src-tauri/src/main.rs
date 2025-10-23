// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::State;
use std::sync::Mutex;

// Types matching the TypeScript types
#[derive(Debug, Serialize, Deserialize)]
struct FileDialogResult {
    canceled: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    file_path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct SaveFileResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    file_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct LoadFileResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    file_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

// Preferences store
struct PreferencesState {
    last_save_directory: Mutex<Option<String>>,
    recent_files: Mutex<Vec<String>>,
    window_bounds: Mutex<Option<serde_json::Value>>,
}

impl Default for PreferencesState {
    fn default() -> Self {
        Self {
            last_save_directory: Mutex::new(None),
            recent_files: Mutex::new(Vec::new()),
            window_bounds: Mutex::new(None),
        }
    }
}

// File operations
#[tauri::command]
async fn file_open_dialog(
    app: tauri::AppHandle,
    prefs: State<'_, PreferencesState>,
) -> Result<FileDialogResult, String> {
    use tauri_plugin_dialog::DialogExt;

    let default_path = prefs.last_save_directory.lock()
        .map_err(|e| e.to_string())?
        .clone();

    let file_path = app.dialog()
        .file()
        .add_filter("LocalMind Maps", &["mindmap"])
        .add_filter("All Files", &["*"])
        .set_title("Ouvrir une carte");

    let file_path = if let Some(path) = default_path {
        file_path.set_directory(path)
    } else {
        file_path
    };

    match file_path.blocking_pick_file() {
        Some(file) => {
            let path_str = file.as_path().unwrap().to_string_lossy().to_string();

            // Update last save directory
            if let Some(parent) = Path::new(&path_str).parent() {
                *prefs.last_save_directory.lock().map_err(|e| e.to_string())? =
                    Some(parent.to_string_lossy().to_string());
            }

            Ok(FileDialogResult {
                canceled: false,
                file_path: Some(path_str),
            })
        }
        None => Ok(FileDialogResult {
            canceled: true,
            file_path: None,
        }),
    }
}

#[tauri::command]
async fn file_open(
    file_path: String,
    prefs: State<'_, PreferencesState>,
) -> Result<LoadFileResult, String> {
    match fs::read_to_string(&file_path) {
        Ok(content) => {
            match serde_json::from_str::<serde_json::Value>(&content) {
                Ok(data) => {
                    // Update recent files
                    let mut recent = prefs.recent_files.lock().map_err(|e| e.to_string())?;
                    recent.retain(|f| f != &file_path);
                    recent.insert(0, file_path.clone());
                    recent.truncate(10);

                    Ok(LoadFileResult {
                        success: true,
                        data: Some(data),
                        file_path: Some(file_path),
                        error: None,
                    })
                }
                Err(e) => Ok(LoadFileResult {
                    success: false,
                    data: None,
                    file_path: None,
                    error: Some(format!("Invalid JSON: {}", e)),
                }),
            }
        }
        Err(e) => Ok(LoadFileResult {
            success: false,
            data: None,
            file_path: None,
            error: Some(format!("Failed to read file: {}", e)),
        }),
    }
}

#[tauri::command]
async fn file_save_dialog(
    app: tauri::AppHandle,
    prefs: State<'_, PreferencesState>,
) -> Result<FileDialogResult, String> {
    use tauri_plugin_dialog::DialogExt;

    let default_path = prefs.last_save_directory.lock()
        .map_err(|e| e.to_string())?
        .clone();

    let dialog = app.dialog()
        .file()
        .add_filter("LocalMind Maps", &["mindmap"])
        .set_title("Enregistrer la carte")
        .set_file_name("Nouvelle carte.mindmap");

    let dialog = if let Some(path) = default_path {
        dialog.set_directory(path)
    } else {
        dialog
    };

    match dialog.blocking_save_file() {
        Some(file) => {
            let path_str = file.as_path().unwrap().to_string_lossy().to_string();

            // Update last save directory
            if let Some(parent) = Path::new(&path_str).parent() {
                *prefs.last_save_directory.lock().map_err(|e| e.to_string())? =
                    Some(parent.to_string_lossy().to_string());
            }

            Ok(FileDialogResult {
                canceled: false,
                file_path: Some(path_str),
            })
        }
        None => Ok(FileDialogResult {
            canceled: true,
            file_path: None,
        }),
    }
}

#[tauri::command]
async fn file_save(
    file_path: String,
    data: serde_json::Value,
    prefs: State<'_, PreferencesState>,
) -> Result<SaveFileResult, String> {
    let content = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize: {}", e))?;

    match fs::write(&file_path, content) {
        Ok(_) => {
            // Update recent files
            let mut recent = prefs.recent_files.lock().map_err(|e| e.to_string())?;
            recent.retain(|f| f != &file_path);
            recent.insert(0, file_path.clone());
            recent.truncate(10);

            Ok(SaveFileResult {
                success: true,
                file_path: Some(file_path),
                error: None,
            })
        }
        Err(e) => Ok(SaveFileResult {
            success: false,
            file_path: None,
            error: Some(format!("Failed to write file: {}", e)),
        }),
    }
}

#[tauri::command]
async fn file_create_backup(
    file_path: String,
    data: serde_json::Value,
) -> Result<SaveFileResult, String> {
    let path = Path::new(&file_path);
    let dir = path.parent().ok_or("Invalid file path")?;
    let filename = path.file_stem().ok_or("Invalid filename")?;

    let backup_dir = dir.join(".localmind-backups").join(filename);

    // Create backup directory
    fs::create_dir_all(&backup_dir)
        .map_err(|e| format!("Failed to create backup directory: {}", e))?;

    // Create timestamped backup
    let timestamp = chrono::Local::now().format("%Y-%m-%dT%H-%M-%S").to_string();
    let backup_path = backup_dir.join(format!("{}.mindmap", timestamp));

    let content = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize: {}", e))?;

    match fs::write(&backup_path, content) {
        Ok(_) => {
            // Clean old backups
            clean_old_backups(&backup_dir, 10)?;

            Ok(SaveFileResult {
                success: true,
                file_path: Some(backup_path.to_string_lossy().to_string()),
                error: None,
            })
        }
        Err(e) => Ok(SaveFileResult {
            success: false,
            file_path: None,
            error: Some(format!("Failed to write backup: {}", e)),
        }),
    }
}

fn clean_old_backups(backup_dir: &Path, max_count: usize) -> Result<(), String> {
    let mut backups: Vec<PathBuf> = fs::read_dir(backup_dir)
        .map_err(|e| format!("Failed to read backup directory: {}", e))?
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .filter(|path| path.extension().and_then(|s| s.to_str()) == Some("mindmap"))
        .collect();

    if backups.len() <= max_count {
        return Ok(());
    }

    // Sort by name (timestamp-based)
    backups.sort();

    // Delete oldest
    let to_delete = &backups[0..(backups.len() - max_count)];
    for path in to_delete {
        fs::remove_file(path)
            .map_err(|e| format!("Failed to delete old backup: {}", e))?;
    }

    Ok(())
}

// Preferences
#[tauri::command]
async fn prefs_get(
    key: String,
    prefs: State<'_, PreferencesState>,
) -> Result<Option<serde_json::Value>, String> {
    match key.as_str() {
        "lastSaveDirectory" => {
            let dir = prefs.last_save_directory.lock().map_err(|e| e.to_string())?;
            Ok(dir.as_ref().map(|s| serde_json::Value::String(s.clone())))
        }
        "recentFiles" => {
            let files = prefs.recent_files.lock().map_err(|e| e.to_string())?;
            Ok(Some(serde_json::to_value(&*files).unwrap()))
        }
        "windowBounds" => {
            let bounds = prefs.window_bounds.lock().map_err(|e| e.to_string())?;
            Ok(bounds.clone())
        }
        _ => Ok(None),
    }
}

#[tauri::command]
async fn prefs_set(
    key: String,
    value: serde_json::Value,
    prefs: State<'_, PreferencesState>,
) -> Result<bool, String> {
    match key.as_str() {
        "lastSaveDirectory" => {
            if let Some(s) = value.as_str() {
                *prefs.last_save_directory.lock().map_err(|e| e.to_string())? = Some(s.to_string());
            }
        }
        "recentFiles" => {
            if let Ok(files) = serde_json::from_value::<Vec<String>>(value) {
                *prefs.recent_files.lock().map_err(|e| e.to_string())? = files;
            }
        }
        "windowBounds" => {
            *prefs.window_bounds.lock().map_err(|e| e.to_string())? = Some(value);
        }
        _ => {}
    }
    Ok(true)
}

// App info
#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn get_app_locale() -> String {
    // Get system locale (simplified)
    sys_locale::get_locale().unwrap_or_else(|| String::from("en-US"))
}

// Open file with default system application
#[tauri::command]
async fn open_file_with_default_app(file_path: String) -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        Command::new("open")
            .arg(&file_path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
        Ok(true)
    }

    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        Command::new("cmd")
            .args(&["/C", "start", "", &file_path])
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
        Ok(true)
    }

    #[cfg(target_os = "linux")]
    {
        use std::process::Command;
        Command::new("xdg-open")
            .arg(&file_path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
        Ok(true)
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(PreferencesState::default())
        .invoke_handler(tauri::generate_handler![
            file_open_dialog,
            file_open,
            file_save_dialog,
            file_save,
            file_create_backup,
            prefs_get,
            prefs_set,
            get_app_version,
            get_app_locale,
            open_file_with_default_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
