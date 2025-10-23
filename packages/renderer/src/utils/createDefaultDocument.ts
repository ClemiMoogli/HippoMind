/**
 * Utility function to create a default MindMap document
 */

import type { MindMapDocument } from '@shared';
import { generateUUID } from '@shared';

export function createDefaultDocument(title: string = 'Nouvelle carte'): MindMapDocument {
  const rootId = generateUUID();
  const now = new Date().toISOString();

  return {
    version: '1.0.0',
    meta: {
      title,
      createdAt: now,
      modifiedAt: now,
      app: 'NodeFlow',
      appVersion: '1.0.0',
      locale: 'fr',
    },
    theme: {
      name: 'light' as const,
      node: {
        shape: 'pill' as const,
        bg: '#ffffff',
        fg: '#1f2937',
        border: '#d1d5db',
      },
      edge: {
        style: 'smooth' as const,
        width: 2,
        color: '#9ca3af',
      },
    },
    layout: {
      type: 'balanced' as const,
      spacing: {
        sibling: 80,
        level: 220,
      },
    },
    rootId,
    nodes: {
      [rootId]: {
        id: rootId,
        text: title,
        pos: { x: 0, y: 0 },
        size: { w: 180, h: 50 },
        style: {},
        data: { notes: '', tags: [] },
        children: [],
      },
    },
  };
}
