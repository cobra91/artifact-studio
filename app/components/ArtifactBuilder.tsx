"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useCanvasStore } from "../lib/canvasStore";
import {
  AIGenerationRequest,
  ComponentNode,
  ComponentType,
  SandboxResult,
} from "../types/artifact";
import { ABTestPanel } from "./ABTestPanel";
import { AIPromptPanel } from "./AIPromptPanel";
import { AnimationPanel } from "./AnimationPanel";
import { ApiConnectionPanel } from "./ApiConnectionPanel";
import { ComponentLibrary } from "./ComponentLibrary";
import { DeploymentPanel } from "./DeploymentPanel";
import { ExportPackageModal } from "./ExportPackageModal";
import { LiveCursors } from "./LiveCursors";
import { LivePreview } from "./LivePreview";
import { PerformancePanel } from "./PerformancePanel";
import { ResponsivePanel } from "./ResponsivePanel";
import { StateManagerPanel } from "./StateManagerPanel";
import { StylePanel } from "./StylePanel";
import { VersionPanel } from "./VersionPanel";
import { VisualCanvas } from "./VisualCanvas/VisualCanvas";

type RightPanelTab =
  | "AI"
  | "Style"
  | "Animate"
  | "State"
  | "API"
  | "Perf"
  | "Versions"
  | "A/B"
  | "Deploy";

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
  const [canvas, setCanvas] = useState<ComponentNode[]>([
    // Demo components with responsive styles
    {
      id: "demo-text",
      type: "text",
      props: { children: "Responsive Text" },
      position: { x: 50, y: 50 },
      size: { width: 200, height: 60 },
      styles: {
        fontSize: "16px",
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
      },
      responsiveStyles: {
        base: { fontSize: "14px", width: "100%" },
        sm: { fontSize: "16px", width: "auto" },
        md: { fontSize: "18px", color: "#2563eb" },
        lg: { fontSize: "20px", fontWeight: "900" },
      },
    },
    {
      id: "demo-button",
      type: "button",
      props: { children: "Click Me" },
      position: { x: 50, y: 150 },
      size: { width: 150, height: 50 },
      styles: {
        backgroundColor: "#3b82f6",
        color: "white",
        padding: "10px 20px",
        borderRadius: "8px",
        borderWidth: "0px",
        borderStyle: "none",
      },
      responsiveStyles: {
        base: { width: "100%", fontSize: "14px", padding: "8px 16px" },
        sm: { width: "auto", fontSize: "16px", padding: "10px 20px" },
        md: { fontSize: "18px", padding: "12px 24px", backgroundColor: "#1d4ed8" },
        lg: { fontSize: "20px", padding: "14px 28px", backgroundColor: "#1e40af" },
      },
    },
    {
      id: "demo-input",
      type: "input",
      props: { placeholder: "Enter text..." },
      position: { x: 50, y: 250 },
      size: { width: 180, height: 40 },
      styles: {
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "#d1d5db",
        borderRadius: "6px",
        padding: "8px 12px",
        fontSize: "14px",
      },
      responsiveStyles: {
        base: { width: "100%", fontSize: "14px", padding: "8px 12px" },
        sm: { width: "auto", fontSize: "16px", padding: "10px 14px" },
        md: { fontSize: "18px", padding: "12px 16px", borderColor: "#3b82f6" },
        lg: { fontSize: "20px", padding: "14px 18px", borderColor: "#1d4ed8" },
      },
    },
  ]);
  const [history, setHistory] = useState<ComponentNode[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [framework, setFramework] = useState<"react" | "vue" | "svelte">(
    "react",
  );

  const historyRef = useRef(history);
  historyRef.current = history;
  const historyIndexRef = useRef(historyIndex);
  historyIndexRef.current = historyIndex;

  const updateCanvas = useCallback(
    (updater: ComponentNode[] | ((c: ComponentNode[]) => ComponentNode[])) => {
      setCanvas((prevCanvas) => {
        const newCanvas =
          typeof updater === "function" ? updater(prevCanvas) : updater;
        const newHistory = historyRef.current.slice(
          0,
          historyIndexRef.current + 1,
        );
        newHistory.push(newCanvas);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        return newCanvas;
      });
    },
    [],
  );

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const { snapToGrid, setSnapToGrid } = useCanvasStore();
  const [aspectRatioLocked, setAspectRatioLocked] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);

  // Use only local state for selection to avoid conflicts
  // const { selectedNodes, setSelectedNodes } = useCanvasStore();

  const toggleNodeSelection = useCallback((nodeId: string) => {
    setSelectedNodeIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(nodeId)) {
        return prevSelectedIds.filter((id) => id !== nodeId);
      }
      return [...prevSelectedIds, nodeId];
    });
  }, []);

  const setSingleNodeSelection = useCallback((nodeId: string) => {
    console.log('🔍 setSingleNodeSelection called with:', nodeId);
    setSelectedNodeIds([nodeId]);
  }, []);

  const handleSelectNode = useCallback(
    (nodeId: string | null, ctrlPressed: boolean) => {
      console.log('🔍 handleSelectNode called:', { nodeId, ctrlPressed, currentSelection: selectedNodeIds });
      
      if (nodeId === null) {
        console.log('🔍 Deselecting all');
        setSelectedNodeIds([]);
      } else if (ctrlPressed) {
        console.log('🔍 Toggle selection for:', nodeId);
        toggleNodeSelection(nodeId);
      } else {
        console.log('🔍 Single selection for:', nodeId);
        setSingleNodeSelection(nodeId);
      }
    },
    [toggleNodeSelection, setSingleNodeSelection, selectedNodeIds],
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
  const [appState, setAppState] = useState<{ [key: string]: any }>({});
  const [apiData, setApiData] = useState<{ [key: string]: any }>({});

  // State for export modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    const savedCanvas = localStorage.getItem("canvas");
    if (savedCanvas) {
      updateCanvas(JSON.parse(savedCanvas));
    }
    const savedState = localStorage.getItem("appState");
    if (savedState) {
      setAppState(JSON.parse(savedState));
    }
    const savedApiData = localStorage.getItem("apiData");
    if (savedApiData) {
      setApiData(JSON.parse(savedApiData));
    }
  }, [updateCanvas]);

  const handleSave = () => {
    localStorage.setItem("canvas", JSON.stringify(canvas));
    localStorage.setItem("appState", JSON.stringify(appState));
    localStorage.setItem("apiData", JSON.stringify(apiData));
    alert("Canvas, state, and API data saved!");
  };

  const handleDeploy = async () => {
    const { aiCodeGen } = await import("../lib/aiCodeGen");
    const code = aiCodeGen.generateReactCode(
      canvas,
      undefined,
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
    setFramework(request.framework);
    try {
      const { aiCodeGen } = await import("../lib/aiCodeGen");
      const result = await aiCodeGen.create(request);

      updateCanvas((prev) => [...prev, ...result.components]);
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
      updateCanvas((prev) => [...prev, newComponent]);
    },
    [updateCanvas],
  );

  const groupSelectedNodes = useCallback(() => {
    if (selectedNodeIds.length < 2) return;

    const selectedNodesArray = canvas.filter((c) => selectedNodeIds.includes(c.id));

    const minX = Math.min(...selectedNodesArray.map((n) => n.position.x));
    const minY = Math.min(...selectedNodesArray.map((n) => n.position.y));
    const maxX = Math.max(
      ...selectedNodesArray.map((n) => n.position.x + n.size.width),
    );
    const maxY = Math.max(
      ...selectedNodesArray.map((n) => n.position.y + n.size.height),
    );

    const newContainer: ComponentNode = {
      id: `container-${Date.now()}`,
      type: "container",
      position: { x: minX, y: minY },
      size: { width: maxX - minX, height: maxY - minY },
      props: {},
      styles: {},
      children: selectedNodesArray.map((node) => ({
        ...node,
        position: {
          x: node.position.x - minX,
          y: node.position.y - minY,
        },
      })),
    };

    updateCanvas((prev) => [
      ...prev.filter((c) => !selectedNodeIds.includes(c.id)),
      newContainer,
    ]);
    setSelectedNodeIds([newContainer.id]);
  }, [canvas, selectedNodeIds, updateCanvas]);

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

    updateCanvas((prev) => [
      ...prev.filter((c) => c.id !== container.id),
      ...children,
    ]);
    setSelectedNodeIds(children.map((c) => c.id));
  }, [canvas, selectedNodeIds, updateCanvas]);

  const updateComponent = useCallback(
    (id: string, updates: Partial<ComponentNode>) => {
      const { activeBreakpoint } = useCanvasStore.getState(); // Get current breakpoint
      updateCanvas((prev) =>
        prev.map((comp) => {
          if (comp.id === id) {
            if (activeBreakpoint === "base") {
              return { ...comp, ...updates };
            } else {
              return {
                ...comp,
                responsiveStyles: {
                  ...comp.responsiveStyles,
                  [activeBreakpoint]: {
                    ...comp.responsiveStyles?.[activeBreakpoint],
                    ...updates.styles, // Assuming updates.styles contains the responsive styles
                  },
                },
              };
            }
          }
          return comp;
        }),
      );
    },
    [updateCanvas],
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

  const handleRestoreVersion = (components: ComponentNode[]) => {
    updateCanvas(components);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvas(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvas(history[historyIndex + 1]);
    }
  };

  const handleCopy = () => {
    if (selectedNode) {
      navigator.clipboard.writeText(JSON.stringify(selectedNode));
    }
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    try {
      // Check if the text looks like a valid JSON object
      if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
        const node = JSON.parse(text) as ComponentNode;
        node.id = `${node.type}-${Date.now()}`;
        node.position.x += 10;
        node.position.y += 10;
        updateCanvas([...canvas, node]);
      } else {
        console.warn("Clipboard content is not a valid JSON object");
      }
    } catch (e) {
      console.error("Failed to parse clipboard content", e);
    }
  };

  const selectedNode = useMemo(() => {
    if (selectedNodeIds.length !== 1) return null;
    return canvas.find((node) => node.id === selectedNodeIds[0]) || null;
  }, [canvas, selectedNodeIds]);

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
        return (
          <StateManagerPanel {...panelProps} onAddState={handleAddState} />
        );
      case "API":
        return (
          <ApiConnectionPanel {...panelProps} onFetchData={handleFetchData} />
        );
      case "Perf":
        return <PerformancePanel selectedNode={selectedNode} />;
      case "Versions":
        return <VersionPanel onRestoreVersion={handleRestoreVersion} />;
      case "A/B":
        return <ABTestPanel selectedNode={selectedNode} />;
      case "Deploy":
        return <DeploymentPanel />;
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
            <ResponsivePanel />
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm disabled:opacity-50"
            >
              Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm disabled:opacity-50"
            >
              Redo
            </button>
            <button
              onClick={handleCopy}
              disabled={!selectedNode}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm disabled:opacity-50"
            >
              Copy
            </button>
            <button
              onClick={handlePaste}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
            >
              Paste
            </button>
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
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm disabled:opacity-50"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm disabled:opacity-50"
              onClick={handleDeploy}
            >
              Deploy
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              onClick={() => setIsExportModalOpen(true)}
            >
              Export Package
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-md ${isEditMode ? "bg-green-600 text-white" : "bg-orange-600 text-white"}`}
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? "Preview" : "Edit"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Navigation */}
          <div className="w-48 bg-white border-r border-gray-200 flex-shrink-0">
            {(
              [
                "AI",
                "Style",
                "Animate",
                "State",
                "API",
                "Perf",
                "Versions",
                "A/B",
                "Deploy",
              ] as RightPanelTab[]
            ).map((tab) => (
              <div key={tab}>
                <TabButton tabName={tab} />
              </div>
            ))}
          </div>

          {/* Right Panel */}
          <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
            {renderPanel()}
          </div>

          {/* Canvas Area */}
          <div className="flex-1 h-full overflow-auto">
            <VisualCanvas
              components={canvas}
              selectedNodeIds={selectedNodeIds}
              onSelectNode={handleSelectNode}
              onToggleNodeInSelection={toggleNodeSelection}
              onSelectNodes={handleSelectNodes}
              onAddNodesToSelection={addNodesToSelection}
              onAddComponent={addComponent}
              snapToGrid={snapToGrid}
              aspectRatioLocked={aspectRatioLocked}
              onUpdateComponent={updateComponent}
              activeBreakpoint={useCanvasStore.getState().activeBreakpoint}
              isEditMode={isEditMode}
            />
          </div>

          {/* Preview */}
          <div className="w-96 bg-gray-100 border-l border-gray-200 flex-shrink-0 overflow-y-auto">
            <LivePreview code={livePreview} framework={framework} />
          </div>
        </div>
      </div>

      {/* Export Package Modal */}
      <ExportPackageModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        components={canvas}
      />
    </div>
  );
};
