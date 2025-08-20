"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ComponentNode,
  AIGenerationRequest,
  SandboxResult,
  ComponentType,
} from "../types/artifact";
import { VisualCanvas } from "./VisualCanvas";
import { ComponentLibrary } from "./ComponentLibrary";
import { StylePanel } from "./StylePanel";
import { AIPromptPanel } from "./AIPromptPanel";
import { LivePreview } from "./LivePreview";
import { AnimationPanel } from "./AnimationPanel";
import { StateManagerPanel } from "./StateManagerPanel";
import { ApiConnectionPanel } from "./ApiConnectionPanel";
import { PerformancePanel } from "./PerformancePanel";

type RightPanelTab = "AI" | "Style" | "Animate" | "State" | "API" | "Perf";

// Helper function to get default properties for a new component
const getComponentDefaults = (type: ComponentType) => {
  switch (type) {
    case "container":
      return {
        props: { className: "p-4 bg-white rounded-lg shadow-sm border" },
        size: { width: 300, height: 200 },
      };
    case "text":
      return {
        props: { children: "Sample text", className: "text-gray-800" },
        size: { width: 150, height: 40 },
      };
    case "button":
      return {
        props: {
          children: "Click me",
          className: "bg-blue-600 text-white px-4 py-2 rounded",
        },
        size: { width: 120, height: 40 },
      };
    case "input":
      return {
        props: {
          placeholder: "Enter text...",
          className: "border border-gray-300 rounded px-3 py-2",
        },
        size: { width: 200, height: 40 },
      };
    case "image":
      return {
        props: {
          src: "https://via.placeholder.com/150",
          alt: "Image",
          className: "rounded",
        },
        size: { width: 150, height: 150 },
      };
    default:
      return {
        props: {},
        size: { width: 200, height: 100 },
      };
  }
};

export const ArtifactBuilder = () => {
  const [canvas, setCanvas] = useState<ComponentNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<ComponentNode | null>(null);
  const [livePreview, setLivePreview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<RightPanelTab>("AI");
  const [appState, setAppState] = useState<{ [key: string]: any }>({});
  const [apiData, setApiData] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const savedCanvas = localStorage.getItem("canvas");
    if (savedCanvas) {
      setCanvas(JSON.parse(savedCanvas));
    }
    const savedState = localStorage.getItem("appState");
    if (savedState) {
      setAppState(JSON.parse(savedState));
    }
    const savedApiData = localStorage.getItem("apiData");
    if (savedApiData) {
      setApiData(JSON.parse(savedApiData));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("canvas", JSON.stringify(canvas));
    localStorage.setItem("appState", JSON.stringify(appState));
    localStorage.setItem("apiData", JSON.stringify(apiData));
    alert("Canvas, state, and API data saved!");
  };

  const handleDeploy = () => {
    const { aiCodeGen } = require("../lib/aiCodeGen");
    const code = aiCodeGen.generateReactCode(
      canvas,
      {
        framework: "react",
        styling: "tailwindcss",
      },
      appState,
      apiData,
    );
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GeneratedArtifact.tsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateFromPrompt = async (
    request: AIGenerationRequest,
  ): Promise<SandboxResult> => {
    setIsGenerating(true);
    try {
      const { aiCodeGen } = await import("../lib/aiCodeGen");
      const result = await aiCodeGen.create(request);

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

  const addComponent = useCallback(
    (type: ComponentType, position: { x: number; y: number }) => {
      const defaults = getComponentDefaults(type);
      const newComponent: ComponentNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        props: defaults.props,
        size: defaults.size,
        styles: {},
      };
      setCanvas((prev) => [...prev, newComponent]);
    },
    [],
  );

  const updateComponent = useCallback(
    (id: string, updates: Partial<ComponentNode>) => {
      let updatedNode: ComponentNode | null = null;
      setCanvas((prev) =>
        prev.map((comp) => {
          if (comp.id === id) {
            updatedNode = { ...comp, ...updates };
            return updatedNode;
          }
          return comp;
        }),
      );

      if (selectedNode?.id === id && updatedNode) {
        setSelectedNode(updatedNode);
      }
    },
    [selectedNode],
  );

  const handleAddState = (key: string, value: any) => {
    setAppState((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetchData = async (url: string, key: string) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setApiData((prev) => ({ ...prev, [key]: data }));
    } catch (error) {
      console.error("Failed to fetch API data:", error);
    }
  };

  const renderPanel = () => {
    const panelProps = {
      selectedNode,
      onUpdateNode: (updates: Partial<ComponentNode>) =>
        selectedNode && updateComponent(selectedNode.id, updates),
    };

    switch (activeTab) {
      case "AI":
        return (
          <AIPromptPanel
            onGenerate={generateFromPrompt}
            isGenerating={isGenerating}
          />
        );
      case "Style":
        return <StylePanel {...panelProps} />;
      case "Animate":
        return <AnimationPanel {...panelProps} />;
      case "State":
        return <StateManagerPanel {...panelProps} onAddState={handleAddState} />;
      case "API":
        return (
          <ApiConnectionPanel {...panelProps} onFetchData={handleFetchData} />
        );
      case "Perf":
        return <PerformancePanel selectedNode={selectedNode} />;
      default:
        return null;
    }
  };

  const TabButton = ({ tabName }: { tabName: RightPanelTab }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-3 py-2 text-sm font-medium ${
        activeTab === tabName
          ? "text-blue-600 border-b-2 border-blue-600"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {tabName}
    </button>
  );

  return (
    <div className="h-screen flex bg-gray-50 font-sans">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <ComponentLibrary />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-800">
            Visual Artifact Studio
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/marketplace"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              Marketplace
            </Link>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Save
            </button>
            <button
              onClick={handleDeploy}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Deploy
            </button>
          </div>
        </div>

        {/* Canvas & Preview */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 h-full overflow-auto">
            <VisualCanvas
              components={canvas}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
              onUpdateComponent={updateComponent}
              onAddComponent={addComponent}
            />
          </div>
          <div className="w-96 flex-shrink-0 border-l border-gray-200">
            <LivePreview code={livePreview} />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
        <div className="flex justify-around border-b border-gray-200">
          <TabButton tabName="AI" />
          <TabButton tabName="Style" />
          <TabButton tabName="Animate" />
          <TabButton tabName="State" />
          <TabButton tabName="API" />
          <TabButton tabName="Perf" />
        </div>
        <div className="flex-1 overflow-y-auto">{renderPanel()}</div>
      </div>
    </div>
  );
};
