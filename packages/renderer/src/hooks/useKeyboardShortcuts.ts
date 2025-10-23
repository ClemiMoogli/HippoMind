/**
 * Keyboard shortcuts handler
 */

import { useEffect } from 'react';
import { useMindMapStore } from '../store/mindmap.store';
import { useUIStore } from '../store/ui.store';
import { useFileOperations } from './useFileOperations';

export function useKeyboardShortcuts() {
  const selectedNodeId = useMindMapStore((state) => state.selectedNodeId);
  const addNode = useMindMapStore((state) => state.addNode);
  const deleteNode = useMindMapStore((state) => state.deleteNode);
  const undo = useMindMapStore((state) => state.undo);
  const redo = useMindMapStore((state) => state.redo);

  const zoom = useUIStore((state) => state.zoom);
  const setZoom = useUIStore((state) => state.setZoom);
  const setPan = useUIStore((state) => state.setPan);

  const { save } = useFileOperations();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Prevent default for shortcuts
      const shouldPreventDefault = () => {
        if (cmdOrCtrl && e.key === 's') return true; // Save
        if (cmdOrCtrl && e.key === 'z') return true; // Undo
        if (cmdOrCtrl && e.shiftKey && e.key === 'z') return true; // Redo
        if (cmdOrCtrl && e.key === 'f') return true; // Search
        if (cmdOrCtrl && e.key === '0') return true; // Recenter
        if (e.key === 'Enter' && selectedNodeId) return true; // New sibling
        if (e.key === 'Tab' && selectedNodeId) return true; // New child
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) return true; // Delete
        return false;
      };

      if (shouldPreventDefault()) {
        e.preventDefault();
      }

      // Check if user is typing in an input
      const target = e.target as HTMLElement;
      const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (isEditing) return;

      // Save
      if (cmdOrCtrl && e.key === 's') {
        save();
        return;
      }

      // Undo/Redo
      if (cmdOrCtrl && e.shiftKey && e.key === 'z') {
        redo();
        return;
      }
      if (cmdOrCtrl && e.key === 'z') {
        undo();
        return;
      }

      // Recenter
      if (cmdOrCtrl && e.key === '0') {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        return;
      }

      // Node operations (only if a node is selected)
      if (!selectedNodeId) return;

      // Add sibling (Enter)
      if (e.key === 'Enter') {
        addNode(selectedNodeId, 'Nouveau nœud', false);
        return;
      }

      // Add child (Tab)
      if (e.key === 'Tab') {
        addNode(selectedNodeId, 'Nouveau nœud', true);
        return;
      }

      // Delete node (Delete or Backspace)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteNode(selectedNodeId);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, addNode, deleteNode, undo, redo, save, zoom, setZoom, setPan]);
}
