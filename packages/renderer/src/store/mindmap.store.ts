/**
 * Zustand store for mind map state
 */

import { create } from 'zustand';
import type { MindMapDocument, MindMapNode, MindMapEdgeStyle, MindMapAttachment } from '@shared';
import {
  generateUUID,
  APP_NAME,
  APP_VERSION,
  FILE_FORMAT_VERSION,
  DEFAULT_THEME,
  DEFAULT_LAYOUT,
  DEFAULT_NODE_SIZE,
  THEMES,
} from '@shared';
import { useTabsStore } from './tabs.store';

interface HistoryState {
  past: MindMapDocument[];
  future: MindMapDocument[];
}

interface MindMapState {
  document: MindMapDocument | null;
  currentFilePath: string | null;
  hasUnsavedChanges: boolean;
  history: HistoryState;
  selectedNodeId: string | null;
  selectedEdge: { parentId: string; childId: string } | null;
  selectedAttachmentId: string | null;
  stageRef: any | null;

  // Actions
  createNewDocument: (title?: string) => void;
  loadDocument: (doc: MindMapDocument, filePath: string) => void;
  updateDocument: (updates: Partial<MindMapDocument>) => void;
  setCurrentFilePath: (path: string | null) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setStageRef: (ref: any) => void;

  // Node operations
  addNode: (parentId: string, text?: string, asChild?: boolean) => string;
  updateNode: (nodeId: string, updates: Partial<MindMapNode>) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  selectEdge: (parentId: string | null, childId: string | null) => void;
  updateEdgeStyle: (parentId: string, childId: string, style: Partial<MindMapEdgeStyle>) => void;

  // Attachment operations
  addAttachment: (attachment: Omit<MindMapAttachment, 'id'>) => string;
  updateAttachment: (attachmentId: string, updates: Partial<MindMapAttachment>) => void;
  deleteAttachment: (attachmentId: string) => void;
  selectAttachment: (attachmentId: string | null) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  pushHistory: () => void;
}

