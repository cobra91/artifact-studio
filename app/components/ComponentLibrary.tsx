"use client";

import { DragEvent } from "react";

import { ComponentType } from "../types/artifact";

export const ComponentLibrary = () => {
  const componentTemplates = [
    {
      name: "Container",
      type: "container" as const,
      icon: "📦",
    },
    {
      name: "Text",
      type: "text" as const,
      icon: "📝",
    },
    {
      name: "Button",
      type: "button" as const,
      icon: "🔘",
    },
    {
      name: "Input",
      type: "input" as const,
      icon: "📝",
    },
    {
      name: "Image",
      type: "image" as const,
      icon: "🖼️",
    },
    {
      name: "Chart",
      type: "chart" as const,
      icon: "📊",
    },
  ];

  const handleDragStart = (e: DragEvent, componentType: ComponentType) => {
    const dragData = {
      type: "component",
      componentType: componentType,
    };
    e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800">Components</h2>
        <p className="text-sm text-gray-600">Drag to add to canvas</p>
      </div>

      <div className="flex-1 space-y-2 p-4">
        {componentTemplates.map(template => (
          <div
            key={template.type}
            draggable="true"
            onDragStart={e => handleDragStart(e, template.type)}
            className="w-full cursor-grab rounded-lg border border-gray-200 bg-white p-3 text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{template.icon}</span>
              <span className="font-medium text-gray-800">{template.name}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 p-4">
        <h3 className="text-md mb-2 font-medium text-gray-800">Templates</h3>
        <div className="space-y-2">
          <button className="w-full rounded border border-purple-200 bg-purple-50 p-2 text-left text-sm hover:bg-purple-100">
            🧮 Calculator
          </button>
          <button className="w-full rounded border border-green-200 bg-green-50 p-2 text-left text-sm hover:bg-green-100">
            📊 Dashboard
          </button>
          <button className="w-full rounded border border-blue-200 bg-blue-50 p-2 text-left text-sm hover:bg-blue-100">
            📝 Form
          </button>
          <button className="w-full rounded border border-orange-200 bg-orange-50 p-2 text-left text-sm hover:bg-orange-100">
            🎯 Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
