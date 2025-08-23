"use client";

import { DragEvent } from "react";

import { ComponentType } from "../types/artifact";
import { Tooltip } from "./ui/tooltip";

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
      <div className="border-border/20 border-b p-2 md:p-4">
        <h2 className="text-base font-semibold text-gray-100 md:text-lg">
          Components
        </h2>
        <p className="text-xs text-gray-300 md:text-sm">
          Drag to add to canvas
        </p>
      </div>

      <div className="flex-1 space-y-2 p-2 md:p-4">
        {componentTemplates.map(template => (
          <Tooltip
            key={template.type}
            content={`Drag to add ${template.name} component`}
            position="right"
          >
            <div
              draggable="true"
              onDragStart={e => handleDragStart(e, template.type)}
              className="glass border-border/30 hover:border-primary/50 hover:bg-accent/50 hover-lift w-full cursor-grab rounded-lg border p-3 text-left transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{template.icon}</span>
                <span className="font-medium text-gray-100">
                  {template.name}
                </span>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>

      <div className="border-border/20 border-t p-2 md:p-4">
        <h3 className="md:text-md mb-2 text-sm font-medium text-gray-200">
          Templates
        </h3>
        <div className="space-y-2">
          <button className="glass border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 w-full rounded border p-2 text-left text-sm text-gray-200 transition-all duration-200">
            🧮 Calculator
          </button>
          <button className="glass border-primary/30 hover:bg-primary/10 hover:border-primary/50 w-full rounded border p-2 text-left text-sm text-gray-200 transition-all duration-200">
            📊 Dashboard
          </button>
          <button className="glass border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 w-full rounded border p-2 text-left text-sm text-gray-200 transition-all duration-200">
            📝 Form
          </button>
          <button className="glass border-primary/30 hover:bg-primary/10 hover:border-primary/50 w-full rounded border p-2 text-left text-sm text-gray-200 transition-all duration-200">
            🎯 Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
