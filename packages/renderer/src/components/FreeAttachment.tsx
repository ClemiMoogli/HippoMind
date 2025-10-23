/**
 * Component for rendering and interacting with free-floating attachments
 */

import React from 'react';
import { Group, Rect, Text, Line, Circle, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import type { MindMapAttachment } from '@shared';

interface FreeAttachmentProps {
  attachment: MindMapAttachment;
  isSelected: boolean;
  isEditing?: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<MindMapAttachment>) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onTextEdit?: (attachmentId: string) => void;
}

export function FreeAttachment({
  attachment,
  isSelected,
  isEditing = false,
  onSelect,
  onUpdate,
  onDelete,
  onDragStart,
  onTextEdit
}: FreeAttachmentProps) {
  const [image] = useImage(attachment.type === 'image' ? attachment.data : '');
  const rotation = attachment.rotation || 0;

  // Render rotation handle for shapes
  const renderRotationHandle = () => {
    if (!isSelected || attachment.type !== 'shape') return null;

    const centerX = attachment.size.w / 2;
    const centerY = attachment.size.h / 2;
    const handleDistance = 60; // Distance from center to rotation handle

    // Calculate handle position based on current rotation
    const angleRad = (rotation - 90) * (Math.PI / 180);
    const handleX = centerX + handleDistance * Math.cos(angleRad);
    const handleY = centerY + handleDistance * Math.sin(angleRad);

    return (
      <Group>
        {/* Line from shape center to handle */}
        <Line
          points={[centerX, centerY, handleX, handleY]}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[4, 4]}
          listening={false}
        />
        {/* Rotation handle */}
        <Circle
          x={handleX}
          y={handleY}
          radius={10}
          fill="white"
          stroke="#3b82f6"
          strokeWidth={2}
          draggable
          onDragStart={(e) => {
            e.cancelBubble = true;
          }}
          onDragMove={(e) => {
            e.cancelBubble = true;

            // Get current mouse position relative to shape center
            const dx = e.target.x() - centerX;
            const dy = e.target.y() - centerY;

            // Calculate angle in degrees
            let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

            // Normalize angle to 0-360 range
            if (angle < 0) angle += 360;
            if (angle >= 360) angle -= 360;

            onUpdate({ rotation: angle });

            // Reposition handle on circle to keep it at constant distance
            const distance = handleDistance;
            const rad = (angle - 90) * (Math.PI / 180);
            e.target.x(centerX + distance * Math.cos(rad));
            e.target.y(centerY + distance * Math.sin(rad));
          }}
          onDragEnd={(e) => {
            e.cancelBubble = true;
          }}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'grab';
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'default';
          }}
        />
      </Group>
    );
  };

  // Handle double-click to open documents
  const handleDocumentDoubleClick = async (e: any) => {
    e.cancelBubble = true;
    console.log('[FreeAttachment] Double click - opening file:', attachment.name);

    try {
      // If we have a filePath, open it directly
      if (attachment.filePath) {
        console.log('[FreeAttachment] Opening file from path:', attachment.filePath);
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('open_file_with_default_app', { filePath: attachment.filePath });
        console.log('[FreeAttachment] File opened successfully');
      } else if (attachment.data && attachment.data.startsWith('data:')) {
        // Legacy support: if we have base64 data, write to temp and open
        console.log('[FreeAttachment] Opening file from base64 data (legacy)');
        const { BaseDirectory, writeFile } = await import('@tauri-apps/plugin-fs');

        const base64Data = attachment.data.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const tempFileName = `localmind-temp-${Date.now()}-${attachment.name}`;
        await writeFile(tempFileName, bytes, { baseDir: BaseDirectory.Temp });

        const { join, tempDir } = await import('@tauri-apps/api/path');
        const tempPath = await join(await tempDir(), tempFileName);

        console.log('[FreeAttachment] Opening with system app:', tempPath);
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('open_file_with_default_app', { filePath: tempPath });
        console.log('[FreeAttachment] File opened successfully');
      } else {
        console.error('[FreeAttachment] No file path or data available');
        // Use console.error instead of alert since dialog permissions might not be granted
      }
    } catch (error) {
      console.error('[FreeAttachment] Error opening document:', error);
      // Log to console instead of showing alert
    }
  };

  // Render different content based on attachment type
  const renderContent = () => {
    if (attachment.type === 'image') {
      return (
        <>
          {/* Image */}
          {image && (
            <>
              <KonvaImage
                image={image}
                width={attachment.size.w}
                height={attachment.size.h}
              />
              {/* Selection border */}
              {isSelected && (
                <Rect
                  x={0}
                  y={0}
                  width={attachment.size.w}
                  height={attachment.size.h}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  listening={false}
                />
              )}
              {/* Resize handle (bottom-right) */}
              {isSelected && (
                <Circle
                  x={attachment.size.w}
                  y={attachment.size.h}
                  radius={8}
                  fill="white"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  draggable
                  onDragStart={(e) => {
                    e.cancelBubble = true;
                  }}
                  onDragMove={(e) => {
                    e.cancelBubble = true;
                    const newWidth = Math.max(80, e.target.x());
                    const newHeight = Math.max(60, e.target.y());
                    onUpdate({
                      size: { w: newWidth, h: newHeight },
                    });
                    // Keep handle at corner
                    e.target.x(attachment.size.w);
                    e.target.y(attachment.size.h);
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
              )}
            </>
          )}
        </>
      );
    } else if (attachment.type === 'document') {
      // Scale document icon to fit the attachment size while maintaining aspect ratio
      const iconWidth = attachment.size.w;
      const iconHeight = attachment.size.h * 0.75; // 75% for icon, 25% for text
      const scale = Math.min(iconWidth / 64, iconHeight / 72);
      const scaledWidth = 64 * scale;
      const scaledHeight = 72 * scale;

      return (
        <>
          {/* Document Icon */}
          <Rect
            width={scaledWidth}
            height={scaledHeight}
            fill="#f3f4f6"
            stroke={isSelected ? '#3b82f6' : '#9ca3af'}
            strokeWidth={isSelected ? 3 : 2}
            cornerRadius={4 * scale}
          />
          {/* Folded corner */}
          <Line
            points={[
              46 * scale, 0,
              64 * scale, 18 * scale,
              46 * scale, 18 * scale,
              46 * scale, 0
            ]}
            fill="#e5e7eb"
            closed
            stroke={isSelected ? '#3b82f6' : '#9ca3af'}
            strokeWidth={1}
          />
          {/* Document lines */}
          <Line
            points={[16 * scale, 28 * scale, 48 * scale, 28 * scale]}
            stroke="#6b7280"
            strokeWidth={2 * scale}
          />
          <Line
            points={[16 * scale, 38 * scale, 48 * scale, 38 * scale]}
            stroke="#6b7280"
            strokeWidth={2 * scale}
          />
          <Line
            points={[16 * scale, 48 * scale, 36 * scale, 48 * scale]}
            stroke="#6b7280"
            strokeWidth={2 * scale}
          />
          {/* File name */}
          <Text
            y={scaledHeight + 4}
            width={attachment.size.w}
            text={attachment.name}
            fontSize={Math.max(10, 11 * scale)}
            fill="#374151"
            align="center"
            wrap="word"
            ellipsis
          />
          {/* Resize handle */}
          {isSelected && (
            <Circle
              x={attachment.size.w}
              y={attachment.size.h}
              radius={8}
              fill="white"
              stroke="#3b82f6"
              strokeWidth={2}
              draggable
              onDragStart={(e) => {
                e.cancelBubble = true;
              }}
              onDragMove={(e) => {
                e.cancelBubble = true;
                const newWidth = Math.max(60, e.target.x());
                const newHeight = Math.max(80, e.target.y());
                onUpdate({
                  size: { w: newWidth, h: newHeight },
                });
                e.target.x(attachment.size.w);
                e.target.y(attachment.size.h);
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
          )}
        </>
      );
    } else if (attachment.type === 'text') {
      return (
        <>
          {/* Text background */}
          <Rect
            width={attachment.size.w}
            height={attachment.size.h}
            fill={attachment.backgroundColor || 'transparent'}
            stroke={isSelected ? '#3b82f6' : 'transparent'}
            strokeWidth={isSelected ? 2 : 0}
            cornerRadius={4}
          />
          {/* Text content - hide during editing to avoid duplication */}
          {!isEditing && (
            <Text
              width={attachment.size.w}
              height={attachment.size.h}
              text={attachment.text || attachment.data}
              fontSize={attachment.fontSize || 16}
              fontFamily={attachment.fontFamily || 'system-ui, -apple-system, sans-serif'}
              fontStyle={attachment.fontWeight === 'bold' && attachment.fontStyle === 'italic' ? 'bold italic' : attachment.fontWeight === 'bold' ? 'bold' : attachment.fontStyle || 'normal'}
              fill={attachment.textColor || '#000000'}
              align="left"
              verticalAlign="top"
              padding={8}
              wrap="word"
              listening={false}
            />
          )}
          {/* Resize handle */}
          {isSelected && !isEditing && (
            <Circle
              x={attachment.size.w}
              y={attachment.size.h}
              radius={8}
              fill="white"
              stroke="#3b82f6"
              strokeWidth={2}
              draggable
              onDragStart={(e) => {
                e.cancelBubble = true;
              }}
              onDragMove={(e) => {
                e.cancelBubble = true;
                const newWidth = Math.max(100, e.target.x());
                const newHeight = Math.max(60, e.target.y());
                onUpdate({
                  size: { w: newWidth, h: newHeight },
                });
                e.target.x(attachment.size.w);
                e.target.y(attachment.size.h);
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
          )}
        </>
      );
    } else if (attachment.type === 'shape') {
      const shapeType = attachment.shapeType || 'rectangle';
      const fillColor = attachment.fillColor || '#e0e0e0';
      const strokeColor = attachment.strokeColor || '#666666';
      const strokeWidth = attachment.strokeWidth || 2;

      if (shapeType === 'rectangle') {
        return (
          <>
            <Rect
              width={attachment.size.w}
              height={attachment.size.h}
              fill={fillColor}
              stroke={isSelected ? '#3b82f6' : strokeColor}
              strokeWidth={isSelected ? strokeWidth + 1 : strokeWidth}
              cornerRadius={8}
            />
            {/* Resize handle */}
            {isSelected && (
              <Circle
                x={attachment.size.w}
                y={attachment.size.h}
                radius={8}
                fill="white"
                stroke="#3b82f6"
                strokeWidth={2}
                draggable
                onDragStart={(e) => {
                  e.cancelBubble = true;
                }}
                onDragMove={(e) => {
                  e.cancelBubble = true;
                  const newWidth = Math.max(50, e.target.x());
                  const newHeight = Math.max(50, e.target.y());
                  onUpdate({
                    size: { w: newWidth, h: newHeight },
                  });
                  e.target.x(attachment.size.w);
                  e.target.y(attachment.size.h);
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
            )}
          </>
        );
      } else if (shapeType === 'circle') {
        const radius = Math.min(attachment.size.w, attachment.size.h) / 2;
        return (
          <>
            <Circle
              x={attachment.size.w / 2}
              y={attachment.size.h / 2}
              radius={radius}
              fill={fillColor}
              stroke={isSelected ? '#3b82f6' : strokeColor}
              strokeWidth={isSelected ? strokeWidth + 1 : strokeWidth}
            />
            {/* Resize handle */}
            {isSelected && (
              <Circle
                x={attachment.size.w}
                y={attachment.size.h}
                radius={8}
                fill="white"
                stroke="#3b82f6"
                strokeWidth={2}
                draggable
                onDragStart={(e) => {
                  e.cancelBubble = true;
                }}
                onDragMove={(e) => {
                  e.cancelBubble = true;
                  const newSize = Math.max(50, Math.max(e.target.x(), e.target.y()));
                  onUpdate({
                    size: { w: newSize, h: newSize },
                  });
                  e.target.x(attachment.size.w);
                  e.target.y(attachment.size.h);
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
            )}
          </>
        );
      } else if (shapeType === 'triangle') {
        return (
          <>
            <Line
              points={[
                attachment.size.w / 2, 0,
                attachment.size.w, attachment.size.h,
                0, attachment.size.h,
                attachment.size.w / 2, 0
              ]}
              fill={fillColor}
              stroke={isSelected ? '#3b82f6' : strokeColor}
              strokeWidth={isSelected ? strokeWidth + 1 : strokeWidth}
              closed
            />
            {/* Resize handle */}
            {isSelected && (
              <Circle
                x={attachment.size.w}
                y={attachment.size.h}
                radius={8}
                fill="white"
                stroke="#3b82f6"
                strokeWidth={2}
                draggable
                onDragStart={(e) => {
                  e.cancelBubble = true;
                }}
                onDragMove={(e) => {
                  e.cancelBubble = true;
                  const newWidth = Math.max(50, e.target.x());
                  const newHeight = Math.max(50, e.target.y());
                  onUpdate({
                    size: { w: newWidth, h: newHeight },
                  });
                  e.target.x(attachment.size.w);
                  e.target.y(attachment.size.h);
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
            )}
          </>
        );
      } else if (shapeType === 'star') {
        // Simple 5-point star
        const outerRadius = Math.min(attachment.size.w, attachment.size.h) / 2;
        const innerRadius = outerRadius * 0.5;
        const points = [];
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          points.push(attachment.size.w / 2 + radius * Math.cos(angle));
          points.push(attachment.size.h / 2 + radius * Math.sin(angle));
        }
        return (
          <>
            <Line
              points={points}
              fill={fillColor}
              stroke={isSelected ? '#3b82f6' : strokeColor}
              strokeWidth={isSelected ? strokeWidth + 1 : strokeWidth}
              closed
            />
            {/* Resize handle */}
            {isSelected && (
              <Circle
                x={attachment.size.w}
                y={attachment.size.h}
                radius={8}
                fill="white"
                stroke="#3b82f6"
                strokeWidth={2}
                draggable
                onDragStart={(e) => {
                  e.cancelBubble = true;
                }}
                onDragMove={(e) => {
                  e.cancelBubble = true;
                  const newSize = Math.max(50, Math.max(e.target.x(), e.target.y()));
                  onUpdate({
                    size: { w: newSize, h: newSize },
                  });
                  e.target.x(attachment.size.w);
                  e.target.y(attachment.size.h);
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
            )}
          </>
        );
      } else if (shapeType === 'arrow') {
        return (
          <>
            <Line
              points={[
                0, attachment.size.h / 2,
                attachment.size.w * 0.7, attachment.size.h / 2,
                attachment.size.w * 0.7, 0,
                attachment.size.w, attachment.size.h / 2,
                attachment.size.w * 0.7, attachment.size.h,
                attachment.size.w * 0.7, attachment.size.h / 2
              ]}
              fill={fillColor}
              stroke={isSelected ? '#3b82f6' : strokeColor}
              strokeWidth={isSelected ? strokeWidth + 1 : strokeWidth}
              closed
            />
            {/* Resize handle */}
            {isSelected && (
              <Circle
                x={attachment.size.w}
                y={attachment.size.h}
                radius={8}
                fill="white"
                stroke="#3b82f6"
                strokeWidth={2}
                draggable
                onDragStart={(e) => {
                  e.cancelBubble = true;
                }}
                onDragMove={(e) => {
                  e.cancelBubble = true;
                  const newWidth = Math.max(60, e.target.x());
                  const newHeight = Math.max(40, e.target.y());
                  onUpdate({
                    size: { w: newWidth, h: newHeight },
                  });
                  e.target.x(attachment.size.w);
                  e.target.y(attachment.size.h);
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
            )}
          </>
        );
      }

      return null;
    }

    return null;
  };

  return (
    <Group
      x={attachment.pos.x}
      y={attachment.pos.y}
      draggable={!isEditing}
      onDragStart={() => {
        if (!isEditing) {
          onDragStart();
        }
      }}
      onDragMove={(e) => {
        if (!isEditing) {
          onUpdate({
            pos: { x: e.target.x(), y: e.target.y() },
          });
        }
      }}
      onClick={(e: any) => {
        e.cancelBubble = true;
        console.log('[FreeAttachment] Single click on attachment:', attachment.type, 'isEditing:', isEditing);
        if (!isEditing) {
          onSelect();
        }
      }}
      onDblClick={(e: any) => {
        e.cancelBubble = true;
        console.log('[FreeAttachment] Double click on attachment:', attachment.type);
        if (attachment.type === 'document') {
          handleDocumentDoubleClick(e);
        } else if (attachment.type === 'text' && onTextEdit) {
          console.log('[FreeAttachment] Triggering text edit for:', attachment.id);
          onTextEdit(attachment.id);
        }
      }}
    >
      {/* Rotatable content group for shapes */}
      <Group
        rotation={attachment.type === 'shape' ? rotation : 0}
        offsetX={attachment.type === 'shape' ? attachment.size.w / 2 : 0}
        offsetY={attachment.type === 'shape' ? attachment.size.h / 2 : 0}
        x={attachment.type === 'shape' ? attachment.size.w / 2 : 0}
        y={attachment.type === 'shape' ? attachment.size.h / 2 : 0}
      >
        {renderContent()}
      </Group>

      {/* Rotation handle */}
      {renderRotationHandle()}

      {/* Delete button for selected attachment */}
      {isSelected && (
        <Group
          x={attachment.type === 'image' ? attachment.size.w - 10 : 54}
          y={-10}
          onClick={(e) => {
            e.cancelBubble = true;
            onDelete();
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
          <Circle
            radius={12}
            fill="#ef4444"
          />
          <Text
            x={-6}
            y={-9}
            text="×"
            fontSize={18}
            fill="white"
            fontStyle="bold"
            listening={false}
          />
        </Group>
      )}
    </Group>
  );
}
