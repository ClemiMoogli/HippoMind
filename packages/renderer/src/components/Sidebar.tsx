/**
 * Sidebar with theme modes and node properties
 */

import React, { useState, useEffect } from 'react';
import { useMindMapStore } from '../store/mindmap.store';
import { PropertiesPanel } from './PropertiesPanel';
import type { MindMapNode } from '@shared';

type ThemeMode = 'light' | 'dark' | 'serious' | 'cartoon' | 'custom';

export function Sidebar() {
  const document = useMindMapStore((state) => state.document);
  const selectedNodeId = useMindMapStore((state) => state.selectedNodeId);
  const selectedAttachmentId = useMindMapStore((state) => state.selectedAttachmentId);
  const selectedEdge = useMindMapStore((state) => state.selectedEdge);
  const updateNode = useMindMapStore((state) => state.updateNode);
  const updateDocument = useMindMapStore((state) => state.updateDocument);
  const updateEdgeStyle = useMindMapStore((state) => state.updateEdgeStyle);

  const [activeTab, setActiveTab] = useState<'theme' | 'node'>('theme');

  // Check if we have an attachment selected
  const selectedAttachment = selectedAttachmentId ? document?.attachments?.[selectedAttachmentId] : null;
  const isTextAttachment = selectedAttachment && selectedAttachment.type === 'text';
  const isShapeAttachment = selectedAttachment && selectedAttachment.type === 'shape';

  // Automatically switch to 'node' tab when a node, edge, text or shape attachment is selected
  useEffect(() => {
    if (selectedNodeId || selectedEdge || isTextAttachment || isShapeAttachment) {
      setActiveTab('node');
    }
  }, [selectedNodeId, selectedEdge, isTextAttachment, isShapeAttachment]);

  if (!document) return null;

  const node = selectedNodeId ? document.nodes[selectedNodeId] : null;
  const theme = document.theme;

  // Get edge style for selected edge
  const edgeKey = selectedEdge ? `${selectedEdge.parentId}->${selectedEdge.childId}` : null;
  const currentEdgeStyle = edgeKey && document.edges ? document.edges[edgeKey] : null;

  // Apply theme mode
  const applyThemeMode = (mode: ThemeMode) => {
    let themeConfig;

    switch (mode) {
      case 'light':
        themeConfig = {
          name: 'light' as const,
          node: {
            shape: 'rounded-rect' as const,
            bg: '#ffffff',
            fg: '#1f2937',
            border: '#d1d5db',
          },
          edge: {
            style: 'smooth' as const,
            width: 2,
            color: '#d1d5db',
          },
        };
        break;

      case 'dark':
        themeConfig = {
          name: 'dark' as const,
          node: {
            shape: 'rounded-rect' as const,
            bg: '#1f2937',
            fg: '#f9fafb',
            border: '#4b5563',
          },
          edge: {
            style: 'smooth' as const,
            width: 2,
            color: '#4b5563',
          },
        };
        break;

      case 'serious':
        themeConfig = {
          name: 'slate' as const,
          node: {
            shape: 'rounded-rect' as const,
            bg: '#f8fafc',
            fg: '#0f172a',
            border: '#334155',
          },
          edge: {
            style: 'straight' as const,
            width: 2,
            color: '#334155',
          },
        };
        break;

      case 'cartoon':
        themeConfig = {
          name: 'sepia' as const,
          node: {
            shape: 'pill' as const,
            bg: '#fef3c7',
            fg: '#92400e',
            border: '#f59e0b',
          },
          edge: {
            style: 'smooth' as const,
            width: 3,
            color: '#f59e0b',
          },
        };
        break;

      default:
        return;
    }

    updateDocument({ theme: themeConfig });
  };

  // Handle node style change
  const handleStyleChange = (updates: Partial<MindMapNode['style']>) => {
    if (!selectedNodeId) return;
    updateNode(selectedNodeId, {
      style: { ...node!.style, ...updates },
    });
  };

  // Current node styles with fallbacks
  const currentBg = node?.style.bg ?? theme.node.bg;
  const currentFg = node?.style.fg ?? theme.node.fg;
  const currentBorder = node?.style.border ?? theme.node.border;
  const currentFontSize = node?.style.fontSize ?? 16;
  const currentFontWeight = node?.style.fontWeight ?? 'normal';
  const currentFontStyle = node?.style.fontStyle ?? 'normal';

  return (
    <div className="w-64 min-w-64 max-w-64 flex-shrink-0 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'theme'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Thème
        </button>
        <button
          onClick={() => setActiveTab('node')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'node'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Nœud
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Modes de thème
              </h3>
              <div className="space-y-2">
                {/* Light mode */}
                <button
                  onClick={() => applyThemeMode('light')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded bg-white border border-gray-300 flex items-center justify-center">
                    <div className="w-6 h-6 rounded bg-gray-100 border border-gray-400"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Clair</div>
                    <div className="text-xs text-gray-500">Fond blanc classique</div>
                  </div>
                </button>

                {/* Dark mode */}
                <button
                  onClick={() => applyThemeMode('dark')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded bg-gray-800 border border-gray-600 flex items-center justify-center">
                    <div className="w-6 h-6 rounded bg-gray-700 border border-gray-500"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Sombre</div>
                    <div className="text-xs text-gray-500">Mode nuit</div>
                  </div>
                </button>

                {/* Serious mode */}
                <button
                  onClick={() => applyThemeMode('serious')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded bg-slate-50 border border-slate-400 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-sm bg-slate-100 border-2 border-slate-600"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Professionnel</div>
                    <div className="text-xs text-gray-500">Style corporate</div>
                  </div>
                </button>

                {/* Cartoon mode */}
                <button
                  onClick={() => applyThemeMode('cartoon')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 border-4 border-amber-500 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-amber-600"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Cartoon</div>
                    <div className="text-xs text-gray-500">Style amusant et coloré</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Edge/Link styles */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Style des liens
              </h3>
              <div className="space-y-3">
                {/* Edge style selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Type de courbe
                  </label>
                  <select
                    value={theme.edge?.style || 'smooth'}
                    onChange={(e) =>
                      updateDocument({
                        theme: {
                          ...theme,
                          edge: { ...theme.edge, style: e.target.value as any, width: theme.edge?.width || 2 },
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  >
                    <option value="straight">Droite</option>
                    <option value="smooth">Courbe douce</option>
                  </select>
                </div>

                {/* Edge width */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Épaisseur
                    </label>
                    <span className="text-xs text-gray-500">{theme.edge?.width || 2}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={theme.edge?.width || 2}
                    onChange={(e) =>
                      updateDocument({
                        theme: {
                          ...theme,
                          edge: { ...theme.edge, width: parseInt(e.target.value), style: theme.edge?.style || 'curved' },
                        },
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Edge color */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Couleur
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.edge?.color || theme.node.border}
                      onChange={(e) =>
                        updateDocument({
                          theme: {
                            ...theme,
                            edge: { ...theme.edge, color: e.target.value, style: theme.edge?.style || 'curved', width: theme.edge?.width || 2 },
                          },
                        })
                      }
                      className="w-12 h-8 rounded cursor-pointer"
                    />
                    <button
                      onClick={() =>
                        updateDocument({
                          theme: {
                            ...theme,
                            edge: { ...theme.edge, color: undefined, style: theme.edge?.style || 'curved', width: theme.edge?.width || 2 },
                          },
                        })
                      }
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Par défaut
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'node' && (
          <>
            {selectedEdge ? (
              /* Edge properties */
              <>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Propriétés du lien
                  </h3>
                </div>

                {/* Edge style */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Type de courbe
                  </label>
                  <select
                    value={currentEdgeStyle?.style || ''}
                    onChange={(e) =>
                      updateEdgeStyle(selectedEdge.parentId, selectedEdge.childId, {
                        style: e.target.value ? (e.target.value as any) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  >
                    <option value="">Par défaut</option>
                    <option value="straight">Droite</option>
                    <option value="smooth">Courbe douce</option>
                  </select>
                </div>

                {/* Edge width */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Épaisseur
                    </label>
                    <span className="text-xs text-gray-500">
                      {currentEdgeStyle?.width || theme.edge?.width || 2}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={currentEdgeStyle?.width || theme.edge?.width || 2}
                    onChange={(e) =>
                      updateEdgeStyle(selectedEdge.parentId, selectedEdge.childId, {
                        width: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <button
                    onClick={() =>
                      updateEdgeStyle(selectedEdge.parentId, selectedEdge.childId, {
                        width: undefined,
                      })
                    }
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                  >
                    Par défaut
                  </button>
                </div>

                {/* Edge color */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Couleur
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentEdgeStyle?.color || theme.edge?.color || theme.node.border}
                      onChange={(e) =>
                        updateEdgeStyle(selectedEdge.parentId, selectedEdge.childId, {
                          color: e.target.value,
                        })
                      }
                      className="w-12 h-8 rounded cursor-pointer"
                    />
                    <button
                      onClick={() =>
                        updateEdgeStyle(selectedEdge.parentId, selectedEdge.childId, {
                          color: undefined,
                        })
                      }
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Par défaut
                    </button>
                  </div>
                </div>

                {/* Reset button */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      if (edgeKey && document.edges) {
                        const updatedEdges = { ...document.edges };
                        delete updatedEdges[edgeKey];
                        updateDocument({ edges: updatedEdges });
                      }
                    }}
                    className="w-full px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    Réinitialiser le style du lien
                  </button>
                </div>
              </>
            ) : !selectedNodeId && !isTextAttachment && !isShapeAttachment ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-500 text-center py-8">
                  Sélectionnez un nœud, un texte libre, une forme ou un lien pour personnaliser ses propriétés
                </div>
              </div>
            ) : (
              /* Use PropertiesPanel for nodes, text attachments, and shape attachments */
              <div className="-m-4">
                <PropertiesPanel />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
