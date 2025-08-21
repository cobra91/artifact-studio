"use client";

import { CSSProperties, DragEvent, MouseEvent, useRef, useState } from "react";

import { ComponentNode, ComponentType } from "../types/artifact";

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
  onAddNodesToSelection,
  onUpdateComponent,
  onAddComponent,
  snapToGrid,
  aspectRatioLocked,
}: VisualCanvasProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [_isRotating, setIsRotating] = useState(false);
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
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({
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
    } else if (isDragging && canvasRef.current) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const newGuides: { x: number[]; y: number[] } = { x: [], y: [] };
      const snapThreshold = 5;

      selectedNodeIds.forEach((nodeId) => {
        const initialPos = initialDragPositions.get(nodeId);
        const component = components.find((c) => c.id === nodeId);
        if (initialPos && component) {
          let newX = initialPos.x + dx;
          let newY = initialPos.y + dy;

          // Snap to grid
          if (snapToGrid) {
            const gridSize = 20;
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
          }

          // Alignment guides
          const otherComponents = components.filter(
            (c) => !selectedNodeIds.includes(c.id),
          );
          otherComponents.forEach((other) => {
            // X-axis
            if (Math.abs(newX - other.position.x) < snapThreshold) {
              newX = other.position.x;
              newGuides.x.push(other.position.x);
            }
            if (
              Math.abs(
                newX +
                  component.size.width / 2 -
                  (other.position.x + other.size.width / 2),
              ) < snapThreshold
            ) {
              newX =
                other.position.x +
                other.size.width / 2 -
                component.size.width / 2;
              newGuides.x.push(other.position.x + other.size.width / 2);
            }
            if (
              Math.abs(
                newX +
                  component.size.width -
                  (other.position.x + other.size.width),
              ) < snapThreshold
            ) {
              newX = other.position.x + other.size.width - component.size.width;
              newGuides.x.push(other.position.x + other.size.width);
            }

            // Y-axis
            if (Math.abs(newY - other.position.y) < snapThreshold) {
              newY = other.position.y;
              newGuides.y.push(other.position.y);
            }
            if (
              Math.abs(
                newY +
                  component.size.height / 2 -
                  (other.position.y + other.size.height / 2),
              ) < snapThreshold
            ) {
              newY =
                other.position.y +
                other.size.height / 2 -
                component.size.height / 2;
              newGuides.y.push(other.position.y + other.size.height / 2);
            }
            if (
              Math.abs(
                newY +
                  component.size.height -
                  (other.position.y + other.size.height),
              ) < snapThreshold
            ) {
              newY =
                other.position.y + other.size.height - component.size.height;
              newGuides.y.push(other.position.y + other.size.height);
            }
          });

          onUpdateComponent(nodeId, {
            position: { x: Math.max(0, newX), y: Math.max(0, newY) },
          });
        }
      });
      setGuides(newGuides);
    } else if (isSelecting && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = Math.min(dragStart.x, e.clientX) - canvasRect.left;
      const y = Math.min(dragStart.y, e.clientY) - canvasRect.top;
      const width = Math.abs(e.clientX - dragStart.x);
      const height = Math.abs(e.clientY - dragStart.y);
      setSelectionRect({ x, y, width, height });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isSelecting && selectionRect) {
      const newSelectedNodeIds: string[] = [];
      components.forEach((c) => {
        if (
          c.position.x < selectionRect.x + selectionRect.width &&
          c.position.x + c.size.width > selectionRect.x &&
          c.position.y < selectionRect.y + selectionRect.height &&
          c.position.y + c.size.height > selectionRect.y
        ) {
          newSelectedNodeIds.push(c.id);
        }
      });
      if (e.ctrlKey || e.metaKey) {
        onAddNodesToSelection(newSelectedNodeIds);
      } else {
        onSelectNodes(newSelectedNodeIds, false);
      }
    }
    setIsDragging(false);
    setIsRotating(false);
    setIsSelecting(false);
    setResizing(null);
    setSelectionRect(null);
    setInitialDragPositions(new Map());
    setGuides({ x: [], y: [] });
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault(); // This is crucial to allow dropping
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData(
      "componentType",
    ) as ComponentType;
    if (!componentType || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top,
    };

    onAddComponent(componentType, position);
  };

  const renderComponent = (node: ComponentNode) => {
    const isSelected = selectedNodeIds.includes(node.id);
    const transform = `rotate(${node.rotation || 0}deg)`;

    return (
      <div
        key={node.id}
        className={`absolute cursor-move border-2 ${
          isSelected
            ? "border-blue-500 bg-blue-50"
            : "border-transparent hover:border-gray-300"
        }`}
        style={
          {
            position: "absolute",
            left: node.position.x,
            top: node.position.y,
            width: node.size.width,
            height: node.size.height,
            transform,
            ...node.styles,
          } as CSSProperties
        }
        onMouseDown={(e) => handleMouseDownOnComponent(e, node)}
      >
        <ComponentRenderer node={node} />

        {isSelected && selectedNodeIds.length === 1 && (
          <>
            {/* Rotation Handle */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-2 h-4 bg-gray-400" />
            <div
              className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-500 cursor-grab rounded-full"
              onMouseDown={handleMouseDownOnRotateHandle}
            />
            {/* Resize Handles */}
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize"
              onMouseDown={(e) => handleMouseDownOnResizeHandle(e, "se")}
            />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize"
              onMouseDown={(e) => handleMouseDownOnResizeHandle(e, "ne")}
            />
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize"
              onMouseDown={(e) => handleMouseDownOnResizeHandle(e, "nw")}
            />
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize"
              onMouseDown={(e) => handleMouseDownOnResizeHandle(e, "sw")}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-gray-100 overflow-hidden"
      onMouseDown={handleMouseDownOnCanvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onSelectNode(null, false)}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Components */}
      {components.map(renderComponent)}

      {guides.x.map((x) => (
        <div
          key={`guid-x-${x}`}
          className="absolute bg-red-500 w-px"
          style={{ left: x, top: 0, bottom: 0 }}
        />
      ))}
      {guides.y.map((y) => (
        <div
          key={`guid-y-${y}`}
          className="absolute bg-red-500 h-px"
          style={{ top: y, left: 0, right: 0 }}
        />
      ))}

      {selectionRect && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-200 opacity-50 pointer-events-none"
          style={{
            left: selectionRect.x,
            top: selectionRect.y,
            width: selectionRect.width,
            height: selectionRect.height,
          }}
        />
      )}

      {/* Drop zone indicator */}
      <div className="absolute inset-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 pointer-events-none">
        {components.length === 0 && (
          <div className="text-center">
            <p className="text-lg font-medium">Drop components here</p>
            <p className="text-sm">
              Or use AI to generate components from prompts
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ComponentRenderer = ({ node }: { node: ComponentNode }) => {
  switch (node.type) {
    case "text":
      return (
        <span className="block p-2 text-gray-800">
          {node.props.children || "Text Component"}
        </span>
      );
    case "button":
      return (
        <button className="w-full h-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
          {node.props.children || "Button"}
        </button>
      );
    case "input":
      return (
        <input
          className="w-full h-full border border-gray-300 rounded px-3 py-2"
          placeholder={node.props.placeholder || "Input field"}
        />
      );
    case "container":
      return (
        <div className="w-full h-full bg-white border border-gray-200 rounded p-2">
          {node.children?.map((child) => (
            <ComponentRenderer key={child.id} node={child} />
          ))}
        </div>
      );
    default:
      return (
        <div className="w-full h-full bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
          <span className="text-gray-600 text-sm">{node.type}</span>
        </div>
      );
  }
};
