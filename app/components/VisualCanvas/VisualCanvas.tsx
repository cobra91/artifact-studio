"use client";

import { CSSProperties, DragEvent, MouseEvent, useRef, useState } from "react";

import { useCanvasStore as _useCanvasStore } from "../../lib/canvasStore";
import { ComponentNode, ComponentType } from "../../types/artifact";
import { PerformanceMonitor } from "../PerformanceMonitor/PerformanceMonitor";
import { usePerformanceMonitor } from "../PerformanceMonitor/usePerformanceMonitor";
import { Tooltip } from "../ui/tooltip";
import { ComponentRenderer } from "./ComponentRenderer";

interface VisualCanvasProps {
  components: ComponentNode[];
  selectedNodeIds: string[];
  onSelectNode: (_nodeId: string | null, _ctrlPressed: boolean) => void;
  onSelectNodes: (_nodeIds: string[], _ctrlPressed: boolean) => void;
  onUpdateComponent: (_id: string, _updates: Partial<ComponentNode>) => void;
  onAddComponent: (
    _type: ComponentType,
    _position: { x: number; y: number }
  ) => void;
  snapToGrid: boolean;
  aspectRatioLocked: boolean;
  activeBreakpoint: "base" | "sm" | "md" | "lg";
  isEditMode: boolean;
  onZoomChange?: (zoom: number) => void;
}

