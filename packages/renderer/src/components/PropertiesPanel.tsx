/**
 * Properties panel for customizing selected node
 */

import { useRef, useEffect, useState } from 'react';
import { useMindMapStore } from '../store/mindmap.store';
import type { MindMapNode } from '@shared';

export function PropertiesPanel() {
  const document = useMindMapStore((state) => state.document);
  const selectedNodeId = useMindMapStore((state) => state.selectedNodeId);
  const selectedAttachmentId = useMindMapStore((state) => state.selectedAttachmentId);
  const updateNode = useMindMapStore((state) => state.updateNode);
  const updateAttachment = useMindMapStore((state) => state.updateAttachment);
  const pushHistory = useMindMapStore((state) => state.pushHistory);
  const hasHistoryBeenPushed = useRef(false);

  // Reset history flag when selection changes
  useEffect(() => {
    hasHistoryBeenPushed.current = false;
  }, [selectedNodeId, selectedAttachmentId]);

  if (!document) {
    return null;
  }

  // Check if we have an attachment selected
  const selectedAttachment = selectedAttachmentId ? document.attachments?.[selectedAttachmentId] : null;
  const isTextAttachment = selectedAttachment && selectedAttachment.type === 'text';
  const isShapeAttachment = selectedAttachment && selectedAttachment.type === 'shape';

  // If no node and no text/shape attachment selected, return null
  if (!selectedNodeId && !isTextAttachment && !isShapeAttachment) {
    return null;
  }

  const node = selectedNodeId ? document.nodes[selectedNodeId] : null;

  const theme = document.theme;

  // Get current styles based on what's selected
  let currentBg: string;
  let currentFg: string;
  let currentBorder: string | null = null;
  let currentFontSize: number;
  let currentFontWeight: 'normal' | 'bold';
  let currentFontStyle: 'normal' | 'italic';
  let currentFontFamily: string;
  let title: string;

  if (isTextAttachment && selectedAttachment) {
    // Text attachment properties
    currentBg = selectedAttachment.backgroundColor || 'transparent';
    currentFg = selectedAttachment.textColor || '#000000';
    currentFontSize = selectedAttachment.fontSize ?? 16;
    currentFontWeight = selectedAttachment.fontWeight ?? 'normal';
    currentFontStyle = selectedAttachment.fontStyle ?? 'normal';
    currentFontFamily = selectedAttachment.fontFamily ?? 'system-ui, -apple-system, sans-serif';
    title = 'Propriétés du texte';
  } else if (isShapeAttachment && selectedAttachment) {
    // Shape attachment properties
    currentBg = selectedAttachment.fillColor || '#e0e0e0';
    currentFg = selectedAttachment.strokeColor || '#666666';
    currentFontSize = 16; // Not used for shapes
    currentFontWeight = 'normal'; // Not used for shapes
    currentFontStyle = 'normal'; // Not used for shapes
    currentFontFamily = 'system-ui, -apple-system, sans-serif'; // Not used for shapes
    title = 'Propriétés de la forme';
  } else if (node) {
    // Node properties
    currentBg = node.style.bg ?? theme.node.bg;
    currentFg = node.style.fg ?? theme.node.fg;
    currentBorder = node.style.border ?? theme.node.border;
    currentFontSize = node.style.fontSize ?? 16;
    currentFontWeight = node.style.fontWeight ?? 'normal';
    currentFontStyle = node.style.fontStyle ?? 'normal';
    currentFontFamily = node.style.fontFamily ?? 'system-ui, -apple-system, sans-serif';
    title = 'Propriétés du nœud';
  } else {
    return null;
  }

  // Calculate text size for auto-sizing nodes
  const calculateTextSize = (
    text: string,
    fontSize: number = 16,
    fontWeight: string = 'normal',
    fontStyle: string = 'normal'
  ): { w: number; h: number } => {
    // Create a temporary canvas to measure text
    const canvas = window.document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return { w: 180, h: 60 }; // Default size

    context.font = `${fontStyle} ${fontWeight} ${fontSize}px system-ui, -apple-system, sans-serif`;

    // Split text into words and measure
    const words = text.split(' ');
    const maxWidth = 300; // Maximum width before wrapping
    const padding = 24; // Horizontal padding (12px each side)
    const lineHeight = fontSize * 1.5;

    let lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = context.measureText(testLine);

      if (metrics.width > maxWidth - padding && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    // Calculate final size
    const longestLineWidth = Math.max(...lines.map(line => context.measureText(line).width));
    const width = Math.max(120, Math.min(maxWidth, longestLineWidth + padding));
    const height = Math.max(60, lines.length * lineHeight + padding);

    return { w: Math.round(width), h: Math.round(height) };
  };

  const handleStyleChange = (updates: any) => {
    // Save history once at the start of style changes
    if (!hasHistoryBeenPushed.current) {
      pushHistory();
      hasHistoryBeenPushed.current = true;
    }

    if (isTextAttachment && selectedAttachmentId && selectedAttachment) {
      // Update text attachment
      const attachmentUpdates: any = {};

      if (updates.bg !== undefined) attachmentUpdates.backgroundColor = updates.bg;
      if (updates.fg !== undefined) attachmentUpdates.textColor = updates.fg;
      if (updates.fontSize !== undefined) attachmentUpdates.fontSize = updates.fontSize;
      if (updates.fontWeight !== undefined) attachmentUpdates.fontWeight = updates.fontWeight;
      if (updates.fontStyle !== undefined) attachmentUpdates.fontStyle = updates.fontStyle;
      if (updates.fontFamily !== undefined) attachmentUpdates.fontFamily = updates.fontFamily;

      updateAttachment(selectedAttachmentId, attachmentUpdates);
    } else if (isShapeAttachment && selectedAttachmentId && selectedAttachment) {
      // Update shape attachment
      const attachmentUpdates: any = {};

      if (updates.bg !== undefined) attachmentUpdates.fillColor = updates.bg;
      if (updates.fg !== undefined) attachmentUpdates.strokeColor = updates.fg;
      if (updates.strokeWidth !== undefined) attachmentUpdates.strokeWidth = updates.strokeWidth;
      if (updates.zIndex !== undefined) attachmentUpdates.zIndex = updates.zIndex;

      updateAttachment(selectedAttachmentId, attachmentUpdates);
    } else if (node && selectedNodeId) {
      // Update node
      // If fontSize, fontWeight, fontStyle, or fontFamily changes, recalculate node size
      if (updates.fontSize !== undefined || updates.fontWeight !== undefined || updates.fontStyle !== undefined || updates.fontFamily !== undefined) {
        const newFontSize = updates.fontSize ?? currentFontSize;
        const newFontWeight = updates.fontWeight ?? currentFontWeight;
        const newFontStyle = updates.fontStyle ?? currentFontStyle;

        const newSize = calculateTextSize(node.text, newFontSize, newFontWeight, newFontStyle);

        updateNode(selectedNodeId, {
          style: { ...node.style, ...updates },
          size: newSize,
        });
      } else {
        updateNode(selectedNodeId, {
          style: { ...node.style, ...updates },
        });
      }
    }
  };

  return (
    <div className="properties-panel">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </h3>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
        {/* Colors */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Couleurs
          </label>

          <div className="space-y-2">
            {/* Background/Fill color */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 w-20">
                {isShapeAttachment ? 'Remplissage' : 'Fond'}
              </span>
              <input
                type="color"
                value={currentBg === 'transparent' ? '#ffffff' : currentBg}
                onChange={(e) => handleStyleChange({ bg: e.target.value })}
                className="w-12 h-8 rounded cursor-pointer"
              />
              {!isTextAttachment && !isShapeAttachment && (
                <button
                  onClick={() => handleStyleChange({ bg: null })}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Par défaut
                </button>
              )}
            </div>

            {/* Text/Stroke color */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 w-20">
                {isShapeAttachment ? 'Contour' : 'Texte'}
              </span>
              <input
                type="color"
                value={currentFg}
                onChange={(e) => handleStyleChange({ fg: e.target.value })}
                className="w-12 h-8 rounded cursor-pointer"
              />
              {!isTextAttachment && !isShapeAttachment && (
                <button
                  onClick={() => handleStyleChange({ fg: null })}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Par défaut
                </button>
              )}
            </div>

            {/* Border color - only for nodes */}
            {!isTextAttachment && !isShapeAttachment && currentBorder !== null && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Bordure</span>
                <input
                  type="color"
                  value={currentBorder}
                  onChange={(e) => handleStyleChange({ border: e.target.value })}
                  className="w-12 h-8 rounded cursor-pointer"
                />
                <button
                  onClick={() => handleStyleChange({ border: null })}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Par défaut
                </button>
              </div>
            )}

            {/* Stroke width - only for shapes */}
            {isShapeAttachment && selectedAttachment && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Épaisseur du contour</span>
                  <span className="text-xs text-gray-500">{selectedAttachment.strokeWidth ?? 2}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={selectedAttachment.strokeWidth ?? 2}
                  onChange={(e) => handleStyleChange({ strokeWidth: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Z-Index - only for shapes */}
        {isShapeAttachment && selectedAttachment && (
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Ordre d'affichage
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStyleChange({ zIndex: (selectedAttachment.zIndex ?? 0) + 1 })}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                >
                  ↑ Premier plan
                </button>
                <button
                  onClick={() => handleStyleChange({ zIndex: (selectedAttachment.zIndex ?? 0) - 1 })}
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  ↓ Arrière-plan
                </button>
              </div>
              <div className="text-xs text-center text-gray-500">
                Niveau actuel: {selectedAttachment.zIndex ?? 0}
              </div>
            </div>
          </div>
        )}

        {/* Font options - not for shapes */}
        {!isShapeAttachment && (
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Police
          </label>

          <div className="space-y-3">
            {/* Font size */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Taille</span>
                <span className="text-xs text-gray-500">{currentFontSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="48"
                value={currentFontSize}
                onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              {!isTextAttachment && (
                <button
                  onClick={() => handleStyleChange({ fontSize: null })}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  Par défaut (16px)
                </button>
              )}
            </div>

            {/* Font family */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Police</span>
              </div>
              <select
                value={currentFontFamily}
                onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                style={{ fontFamily: currentFontFamily }}
              >
                <option value="system-ui, -apple-system, sans-serif" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Système (défaut)
                </option>
                <option value="Arial, sans-serif" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Arial
                </option>
                <option value="'Helvetica Neue', Helvetica, sans-serif" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>
                  Helvetica
                </option>
                <option value="'Times New Roman', Times, serif" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  Times New Roman
                </option>
                <option value="Georgia, serif" style={{ fontFamily: 'Georgia, serif' }}>
                  Georgia
                </option>
                <option value="'Courier New', Courier, monospace" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                  Courier New
                </option>
                <option value="Monaco, 'Lucida Console', monospace" style={{ fontFamily: "Monaco, 'Lucida Console', monospace" }}>
                  Monaco
                </option>
                <option value="Verdana, sans-serif" style={{ fontFamily: 'Verdana, sans-serif' }}>
                  Verdana
                </option>
                <option value="'Trebuchet MS', sans-serif" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                  Trebuchet MS
                </option>
                <option value="Impact, sans-serif" style={{ fontFamily: 'Impact, sans-serif' }}>
                  Impact
                </option>
                <option value="'Comic Sans MS', cursive" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
                  Comic Sans MS
                </option>
              </select>
              {!isTextAttachment && (
                <button
                  onClick={() => handleStyleChange({ fontFamily: null })}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  Par défaut
                </button>
              )}
            </div>

            {/* Font weight (bold) */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Gras</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentFontWeight === 'bold'}
                  onChange={(e) =>
                    handleStyleChange({ fontWeight: e.target.checked ? 'bold' : 'normal' })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Font style (italic) */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Italique</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentFontStyle === 'italic'}
                  onChange={(e) =>
                    handleStyleChange({ fontStyle: e.target.checked ? 'italic' : 'normal' })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        )}

        {/* Reset button - only for nodes */}
        {!isTextAttachment && !isShapeAttachment && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() =>
                handleStyleChange({
                  bg: null,
                  fg: null,
                  border: null,
                  fontSize: null,
                  fontWeight: null,
                  fontStyle: null,
                  fontFamily: null,
                })
              }
              className="w-full px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            >
              Réinitialiser tous les styles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
