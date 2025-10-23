/**
 * Validation tests
 */

import { describe, it, expect } from 'vitest';
import { validateMindMapDocument, ValidationError } from '../validation';
import type { MindMapDocument } from '../../types/mindmap';
import { FILE_FORMAT_VERSION, APP_NAME, APP_VERSION, THEMES, DEFAULT_LAYOUT } from '../../constants';

describe('validateMindMapDocument', () => {
  const validDocument: MindMapDocument = {
    version: FILE_FORMAT_VERSION,
    meta: {
      title: 'Test',
      createdAt: '2025-01-01T00:00:00Z',
      modifiedAt: '2025-01-01T00:00:00Z',
      app: APP_NAME,
      appVersion: APP_VERSION,
      locale: 'fr',
    },
    theme: THEMES.dark,
    layout: DEFAULT_LAYOUT,
    rootId: 'root-id',
    nodes: {
      'root-id': {
        id: 'root-id',
        text: 'Root',
        pos: { x: 0, y: 0 },
        size: { w: 180, h: 48 },
        style: {},
        data: { notes: '', tags: [] },
        children: [],
      },
    },
  };

  it('should validate a valid document', () => {
    expect(() => validateMindMapDocument(validDocument)).not.toThrow();
  });

  it('should throw on null document', () => {
    expect(() => validateMindMapDocument(null)).toThrow(ValidationError);
  });

  it('should throw on missing version', () => {
    const doc = { ...validDocument };
    delete (doc as any).version;
    expect(() => validateMindMapDocument(doc)).toThrow(ValidationError);
  });

  it('should throw on missing meta', () => {
    const doc = { ...validDocument };
    delete (doc as any).meta;
    expect(() => validateMindMapDocument(doc)).toThrow(ValidationError);
  });

  it('should throw on missing theme', () => {
    const doc = { ...validDocument };
    delete (doc as any).theme;
    expect(() => validateMindMapDocument(doc)).toThrow(ValidationError);
  });

  it('should throw on missing nodes', () => {
    const doc = { ...validDocument };
    delete (doc as any).nodes;
    expect(() => validateMindMapDocument(doc)).toThrow(ValidationError);
  });

  it('should throw on missing root node', () => {
    const doc = { ...validDocument, rootId: 'non-existent' };
    expect(() => validateMindMapDocument(doc)).toThrow(ValidationError);
  });
});
