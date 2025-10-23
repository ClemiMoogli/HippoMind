/**
 * Preload script - secure bridge between main and renderer
 */

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, type MindMapDocument } from '@localmind/shared';

// Expose safe IPC API to renderer
const api = {
  // File operations
  fileOpenDialog: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN_DIALOG),
  fileOpen: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN, filePath),
  fileSaveDialog: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE_DIALOG),
  fileSave: (filePath: string, data: MindMapDocument) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE, filePath, data),
  fileCreateBackup: (filePath: string, data: MindMapDocument) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_CREATE_BACKUP, filePath, data),

  // Preferences
  prefsGet: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.PREFS_GET, key),
  prefsSet: (key: string, value: unknown) =>
    ipcRenderer.invoke(IPC_CHANNELS.PREFS_SET, key, value),

  // App info
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION),
  getAppLocale: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_LOCALE),
};

// Expose to window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', api);

// Type declaration for renderer
export type ElectronAPI = typeof api;
