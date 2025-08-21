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
    e.dataTransfer.setData("componentType", componentType);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Components</h2>
        <p className="text-sm text-gray-600">Drag to add to canvas</p>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {componentTemplates.map((template) => (
          <div
            key={template.type}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, template.type)}
            className="w-full p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-grab"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{template.icon}</span>
              <span className="font-medium text-gray-800">{template.name}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <h3 className="text-md font-medium text-gray-800 mb-2">Templates</h3>
        <div className="space-y-2">
          <button className="w-full p-2 text-left text-sm bg-purple-50 border border-purple-200 rounded hover:bg-purple-100">
            🧮 Calculator
          </button>
          <button className="w-full p-2 text-left text-sm bg-green-50 border border-green-200 rounded hover:bg-green-100">
            📊 Dashboard
          </button>
          <button className="w-full p-2 text-left text-sm bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
            📝 Form
          </button>
          <button className="w-full p-2 text-left text-sm bg-orange-50 border border-orange-200 rounded hover:bg-orange-100">
            🎯 Quiz
          </button>
        </div>
      </div>
    </div>
  );
};