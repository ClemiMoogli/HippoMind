/**
 * Tauri API wrapper - replaces Electron preload API
 * This provides a compatible interface with the previous Electron API
 */

import { invoke } from '@tauri-apps/api/core';
import type { MindMapDocument } from './types/mindmap';
import type { FileDialogResult, SaveFileResult, LoadFileResult } from './types/ipc';

export const tauriAPI = {
  // File operations
  fileOpenDialog: (): Promise<FileDialogResult> => {
    return invoke('file_open_dialog');
  },

  fileOpen: (filePath: string): Promise<LoadFileResult> => {
    return invoke('file_open', { filePath });
  },

  fileSaveDialog: (): Promise<FileDialogResult> => {
    return invoke('file_save_dialog');
  },

  fileSave: (filePath: string, data: MindMapDocument): Promise<SaveFileResult> => {
    return invoke('file_save', { filePath, data });
  },

  fileCreateBackup: (filePath: string, data: MindMapDocument): Promise<SaveFileResult> => {
    return invoke('file_create_backup', { filePath, data });
  },

  // Preferences
  prefsGet: (key: string): Promise<any> => {
    return invoke('prefs_get', { key });
  },

  prefsSet: (key: string, value: unknown): Promise<boolean> => {
    return invoke('prefs_set', { key, value });
  },

  // App info
  getAppVersion: (): Promise<string> => {
    return invoke('get_app_version');
  },

  getAppLocale: (): Promise<string> => {
    return invoke('get_app_locale');
  },
};

// Auto-inject the API (only runs in browser context)
// We expose it regardless of __TAURI__ because Tauri loads modules before __TAURI__ is ready
if (typeof window !== 'undefined') {
  (window as any).electronAPI = tauriAPI;
  console.log('Tauri API injected into window.electronAPI');
}
