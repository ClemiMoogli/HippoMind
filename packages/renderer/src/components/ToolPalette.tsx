/**
 * Tool palette for adding text and shapes
 */

import { useState } from 'react';
import { useMindMapStore } from '../store/mindmap.store';

export function ToolPalette() {
  const addAttachment = useMindMapStore((state) => state.addAttachment);
  const pushHistory = useMindMapStore((state) => state.pushHistory);
  const [isExpanded, setIsExpanded] = useState(false);

  // Add text box
  const handleAddText = () => {
    pushHistory();
    addAttachment({
      type: 'text',
      name: 'Text',
      data: 'Double-click to edit',
      text: 'Double-click to edit',
      pos: { x: 100, y: 100 },
      size: { w: 200, h: 100 },
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textColor: '#000000',
      backgroundColor: 'transparent',
    });
  };

  // Add shape
  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'triangle' | 'star' | 'arrow') => {
    pushHistory();
    addAttachment({
      type: 'shape',
      name: `Shape - ${shapeType}`,
      data: shapeType,
      pos: { x: 150, y: 150 },
      size: { w: 100, h: 100 },
      shapeType,
      fillColor: '#e0e0e0',
      strokeColor: '#666666',
      strokeWidth: 2,
    });
  };

  return (
    <div className="absolute left-4 top-4 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="font-semibold text-sm">Tools</span>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Tools */}
        {isExpanded && (
          <div className="p-2 space-y-1 border-t border-gray-200 dark:border-gray-700">
            {/* Add Text */}
            <button
              onClick={handleAddText}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              Add Text
            </button>

            {/* Shapes */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Shapes
              </div>
              <button
                onClick={() => handleAddShape('rectangle')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
              >
                <div className="w-5 h-5 border-2 border-current rounded"></div>
                Rectangle
              </button>
              <button
                onClick={() => handleAddShape('circle')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
              >
                <div className="w-5 h-5 border-2 border-current rounded-full"></div>
                Circle
              </button>
              <button
                onClick={() => handleAddShape('triangle')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2 L22 22 L2 22 Z" strokeWidth="2" />
                </svg>
                Triangle
              </button>
              <button
                onClick={() => handleAddShape('star')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                Star
              </button>
              <button
                onClick={() => handleAddShape('arrow')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
                Arrow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
