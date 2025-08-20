"use client";

import { useState, useRef } from "react";
import { ComponentNode, ComponentType } from "../types/artifact";

interface VisualCanvasProps {
  components: ComponentNode[];
  selectedNode: ComponentNode | null;
  onSelectNode: (_node: ComponentNode | null) => void;
  onUpdateComponent: (_id: string, _updates: Partial<ComponentNode>) => void;
  onAddComponent: (
    _type: ComponentType,
    _position: { x: number; y: number },
  ) => void;
}

export const VisualCanvas = ({
  components,
  selectedNode,
  onSelectNode,
  onUpdateComponent,
  onAddComponent,
}: VisualCanvasProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, node: ComponentNode) => {
    e.stopPropagation();
    onSelectNode(node);
    setIsDragging(true);

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedNode || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    onUpdateComponent(selectedNode.id, {
      position: { x: Math.max(0, newX), y: Math.max(0, newY) },
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // This is crucial to allow dropping
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData("componentType") as ComponentType;
    if (!componentType || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top,
    };

    onAddComponent(componentType, position);
  };

  const renderComponent = (node: ComponentNode) => {
    const isSelected = selectedNode?.id === node.id;

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
            ...node.styles,
          } as React.CSSProperties
        }
        onMouseDown={(e) => handleMouseDown(e, node)}
      >
        <ComponentRenderer node={node} />

        {/* Resize handles */}
        {isSelected && (
          <>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize" />
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize" />
          </>
        )}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-gray-100 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onSelectNode(null)}
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