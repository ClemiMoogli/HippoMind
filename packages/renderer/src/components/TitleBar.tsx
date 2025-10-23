/**
 * Custom title bar component with window controls and tabs
 */

import { useState, useEffect } from 'react';
import { useMindMapStore } from '../store/mindmap.store';
import { useTabsStore } from '../store/tabs.store';
import { generateUUID, FILE_FORMAT_VERSION, APP_NAME, APP_VERSION, THEMES, DEFAULT_THEME, DEFAULT_LAYOUT, DEFAULT_NODE_SIZE } from '@shared';

export function TitleBar() {
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const addTab = useTabsStore((state) => state.addTab);
  const removeTab = useTabsStore((state) => state.removeTab);
  const setActiveTab = useTabsStore((state) => state.setActiveTab);
  const updateTabTitle = useTabsStore((state) => state.updateTabTitle);
  const getActiveTab = useTabsStore((state) => state.getActiveTab);

  const document = useMindMapStore((state) => state.document);
  const loadDocument = useMindMapStore((state) => state.loadDocument);

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Sync active tab with mindmap store
  useEffect(() => {
    const activeTab = getActiveTab();
    if (activeTab && document?.meta.title !== activeTab.title) {
      loadDocument(activeTab.document, activeTab.filePath || '');
    }
  }, [activeTabId]);

  const handleAddTab = () => {
    const rootId = generateUUID();
    const now = new Date().toISOString();
    const title = 'Nouvelle carte';

    const newDocument = {
      version: FILE_FORMAT_VERSION,
      meta: {
        title,
        createdAt: now,
        modifiedAt: now,
        app: APP_NAME,
        appVersion: APP_VERSION,
        locale: 'fr' as const,
      },
      theme: THEMES[DEFAULT_THEME],
      layout: DEFAULT_LAYOUT,
      rootId,
      nodes: {
        [rootId]: {
          id: rootId,
          text: title,
          pos: { x: 0, y: 0 },
          size: DEFAULT_NODE_SIZE,
          style: {},
          data: { notes: '', tags: [] },
          children: [],
        },
      },
    };

    addTab(newDocument);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    removeTab(tabId);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleTabDoubleClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setEditingTabId(tabId);
      setEditingTitle(tab.title);
    }
  };

  const handleTitleChange = (tabId: string) => {
    if (editingTitle.trim()) {
      updateTabTitle(tabId, editingTitle.trim());
    }
    setEditingTabId(null);
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Title bar with drag region */}
      <div
        data-tauri-drag-region
        className="h-8 flex items-center justify-between px-2 bg-gray-100 dark:bg-gray-900"
      >
        <div className="flex items-center gap-2 flex-1" data-tauri-drag-region>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400" data-tauri-drag-region>
            LocalMind
          </span>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-t-lg cursor-pointer
              transition-colors min-w-[120px] max-w-[200px]
              ${activeTabId === tab.id
                ? 'bg-white dark:bg-gray-700 border-t border-l border-r border-gray-200 dark:border-gray-600'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
            onClick={() => handleTabClick(tab.id)}
            onDoubleClick={() => handleTabDoubleClick(tab.id)}
          >
            {editingTabId === tab.id ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => handleTitleChange(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleChange(tab.id);
                  } else if (e.key === 'Escape') {
                    setEditingTabId(null);
                  }
                }}
                className="flex-1 text-sm bg-transparent border-none outline-none focus:outline-none px-1 py-0 text-gray-900 dark:text-gray-100"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="flex-1 text-sm truncate text-gray-900 dark:text-gray-100">
                {tab.title}
              </span>
            )}

            {tabs.length > 1 && (
              <button
                onClick={(e) => handleCloseTab(e, tab.id)}
                className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                title="Fermer l'onglet"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* Add tab button */}
        <button
          onClick={handleAddTab}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          title="Nouvel onglet"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
