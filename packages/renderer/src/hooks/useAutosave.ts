/**
 * Autosave hook with tabs support
 */

import { useEffect, useRef } from 'react';
import { useTabsStore } from '../store/tabs.store';
import { AUTOSAVE_INTERVAL_MS } from '@shared';

export function useAutosave() {
  const tabs = useTabsStore((state) => state.tabs);
  const setTabUnsavedChanges = useTabsStore((state) => state.setTabUnsavedChanges);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Set up autosave interval for all tabs
    intervalRef.current = window.setInterval(async () => {
      if (!window.electronAPI) return;

      // Save all tabs that have a file path and unsaved changes
      for (const tab of tabs) {
        if (tab.filePath && tab.hasUnsavedChanges) {
          try {
            await window.electronAPI.fileSave(tab.filePath, tab.document);
            setTabUnsavedChanges(tab.id, false);

            // Create backup
            await window.electronAPI.fileCreateBackup(tab.filePath, tab.document);
          } catch (error) {
            console.error(`Autosave failed for tab ${tab.id}:`, error);
          }
        }
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tabs, setTabUnsavedChanges]);
}
