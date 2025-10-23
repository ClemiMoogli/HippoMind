/**
 * IPC handlers for communication with renderer
 */

import { ipcMain, dialog, app } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
import {
  IPC_CHANNELS,
  type MindMapDocument,
  type FileDialogResult,
  type SaveFileResult,
  type LoadFileResult,
  validateMindMapDocument,
  migrateDocumentVersion,
  APP_NAME,
  APP_VERSION,
  FILE_EXTENSION,
  BACKUP_FOLDER_NAME,
  MAX_BACKUP_COUNT,
} from '@localmind/shared';
import { PreferencesStore } from './preferences';

const prefs = PreferencesStore.getInstance();

export function setupIPC() {
  // File operations
  ipcMain.handle(IPC_CHANNELS.FILE_OPEN_DIALOG, handleOpenDialog);
  ipcMain.handle(IPC_CHANNELS.FILE_OPEN, handleOpenFile);
  ipcMain.handle(IPC_CHANNELS.FILE_SAVE_DIALOG, handleSaveDialog);
  ipcMain.handle(IPC_CHANNELS.FILE_SAVE, handleSaveFile);
  ipcMain.handle(IPC_CHANNELS.FILE_CREATE_BACKUP, handleCreateBackup);

  // Preferences
  ipcMain.handle(IPC_CHANNELS.PREFS_GET, (_event, key: string) => {
    return prefs.get(key as any);
  });

  ipcMain.handle(IPC_CHANNELS.PREFS_SET, (_event, key: string, value: unknown) => {
    prefs.set(key as any, value as any);
    return true;
  });

  // App info
  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, () => APP_VERSION);
  ipcMain.handle(IPC_CHANNELS.APP_GET_LOCALE, () => app.getLocale());
}

async function handleOpenDialog(): Promise<FileDialogResult> {
  const defaultPath = prefs.get('lastSaveDirectory') ?? app.getPath('documents');

  const result = await dialog.showOpenDialog({
    title: 'Ouvrir une carte',
    defaultPath,
    filters: [
      { name: 'LocalMind Maps', extensions: ['mindmap'] },
      { name: 'Tous les fichiers', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const filePath = result.filePaths[0];
  prefs.set('lastSaveDirectory', path.dirname(filePath));

  return { canceled: false, filePath };
}

async function handleOpenFile(_event: unknown, filePath: string): Promise<LoadFileResult> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as unknown;

    // Validate and migrate if needed
    validateMindMapDocument(data);
    const migratedData = migrateDocumentVersion(data as MindMapDocument);

    // Update recent files
    const recent = prefs.get('recentFiles') ?? [];
    const filtered = recent.filter((f) => f !== filePath);
    prefs.set('recentFiles', [filePath, ...filtered].slice(0, 10));

    return {
      success: true,
      data: migratedData,
      filePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function handleSaveDialog(): Promise<FileDialogResult> {
  const defaultPath = prefs.get('lastSaveDirectory') ?? app.getPath('documents');

  const result = await dialog.showSaveDialog({
    title: 'Enregistrer la carte',
    defaultPath: path.join(defaultPath, `Nouvelle carte${FILE_EXTENSION}`),
    filters: [{ name: 'LocalMind Maps', extensions: ['mindmap'] }],
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  const filePath = result.filePath;
  prefs.set('lastSaveDirectory', path.dirname(filePath));

  return { canceled: false, filePath };
}

async function handleSaveFile(
  _event: unknown,
  filePath: string,
  data: MindMapDocument
): Promise<SaveFileResult> {
  try {
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, content, 'utf-8');

    // Update recent files
    const recent = prefs.get('recentFiles') ?? [];
    const filtered = recent.filter((f) => f !== filePath);
    prefs.set('recentFiles', [filePath, ...filtered].slice(0, 10));

    return { success: true, filePath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function handleCreateBackup(
  _event: unknown,
  filePath: string,
  data: MindMapDocument
): Promise<SaveFileResult> {
  try {
    const dir = path.dirname(filePath);
    const filename = path.basename(filePath, FILE_EXTENSION);
    const backupDir = path.join(dir, BACKUP_FOLDER_NAME, filename);

    // Create backup directory
    await fs.mkdir(backupDir, { recursive: true });

    // Create timestamped backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const backupPath = path.join(backupDir, `${timestamp}${FILE_EXTENSION}`);

    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(backupPath, content, 'utf-8');

    // Clean old backups
    await cleanOldBackups(backupDir);

    return { success: true, filePath: backupPath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function cleanOldBackups(backupDir: string) {
  try {
    const files = await fs.readdir(backupDir);
    const backups = files
      .filter((f) => f.endsWith(FILE_EXTENSION))
      .map((f) => ({
        name: f,
        path: path.join(backupDir, f),
      }));

    if (backups.length <= MAX_BACKUP_COUNT) {
      return;
    }

    // Sort by name (which is timestamp-based)
    backups.sort((a, b) => a.name.localeCompare(b.name));

    // Delete oldest
    const toDelete = backups.slice(0, backups.length - MAX_BACKUP_COUNT);
    await Promise.all(toDelete.map((b) => fs.unlink(b.path)));
  } catch (error) {
    console.error('Failed to clean old backups:', error);
  }
}