const createDefaultDocument = (title: string = 'Nouvelle carte'): MindMapDocument => {
  const rootId = generateUUID();
  const now = new Date().toISOString();

  return {
    version: FILE_FORMAT_VERSION,
    meta: {
      title,
      createdAt: now,
      modifiedAt: now,
      app: APP_NAME,
      appVersion: APP_VERSION,
      locale: 'fr',
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
};

export const useMindMapStore = create<MindMapState>((set, get) => ({
  document: null,
  currentFilePath: null,
  hasUnsavedChanges: false,
  history: { past: [], future: [] },
  selectedNodeId: null,
  selectedEdge: null,
  selectedAttachmentId: null,
  stageRef: null,

  createNewDocument: (title?: string) => {
    const doc = createDefaultDocument(title);
    set({
      document: doc,
      currentFilePath: null,
      hasUnsavedChanges: false,
      history: { past: [], future: [] },
      selectedNodeId: doc.rootId,
    });
  },

  loadDocument: (doc, filePath) => {
    set({
      document: doc,
      currentFilePath: filePath,
      hasUnsavedChanges: false,
      history: { past: [], future: [] },
      selectedNodeId: doc.rootId,
    });
  },

  updateDocument: (updates) => {
    const { document } = get();
    if (!document) return;

    const updatedDoc = {
      ...document,
      ...updates,
      meta: {
        ...document.meta,
        ...updates.meta,
        modifiedAt: new Date().toISOString(),
      },
    };

    set({ document: updatedDoc, hasUnsavedChanges: true });

    // Mark the active tab as having unsaved changes
    const activeTabId = useTabsStore.getState().activeTabId;
    if (activeTabId) {
      useTabsStore.getState().setTabUnsavedChanges(activeTabId, true);
    }
  },

  setCurrentFilePath: (path) => set({ currentFilePath: path }),

  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

  setStageRef: (ref) => set({ stageRef: ref }),

  addNode: (parentId, text = 'Nouveau nœud', asChild = true) => {
    const { document } = get();
    if (!document) return '';

    // Save current state before making changes
    get().pushHistory();

    const newId = generateUUID();
    const parent = document.nodes[parentId];
    if (!parent) return '';

    // Calculate position (simplified - will be refined with layout algorithm)
    const offset = asChild ? 220 : 0;
    const newNode: MindMapNode = {
      id: newId,
      text,
      pos: { x: parent.pos.x + offset, y: parent.pos.y + (asChild ? 0 : 60) },
      size: DEFAULT_NODE_SIZE,
      style: {},
      data: { notes: '', tags: [] },
      children: [],
    };

    const updatedNodes = { ...document.nodes };
    updatedNodes[newId] = newNode;

    if (asChild) {
      updatedNodes[parentId] = {
        ...parent,
        children: [...parent.children, newId],
      };
    } else {
      // Add as sibling - find parent's parent
      const grandParent = Object.values(updatedNodes).find((n) =>
        n.children.includes(parentId)
      );
      if (grandParent) {
        const index = grandParent.children.indexOf(parentId);
        grandParent.children.splice(index + 1, 0, newId);
      }
    }

    get().updateDocument({ nodes: updatedNodes });
    set({ selectedNodeId: newId });

    return newId;
  },

  updateNode: (nodeId, updates) => {
    const { document } = get();
    if (!document || !document.nodes[nodeId]) return;

    const updatedNodes = { ...document.nodes };
    updatedNodes[nodeId] = { ...updatedNodes[nodeId], ...updates };

    get().updateDocument({ nodes: updatedNodes });
  },

  deleteNode: (nodeId) => {
    const { document } = get();
    if (!document || nodeId === document.rootId) return;

    // Save current state before making changes
    get().pushHistory();

    const updatedNodes = { ...document.nodes };

    // Remove from parent's children
    const parent = Object.values(updatedNodes).find((n) => n.children.includes(nodeId));
    if (parent) {
      parent.children = parent.children.filter((id) => id !== nodeId);
    }

    // Recursively delete children
    const deleteRecursive = (id: string) => {
      const node = updatedNodes[id];
      if (node) {
        node.children.forEach(deleteRecursive);
        delete updatedNodes[id];
      }
    };
    deleteRecursive(nodeId);

    get().updateDocument({ nodes: updatedNodes });
    set({ selectedNodeId: parent?.id ?? document.rootId });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId, selectedEdge: null }),

  selectEdge: (parentId, childId) => {
    if (parentId && childId) {
      set({ selectedEdge: { parentId, childId }, selectedNodeId: null });
    } else {
      set({ selectedEdge: null });
    }
  },

  updateEdgeStyle: (parentId, childId, style) => {
    const { document } = get();
    if (!document) return;

    // Save history before making changes
    get().pushHistory();

    const edgeKey = `${parentId}->${childId}`;
    const edges = document.edges || {};
    const currentEdgeStyle = edges[edgeKey] || {};

    console.log('updateEdgeStyle', { edgeKey, currentEdgeStyle, style });

    // Merge the new style, removing undefined values
    const newStyle = { ...currentEdgeStyle, ...style };

    // Remove undefined properties
    Object.keys(newStyle).forEach(key => {
      if (newStyle[key as keyof typeof newStyle] === undefined) {
        delete newStyle[key as keyof typeof newStyle];
      }
    });

    const updatedEdges = {
      ...edges,
    };

    // Remove the entry completely if the style is empty
    if (Object.keys(newStyle).length === 0) {
      delete updatedEdges[edgeKey];
    } else {
      updatedEdges[edgeKey] = newStyle;
    }

    console.log('Updated edges:', updatedEdges);

    get().updateDocument({ edges: updatedEdges });
  },

  // Attachment operations
  addAttachment: (attachment) => {
    const { document } = get();
    if (!document) return '';

    get().pushHistory();

    const attachmentId = generateUUID();
    const newAttachment: MindMapAttachment = {
      ...attachment,
      id: attachmentId,
    };

    const attachments = document.attachments || {};
    get().updateDocument({
      attachments: {
        ...attachments,
        [attachmentId]: newAttachment,
      },
    });

    return attachmentId;
  },

  updateAttachment: (attachmentId, updates) => {
    const { document } = get();
    if (!document || !document.attachments?.[attachmentId]) return;

    get().pushHistory();

    const currentAttachment = document.attachments[attachmentId];
    get().updateDocument({
      attachments: {
        ...document.attachments,
        [attachmentId]: {
          ...currentAttachment,
          ...updates,
        },
      },
    });
  },

  deleteAttachment: (attachmentId) => {
    const { document } = get();
    if (!document || !document.attachments?.[attachmentId]) return;

    get().pushHistory();

    const attachments = { ...document.attachments };
    delete attachments[attachmentId];

    get().updateDocument({ attachments });

    // Deselect if this attachment was selected
    if (get().selectedAttachmentId === attachmentId) {
      set({ selectedAttachmentId: null });
    }
  },

  selectAttachment: (attachmentId) => {
    set({ selectedAttachmentId: attachmentId, selectedNodeId: null, selectedEdge: null });
  },

  pushHistory: () => {
    const { document, history } = get();
    if (!document) return;

    set({
      history: {
        past: [...history.past, document],
        future: [],
      },
    });
  },

  undo: () => {
    const { history, document } = get();
    if (history.past.length === 0 || !document) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    set({
      document: previous,
      history: {
        past: newPast,
        future: [document, ...history.future],
      },
      hasUnsavedChanges: true,
    });
  },

  redo: () => {
    const { history, document } = get();
    if (history.future.length === 0 || !document) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    set({
      document: next,
      history: {
        past: [...history.past, document],
        future: newFuture,
      },
      hasUnsavedChanges: true,
    });
  },

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,
}));
