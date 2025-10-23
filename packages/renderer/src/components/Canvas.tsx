/**
 * Main Canvas component using React-Konva
 */

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Line, Circle, Group, Image as KonvaImage } from 'react-konva';
import { useMindMapStore } from '../store/mindmap.store';
import { useUIStore } from '../store/ui.store';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { MindMapNode } from '@shared';
import { generateUUID, DEFAULT_NODE_SIZE } from '@shared';
import useImage from 'use-image';
import { FreeAttachment } from './FreeAttachment';

// Component to render node attachment (image or document icon)
function NodeAttachment({
  attachment,
  nodeId,
  isSelected,
  onResize
}: {
  attachment: { type: 'image' | 'document'; data: string; name: string; width?: number; height?: number; path?: string };
  nodeId: string;
  isSelected: boolean;
  onResize?: (width: number, height: number) => void;
}) {
  const [image] = useImage(attachment.type === 'image' ? attachment.data : '');

  if (attachment.type === 'image') {
    if (!image) return null;

    // Use custom dimensions if available, otherwise calculate from image
    const displayWidth = attachment.width || Math.min(160, image.width);
    const displayHeight = attachment.height || (displayWidth / image.width * image.height);

    return (
      <>
        <KonvaImage
          image={image}
          width={displayWidth}
          height={displayHeight}
          listening={false}
        />
        {/* Resize handles for selected node */}
        {isSelected && (
          <>
            {/* Bottom-right resize handle */}
            <Circle
              x={displayWidth}
              y={displayHeight}
              radius={6}
              fill="white"
              stroke="#3b82f6"
              strokeWidth={2}
              draggable
              onDragMove={(e) => {
                const newWidth = Math.max(80, e.target.x());
                const newHeight = Math.max(60, e.target.y());
                onResize?.(newWidth, newHeight);
                e.target.x(displayWidth);
                e.target.y(displayHeight);
              }}
              onMouseEnter={(e) => {
                const container = e.target.getStage()?.container();
                if (container) container.style.cursor = 'nwse-resize';
              }}
              onMouseLeave={(e) => {
                const container = e.target.getStage()?.container();
                if (container) container.style.cursor = 'default';
              }}
            />
          </>
        )}
      </>
    );
  } else {
    // Document icon
    return (
      <Group
        onDblClick={async () => {
          console.log('Document double-clicked:', attachment.name);
          try {
            // Create a temporary file from the base64 data and open it
            const { Command } = await import('@tauri-apps/plugin-shell');
            const { BaseDirectory, writeFile } = await import('@tauri-apps/plugin-fs');

            // Extract base64 data (remove data URL prefix)
            const base64Data = attachment.data.split(',')[1];

            // Convert base64 to Uint8Array
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            // Write to temp directory with original filename
            const tempFileName = `localmind-temp-${Date.now()}-${attachment.name}`;
            await writeFile(tempFileName, bytes, { baseDir: BaseDirectory.Temp });

            // Get the temp path and open it
            const { join, tempDir } = await import('@tauri-apps/api/path');
            const tempPath = await join(await tempDir(), tempFileName);

            console.log('Opening file:', tempPath);
            const command = Command.create('open', [tempPath]);
            await command.execute();
          } catch (error) {
            console.error('Error opening document:', error);
            console.error('Trying to show error in console instead of alert');
          }
        }}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = 'pointer';
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = 'default';
        }}
      >
        {/* Document icon background */}
        <Rect
          width={48}
          height={56}
          fill="#f3f4f6"
          stroke="#9ca3af"
          strokeWidth={2}
          cornerRadius={4}
        />
        {/* Folded corner */}
        <Line
          points={[36, 0, 48, 12, 36, 12, 36, 0]}
          fill="#e5e7eb"
          closed
          stroke="#9ca3af"
          strokeWidth={1}
        />
        {/* Document lines */}
        <Line points={[12, 20, 36, 20]} stroke="#6b7280" strokeWidth={2} />
        <Line points={[12, 28, 36, 28]} stroke="#6b7280" strokeWidth={2} />
        <Line points={[12, 36, 28, 36]} stroke="#6b7280" strokeWidth={2} />
        {/* File name */}
        <Text
          y={60}
          width={80}
          text={attachment.name}
          fontSize={10}
          fill="#374151"
          align="center"
          wrap="none"
          ellipsis
        />
      </Group>
    );
  }
}