export const VisualCanvas = ({
  components,
  selectedNodeIds,
  onSelectNode,
  onSelectNodes,
  onUpdateComponent,
  onAddComponent,
  snapToGrid,
  aspectRatioLocked,
  activeBreakpoint,
  isEditMode,
  onZoomChange,
}: VisualCanvasProps) => {
  const { isOpen } = usePerformanceMonitor();
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
  const [rotating, setRotating] = useState<boolean>(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDownOnResizeHandle = (e: MouseEvent, direction: string) => {
    e.stopPropagation();
    setResizing(direction);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDownOnRotateHandle = (e: MouseEvent) => {
    e.stopPropagation();
    setRotating(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => {
      const newZoom = Math.max(0.1, Math.min(3, prev + delta));
      onZoomChange?.(newZoom);
      return newZoom;
    });
  };

  const handleZoomIn = () => handleZoom(0.1);
  const handleZoomOut = () => handleZoom(-0.1);
  const handleZoom50 = () => {
    setZoom(0.5);
    setPan({ x: 0, y: 0 });
    onZoomChange?.(0.5);
  };
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onZoomChange?.(1);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      handleZoom(delta);
    }
  };

  const handleMouseDownOnComponent = (e: MouseEvent, node: ComponentNode) => {
    console.log("🔍 Component mousedown:", {
      nodeId: node.id,
      target: e.target,
      currentTarget: e.currentTarget,
    });
    e.preventDefault();
    e.stopPropagation();

    // Simple selection logic - just select the clicked component
    onSelectNode(node.id, e.ctrlKey || e.metaKey);

    setIsDragging(true);

    const newInitialPositions = new Map<string, { x: number; y: number }>();
    // Always use the current selection, not trying to predict the next one
    const currentSelection =
      e.ctrlKey || e.metaKey
        ? selectedNodeIds.includes(node.id)
          ? selectedNodeIds.filter(id => id !== node.id)
          : [...selectedNodeIds, node.id]
        : [node.id];

    components
      .filter(c => currentSelection.includes(c.id))
      .forEach(c => {
        newInitialPositions.set(c.id, c.position);
      });
    setInitialDragPositions(newInitialPositions);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDownOnCanvas = (e: MouseEvent) => {
    console.log("🔍 Canvas mousedown:", {
      target: e.target,
      currentTarget: e.currentTarget,
      shouldDeselect: e.target === e.currentTarget,
    });
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
      console.log("🔍 Deselecting from canvas click");
      onSelectNodes([], false);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (rotating && selectedNodeIds.length === 1 && canvasRef.current) {
      const selectedNode = components.find(c => c.id === selectedNodeIds[0]);
      if (!selectedNode) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const centerX = selectedNode.position.x + selectedNode.size.width / 2;
      const centerY = selectedNode.position.y + selectedNode.size.height / 2;

      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      // Calculate angle between center and mouse position
      const deltaX = mouseX - centerX;
      const deltaY = mouseY - centerY;
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      // Convert to 0-360 range and snap to 15-degree increments
      let rotation = (angle + 90 + 360) % 360;
      rotation = Math.round(rotation / 15) * 15;

      onUpdateComponent(selectedNode.id, {
        rotation: rotation,
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (resizing && selectedNodeIds.length === 1 && canvasRef.current) {
      const selectedNode = components.find(c => c.id === selectedNodeIds[0]);
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

      selectedNodeIds.forEach(nodeId => {
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
        const component = components.find(c => c.id === nodeId);
        if (!component) return;

        const adjustedPos = { ...newPos };

        // Simple collision detection with guides
        const nearOtherComponents = components
          .filter(c => c.id !== nodeId)
          .some(other => {
            const dist = Math.sqrt(
              Math.pow(other.position.x - newPos.x, 2) +
                Math.pow(other.position.y - newPos.y, 2)
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

      const selectedInRect = components.filter(component => {
        const componentRight = component.position.x + component.size.width;
        const componentBottom = component.position.y + component.size.height;

        return (
          component.position.x < x + width &&
          componentRight > x &&
          component.position.y < y + height &&
          componentBottom > y
        );
      });

      const nodeIds = selectedInRect.map(c => c.id);
      onSelectNodes(nodeIds, false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setRotating(false);
    setIsSelecting(false);
    setSelectionRect(null);

    // Clear guides and perform final position updates
    if (selectedNodeIds.length === 1) {
      const selectedNode = components.find(c => c.id === selectedNodeIds[0]);
      if (selectedNode) {
        onUpdateComponent(selectedNode.id, { position: selectedNode.position });
      }
    }
  };

  const handleMouseLeave = () => {
    handleMouseUp();
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

  const getResizeHandleStyle = (
    direction: string,
    _size: { width: number; height: number }
  ): CSSProperties => {
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
  };

  return (
    <div className="relative h-full w-full">
      <div
        ref={canvasRef}
        className="border-border/20 bg-card/50 relative h-full w-full cursor-crosshair border backdrop-blur-sm"
        onMouseDown={handleMouseDownOnCanvas}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Breakpoint indicator */}
        <div className="glass text-foreground absolute top-2 right-2 z-20 rounded-md px-3 py-1 text-sm font-medium shadow-lg">
          {activeBreakpoint.toUpperCase()}
        </div>
        {/* Selection indicator */}
        <div className="glass text-foreground absolute top-2 left-2 z-20 rounded-md px-3 py-1 text-sm font-medium shadow-lg">
          Selected: {selectedNodeIds.length}{" "}
          {selectedNodeIds.length > 0 && `(${selectedNodeIds.join(", ")})`}
        </div>

        {/* Zoom controls - adaptatifs selon la taille d'écran */}
        <div className="glass absolute right-4 bottom-4 z-20 flex items-center gap-1 rounded-md px-2 py-2 shadow-lg md:gap-2 md:px-3">
          <Tooltip content="Zoom Out (Ctrl + Scroll)" position="top">
            <button
              onClick={handleZoomOut}
              className="glass text-foreground hover:bg-accent rounded px-2 py-1 text-sm transition-all duration-200 hover-lift"
            >
              -
            </button>
          </Tooltip>
          
          <span className="text-foreground min-w-[2.5rem] text-center text-xs font-medium md:min-w-[3rem] md:text-sm">
            {Math.round(zoom * 100)}%
          </span>
          
          <Tooltip content="Zoom In (Ctrl + Scroll)" position="top">
            <button
              onClick={handleZoomIn}
              className="glass text-foreground hover:bg-accent rounded px-2 py-1 text-sm transition-all duration-200 hover-lift"
            >
              +
            </button>
          </Tooltip>
          
          <Tooltip content="Zoom to 50%" position="top">
            <button
              onClick={handleZoom50}
              className="glass text-foreground hover:bg-accent rounded px-2 py-1 text-xs transition-all duration-200 hover-lift md:text-sm"
            >
              50%
            </button>
          </Tooltip>
          
          <Tooltip content="Reset zoom to 100%" position="top">
            <button
              onClick={handleZoomReset}
              className="glass text-foreground hover:bg-accent rounded px-2 py-1 text-xs transition-all duration-200 hover-lift md:text-sm"
            >
              <span className="hidden md:inline">Reset</span>
              <span className="md:hidden">↻</span>
            </button>
          </Tooltip>
        </div>

        {/* Performance Monitor - conditionally rendered */}
        {isOpen && <PerformanceMonitor />}
        {/* Canvas grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: snapToGrid
              ? "repeating-linear-gradient(0deg, rgba(74, 222, 128, 0.1) 0px, rgba(74, 222, 128, 0.1) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, rgba(74, 222, 128, 0.1) 0px, rgba(74, 222, 128, 0.1) 1px, transparent 1px, transparent 20px)"
              : "none",
          }}
        />

        {/* Guide lines */}
        {guides.x.map((guideX, index) => (
          <div
            key={`x-guide-${index}`}
            className="border-primary pointer-events-none absolute top-0 bottom-0 border-l-2 opacity-50"
            style={{ left: guideX }}
          />
        ))}
        {guides.y.map((guideY, index) => (
          <div
            key={`y-guide-${index}`}
            className="border-primary pointer-events-none absolute right-0 left-0 border-t-2 opacity-50"
            style={{ top: guideY }}
          />
        ))}

        {/* Components */}
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          {components.map(node => (
            <div
              key={node.id}
              onMouseDown={e => {
                console.log(
                  "🔍 DIV mousedown triggered for:",
                  node.id,
                  "target:",
                  e.target,
                  "currentTarget:",
                  e.currentTarget
                );
                handleMouseDownOnComponent(e, node);
              }}
              className={`absolute cursor-move transition-all duration-200 ${selectedNodeIds.includes(node.id) ? "ring-primary rounded shadow-lg ring-2" : ""}`}
              style={{
                left: node.position.x,
                top: node.position.y,
                width: node.size.width,
                height: node.size.height,
                zIndex: selectedNodeIds.includes(node.id) ? 10 : 1,
              }}
            >
              <ComponentRenderer
                node={node}
                activeBreakpoint={_useCanvasStore.getState().activeBreakpoint}
                isEditMode={isEditMode}
              />

              {/* Resize handles */}
              {getResizeHandles(node).map(direction => (
                <div
                  key={`resize-${direction}`}
                  className="bg-primary absolute h-2 w-2 cursor-pointer rounded-full shadow-sm"
                  style={getResizeHandleStyle(direction, node.size)}
                  onMouseDown={e => handleMouseDownOnResizeHandle(e, direction)}
                />
              ))}

              {/* Rotate handle */}
              {selectedNodeIds.length === 1 &&
                selectedNodeIds[0] === node.id && (
                  <div
                    className="bg-secondary absolute h-3 w-3 cursor-pointer rounded-full shadow-sm"
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
        </div>

        {/* Selection rectangle */}
        {isSelecting && selectionRect && (
          <div
            className="border-primary bg-primary/10 pointer-events-none absolute border-2 border-dashed"
            style={{
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.width,
              height: selectionRect.height,
            }}
          />
        )}
      </div>
    </div>
  );
};
