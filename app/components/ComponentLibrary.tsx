"use client";

import { ComponentNode } from "../types/artifact";

interface ComponentLibraryProps {
  onAddComponent: (component: ComponentNode) => void;
}

export const ComponentLibrary = ({ onAddComponent }: ComponentLibraryProps) => {
  const componentTemplates = [
    {
      name: "Container",
      type: "container" as const,
      icon: "📦",
      defaultProps: { className: "p-4 bg-white rounded-lg shadow-sm border" },
    },
    {
      name: "Text",
      type: "text" as const,
      icon: "📝",
      defaultProps: { children: "Sample text", className: "text-gray-800" },
    },
    {
      name: "Button",
      type: "button" as const,
      icon: "🔘",
      defaultProps: {
        children: "Click me",
        className: "bg-blue-600 text-white px-4 py-2 rounded",
      },
    },
    {
      name: "Input",
      type: "input" as const,
      icon: "📝",
      defaultProps: {
        placeholder: "Enter text...",
        className: "border border-gray-300 rounded px-3 py-2",
      },
    },
    {
      name: "Image",
      type: "image" as const,
      icon: "🖼️",
      defaultProps: {
        src: "/placeholder.jpg",
        alt: "Image",
        className: "rounded",
      },
    },
    {
      name: "Chart",
      type: "chart" as const,
      icon: "📊",
      defaultProps: { type: "bar", data: [], className: "w-full h-full" },
    },
  ];

  const createComponent = (template: (typeof componentTemplates)[0]) => {
    const component: ComponentNode = {
      id: `${template.type}-${Date.now()}`,
      type: template.type,
      props: template.defaultProps,
      position: { x: 50, y: 50 },
      size: { width: 200, height: 100 },
      styles: {},
    };

    onAddComponent(component);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Components</h2>
        <p className="text-sm text-gray-600">Drag to add to canvas</p>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {componentTemplates.map((template) => (
          <button
            key={template.type}
            onClick={() => createComponent(template)}
            className="w-full p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{template.icon}</span>
              <span className="font-medium text-gray-800">{template.name}</span>
            </div>
          </button>
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
