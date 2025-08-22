"use client";

import { CSSProperties, DragEvent, MouseEvent, useRef, useState } from "react";

import { useCanvasStore as _useCanvasStore } from "../../lib/canvasStore";
import { ComponentNode, ComponentType } from "../../types/artifact";
import { ComponentRenderer } from "./ComponentRenderer";

interface VisualCanvasProps {
  components: ComponentNode[];
  selectedNodeIds: string[];
  onSelectNode: (_nodeId: string | null, _ctrlPressed: boolean) => void;
  onToggleNodeInSelection: (_nodeId: string) => void;
  onSelectNodes: (_nodeIds: string[], _ctrlPressed: boolean) => void;
  onAddNodesToSelection: (_nodeIds: string[]) => void;
  onUpdateComponent: (_id: string, _updates: Partial<ComponentNode>) => void;
  onAddComponent: (
    _type: ComponentType,
    _position: { x: number; y: number },
  ) => void;
  snapToGrid: boolean;
  aspectRatioLocked: boolean;
}

export const VisualCanvas = ({
  components,
  selectedNodeIds,
  onSelectNode,
  onToggleNodeInSelection,
  onSelectNodes,
  onUpdateComponent,
  onAddComponent,
  snapToGrid,
  aspectRatioLocked,
}: VisualCanvasProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialDragPositions, setInitialDragPositions] = useState<
    Map<string, { x: number; y: number }>
  >(new Map());
  const [guides, _setGuides] = useState<{ x: number[]; y: number[] }>({
    x: [],
    y: [],
  });
  const [resizing, setResizing] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDownOnResizeHandle = (e: MouseEvent, direction: string) => {
    e.stopPropagation();
    setResizing(direction);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDownOnRotateHandle = (_e: MouseEvent) => {
    // TODO: Implement rotation functionality
    _e.stopPropagation();
  };

  const handleMouseDownOnComponent = (e: MouseEvent, node: ComponentNode) => {
    e.stopPropagation();

    const ctrlPressed = e.ctrlKey || e.metaKey;

    // This logic is duplicated from the parent to ensure drag behavior is correct,
    // as the parent's state update is asynchronous.
    let nextSelectedNodeIds: string[];
    if (ctrlPressed) {
      onToggleNodeInSelection(node.id);
      if (selectedNodeIds.includes(node.id)) {
        nextSelectedNodeIds = selectedNodeIds.filter((id) => id !== node.id);
      } else {
        nextSelectedNodeIds = [...selectedNodeIds, node.id];
      }
    } else {
      onSelectNode(node.id, false);
      if (selectedNodeIds.length === 1 && selectedNodeIds[0] === node.id) {
        nextSelectedNodeIds = [];
      } else {
        nextSelectedNodeIds = [node.id];
      }
    }

    setIsDragging(true);

    const newInitialPositions = new Map<string, { x: number; y: number }>();
    components
      .filter((c) => nextSelectedNodeIds.includes(c.id))
      .forEach((c) => {
        newInitialPositions.set(c.id, c.position);
      });
    setInitialDragPositions(newInitialPositions);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDownOnCanvas = (e: MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    setIsSelecting(true);
    const canvasRect = canvasRef.current!.getBoundingClientRect();
    setDragStart({ x: e.clientX, y: e.clientY });
    setSelectionRect({
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top,
      width: 0,
      height: 0,
    });
    if (!e.ctrlKey && !e.metaKey) {
      onSelectNodes([], false);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizing && selectedNodeIds.length === 1 && canvasRef.current) {
      const selectedNode = components.find((c) => c.id === selectedNodeIds[0]);
      if (!selectedNode) return;

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      const newPosition = { ...selectedNode.position };
      const newSize = { ...selectedNode.size };
      const aspectRatio = selectedNode.size.width / selectedNode.size.height;

      if (resizing.includes("e")) {
        newSize.width = Math.max(20, selectedNode.size.width + dx);
        if (aspectRatioLocked) {
          newSize.height = newSize.width / aspectRatio;
        }
      }
      if (resizing.includes("w")) {
        newSize.width = Math.max(20, selectedNode.size.width - dx);
        if (aspectRatioLocked) {
          newSize.height = newSize.width / aspectRatio;
        }
        newPosition.x = selectedNode.position.x + dx;
      }
      if (resizing.includes("s")) {
        newSize.height = Math.max(20, selectedNode.size.height + dy);
        if (aspectRatioLocked) {
          newSize.width = newSize.height * aspectRatio;
        }
      }
      if (resizing.includes("n")) {
        newSize.height = Math.max(20, selectedNode.size.height - dy);
        if (aspectRatioLocked) {
          newSize.width = newSize.height * aspectRatio;
        }
        newPosition.y = selectedNode.position.y + dy;
      }

      onUpdateComponent(selectedNode.id, {
        position: newPosition,
        size: newSize,
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDragging && selectedNodeIds.length > 0 && canvasRef.current) {
      const _canvasRect = canvasRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      const updatedPositions = new Map<string, { x: number; y: number }>();

      selectedNodeIds.forEach((nodeId) => {
        const initialPos = initialDragPositions.get(nodeId);
        if (!initialPos) return;

        let newX = initialPos.x + dx;
        let newY = initialPos.y + dy;

        if (snapToGrid) {
          newX = Math.round(newX / 20) * 20;
          newY = Math.round(newY / 20) * 20;
        }

        updatedPositions.set(nodeId, { x: newX, y: newY });
      });

      // Check for conflicts and update all selected components
      const componentsToUpdate: Array<{
        id: string;
        position: { x: number; y: number };
      }> = [];

      updatedPositions.forEach((newPos, nodeId) => {
        const component = components.find((c) => c.id === nodeId);
        if (!component) return;

        const adjustedPos = { ...newPos };

        // Simple collision detection with guides
        const nearOtherComponents = components
          .filter((c) => c.id !== nodeId)
          .some((other) => {
            const dist = Math.sqrt(
              Math.pow(other.position.x - newPos.x, 2) +
                Math.pow(other.position.y - newPos.y, 2),
            );
            return dist < 10;
          });

        if (nearOtherComponents) {
          // Snap to grid if near other components
          adjustedPos.x = Math.round(newPos.x / 10) * 10;
          adjustedPos.y = Math.round(newPos.y / 10) * 10;
        }

        componentsToUpdate.push({
          id: nodeId,
          position: adjustedPos,
        });
      });

      // Batch update all component positions
      componentsToUpdate.forEach(({ id, position }) => {
        onUpdateComponent(id, { position });
      });
    } else if (isSelecting && selectionRect && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = Math.min(dragStart.x, e.clientX) - canvasRect.left;
      const y = Math.min(dragStart.y, e.clientY) - canvasRect.top;
      const width = Math.abs(e.clientX - dragStart.x);
      const height = Math.abs(e.clientY - dragStart.y);

      setSelectionRect({ x, y, width, height });

      const selectedInRect = components.filter((component) => {
        const componentRight = component.position.x + component.size.width;
        const componentBottom = component.position.y + component.size.height;

        return (
          component.position.x < x + width &&
          componentRight > x &&
          component.position.y < y + height &&
          componentBottom > y
        );
      });

      const nodeIds = selectedInRect.map((c) => c.id);
      onSelectNodes(nodeIds, false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsSelecting(false);
    setSelectionRect(null);

    // Clear guides and perform final position updates
    if (selectedNodeIds.length === 1) {
      const selectedNode = components.find((c) => c.id === selectedNodeIds[0]);
      if (selectedNode) {
        onUpdateComponent(selectedNode.id, { position: selectedNode.position });
      }
    }
  };

  const handleMouseLeave = () => {
    handleMouseUp();
  };

  const handleWheel = (e: { deltaY: number; preventDefault: () => void }) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dragData = JSON.parse(e.dataTransfer?.getData("text/plain") || "{}");

    if (dragData.type === "component") {
      const position = snapToGrid
        ? { x: Math.round(x / 20) * 20, y: Math.round(y / 20) * 20 }
        : { x, y };

      onAddComponent(dragData.componentType as ComponentType, position);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const getResizeHandles = (node: ComponentNode) => {
    const handles = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
    let handlesToShow: string[] = [];

    if (selectedNodeIds.length === 1 && selectedNodeIds[0] === node.id) {
      handlesToShow = handles;
    }

    return handlesToShow;
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-gray-50 border border-gray-200 cursor-crosshair"
      onMouseDown={handleMouseDownOnCanvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Canvas grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: snapToGrid
            ? "repeating-linear-gradient(0deg, #f3f4f6 0px, #f3f4f6 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #f3f4f6 0px, #f3f4f6 1px, transparent 1px, transparent 20px)"
            : "none",
        }}
      />

      {/* Guide lines */}
      {guides.x.map((guideX, index) => (
        <div
          key={`x-guide-${index}`}
          className="absolute top-0 bottom-0 border-l-2 border-blue-400 opacity-50 pointer-events-none"
          style={{ left: guideX }}
        />
      ))}
      {guides.y.map((guideY, index) => (
        <div
          key={`y-guide-${index}`}
          className="absolute left-0 right-0 border-t-2 border-blue-400 opacity-50 pointer-events-none"
          style={{ top: guideY }}
        />
      ))}

      {/* Components */}
      {components.map((node) => (
        <div
          key={node.id}
          onMouseDown={(e) => handleMouseDownOnComponent(e, node)}
          className={`absolute cursor-move ${selectedNodeIds.includes(node.id) ? "ring-2 ring-blue-500 rounded" : ""}`}
          style={{
            left: node.position.x,
            top: node.position.y,
            width: node.size.width,
            height: node.size.height,
            zIndex: selectedNodeIds.includes(node.id) ? 10 : 1,
          }}
        >
          <ComponentRenderer node={node} activeBreakpoint={_useCanvasStore.getState().activeBreakpoint} />

          {/* Resize handles */}
          {getResizeHandles(node).map((direction) => (
            <div
              key={`resize-${direction}`}
              className="absolute w-2 h-2 bg-blue-500 rounded-full cursor-pointer"
              style={getResizeHandleStyle(direction, node.size)}
              onMouseDown={(e) => handleMouseDownOnResizeHandle(e, direction)}
            />
          ))}

          {/* Rotate handle */}
          {selectedNodeIds.length === 1 && selectedNodeIds[0] === node.id && (
            <div
              className="absolute w-3 h-3 bg-gray-600 rounded-full cursor-pointer"
              style={{
                top: -10,
                left: "50%",
                transform: "translateX(-50%)",
              }}
              onMouseDown={handleMouseDownOnRotateHandle}
            />
          )}
        </div>
      ))}

      {/* Selection rectangle */}
      {isSelecting && selectionRect && (
        <div
          className="absolute border-2 border-blue-500 border-dashed bg-blue-100 bg-opacity-30 pointer-events-none"
          style={{
            left: selectionRect.x,
            top: selectionRect.y,
            width: selectionRect.width,
            height: selectionRect.height,
          }}
        />
      )}
    </div>
  );
};

function getResizeHandleStyle(
  direction: string,
  _size: { width: number; height: number },
) {
  const style: CSSProperties = {};

  if (direction.includes("n")) style.top = -4;
  if (direction.includes("s")) style.bottom = -4;
  if (direction.includes("w")) style.left = -4;
  if (direction.includes("e")) style.right = -4;

  if (!direction.includes("n") && !direction.includes("s")) {
    style.top = "50%";
    style.transform = "translateY(-50%)";
  }
  if (!direction.includes("e") && !direction.includes("w")) {
    style.left = "50%";
    style.transform = "translateX(-50%)";
  }

  return style;
}
