/**
 * Preferences storage using electron-store
 */

import Store from 'electron-store';
import type { Rectangle } from 'electron';

interface Preferences {
  theme: 'light' | 'dark' | 'sepia' | 'slate';
  locale: string;
  lastOpenedFile?: string;
  lastSaveDirectory?: string;
  windowBounds?: Rectangle;
  recentFiles: string[];
}

const defaultPreferences: Preferences = {
  theme: 'dark',
  locale: 'fr',
  recentFiles: [],
};

export class PreferencesStore {
  private static instance: Store<Preferences>;

  static getInstance(): Store<Preferences> {
    if (!PreferencesStore.instance) {
      PreferencesStore.instance = new Store<Preferences>({
        name: 'preferences',
        defaults: defaultPreferences,
      });
    }
    return PreferencesStore.instance;
  }
}
