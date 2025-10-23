/**
 * Validation utilities for MindMap documents
 */

import type { MindMapDocument } from '../types/mindmap';
import { FILE_FORMAT_VERSION } from '../constants';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateMindMapDocument(data: unknown): data is MindMapDocument {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Document must be an object');
  }

  const doc = data as Record<string, unknown>;

  // Check version
  if (typeof doc.version !== 'string') {
    throw new ValidationError('Missing or invalid version');
  }

  // Check meta
  if (!doc.meta || typeof doc.meta !== 'object') {
    throw new ValidationError('Missing or invalid meta');
  }

  // Check theme
  if (!doc.theme || typeof doc.theme !== 'object') {
    throw new ValidationError('Missing or invalid theme');
  }

  // Check layout
  if (!doc.layout || typeof doc.layout !== 'object') {
    throw new ValidationError('Missing or invalid layout');
  }

  // Check rootId
  if (typeof doc.rootId !== 'string') {
    throw new ValidationError('Missing or invalid rootId');
  }

  // Check nodes
  if (!doc.nodes || typeof doc.nodes !== 'object') {
    throw new ValidationError('Missing or invalid nodes');
  }

  // Check root node exists
  const nodes = doc.nodes as Record<string, unknown>;
  if (!nodes[doc.rootId]) {
    throw new ValidationError(`Root node ${doc.rootId} not found in nodes`);
  }

  return true;
}

export function migrateDocumentVersion(doc: MindMapDocument): MindMapDocument {
  // For now, only v1.0.0 exists
  // Future versions would add migration logic here
  if (doc.version === FILE_FORMAT_VERSION) {
    return doc;
  }

  // Log migration if needed
  console.warn(`Migrating document from ${doc.version} to ${FILE_FORMAT_VERSION}`);

  return {
    ...doc,
    version: FILE_FORMAT_VERSION,
  };
}
