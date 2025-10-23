/**
 * Simple draggable title bar for window movement
 */

export function DragBar() {
  return (
    <div
      data-tauri-drag-region
      className="h-8 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-3"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
        LocalMind
      </span>
    </div>
  );
}
