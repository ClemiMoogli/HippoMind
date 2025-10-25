/**
 * Main App component
 */

import { useEffect, useState } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { ToolPalette } from './components/ToolPalette';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LicenseDialog } from './components/LicenseDialog';
import { TabBar } from './components/TabBar';
import { useUIStore } from './store/ui.store';
import { useMindMapStore } from './store/mindmap.store';
import { useTabsStore } from './store/tabs.store';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutosave } from './hooks/useAutosave';
import { isLicensed } from './utils/license';

export function App() {
  const theme = useUIStore((state) => state.theme);
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const activeTab = useTabsStore((state) => state.getActiveTab());
  const loadDocument = useMindMapStore((state) => state.loadDocument);
  const currentDocument = useMindMapStore((state) => state.document);
  const updateTabDocument = useTabsStore((state) => state.updateTabDocument);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showLicenseDialog, setShowLicenseDialog] = useState(!isLicensed());
  const [previousTabId, setPreviousTabId] = useState<string | null>(null);

  // Set up keyboard shortcuts
  useKeyboardShortcuts();

  // Set up autosave
  useAutosave();

  // Apply theme to HTML document
  useEffect(() => {
    const root = window.document.documentElement;
    root.className = theme;

    // Save theme preference
    window.electronAPI?.prefsSet('theme', theme);
  }, [theme]);

  // Load theme preference on mount
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const savedTheme = await window.electronAPI?.prefsGet('theme');
        if (savedTheme) {
          useUIStore.getState().setTheme(savedTheme as any);
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };

    loadPrefs();
  }, []);

  // Sync active tab with mindmap store
  useEffect(() => {
    // Save the current document to the previous tab before switching
    if (previousTabId && currentDocument && previousTabId !== activeTabId) {
      updateTabDocument(previousTabId, currentDocument);
    }

    // Load the new active tab's document
    if (activeTab) {
      loadDocument(activeTab.document, activeTab.filePath || '');
      setShowWelcome(false);
      setPreviousTabId(activeTabId);
    } else if (tabs.length === 0) {
      setShowWelcome(true);
      setPreviousTabId(null);
    }
  }, [activeTabId]);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {showLicenseDialog ? (
        <LicenseDialog onLicenseActivated={() => setShowLicenseDialog(false)} />
      ) : showWelcome ? (
        <WelcomeScreen onClose={() => setShowWelcome(false)} />
      ) : (
        <>
          <Toolbar />
          <TabBar />
          <div className="flex-1 overflow-hidden flex relative">
            <div className="flex-1 relative min-w-0">
              <Canvas />
              <ToolPalette />
            </div>
            <Sidebar />
          </div>
        </>
      )}
    </div>
  );
}
