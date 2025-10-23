/**
 * Zustand store for managing tabs (multiple mindmap documents)
 */

import { create } from 'zustand';
import type { MindMapDocument } from '@shared';
import { useMindMapStore } from './mindmap.store';

export interface Tab {
  id: string;
  title: string;
  document: MindMapDocument;
  filePath: string | null;
  hasUnsavedChanges: boolean;
  history: {
    past: MindMapDocument[];
    future: MindMapDocument[];
  };
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;

  // Actions
  addTab: (document: MindMapDocument, filePath?: string | null) => string;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabDocument: (tabId: string, document: MindMapDocument) => void;
  updateTabTitle: (tabId: string, title: string) => void;
  updateTabFilePath: (tabId: string, filePath: string | null) => void;
  setTabUnsavedChanges: (tabId: string, hasChanges: boolean) => void;
  getActiveTab: () => Tab | null;
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (document, filePath = null) => {
    const id = Date.now().toString();
    const newTab: Tab = {
      id,
      title: document.meta.title,
      document,
      filePath,
      hasUnsavedChanges: false,
      history: { past: [], future: [] },
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: id,
    }));

    return id;
  },

  removeTab: (tabId) => {
    const { tabs, activeTabId } = get();
    const newTabs = tabs.filter((t) => t.id !== tabId);

    // Don't allow removing the last tab
    if (newTabs.length === 0) return;

    let newActiveId = activeTabId;
    if (activeTabId === tabId) {
      // Switch to the previous tab or the first one
      const removedIndex = tabs.findIndex((t) => t.id === tabId);
      const newIndex = removedIndex > 0 ? removedIndex - 1 : 0;
      newActiveId = newTabs[newIndex]?.id || null;
    }

    set({
      tabs: newTabs,
      activeTabId: newActiveId,
    });
  },

  setActiveTab: (tabId) => {
    set({ activeTabId: tabId });
  },

  updateTabDocument: (tabId, document) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id === tabId) {
          // Simply update the document without touching history
          // History is managed by the mindmap store's undo/redo
          return {
            ...tab,
            document,
            title: document.meta.title,
          };
        }
        return tab;
      }),
    }));
  },

  updateTabTitle: (tabId, title) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              title,
              document: {
                ...tab.document,
                meta: {
                  ...tab.document.meta,
                  title,
                  modifiedAt: new Date().toISOString(),
                },
              },
              hasUnsavedChanges: true,
            }
          : tab
      ),
    }));

    // If this is the active tab, also update the mindmap store
    const { activeTabId } = get();
    if (tabId === activeTabId) {
      const currentDoc = useMindMapStore.getState().document;
      if (currentDoc) {
        useMindMapStore.getState().updateDocument({
          meta: {
            ...currentDoc.meta,
            title,
          },
        });
      }
    }
  },

  updateTabFilePath: (tabId, filePath) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, filePath } : tab
      ),
    }));
  },

  setTabUnsavedChanges: (tabId, hasChanges) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, hasUnsavedChanges: hasChanges } : tab
      ),
    }));
  },

  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find((t) => t.id === activeTabId) || null;
  },
}));
