/**
 * Application-wide constants
 */
export const APP_NAME = 'LocalMind';
export const APP_VERSION = '1.0.0';
export const FILE_FORMAT_VERSION = '1.0.0';
export const FILE_EXTENSION = '.mindmap';
export const FILE_EXTENSION_PATTERN = '*.mindmap';
export const AUTOSAVE_INTERVAL_MS = 30000; // 30 seconds
export const MAX_BACKUP_COUNT = 20;
export const BACKUP_FOLDER_NAME = 'Backups';
export const DEFAULT_LOCALE = 'fr';
export const SUPPORTED_LOCALES = ['fr', 'en'];
export const DEFAULT_THEME = 'dark';
export const THEMES = {
    light: {
        name: 'light',
        node: {
            shape: 'pill',
            bg: '#ffffff',
            fg: '#111827',
            border: '#d1d5db',
        },
    },
    dark: {
        name: 'dark',
        node: {
            shape: 'pill',
            bg: '#1f2937',
            fg: '#f9fafb',
            border: '#374151',
        },
    },
    sepia: {
        name: 'sepia',
        node: {
            shape: 'pill',
            bg: '#f5f1e8',
            fg: '#3e2723',
            border: '#d4c5a9',
        },
    },
    slate: {
        name: 'slate',
        node: {
            shape: 'pill',
            bg: '#1e293b',
            fg: '#e2e8f0',
            border: '#475569',
        },
    },
};
export const DEFAULT_LAYOUT = {
    type: 'balanced',
    spacing: {
        sibling: 40,
        level: 80,
    },
};
export const DEFAULT_NODE_SIZE = {
    w: 180,
    h: 48,
};
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3.0;
export const ZOOM_STEP = 0.1;
export const TARGET_FPS = 60;
export const MAX_NODES_TARGET = 2000;
