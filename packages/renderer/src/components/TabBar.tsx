/**
 * TabBar component for managing multiple mind maps
 */

import { useState } from 'react';
import { useTabsStore } from '../store/tabs.store';
import { createDefaultDocument } from '../utils/createDefaultDocument';

export function TabBar() {
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const setActiveTab = useTabsStore((state) => state.setActiveTab);
  const removeTab = useTabsStore((state) => state.removeTab);
  const addTab = useTabsStore((state) => state.addTab);
  const updateTabTitle = useTabsStore((state) => state.updateTabTitle);

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleNewTab = () => {
    const newDoc = createDefaultDocument();
    addTab(newDoc);
  };

  const handleDoubleClick = (tabId: string, currentTitle: string) => {
    setEditingTabId(tabId);
    setEditingTitle(currentTitle);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(e.target.value);
  };

  const handleTitleSubmit = () => {
    if (editingTabId && editingTitle.trim()) {
      updateTabTitle(editingTabId, editingTitle.trim());
    }
    setEditingTabId(null);
    setEditingTitle('');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
      setEditingTitle('');
    }
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if tab has unsaved changes
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.hasUnsavedChanges) {
      const confirm = window.confirm(
        `"${tab.title}" a des modifications non enregistrées. Voulez-vous vraiment fermer cet onglet ?`
      );
      if (!confirm) return;
    }

    removeTab(tabId);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 py-1 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => editingTabId !== tab.id && setActiveTab(tab.id)}
          onDoubleClick={() => handleDoubleClick(tab.id, tab.title)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer min-w-[120px] max-w-[200px]
            transition-colors duration-150
            ${
              tab.id === activeTabId
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-t border-x border-gray-200 dark:border-gray-700'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-650'
            }
          `}
          title="Double-cliquez pour renommer"
        >
          {editingTabId === tab.id ? (
            <input
              type="text"
              value={editingTitle}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleSubmit}
              autoFocus
              className="flex-1 text-sm bg-transparent border-b border-blue-500 outline-none px-1"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 truncate text-sm">
              {tab.hasUnsavedChanges ? '• ' : ''}
              {tab.title}
            </span>
          )}
          <button
            onClick={(e) => handleCloseTab(tab.id, e)}
            className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Fermer l'onglet"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}

      {/* New Tab Button */}
      <button
        onClick={handleNewTab}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Nouvel onglet"
      >
        <svg
          className="w-4 h-4 text-gray-600 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}
