/**
 * Application-wide constants
 */

export const APP_NAME = 'HippoMind';
export const APP_VERSION = '1.0.0';
export const FILE_FORMAT_VERSION = '1.0.0';

export const FILE_EXTENSION = '.mindmap';
export const FILE_EXTENSION_PATTERN = '*.mindmap';

export const AUTOSAVE_INTERVAL_MS = 30000; // 30 seconds
export const MAX_BACKUP_COUNT = 20;
export const BACKUP_FOLDER_NAME = 'Backups';

export const DEFAULT_LOCALE = 'fr';
export const SUPPORTED_LOCALES = ['fr', 'en'] as const;

export const DEFAULT_THEME = 'light';

export const THEMES = {
  light: {
    name: 'light' as const,
    node: {
      shape: 'pill' as const,
      bg: '#ffffff',
      fg: '#111827',
      border: '#d1d5db',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    },
    edge: {
      style: 'smooth' as const,
      width: 2,
      color: '#d1d5db',
    },
  },
  dark: {
    name: 'dark' as const,
    node: {
      shape: 'pill' as const,
      bg: '#1f2937',
      fg: '#f9fafb',
      border: '#374151',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    },
    edge: {
      style: 'smooth' as const,
      width: 2,
      color: '#374151',
    },
  },
  sepia: {
    name: 'sepia' as const,
    node: {
      shape: 'pill' as const,
      bg: '#f5f1e8',
      fg: '#3e2723',
      border: '#d4c5a9',
      fontFamily: 'Lora, Georgia, serif',
    },
    edge: {
      style: 'smooth' as const,
      width: 2,
      color: '#d4c5a9',
    },
  },
  slate: {
    name: 'slate' as const,
    node: {
      shape: 'pill' as const,
      bg: '#1e293b',
      fg: '#e2e8f0',
      border: '#475569',
      fontFamily: 'IBM Plex Mono, Courier New, monospace',
    },
    edge: {
      style: 'smooth' as const,
      width: 2,
      color: '#475569',
    },
  },
} as const;

export const DEFAULT_LAYOUT = {
  type: 'balanced' as const,
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
