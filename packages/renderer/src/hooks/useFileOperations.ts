/**
 * Custom hook for file operations with tabs support
 */

import { useMindMapStore } from '../store/mindmap.store';
import { useTabsStore } from '../store/tabs.store';
import { createDefaultDocument } from '../utils/createDefaultDocument';

export function useFileOperations() {
  const document = useMindMapStore((state) => state.document);
  const addTab = useTabsStore((state) => state.addTab);
  const activeTab = useTabsStore((state) => state.getActiveTab());
  const updateTabFilePath = useTabsStore((state) => state.updateTabFilePath);
  const setTabUnsavedChanges = useTabsStore((state) => state.setTabUnsavedChanges);

  const createNew = async () => {
    // Create a new document and add it as a new tab
    const newDoc = createDefaultDocument();
    addTab(newDoc);
  };

  const open = async () => {
    try {
      if (!window.electronAPI) {
        console.error('electronAPI is not available');
        alert('L\'API de fichiers n\'est pas disponible. Assurez-vous que l\'application Tauri est démarrée.');
        return;
      }

      const result = await window.electronAPI.fileOpenDialog();
      if (result.canceled || (!result.filePath && !result.file_path)) return;

      // Support both Electron (filePath) and Tauri (file_path) conventions
      const filePath = result.filePath || result.file_path;
      const loadResult = await window.electronAPI.fileOpen(filePath);
      if (loadResult.success && loadResult.data) {
        // Add the opened document as a new tab
        addTab(loadResult.data, filePath);
      } else {
        alert(`Erreur: ${loadResult.error}`);
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      alert('Impossible d\'ouvrir le fichier');
    }
  };

  const save = async (): Promise<boolean> => {
    console.log('[useFileOperations] save() called');
    console.log('[useFileOperations] document:', document ? 'exists' : 'null');
    console.log('[useFileOperations] activeTab:', activeTab);

    if (!document || !activeTab) {
      console.warn('No document or active tab to save');
      return false;
    }

    try {
      if (!window.electronAPI) {
        console.error('electronAPI is not available');
        alert('L\'API de fichiers n\'est pas disponible. Assurez-vous que l\'application Tauri est démarrée.');
        return false;
      }

      let filePath = activeTab.filePath;
      console.log('[useFileOperations] filePath from activeTab:', filePath);

      if (!filePath) {
        console.log('[useFileOperations] No filePath, showing save dialog...');
        const result = await window.electronAPI.fileSaveDialog();
        console.log('[useFileOperations] Save dialog result:', result);
        if (result.canceled || (!result.filePath && !result.file_path)) {
          console.log('[useFileOperations] Save dialog cancelled');
          return false;
        }
        // Support both Electron (filePath) and Tauri (file_path) conventions
        filePath = result.filePath || result.file_path;
      }

      console.log('[useFileOperations] Saving to:', filePath);
      const saveResult = await window.electronAPI.fileSave(filePath, document);
      console.log('[useFileOperations] Save result:', saveResult);

      if (saveResult.success) {
        updateTabFilePath(activeTab.id, filePath);
        setTabUnsavedChanges(activeTab.id, false);
        useMindMapStore.getState().setCurrentFilePath(filePath);
        useMindMapStore.getState().setHasUnsavedChanges(false);

        console.log(`[useFileOperations] Successfully saved: ${filePath}`);
        return true;
      } else {
        alert(`Erreur lors de la sauvegarde: ${saveResult.error}`);
        return false;
      }
    } catch (error) {
      console.error('[useFileOperations] Failed to save file:', error);
      alert('Impossible d\'enregistrer le fichier');
      return false;
    }
  };

  const saveAs = async () => {
    if (!document || !activeTab) return;

    try {
      if (!window.electronAPI) {
        console.error('electronAPI is not available');
        alert('L\'API de fichiers n\'est pas disponible. Assurez-vous que l\'application Tauri est démarrée.');
        return;
      }

      const result = await window.electronAPI.fileSaveDialog();
      if (result.canceled || (!result.filePath && !result.file_path)) return;

      // Support both Electron (filePath) and Tauri (file_path) conventions
      const filePath = result.filePath || result.file_path;
      const saveResult = await window.electronAPI.fileSave(filePath, document);
      if (saveResult.success) {
        updateTabFilePath(activeTab.id, filePath);
        setTabUnsavedChanges(activeTab.id, false);
        useMindMapStore.getState().setCurrentFilePath(filePath);
        useMindMapStore.getState().setHasUnsavedChanges(false);
      } else {
        alert(`Erreur: ${saveResult.error}`);
      }
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('Impossible d\'enregistrer le fichier');
    }
  };

  return { createNew, open, save, saveAs };
}