export function Canvas() {
  const stageRef = useRef<any>(null);
  const document = useMindMapStore((state) => state.document);
  const selectedNodeId = useMindMapStore((state) => state.selectedNodeId);
  const selectedEdge = useMindMapStore((state) => state.selectedEdge);
  const selectedAttachmentId = useMindMapStore((state) => state.selectedAttachmentId);
  const selectNode = useMindMapStore((state) => state.selectNode);
  const selectEdge = useMindMapStore((state) => state.selectEdge);
  const selectAttachment = useMindMapStore((state) => state.selectAttachment);
  const updateNode = useMindMapStore((state) => state.updateNode);
  const updateDocument = useMindMapStore((state) => state.updateDocument);
  const pushHistory = useMindMapStore((state) => state.pushHistory);
  const addAttachment = useMindMapStore((state) => state.addAttachment);
  const updateAttachment = useMindMapStore((state) => state.updateAttachment);
  const deleteAttachment = useMindMapStore((state) => state.deleteAttachment);
  const setStageRef = useMindMapStore((state) => state.setStageRef);

  // Store the stage ref in the global store so it can be accessed by other components
  useEffect(() => {
    setStageRef(stageRef);
  }, [setStageRef]);

  const zoom = useUIStore((state) => state.zoom);
  const pan = useUIStore((state) => state.pan);
  const setZoom = useUIStore((state) => state.setZoom);
  const setPan = useUIStore((state) => state.setPan);

  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [editingNodeId, setEditingNodeId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState('');
  const [editingAttachmentId, setEditingAttachmentId] = React.useState<string | null>(null);
  const [editAttachmentText, setEditAttachmentText] = React.useState('');
  const hasCenteredRef = useRef(false);

  // Center the view when a new document is loaded
  useEffect(() => {
    if (document && containerRef.current && !hasCenteredRef.current) {
      const rootNode = document.nodes[document.rootId];
      if (rootNode) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // Calculate pan to center the root node
        const centerX = containerWidth / 2 - rootNode.size.w / 2;
        const centerY = containerHeight / 2 - rootNode.size.h / 2;

        setPan({ x: centerX, y: centerY });
        hasCenteredRef.current = true;
      }
    }
  }, [document, setPan]);

  // Reset centering flag when document changes
  useEffect(() => {
    hasCenteredRef.current = false;
  }, [document?.rootId]);

  // Handle wheel zoom
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = zoom;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - pan.x) / oldScale,
      y: (pointer.y - pan.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(0.1, Math.min(3, oldScale + direction * 0.1));

    setZoom(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setPan(newPos);
  };

  // Handle space + drag panning and Escape to cancel link creation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        isPanningRef.current = true;
        container.style.cursor = 'grab';
      }

      // Cancel editing with Escape
      if (e.code === 'Escape') {
        setEditingNodeId(null);
        setEditText('');
        setEditingAttachmentId(null);
        setEditAttachmentText('');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isPanningRef.current = false;
        container.style.cursor = 'default';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Ref to track if we're currently processing a file drop
  const isProcessingDropRef = useRef(false);
  const lastDropTimeRef = useRef(0);

  // Handle drag-and-drop for files using Tauri API
  useEffect(() => {
    let unlistenFileDragDrop: (() => void) | undefined;
    let unlistenFileDragOver: (() => void) | undefined;

    const setupFileDrop = async () => {
      console.log('[Canvas] Setting up Tauri file drop listener...');

      try {
        const { listen } = await import('@tauri-apps/api/event');

        // Listen for drag over events to ignore them
        unlistenFileDragOver = await listen('tauri://drag-enter', (event: any) => {
          console.log('[Canvas] Drag enter event (ignoring)');
        });

        // Listen for file drop events - Tauri v2 uses 'tauri://drag-drop'
        unlistenFileDragDrop = await listen('tauri://drag-drop', async (event: any) => {
          const now = Date.now();
          console.log('[Canvas] File drop event received, isProcessing:', isProcessingDropRef.current, 'timeSinceLastDrop:', now - lastDropTimeRef.current);

          // Prevent double processing - ignore events within 1 second of each other
          if (isProcessingDropRef.current || (now - lastDropTimeRef.current) < 1000) {
            console.log('[Canvas] Already processing a drop or too soon after last drop, ignoring');
            return;
          }

          lastDropTimeRef.current = now;

          const paths = event.payload.paths as string[];

          if (!paths || paths.length === 0) {
            console.log('[Canvas] No paths in drop event');
            return;
          }

          isProcessingDropRef.current = true;
          const filePath = paths[0];
          console.log('[Canvas] Processing file:', filePath);

          try {
            // Get file extension and name
            const fileName = filePath.split(/[/\\]/).pop() || 'file';
            const extension = fileName.split('.').pop()?.toLowerCase() || '';
            const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension);

            // Get center position
            const stage = stageRef.current;
            if (!stage) {
              console.log('[Canvas] No stage ref');
              return;
            }

            const stageBox = stage.container().getBoundingClientRect();
            const currentPan = useUIStore.getState().pan;
            const currentZoom = useUIStore.getState().zoom;
            const x = (stageBox.width / 2 - currentPan.x) / currentZoom;
            const y = (stageBox.height / 2 - currentPan.y) / currentZoom;

            console.log('[Canvas] Creating attachment at:', { x, y });

            if (isImage) {
              // For images, read and encode as base64
              const { readFile } = await import('@tauri-apps/plugin-fs');
              const fileData = await readFile(filePath);
              console.log('[Canvas] Image file read, size:', fileData.length);

              // Convert to base64
              const base64 = btoa(
                new Uint8Array(fileData).reduce((data, byte) => data + String.fromCharCode(byte), '')
              );

              const mimeType = extension === 'svg' ? 'image/svg+xml' : extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : `image/${extension}`;
              const dataUrl = `data:${mimeType};base64,${base64}`;

              const img = new Image();
              img.onload = () => {
                const displayWidth = Math.min(200, img.width);
                const displayHeight = (displayWidth / img.width) * img.height;

                useMindMapStore.getState().addAttachment({
                  type: 'image',
                  name: fileName,
                  data: dataUrl,
                  mimeType: mimeType,
                  pos: { x, y },
                  size: { w: displayWidth, h: displayHeight },
                });
                console.log('[Canvas] Image attachment created');
              };
              img.src = dataUrl;
            } else {
              // For documents, just store the file path
              useMindMapStore.getState().addAttachment({
                type: 'document',
                name: fileName,
                data: '', // Empty data for documents
                filePath: filePath, // Store the absolute path
                mimeType: 'application/octet-stream',
                pos: { x, y },
                size: { w: 80, h: 100 }, // Larger default size for documents
              });
              console.log('[Canvas] Document attachment created with path:', filePath);
            }
          } catch (error) {
            console.error('[Canvas] Error processing file:', error);
          } finally {
            // Reset processing flag after a short delay
            setTimeout(() => {
              isProcessingDropRef.current = false;
              console.log('[Canvas] Reset processing flag');
            }, 1000);
          }
        });

        console.log('[Canvas] File drop listener set up successfully');
      } catch (error) {
        console.error('[Canvas] Error setting up file drop:', error);
      }
    };

    setupFileDrop();

    return () => {
      if (unlistenFileDragDrop) {
        console.log('[Canvas] Cleaning up file drop listener');
        unlistenFileDragDrop();
      }
      if (unlistenFileDragOver) {
        console.log('[Canvas] Cleaning up drag over listener');
        unlistenFileDragOver();
      }
    };
  }, []); // Empty deps - only run once on mount!

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // Pan with space key, right click, or middle mouse button
    const isRightClick = e.evt.button === 2;
    const isMiddleClick = e.evt.button === 1;
    const shouldPan = isPanningRef.current || isRightClick || isMiddleClick;

    if (shouldPan) {
      e.evt.preventDefault();
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        lastPosRef.current = pos;
        isPanningRef.current = true;
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grabbing';
        }
      }
    }

    // Deselect node, edge, and attachment if clicking on background
    if (e.target === e.target.getStage()) {
      selectNode(null);
      selectEdge(null, null);
      selectAttachment(null);
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (isPanningRef.current) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        const dx = pos.x - lastPosRef.current.x;
        const dy = pos.y - lastPosRef.current.y;
        setPan({ x: pan.x + dx, y: pan.y + dy });
        lastPosRef.current = pos;
      }
    }
  };

  const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      if (containerRef.current) {
        containerRef.current.style.cursor = 'default';
      }
    }
  };

  // Handle double-click to create new node
  const handleDblClick = (e: KonvaEventObject<MouseEvent>) => {
    // Only create node if double-clicking on empty space
    if (e.target !== e.target.getStage()) return;

    const stage = e.target.getStage();
    if (!stage || !document) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Save current state before making changes
    pushHistory();

    // Convert screen coordinates to canvas coordinates
    const x = (pos.x - pan.x) / zoom;
    const y = (pos.y - pan.y) / zoom;

    // Create a new node at this position
    const newId = generateUUID();
    const defaultText = 'Nouveau nœud';
    const newNode: MindMapNode = {
      id: newId,
      text: defaultText,
      pos: { x, y },
      size: calculateTextSize(defaultText, 16, 'normal', 'normal', document?.theme?.node?.fontFamily),
      style: {},
      data: { notes: '', tags: [] },
      children: [],
    };

    const updatedNodes = { ...document.nodes };
    updatedNodes[newId] = newNode;

    // Don't add to any parent - standalone node for now
    updateDocument({ nodes: updatedNodes });
    selectNode(newId);
  };

  // Create child node with automatic positioning for multiple children
  const handleCreateChild = (parentId: string) => {
    if (!document) return;

    const parent = document.nodes[parentId];
    if (!parent) return;

    // Save current state before making changes
    pushHistory();

    const newId = generateUUID();

    // Calculate vertical position based on number of existing children
    const siblingCount = parent.children.length;
    const verticalSpacing = 80; // Space between siblings
    const yOffset = siblingCount * verticalSpacing;

    const defaultText = 'Nouveau nœud';
    const newNode: MindMapNode = {
      id: newId,
      text: defaultText,
      pos: {
        x: parent.pos.x + 220,
        y: parent.pos.y + yOffset
      },
      size: calculateTextSize(defaultText, 16, 'normal', 'normal', document?.theme?.node?.fontFamily),
      style: {},
      data: { notes: '', tags: [] },
      children: [],
    };

    const updatedNodes = { ...document.nodes };
    updatedNodes[newId] = newNode;
    updatedNodes[parentId] = {
      ...parent,
      children: [...parent.children, newId],
    };

    updateDocument({ nodes: updatedNodes });
    selectNode(newId);
  };

  // Handle node click
  const handleNodeClick = (e: KonvaEventObject<MouseEvent>, nodeId: string) => {
    selectNode(nodeId);
  };

  // Handle double-click on node to edit
  const handleNodeDblClick = (nodeId: string) => {
    const node = document?.nodes[nodeId];
    if (!node) return;

    // Save current state before editing
    pushHistory();

    setEditingNodeId(nodeId);
    setEditText(node.text);
  };

  // Calculate text size for auto-sizing nodes
  const calculateTextSize = (
    text: string,
    fontSize: number = 16,
    fontWeight: string = 'normal',
    fontStyle: string = 'normal',
    fontFamily?: string
  ): { w: number; h: number } => {
    // Create a temporary canvas to measure text
    const canvas = window.document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return { w: 180, h: 60 }; // Default size

    const family = fontFamily ?? document?.theme?.node?.fontFamily ?? 'system-ui, -apple-system, sans-serif';
    context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${family}`;

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

  // Save edited text and resize node
  const handleSaveEdit = () => {
    if (editingNodeId && editText.trim()) {
      const node = document?.nodes[editingNodeId];
      if (node) {
        const fontSize = node.style.fontSize ?? 16;
        const fontWeight = node.style.fontWeight ?? 'normal';
        const fontStyle = node.style.fontStyle ?? 'normal';
        const fontFamily = node.style.fontFamily ?? document?.theme?.node?.fontFamily;
        const newSize = calculateTextSize(editText.trim(), fontSize, fontWeight, fontStyle, fontFamily);
        updateNode(editingNodeId, {
          text: editText.trim(),
          size: newSize
        });
      }
    }
    setEditingNodeId(null);
    setEditText('');
  };

  if (!document) {
    return (
      <div className="canvas-container flex items-center justify-center">
        <p className="text-gray-500">Aucune carte ouverte</p>
      </div>
    );
  }

  const nodes = Object.values(document.nodes);
  const theme = document.theme;

  // Determine which nodes are visible (not hidden by a collapsed parent)
  const getVisibleNodes = (): MindMapNode[] => {
    const visibleNodeIds = new Set<string>();

    // Helper function to check if a node should be visible
    const isNodeVisible = (nodeId: string, visited = new Set<string>()): boolean => {
      if (visited.has(nodeId)) return false; // Avoid circular references
      visited.add(nodeId);

      const node = document.nodes[nodeId];
      if (!node) return false;

      // Root node is always visible
      if (nodeId === document.rootId) return true;

      // Find parent
      const parent = nodes.find(n => n.children.includes(nodeId));
      if (!parent) return true; // Orphan nodes are visible

      // If parent is collapsed, this node is not visible
      if (parent.collapsed) return false;

      // Check if parent is visible recursively
      return isNodeVisible(parent.id, visited);
    };

    // Build set of visible nodes
    nodes.forEach(node => {
      if (isNodeVisible(node.id)) {
        visibleNodeIds.add(node.id);
      }
    });

    return nodes.filter(node => visibleNodeIds.has(node.id));
  };

  const visibleNodes = getVisibleNodes();

  // Calculate smooth connection points based on angle between node centers
  const getConnectionPoints = (
    parent: MindMapNode,
    child: MindMapNode
  ): { startX: number; startY: number; endX: number; endY: number } => {
    const parentCenterX = parent.pos.x + parent.size.w / 2;
    const parentCenterY = parent.pos.y + parent.size.h / 2;
    const childCenterX = child.pos.x + child.size.w / 2;
    const childCenterY = child.pos.y + child.size.h / 2;

    // Calculate angle from parent to child
    const dx = childCenterX - parentCenterX;
    const dy = childCenterY - parentCenterY;
    const angle = Math.atan2(dy, dx);

    // Function to get intersection point with rectangle edge based on angle
    const getEdgePoint = (
      centerX: number,
      centerY: number,
      width: number,
      height: number,
      angle: number
    ): { x: number; y: number } => {
      const halfW = width / 2;
      const halfH = height / 2;

      // Normalize angle to 0-2π
      let normalizedAngle = angle;
      while (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
      while (normalizedAngle >= Math.PI * 2) normalizedAngle -= Math.PI * 2;

      const cos = Math.cos(normalizedAngle);
      const sin = Math.sin(normalizedAngle);

      // Calculate intersection with all four edges and pick the closest
      let x: number, y: number;

      // Calculate the parametric t for intersection with each edge
      const tRight = cos > 0 ? halfW / cos : Infinity;
      const tLeft = cos < 0 ? -halfW / cos : Infinity;
      const tBottom = sin > 0 ? halfH / sin : Infinity;
      const tTop = sin < 0 ? -halfH / sin : Infinity;

      // Find minimum positive t (closest intersection)
      const t = Math.min(tRight, tLeft, tBottom, tTop);

      x = centerX + t * cos;
      y = centerY + t * sin;

      // Final safety clamp
      x = Math.max(centerX - halfW, Math.min(centerX + halfW, x));
      y = Math.max(centerY - halfH, Math.min(centerY + halfH, y));

      return { x, y };
    };

    // Get start point on parent (facing child)
    const startPoint = getEdgePoint(
      parentCenterX,
      parentCenterY,
      parent.size.w,
      parent.size.h,
      angle
    );

    // Get end point on child (facing parent - opposite angle)
    const endPoint = getEdgePoint(
      childCenterX,
      childCenterY,
      child.size.w,
      child.size.h,
      angle + Math.PI // Opposite direction
    );

    return {
      startX: startPoint.x,
      startY: startPoint.y,
      endX: endPoint.x,
      endY: endPoint.y,
    };
  };


  // Generate edge path based on style
  const generateEdgePath = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    style: string
  ): number[] => {
    switch (style) {
      case 'straight':
        return [startX, startY, endX, endY];

      case 'smooth':
        // Smooth curve with two control points
        const dx = endX - startX;
        const dy = endY - startY;
        const offsetX = Math.abs(dx) * 0.5;
        const cp1X = startX + offsetX;
        const cp1Y = startY;
        const cp2X = endX - offsetX;
        const cp2Y = endY;
        return [startX, startY, cp1X, cp1Y, cp2X, cp2Y, endX, endY];

      default:
        return [startX, startY, endX, endY];
    }
  };

  // Render edges with smart connections
  const edges: JSX.Element[] = [];
  const defaultEdgeStyle = theme.edge?.style || 'smooth';
  const defaultEdgeWidth = theme.edge?.width || 2;
  const defaultEdgeColor = theme.edge?.color || theme.node.border;

  // Create a set of visible node IDs for quick lookup
  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

  visibleNodes.forEach((node) => {
    node.children.forEach((childId) => {
      const child = document.nodes[childId];
      // Only render edge if child is also visible
      if (child && visibleNodeIds.has(childId)) {
        const { startX, startY, endX, endY } = getConnectionPoints(node, child);

        // Get edge style from document.edges using the key "parentId->childId"
        const edgeKey = `${node.id}->${childId}`;
        const edgeStyleData = document.edges?.[edgeKey];

        // Use individual edge style if defined, otherwise use theme default
        const edgeStyle = edgeStyleData?.style || defaultEdgeStyle;
        const edgeWidth = edgeStyleData?.width || defaultEdgeWidth;
        const edgeColor = edgeStyleData?.color || defaultEdgeColor;

        const points = generateEdgePath(startX, startY, endX, endY, edgeStyle);

        // Check if this edge is selected
        const isEdgeSelected =
          selectedEdge?.parentId === node.id && selectedEdge?.childId === childId;

        edges.push(
          <Line
            key={`edge-${node.id}-${childId}`}
            points={points}
            stroke={isEdgeSelected ? '#3b82f6' : edgeColor}
            strokeWidth={isEdgeSelected ? edgeWidth + 2 : edgeWidth}
            lineCap="round"
            lineJoin="round"
            tension={edgeStyle === 'smooth' ? 0.4 : 0}
            bezier={edgeStyle === 'smooth'}
            hitStrokeWidth={20}
            onClick={(e) => {
              e.cancelBubble = true;
              selectEdge(node.id, childId);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              selectEdge(node.id, childId);
            }}
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container();
              if (container) container.style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container();
              if (container) container.style.cursor = 'default';
            }}
          />
        );
      }
    });
  });


  return (
    <div ref={containerRef} className="canvas-container relative">
      {/* Text editing input for nodes */}
      {editingNodeId && document?.nodes[editingNodeId] && (
        <div
          className="absolute z-50"
          style={{
            left: `${document.nodes[editingNodeId].pos.x * zoom + pan.x}px`,
            top: `${document.nodes[editingNodeId].pos.y * zoom + pan.y}px`,
            width: `${document.nodes[editingNodeId].size.w * zoom}px`,
            height: `${document.nodes[editingNodeId].size.h * zoom}px`,
          }}
        >
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveEdit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setEditingNodeId(null);
                setEditText('');
              }
              // Allow normal text editing keys to propagate
              e.stopPropagation();
            }}
            onBlur={handleSaveEdit}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            autoFocus
            className="w-full h-full px-3 text-center border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            style={{
              fontSize: `${(document.nodes[editingNodeId].style.fontSize ?? 16) * zoom}px`,
              fontWeight: document.nodes[editingNodeId].style.fontWeight ?? 'normal',
              fontStyle: document.nodes[editingNodeId].style.fontStyle ?? 'normal',
              backgroundColor: document.nodes[editingNodeId].style.bg ?? document.theme.node.bg,
              color: document.nodes[editingNodeId].style.fg ?? document.theme.node.fg,
              borderColor: '#3b82f6',
              borderRadius: document.theme.node.shape === 'pill' ? `${document.nodes[editingNodeId].size.h / 2}px` : '8px',
            }}
          />
        </div>
      )}

      {/* Text editing input for attachments */}
      {editingAttachmentId && document?.attachments?.[editingAttachmentId] && (
        <div
          className="absolute z-50"
          style={{
            left: `${document.attachments[editingAttachmentId].pos.x * zoom + pan.x}px`,
            top: `${document.attachments[editingAttachmentId].pos.y * zoom + pan.y}px`,
            width: `${document.attachments[editingAttachmentId].size.w * zoom}px`,
            height: `${document.attachments[editingAttachmentId].size.h * zoom}px`,
          }}
        >
          <textarea
            value={editAttachmentText}
            onChange={(e) => setEditAttachmentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setEditingAttachmentId(null);
                setEditAttachmentText('');
              }
              e.stopPropagation();
            }}
            onBlur={() => {
              if (editAttachmentText.trim()) {
                pushHistory();
                updateAttachment(editingAttachmentId, {
                  text: editAttachmentText.trim(),
                  data: editAttachmentText.trim(),
                });
              }
              setEditingAttachmentId(null);
              setEditAttachmentText('');
            }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            autoFocus
            className="w-full h-full px-2 py-2 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            style={{
              fontSize: `${(document.attachments[editingAttachmentId].fontSize ?? 16) * zoom}px`,
              fontWeight: document.attachments[editingAttachmentId].fontWeight ?? 'normal',
              fontStyle: document.attachments[editingAttachmentId].fontStyle ?? 'normal',
              backgroundColor: document.attachments[editingAttachmentId].backgroundColor ?? 'transparent',
              color: document.attachments[editingAttachmentId].textColor ?? '#000000',
            }}
          />
        </div>
      )}

      <Stage
        ref={stageRef}
        width={containerRef.current?.clientWidth ?? 800}
        height={containerRef.current?.clientHeight ?? 600}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDblClick}
        onContextMenu={(e) => e.evt.preventDefault()}
        draggable={false}
      >
        <Layer>
          {/* Edges */}
          {edges}

          {/* Nodes */}
          {visibleNodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const bgColor = node.style.bg ?? theme.node.bg;
            const fgColor = node.style.fg ?? theme.node.fg;
            const borderColor = node.style.border ?? theme.node.border;
            const fontSize = node.style.fontSize ?? 16;
            const fontWeight = node.style.fontWeight ?? 'normal';
            const fontStyle = node.style.fontStyle ?? 'normal';
            const fontFamily = node.style.fontFamily ?? theme.node.fontFamily ?? 'system-ui, -apple-system, sans-serif';

            return (
              <Group key={node.id}>
                {/* Main node */}
                <Group
                  x={node.pos.x}
                  y={node.pos.y}
                  draggable
                  onDragStart={() => {
                    // Save current state before starting drag
                    pushHistory();
                  }}
                  onDragMove={(e) => {
                    // Update node position in real-time during drag for smooth edge updates
                    updateNode(node.id, {
                      pos: { x: e.target.x(), y: e.target.y() },
                    });
                  }}
                  onDragEnd={(e) => {
                    // Final position update (already done in onDragMove)
                  }}
                  onClick={(e: any) => handleNodeClick(e, node.id)}
                  onTap={(e: any) => handleNodeClick(e, node.id)}
                  onDblClick={() => handleNodeDblClick(node.id)}
                  onDblTap={() => handleNodeDblClick(node.id)}
                >
                  <Rect
                    width={node.size.w}
                    height={node.size.h}
                    fill={bgColor}
                    stroke={isSelected ? '#3b82f6' : borderColor}
                    strokeWidth={isSelected ? 3 : 2}
                    cornerRadius={theme.node.shape === 'pill' ? node.size.h / 2 : 8}
                    shadowColor="rgba(0,0,0,0.1)"
                    shadowBlur={4}
                    shadowOffsetY={2}
                  />

                  <Text
                    width={node.size.w}
                    height={node.size.h}
                    text={node.text}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    fontStyle={fontWeight === 'bold' && fontStyle === 'italic' ? 'bold italic' : fontWeight === 'bold' ? 'bold' : fontStyle}
                    fill={fgColor}
                    align="center"
                    verticalAlign="middle"
                    padding={12}
                    listening={false}
                  />
                </Group>

                {/* Collapse/Expand button - always show if node has children */}
                {node.children.length > 0 && (
                  <Group
                    x={node.pos.x + node.size.w + 8}
                    y={node.pos.y + node.size.h / 2 - 12}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      pushHistory();
                      updateNode(node.id, {
                        collapsed: !node.collapsed,
                      });
                    }}
                    onMouseEnter={(e) => {
                      const container = e.target.getStage()?.container();
                      if (container) container.style.cursor = 'pointer';
                    }}
                    onMouseLeave={(e) => {
                      const container = e.target.getStage()?.container();
                      if (container) container.style.cursor = 'default';
                    }}
                  >
                    <Circle radius={12} fill={node.collapsed ? "#10b981" : "#6366f1"} />
                    <Text
                      x={-6}
                      y={-8}
                      text={node.collapsed ? "+" : "−"}
                      fontSize={18}
                      fill="white"
                      fontStyle="bold"
                      listening={false}
                    />
                  </Group>
                )}

                {/* Action buttons and resize handles - only show for selected node */}
                {isSelected && (
                  <>
                    {/* Add child button (right side, offset if collapse button exists) */}
                    <Group
                      x={node.pos.x + node.size.w + (node.children.length > 0 ? 40 : 8)}
                      y={node.pos.y + node.size.h / 2 - 12}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        handleCreateChild(node.id);
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'pointer';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                    >
                      <Circle radius={12} fill="#3b82f6" />
                      <Text
                        x={-6}
                        y={-8}
                        text="+"
                        fontSize={18}
                        fill="white"
                        fontStyle="bold"
                        listening={false}
                      />
                    </Group>

                    {/* Resize handles (8 corners and sides) */}
                    {/* Top-left corner */}
                    <Circle
                      x={node.pos.x}
                      y={node.pos.y}
                      radius={6}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      draggable
                      onDragStart={() => pushHistory()}
                      onDragMove={(e) => {
                        const deltaX = e.target.x() - node.pos.x;
                        const deltaY = e.target.y() - node.pos.y;
                        updateNode(node.id, {
                          pos: { x: node.pos.x + deltaX, y: node.pos.y + deltaY },
                          size: { w: Math.max(80, node.size.w - deltaX), h: Math.max(40, node.size.h - deltaY) },
                        });
                        e.target.x(node.pos.x);
                        e.target.y(node.pos.y);
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'nwse-resize';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                    />

                    {/* Top-right corner */}
                    <Circle
                      x={node.pos.x + node.size.w}
                      y={node.pos.y}
                      radius={6}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      draggable
                      onDragStart={() => pushHistory()}
                      onDragMove={(e) => {
                        const deltaX = e.target.x() - (node.pos.x + node.size.w);
                        const deltaY = e.target.y() - node.pos.y;
                        updateNode(node.id, {
                          pos: { x: node.pos.x, y: node.pos.y + deltaY },
                          size: { w: Math.max(80, node.size.w + deltaX), h: Math.max(40, node.size.h - deltaY) },
                        });
                        e.target.x(node.pos.x + node.size.w);
                        e.target.y(node.pos.y);
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'nesw-resize';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                    />

                    {/* Bottom-left corner */}
                    <Circle
                      x={node.pos.x}
                      y={node.pos.y + node.size.h}
                      radius={6}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      draggable
                      onDragStart={() => pushHistory()}
                      onDragMove={(e) => {
                        const deltaX = e.target.x() - node.pos.x;
                        const deltaY = e.target.y() - (node.pos.y + node.size.h);
                        updateNode(node.id, {
                          pos: { x: node.pos.x + deltaX, y: node.pos.y },
                          size: { w: Math.max(80, node.size.w - deltaX), h: Math.max(40, node.size.h + deltaY) },
                        });
                        e.target.x(node.pos.x);
                        e.target.y(node.pos.y + node.size.h);
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'nesw-resize';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                    />

                    {/* Bottom-right corner */}
                    <Circle
                      x={node.pos.x + node.size.w}
                      y={node.pos.y + node.size.h}
                      radius={6}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      draggable
                      onDragStart={() => pushHistory()}
                      onDragMove={(e) => {
                        const deltaX = e.target.x() - (node.pos.x + node.size.w);
                        const deltaY = e.target.y() - (node.pos.y + node.size.h);
                        updateNode(node.id, {
                          size: { w: Math.max(80, node.size.w + deltaX), h: Math.max(40, node.size.h + deltaY) },
                        });
                        e.target.x(node.pos.x + node.size.w);
                        e.target.y(node.pos.y + node.size.h);
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'nwse-resize';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                    />

                    {/* Right side handle */}
                    <Circle
                      x={node.pos.x + node.size.w}
                      y={node.pos.y + node.size.h / 2}
                      radius={6}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      draggable
                      onDragStart={() => pushHistory()}
                      onDragMove={(e) => {
                        const deltaX = e.target.x() - (node.pos.x + node.size.w);
                        updateNode(node.id, {
                          size: { w: Math.max(80, node.size.w + deltaX), h: node.size.h },
                        });
                        e.target.x(node.pos.x + node.size.w);
                        e.target.y(node.pos.y + node.size.h / 2);
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'ew-resize';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                    />

                    {/* Left side handle */}
                    <Circle
                      x={node.pos.x}
                      y={node.pos.y + node.size.h / 2}
                      radius={6}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      draggable
                      onDragStart={() => pushHistory()}
                      onDragMove={(e) => {
                        const deltaX = e.target.x() - node.pos.x;
                        updateNode(node.id, {
                          pos: { x: node.pos.x + deltaX, y: node.pos.y },
                          size: { w: Math.max(80, node.size.w - deltaX), h: node.size.h },
                        });
                        e.target.x(node.pos.x);
                        e.target.y(node.pos.y + node.size.h / 2);
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'ew-resize';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                    />

                    {/* Top side handle */}
                    <Circle
                      x={node.pos.x + node.size.w / 2}
                      y={node.pos.y}
                      radius={6}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      draggable
                      onDragStart={() => pushHistory()}
                      onDragMove={(e) => {
                        const deltaY = e.target.y() - node.pos.y;
                        updateNode(node.id, {
                          pos: { x: node.pos.x, y: node.pos.y + deltaY },
                          size: { w: node.size.w, h: Math.max(40, node.size.h - deltaY) },
                        });
                        e.target.x(node.pos.x + node.size.w / 2);
                        e.target.y(node.pos.y);
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'ns-resize';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                    />

                    {/* Bottom side handle */}
                    <Circle
                      x={node.pos.x + node.size.w / 2}
                      y={node.pos.y + node.size.h}
                      radius={6}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      draggable
                      onDragStart={() => pushHistory()}
                      onDragMove={(e) => {
                        const deltaY = e.target.y() - (node.pos.y + node.size.h);
                        updateNode(node.id, {
                          size: { w: node.size.w, h: Math.max(40, node.size.h + deltaY) },
                        });
                        e.target.x(node.pos.x + node.size.w / 2);
                        e.target.y(node.pos.y + node.size.h);
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'ns-resize';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                    />
                  </>
                )}
              </Group>
            );
          })}

          {/* Free Attachments - sorted by zIndex */}
          {document.attachments && Object.values(document.attachments)
            .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
            .map((attachment) => (
              <FreeAttachment
                key={attachment.id}
                attachment={attachment}
                isSelected={attachment.id === selectedAttachmentId}
                isEditing={attachment.id === editingAttachmentId}
                onSelect={() => selectAttachment(attachment.id)}
                onUpdate={(updates) => updateAttachment(attachment.id, updates)}
                onDelete={() => deleteAttachment(attachment.id)}
                onDragStart={() => pushHistory()}
                onTextEdit={(attachmentId) => {
                  setEditingAttachmentId(attachmentId);
                  const att = document.attachments?.[attachmentId];
                  setEditAttachmentText(att?.text || att?.data || '');
                }}
              />
            ))}
        </Layer>
      </Stage>
    </div>
  );
}
