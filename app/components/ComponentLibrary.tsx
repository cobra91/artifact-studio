"use client";

import { DragEvent } from "react";

import { loadTemplate } from "../lib/templateLoader";
import { ComponentNode, ComponentType } from "../types/artifact";
import { useQuickNotifications } from "./ui/notifications";
import { Tooltip } from "./ui/tooltip";

type RightPanelTab = "AI" | "Style" | "Animate" | "State";

interface ComponentLibraryProps {
  onAddTemplate?: (components: ComponentNode[]) => void;
  activeTab?: RightPanelTab;
  onTabChange?: (tab: RightPanelTab) => void;
}

export const ComponentLibrary = ({ onAddTemplate, activeTab, onTabChange }: ComponentLibraryProps) => {
  const { success, error, info } = useQuickNotifications();

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

  const handleTemplateClick = async (templateId: string) => {
    try {
      info(`Loading ${templateId} template...`);

      const templateComponents = await loadTemplate(templateId);

      // Ensure unique IDs for all components
      const componentsWithUniqueIds = templateComponents.map(component => ({
        ...component,
        id: `${component.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      }));

      // Use the callback to add template components to the canvas
      if (onAddTemplate) {
        onAddTemplate(componentsWithUniqueIds);
      }

      success(`${templateId} template has been added to the canvas!`);
    } catch (err) {
      console.error("Failed to load template:", err);
      error(err instanceof Error ? err.message : "Unknown error occurred");
    }
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
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onTabChange?.("AI" as RightPanelTab)}
            className={`glass flex items-center justify-center gap-2 rounded border p-2 text-sm transition-all duration-200 ${
              activeTab === "AI"
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-accent/30 hover:bg-accent/10 hover:border-accent/50 text-gray-200"
            }`}
          >
            🤖 AI
          </button>
          <button
            onClick={() => onTabChange?.("Style" as RightPanelTab)}
            className={`glass flex items-center justify-center gap-2 rounded border p-2 text-sm transition-all duration-200 ${
              activeTab === "Style"
                ? "border-secondary/50 bg-secondary/10 text-secondary"
                : "border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 text-gray-200"
            }`}
          >
            🎨 Style
          </button>
          <button
            onClick={() => onTabChange?.("Animate" as RightPanelTab)}
            className={`glass flex items-center justify-center gap-2 rounded border p-2 text-sm transition-all duration-200 ${
              activeTab === "Animate"
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-gray-200"
            }`}
          >
            ✨ Animate
          </button>
          <button
            onClick={() => onTabChange?.("State" as RightPanelTab)}
            className={`glass flex items-center justify-center gap-2 rounded border p-2 text-sm transition-all duration-200 ${
              activeTab === "State"
                ? "border-border/50 bg-border/10 text-border"
                : "border-border/30 hover:bg-border/10 hover:border-border/50 text-gray-200"
            }`}
          >
            ⚡ State
          </button>
        </div>
      </div>

      <div className="border-border/20 border-t p-2 md:p-4">
        <h3 className="md:text-md mb-2 text-sm font-medium text-gray-200">
          Templates
        </h3>
        <p className="mb-3 text-xs text-gray-400">
          Click to load complete templates
        </p>
        <div className="space-y-2">
          <Tooltip content="Load a loan calculator template with interactive inputs">
            <button
              onClick={() => handleTemplateClick("calculator")}
              className="glass border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 w-full rounded border p-2 text-left text-sm text-gray-200 transition-all duration-200"
            >
              🧮 Calculator
            </button>
          </Tooltip>
          <Tooltip content="Load an analytics dashboard with charts and metrics">
            <button
              onClick={() => handleTemplateClick("dashboard")}
              className="glass border-primary/30 hover:bg-primary/10 hover:border-primary/50 w-full rounded border p-2 text-left text-sm text-gray-200 transition-all duration-200"
            >
              📊 Dashboard
            </button>
          </Tooltip>
          <Tooltip content="Load a contact form with validation">
            <button
              onClick={() => handleTemplateClick("form")}
              className="glass border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 w-full rounded border p-2 text-left text-sm text-gray-200 transition-all duration-200"
            >
              📝 Form
            </button>
          </Tooltip>
          <Tooltip content="Load an interactive quiz with multiple choice questions">
            <button
              onClick={() => handleTemplateClick("quiz")}
              className="glass border-primary/30 hover:bg-primary/10 hover:border-primary/50 w-full rounded border p-2 text-left text-sm text-gray-200 transition-all duration-200"
            >
              🎯 Quiz
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
