/**
 * Core types for the MindMap data model
 * Version 1.0.0 of the .mindmap file format
 */

export interface MindMapDocument {
  version: string;
  meta: MindMapMeta;
  theme: MindMapTheme;
  layout: MindMapLayout;
  rootId: string;
  nodes: Record<string, MindMapNode>;
  edges?: Record<string, MindMapEdgeStyle>; // Key format: "parentId->childId"
  attachments?: Record<string, MindMapAttachment>; // Free-floating attachments
}

export interface MindMapMeta {
  title: string;
  createdAt: string; // ISO 8601
  modifiedAt: string; // ISO 8601
  app: string;
  appVersion: string;
  locale: string;
}

export interface MindMapTheme {
  name: 'light' | 'dark' | 'sepia' | 'slate';
  node: {
    shape: 'pill' | 'rounded-rect';
    bg: string;
    fg: string;
    border: string;
    fontFamily?: string;
  };
  edge: {
    style: 'straight' | 'smooth';
    width: number;
    color?: string;
  };
}

export interface MindMapLayout {
  type: 'balanced' | 'radial';
  spacing: {
    sibling: number;
    level: number;
  };
}

export interface MindMapNode {
  id: string;
  text: string;
  pos: { x: number; y: number };
  size: { w: number; h: number };
  style: MindMapNodeStyle;
  data: MindMapNodeData;
  children: string[];
  collapsed?: boolean; // If true, children are hidden
}

export interface MindMapNodeStyle {
  bg?: string | null;
  fg?: string | null;
  border?: string | null;
  badge?: string | null;
  fontSize?: number | null;
  fontWeight?: 'normal' | 'bold' | null;
  fontStyle?: 'normal' | 'italic' | null;
  fontFamily?: string | null;
}

export interface MindMapNodeData {
  notes: string;
  tags: string[];
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export interface MindMapEdgeStyle {
  style?: 'straight' | 'smooth';
  width?: number;
  color?: string;
}

export interface MindMapAttachment {
  id: string;
  type: 'image' | 'document' | 'text' | 'shape';
  name: string;
  data: string; // Base64 encoded for images, text content for text, shape type for shapes
  filePath?: string; // Absolute file path for documents (instead of base64)
  mimeType?: string; // Optional, only for images/documents
  pos: { x: number; y: number };
  size: { w: number; h: number };
  rotation?: number; // Rotation angle in degrees
  zIndex?: number; // Z-index for layering (default: 0, higher values appear on top)
  // Optional properties for text
  text?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  // Optional properties for shapes
  shapeType?: 'rectangle' | 'circle' | 'triangle' | 'star' | 'arrow';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}
