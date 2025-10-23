/**
 * Main process entry point
 */

import { app, BrowserWindow } from 'electron';
import path from 'path';
import { setupIPC } from './ipc';
import { PreferencesStore } from './preferences';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const prefs = PreferencesStore.getInstance();
  const bounds = prefs.get('windowBounds');

  mainWindow = new BrowserWindow({
    width: bounds?.width ?? 1200,
    height: bounds?.height ?? 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Load renderer
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Save window bounds on close
  mainWindow.on('close', () => {
    if (mainWindow) {
      prefs.set('windowBounds', mainWindow.getBounds());
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.on('ready', () => {
  setupIPC();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Disable navigation and new window creation for security
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});
