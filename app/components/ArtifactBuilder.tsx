"use client";

import { useState, useCallback } from "react";
import {
  ComponentNode,
  AIGenerationRequest,
  SandboxResult,
} from "../types/artifact";
import { VisualCanvas } from "./VisualCanvas";
import { ComponentLibrary } from "./ComponentLibrary";
import { StylePanel } from "./StylePanel";
import { AIPromptPanel } from "./AIPromptPanel";
import { LivePreview } from "./LivePreview";

export const ArtifactBuilder = () => {
  const [canvas, setCanvas] = useState<ComponentNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<ComponentNode | null>(null);
  const [livePreview, setLivePreview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateFromPrompt = async (
    request: AIGenerationRequest,
  ): Promise<SandboxResult> => {
    setIsGenerating(true);
    try {
      const { aiCodeGen } = await import("../lib/aiCodeGen");
      const result = await aiCodeGen.create(request);

      // Add generated components to canvas
      setCanvas((prev) => [...prev, ...result.components]);
      setLivePreview(result.code);

      return {
        success: true,
        code: result.code,
        preview: "Generated successfully",
      };
    } catch (error) {
      return {
        success: false,
        code: "",
        preview: "",
        errors: [error instanceof Error ? error.message : "Generation failed"],
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReactCode = (components: ComponentNode[]): string => {
    // Basic code generation - enhance with proper React component generation
    return `
export const GeneratedComponent = () => {
  return (
    <div className="generated-artifact">
      ${components.map((comp) => renderComponentCode(comp)).join("\n")}
    </div>
  )
}`;
  };

  const renderComponentCode = (node: ComponentNode): string => {
    const { type, props, children } = node;
    const childrenCode = children?.map(renderComponentCode).join("\n") || "";

    switch (type) {
      case "container":
        return `<div ${propsToString(props)}>${childrenCode}</div>`;
      case "text":
        return `<span ${propsToString(props)}>${props.children || ""}</span>`;
      case "button":
        return `<button ${propsToString(props)}>${props.children || "Button"}</button>`;
      default:
        return `<div ${propsToString(props)}>${childrenCode}</div>`;
    }
  };

  const propsToString = (props: Record<string, any>): string => {
    return Object.entries(props)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");
  };

  const addComponent = useCallback((component: ComponentNode) => {
    setCanvas((prev) => [...prev, component]);
  }, []);

  const updateComponent = useCallback(
    (id: string, updates: Partial<ComponentNode>) => {
      setCanvas((prev) =>
        prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp)),
      );
    },
    [],
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Component Library Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <ComponentLibrary onAddComponent={addComponent} />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Visual Artifact Studio
          </h1>
          <div className="ml-auto flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Deploy
            </button>
          </div>
        </div>

        {/* Canvas and Preview */}
        <div className="flex-1 flex">
          <div className="flex-1">
            <VisualCanvas
              components={canvas}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
              onUpdateComponent={updateComponent}
            />
          </div>
          <div className="w-96 border-l border-gray-200">
            <LivePreview code={livePreview} />
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-white border-l border-gray-200">
        <div className="h-1/2">
          <AIPromptPanel
            onGenerate={generateFromPrompt}
            isGenerating={isGenerating}
          />
        </div>
        <div className="h-1/2 border-t border-gray-200">
          <StylePanel
            selectedNode={selectedNode}
            onUpdateNode={(updates) =>
              selectedNode && updateComponent(selectedNode.id, updates)
            }
          />
        </div>
      </div>
    </div>
  );
};
