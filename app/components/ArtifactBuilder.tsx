"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import {
  AIGenerationRequest,
  ComponentNode,
  ComponentType,
  SandboxResult,
} from "../types/artifact";
import { AIPromptPanel } from "./AIPromptPanel";
import { AnimationPanel } from "./AnimationPanel";
import { ApiConnectionPanel } from "./ApiConnectionPanel";
import { ComponentLibrary } from "./ComponentLibrary";
import { LiveCursors } from "./LiveCursors";
import { LivePreview } from "./LivePreview";
import { PerformancePanel } from "./PerformancePanel";
import { StateManagerPanel } from "./StateManagerPanel";
import { StylePanel } from "./StylePanel";
import { VisualCanvas } from "./VisualCanvas";

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
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [aspectRatioLocked, setAspectRatioLocked] = useState<boolean>(false);

  const toggleNodeSelection = useCallback((nodeId: string) => {
    setSelectedNodeIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(nodeId)) {
        return prevSelectedIds.filter((id) => id !== nodeId);
      }
      return [...prevSelectedIds, nodeId];
    });
  }, []);

  const setSingleNodeSelection = useCallback((nodeId: string) => {
    setSelectedNodeIds((prevSelectedIds) => {
      if (prevSelectedIds.length === 1 && prevSelectedIds[0] === nodeId) {
        return [];
      }
      return [nodeId];
    });
  }, []);

  const handleSelectNode = useCallback(
    (nodeId: string | null, ctrlPressed: boolean) => {
      if (nodeId === null) {
        setSelectedNodeIds([]);
      } else if (ctrlPressed) {
        toggleNodeSelection(nodeId);
      } else {
        setSingleNodeSelection(nodeId);
      }
    },
    [toggleNodeSelection, setSingleNodeSelection],
  );

  const addNodesToSelection = useCallback((nodeIds: string[]) => {
    setSelectedNodeIds((prevSelectedIds) => {
      const newIds = [...prevSelectedIds];
      nodeIds.forEach((id) => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      return newIds;
    });
  }, []);

  const setNodeSelection = useCallback((nodeIds: string[]) => {
    setSelectedNodeIds(nodeIds);
  }, []);

  const handleAddNodesToSelection = useCallback(
    (nodeIds: string[]) => {
      addNodesToSelection(nodeIds);
    },
    [addNodesToSelection],
  );

  const handleSetNodeSelection = useCallback(
    (nodeIds: string[]) => {
      setNodeSelection(nodeIds);
    },
    [setNodeSelection],
  );

  const handleSelectNodes = useCallback(
    (nodeIds: string[], ctrlPressed: boolean) => {
      if (ctrlPressed) {
        handleAddNodesToSelection(nodeIds);
      } else {
        handleSetNodeSelection(nodeIds);
      }
    },
    [handleAddNodesToSelection, handleSetNodeSelection],
  );
  const [livePreview, setLivePreview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<RightPanelTab>("AI");

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

  const groupSelectedNodes = useCallback(() => {
    if (selectedNodeIds.length < 2) return;

    const selectedNodes = canvas.filter((c) => selectedNodeIds.includes(c.id));

    const minX = Math.min(...selectedNodes.map((n) => n.position.x));
    const minY = Math.min(...selectedNodes.map((n) => n.position.y));
    const maxX = Math.max(
      ...selectedNodes.map((n) => n.position.x + n.size.width),
    );
    const maxY = Math.max(
      ...selectedNodes.map((n) => n.position.y + n.size.height),
    );

    const newContainer: ComponentNode = {
      id: `container-${Date.now()}`,
      type: "container",
      position: { x: minX, y: minY },
      size: { width: maxX - minX, height: maxY - minY },
      props: {},
      styles: {},
      children: selectedNodes.map((node) => ({
        ...node,
        position: {
          x: node.position.x - minX,
          y: node.position.y - minY,
        },
      })),
    };

    setCanvas((prev) => [
      ...prev.filter((c) => !selectedNodeIds.includes(c.id)),
      newContainer,
    ]);
    setSelectedNodeIds([newContainer.id]);
  }, [canvas, selectedNodeIds]);

  const ungroupSelectedNodes = useCallback(() => {
    if (selectedNodeIds.length !== 1) return;
    const container = canvas.find((c) => c.id === selectedNodeIds[0]);

    if (!container || container.type !== "container" || !container.children)
      return;

    const children = container.children.map((child) => ({
      ...child,
      position: {
        x: child.position.x + container.position.x,
        y: child.position.y + container.position.y,
      },
    }));

    setCanvas((prev) => [
      ...prev.filter((c) => c.id !== container.id),
      ...children,
    ]);
    setSelectedNodeIds(children.map((c) => c.id));
  }, [canvas, selectedNodeIds]);

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
    },
    [],
  );

  const selectedNode = canvas.find((c) => c.id === selectedNodeIds[0]) || null;

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
        return <StateManagerPanel {...panelProps} />;
      case "API":
        return <ApiConnectionPanel {...panelProps} />;
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
    <div className="h-screen flex bg-gray-50 font-sans relative">
      <LiveCursors />
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
            <button
              className={`px-4 py-2 text-sm rounded-md ${snapToGrid ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => setSnapToGrid(!snapToGrid)}
            >
              Snap to Grid
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-md ${aspectRatioLocked ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
            >
              Lock Aspect Ratio
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm disabled:opacity-50"
              onClick={groupSelectedNodes}
              disabled={selectedNodeIds.length < 2}
            >
              Group
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm disabled:opacity-50"
              onClick={ungroupSelectedNodes}
              disabled={
                selectedNodeIds.length !== 1 ||
                canvas.find((c) => c.id === selectedNodeIds[0])?.type !==
                  "container"
              }
            >
              Ungroup
            </button>
            <Link
              href="/marketplace"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              Marketplace
            </Link>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Save
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
              Deploy
            </button>
          </div>
        </div>

        {/* Canvas & Preview */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 h-full overflow-auto">
            <VisualCanvas
              components={canvas}
              selectedNodeIds={selectedNodeIds}
              onSelectNode={handleSelectNode}
              onToggleNodeInSelection={(nodeId: string) =>
                toggleNodeSelection(nodeId)
              }
              onSelectNodes={handleSelectNodes}
              onAddNodesToSelection={handleAddNodesToSelection}
              onUpdateComponent={updateComponent}
              onAddComponent={addComponent}
              snapToGrid={snapToGrid}
              aspectRatioLocked={aspectRatioLocked}
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
