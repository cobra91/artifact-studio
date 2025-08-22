"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  analytics,
  trackComponentCreate,
  trackComponentDelete,
  trackFeature,
} from "../lib/analytics";
import { useCanvasStore } from "../lib/canvasStore";
import {
  AIGenerationRequest,
  ComponentNode,
  ComponentType,
  SandboxResult,
} from "../types/artifact";
import { ABTestPanel } from "./ABTestPanel";
import { AIPromptPanel } from "./AIPromptPanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { AnimationPanel } from "./AnimationPanel";
import { ApiConnectionPanel } from "./ApiConnectionPanel";
import { CommandPalette } from "./CommandPalette";
import { ComponentLibrary } from "./ComponentLibrary";
import { DeploymentPanel } from "./DeploymentPanel";
import { ExportPackageModal } from "./ExportPackageModal";
import { HelpSystem } from "./HelpSystem";
import { LiveCursors } from "./LiveCursors";
import { LivePreview } from "./LivePreview";
import {
  PerformanceMonitor,
  usePerformanceMonitor,
} from "./PerformanceMonitor";
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
        md: {
          fontSize: "18px",
          padding: "12px 24px",
          backgroundColor: "#1d4ed8",
        },
        lg: {
          fontSize: "20px",
          padding: "14px 28px",
          backgroundColor: "#1e40af",
        },
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
    "react"
  );

  const historyRef = useRef(history);
  historyRef.current = history;
  const historyIndexRef = useRef(historyIndex);
  historyIndexRef.current = historyIndex;

  const updateCanvas = useCallback(
    (updater: ComponentNode[] | ((c: ComponentNode[]) => ComponentNode[])) => {
      setCanvas(prevCanvas => {
        const newCanvas =
          typeof updater === "function" ? updater(prevCanvas) : updater;
        const newHistory = historyRef.current.slice(
          0,
          historyIndexRef.current + 1
        );
        newHistory.push(newCanvas);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        return newCanvas;
      });
    },
    []
  );

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const { snapToGrid, setSnapToGrid } = useCanvasStore();
  const [aspectRatioLocked, setAspectRatioLocked] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] =
    useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isAnalyticsPanelOpen, setIsAnalyticsPanelOpen] =
    useState<boolean>(false);

  // Performance monitoring
  const { memoryUsage: _memoryUsage } = usePerformanceMonitor();

  // Check if onboarding should be shown
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboarding-completed");
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Use only local state for selection to avoid conflicts
  // const { selectedNodes, setSelectedNodes } = useCanvasStore();

  const toggleNodeSelection = useCallback((nodeId: string) => {
    setSelectedNodeIds(prevSelectedIds => {
      if (prevSelectedIds.includes(nodeId)) {
        return prevSelectedIds.filter(id => id !== nodeId);
      }
      return [...prevSelectedIds, nodeId];
    });
  }, []);

  const setSingleNodeSelection = useCallback((nodeId: string) => {
    console.log("🔍 setSingleNodeSelection called with:", nodeId);
    setSelectedNodeIds([nodeId]);
  }, []);

  const handleSelectNode = useCallback(
    (nodeId: string | null, ctrlPressed: boolean) => {
      console.log("🔍 handleSelectNode called:", {
        nodeId,
        ctrlPressed,
        currentSelection: selectedNodeIds,
      });

      if (nodeId === null) {
        console.log("🔍 Deselecting all");
        setSelectedNodeIds([]);
      } else if (ctrlPressed) {
        console.log("🔍 Toggle selection for:", nodeId);
        toggleNodeSelection(nodeId);
      } else {
        console.log("🔍 Single selection for:", nodeId);
        setSingleNodeSelection(nodeId);
      }
    },
    [toggleNodeSelection, setSingleNodeSelection, selectedNodeIds]
  );

  const addNodesToSelection = useCallback((nodeIds: string[]) => {
    setSelectedNodeIds(prevSelectedIds => {
      const newIds = [...prevSelectedIds];
      nodeIds.forEach(id => {
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
    [addNodesToSelection]
  );

  const handleSetNodeSelection = useCallback(
    (nodeIds: string[]) => {
      setNodeSelection(nodeIds);
    },
    [setNodeSelection]
  );

  const handleSelectNodes = useCallback(
    (nodeIds: string[], ctrlPressed: boolean) => {
      if (ctrlPressed) {
        handleAddNodesToSelection(nodeIds);
      } else {
        handleSetNodeSelection(nodeIds);
      }
    },
    [handleAddNodesToSelection, handleSetNodeSelection]
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

  const handleSave = useCallback(() => {
    localStorage.setItem("canvas", JSON.stringify(canvas));
    localStorage.setItem("appState", JSON.stringify(appState));
    localStorage.setItem("apiData", JSON.stringify(apiData));
    trackFeature("save-project", { componentCount: canvas.length });
    alert("Canvas, state, and API data saved!");
  }, [canvas, appState, apiData]);

  const handleDeploy = useCallback(async () => {
    const { aiCodeGen } = await import("../lib/aiCodeGen");
    const code = aiCodeGen.generateReactCode(
      canvas,
      undefined,
      appState,
      apiData
    );
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GeneratedArtifact.tsx";
    a.click();
    URL.revokeObjectURL(url);
  }, [canvas, appState, apiData]);

  const generateFromPrompt = async (
    request: AIGenerationRequest
  ): Promise<SandboxResult> => {
    setIsGenerating(true);
    setFramework(request.framework);
    try {
      const { aiCodeGen } = await import("../lib/aiCodeGen");
      const result = await aiCodeGen.create(request);

      updateCanvas(prev => [...prev, ...result.components]);
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
      updateCanvas(prev => [...prev, newComponent]);
      trackComponentCreate(type);
    },
    [updateCanvas]
  );

  const groupSelectedNodes = useCallback(() => {
    if (selectedNodeIds.length < 2) return;

    const selectedNodesArray = canvas.filter(c =>
      selectedNodeIds.includes(c.id)
    );

    const minX = Math.min(...selectedNodesArray.map(n => n.position.x));
    const minY = Math.min(...selectedNodesArray.map(n => n.position.y));
    const maxX = Math.max(
      ...selectedNodesArray.map(n => n.position.x + n.size.width)
    );
    const maxY = Math.max(
      ...selectedNodesArray.map(n => n.position.y + n.size.height)
    );

    const newContainer: ComponentNode = {
      id: `container-${Date.now()}`,
      type: "container",
      position: { x: minX, y: minY },
      size: { width: maxX - minX, height: maxY - minY },
      props: {},
      styles: {},
      children: selectedNodesArray.map(node => ({
        ...node,
        position: {
          x: node.position.x - minX,
          y: node.position.y - minY,
        },
      })),
    };

    updateCanvas(prev => [
      ...prev.filter(c => !selectedNodeIds.includes(c.id)),
      newContainer,
    ]);
    setSelectedNodeIds([newContainer.id]);
  }, [canvas, selectedNodeIds, updateCanvas]);

  const ungroupSelectedNodes = useCallback(() => {
    if (selectedNodeIds.length !== 1) return;
    const container = canvas.find(c => c.id === selectedNodeIds[0]);

    if (!container || container.type !== "container" || !container.children)
      return;

    const children = container.children.map(child => ({
      ...child,
      position: {
        x: child.position.x + container.position.x,
        y: child.position.y + container.position.y,
      },
    }));

    updateCanvas(prev => [
      ...prev.filter(c => c.id !== container.id),
      ...children,
    ]);
    setSelectedNodeIds(children.map(c => c.id));
  }, [canvas, selectedNodeIds, updateCanvas]);

  const updateComponent = useCallback(
    (id: string, updates: Partial<ComponentNode>) => {
      const { activeBreakpoint } = useCanvasStore.getState(); // Get current breakpoint
      updateCanvas(prev =>
        prev.map(comp => {
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
        })
      );
    },
    [updateCanvas]
  );

  const handleAddState = (key: string, value: any) => {
    setAppState(prev => ({ ...prev, [key]: value }));
  };

  const handleFetchData = async (url: string, key: string) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setApiData(prev => ({ ...prev, [key]: data }));
    } catch (error) {
      console.error("Failed to fetch API data:", error);
    }
  };

  const handleRestoreVersion = (components: ComponentNode[]) => {
    updateCanvas(components);
  };

  const selectedNode = useMemo(() => {
    if (selectedNodeIds.length !== 1) return null;
    return canvas.find(node => node.id === selectedNodeIds[0]) || null;
  }, [canvas, selectedNodeIds]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvas(history[historyIndex - 1]);
    }
  }, [historyIndex, history, setCanvas]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvas(history[historyIndex + 1]);
    }
  }, [historyIndex, history, setCanvas]);

  const handleCopy = useCallback(() => {
    if (selectedNode) {
      navigator.clipboard.writeText(JSON.stringify(selectedNode));
    }
  }, [selectedNode]);

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    try {
      // Check if the text looks like a valid JSON object
      if (text.trim().startsWith("{") && text.trim().endsWith("}")) {
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
  }, [canvas, updateCanvas]);

  // Command palette commands
  const commands = useMemo(
    () => [
      // File operations
      {
        id: "save-project",
        name: "Save Project",
        description: "Save the current project",
        shortcut: "Ctrl+S",
        category: "File",
        action: () => handleSave(),
      },
      {
        id: "export-package",
        name: "Export Package",
        description: "Export project as a package",
        shortcut: "",
        category: "File",
        action: () => setIsExportModalOpen(true),
      },
      {
        id: "deploy-project",
        name: "Deploy Project",
        description: "Deploy project to production",
        shortcut: "",
        category: "File",
        action: () => handleDeploy(),
      },
      // Edit operations
      {
        id: "undo",
        name: "Undo",
        description: "Undo the last action",
        shortcut: "Ctrl+Z",
        category: "Edit",
        action: () => handleUndo(),
      },
      {
        id: "redo",
        name: "Redo",
        description: "Redo the last undone action",
        shortcut: "Ctrl+Shift+Z",
        category: "Edit",
        action: () => handleRedo(),
      },
      {
        id: "copy-component",
        name: "Copy Component",
        description: "Copy the selected component",
        shortcut: "Ctrl+C",
        category: "Edit",
        action: () => selectedNode && handleCopy(),
      },
      {
        id: "paste-component",
        name: "Paste Component",
        description: "Paste the copied component",
        shortcut: "Ctrl+V",
        category: "Edit",
        action: () => handlePaste(),
      },
      {
        id: "duplicate-component",
        name: "Duplicate Component",
        description: "Duplicate the selected component",
        shortcut: "Ctrl+D",
        category: "Edit",
        action: () => {
          if (selectedNode) {
            const duplicated = {
              ...selectedNode,
              id: `${selectedNode.type}-${Date.now()}`,
              position: {
                x: selectedNode.position.x + 20,
                y: selectedNode.position.y + 20,
              },
            };
            updateCanvas([...canvas, duplicated]);
            setSelectedNodeIds([duplicated.id]);
          }
        },
      },
      {
        id: "delete-component",
        name: "Delete Selected",
        description: "Delete the selected components",
        shortcut: "Delete",
        category: "Edit",
        action: () => {
          if (selectedNodeIds.length > 0) {
            updateCanvas(prev =>
              prev.filter(c => !selectedNodeIds.includes(c.id))
            );
            setSelectedNodeIds([]);
          }
        },
      },
      {
        id: "select-all",
        name: "Select All",
        description: "Select all components",
        shortcut: "Ctrl+A",
        category: "Selection",
        action: () => setSelectedNodeIds(canvas.map(c => c.id)),
      },
      {
        id: "clear-selection",
        name: "Clear Selection",
        description: "Clear the current selection",
        shortcut: "Esc",
        category: "Selection",
        action: () => setSelectedNodeIds([]),
      },
      // View operations
      {
        id: "toggle-grid",
        name: "Toggle Grid Snapping",
        description: "Toggle grid snapping on/off",
        shortcut: "",
        category: "View",
        action: () => setSnapToGrid(!snapToGrid),
      },
      {
        id: "toggle-aspect-ratio",
        name: "Toggle Aspect Ratio Lock",
        description: "Toggle aspect ratio locking",
        shortcut: "",
        category: "View",
        action: () => setAspectRatioLocked(!aspectRatioLocked),
      },
      {
        id: "toggle-edit-preview",
        name: "Toggle Edit/Preview Mode",
        description: "Switch between edit and preview mode",
        shortcut: "",
        category: "View",
        action: () => setIsEditMode(!isEditMode),
      },
      // Component operations
      {
        id: "group-components",
        name: "Group Components",
        description: "Group the selected components",
        shortcut: "",
        category: "Components",
        action: () => selectedNodeIds.length >= 2 && groupSelectedNodes(),
      },
      {
        id: "ungroup-components",
        name: "Ungroup Components",
        description: "Ungroup the selected container",
        shortcut: "",
        category: "Components",
        action: () => {
          if (selectedNodeIds.length === 1) {
            const component = canvas.find(c => c.id === selectedNodeIds[0]);
            if (component?.type === "container") {
              ungroupSelectedNodes();
            }
          }
        },
      },
      // Panel switching
      {
        id: "open-ai-panel",
        name: "Open AI Panel",
        description: "Switch to the AI generation panel",
        shortcut: "",
        category: "Panels",
        action: () => setActiveTab("AI"),
      },
      {
        id: "open-style-panel",
        name: "Open Style Panel",
        description: "Switch to the style editing panel",
        shortcut: "",
        category: "Panels",
        action: () => setActiveTab("Style"),
      },
      {
        id: "open-animation-panel",
        name: "Open Animation Panel",
        description: "Switch to the animation panel",
        shortcut: "",
        category: "Panels",
        action: () => setActiveTab("Animate"),
      },
      {
        id: "open-deploy-panel",
        name: "Open Deploy Panel",
        description: "Switch to the deployment panel",
        shortcut: "",
        category: "Panels",
        action: () => setActiveTab("Deploy"),
      },
      // Help
      {
        id: "show-onboarding",
        name: "Show Onboarding",
        description: "Restart the onboarding tutorial",
        shortcut: "",
        category: "Help",
        action: () => setShowOnboarding(true),
      },
      // Analytics
      {
        id: "show-analytics",
        name: "Show Analytics",
        description: "View usage analytics and statistics",
        shortcut: "",
        category: "Analytics",
        action: () => setIsAnalyticsPanelOpen(true),
      },
      {
        id: "export-analytics",
        name: "Export Analytics Data",
        description: "Export analytics data as JSON",
        shortcut: "",
        category: "Analytics",
        action: () => {
          const data = analytics.exportData();
          const blob = new Blob([data], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `analytics-${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        },
      },
    ],
    [
      selectedNode,
      selectedNodeIds,
      canvas,
      snapToGrid,
      aspectRatioLocked,
      isEditMode,
      handleSave,
      handleUndo,
      handleRedo,
      handleCopy,
      handlePaste,
      handleDeploy,
      updateCanvas,
      setSelectedNodeIds,
      setSnapToGrid,
      setAspectRatioLocked,
      setIsEditMode,
      setIsExportModalOpen,
      groupSelectedNodes,
      ungroupSelectedNodes,
      setActiveTab,
    ]
  );

  // Comprehensive keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Handle shortcuts with modifiers
      if (isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case "c":
            e.preventDefault();
            if (selectedNode) {
              handleCopy();
              console.log("📋 Copied component:", selectedNode.id);
            }
            break;
          case "v":
            e.preventDefault();
            handlePaste();
            console.log("📋 Pasting component...");
            break;
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
              console.log("↪️ Redo");
            } else {
              handleUndo();
              console.log("↩️ Undo");
            }
            break;
          case "a":
            e.preventDefault();
            // Select all components
            setSelectedNodeIds(canvas.map(c => c.id));
            console.log("🔵 Selected all components");
            break;
          case "d":
            e.preventDefault();
            // Duplicate selected component
            if (selectedNode) {
              const duplicated = {
                ...selectedNode,
                id: `${selectedNode.type}-${Date.now()}`,
                position: {
                  x: selectedNode.position.x + 20,
                  y: selectedNode.position.y + 20,
                },
              };
              updateCanvas([...canvas, duplicated]);
              setSelectedNodeIds([duplicated.id]);
              console.log("📄 Duplicated component:", duplicated.id);
            }
            break;
          case "s":
            e.preventDefault();
            handleSave();
            console.log("💾 Saved project");
            break;
          case "k":
            e.preventDefault();
            setIsCommandPaletteOpen(true);
            console.log("⌘ Opened command palette");
            break;
        }
      } else {
        // Handle shortcuts without modifiers
        switch (e.key.toLowerCase()) {
          case "delete":
          case "backspace":
            e.preventDefault();
            if (selectedNodeIds.length > 0) {
              selectedNodeIds.forEach(id => {
                const component = canvas.find(c => c.id === id);
                if (component) trackComponentDelete(component.type);
              });
              updateCanvas(prev =>
                prev.filter(c => !selectedNodeIds.includes(c.id))
              );
              setSelectedNodeIds([]);
              console.log("🗑️ Deleted selected components");
            }
            break;
          case "escape":
            e.preventDefault();
            setSelectedNodeIds([]);
            console.log("❌ Cleared selection");
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedNode,
    selectedNodeIds,
    canvas,
    handleCopy,
    handlePaste,
    handleUndo,
    handleRedo,
    handleSave,
    updateCanvas,
    setSelectedNodeIds,
  ]);

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
        return <PerformancePanel />;
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
          ? "border-b-2 border-blue-600 text-blue-600"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {tabName}
    </button>
  );

  return (
    <div className="relative flex h-screen bg-gray-50 font-sans">
      <LiveCursors />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />

      {/* Help System */}
      <HelpSystem
        showOnboarding={showOnboarding}
        onFinishOnboarding={() => setShowOnboarding(false)}
      />

      {/* Analytics Panel */}
      <AnalyticsPanel
        isOpen={isAnalyticsPanelOpen}
        onClose={() => setIsAnalyticsPanelOpen(false)}
      />

      {/* Performance Monitor */}
      <PerformanceMonitor />

      {/* Left Sidebar */}
      <div className="component-library w-64 flex-shrink-0 border-r border-gray-200 bg-white">
        <ComponentLibrary />
      </div>

      {/* Main Area */}
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Visual Artifact Studio
          </h1>
          <div className="flex items-center gap-2">
            <ResponsivePanel />
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
              Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
              Redo
            </button>
            <button
              onClick={handleCopy}
              disabled={!selectedNode}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              title="Copy selected component (Ctrl+C)"
            >
              Copy
            </button>
            <button
              onClick={handlePaste}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300"
              title="Paste component (Ctrl+V)"
            >
              Paste
            </button>
            <button
              className={`rounded-md px-4 py-2 text-sm ${snapToGrid ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => setSnapToGrid(!snapToGrid)}
            >
              Snap to Grid
            </button>
            <button
              className={`rounded-md px-4 py-2 text-sm ${aspectRatioLocked ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
            >
              Lock Aspect Ratio
            </button>
            <button
              className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              onClick={groupSelectedNodes}
              disabled={selectedNodeIds.length < 2}
            >
              Group
            </button>
            <button
              className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              onClick={ungroupSelectedNodes}
              disabled={
                selectedNodeIds.length !== 1 ||
                canvas.find(c => c.id === selectedNodeIds[0])?.type !==
                  "container"
              }
            >
              Ungroup
            </button>
            <button
              className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              onClick={handleDeploy}
            >
              Deploy
            </button>
            <button
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              onClick={() => setIsExportModalOpen(true)}
            >
              Export Package
            </button>
            <button
              className={`rounded-md px-4 py-2 text-sm ${isEditMode ? "bg-green-600 text-white" : "bg-orange-600 text-white"}`}
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? "Preview" : "Edit"}
            </button>
            <button
              className="command-button rounded-md bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
              onClick={() => setIsCommandPaletteOpen(true)}
              title="Open Command Palette (Ctrl+K)"
            >
              ⌘ Commands
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1">
          {/* Left Navigation */}
          <div className="w-48 flex-shrink-0 border-r border-gray-200 bg-white">
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
            ).map(tab => (
              <div key={tab}>
                <TabButton tabName={tab} />
              </div>
            ))}
          </div>

          {/* Right Panel */}
          <div className="style-panel w-80 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
            {renderPanel()}
          </div>

          {/* Canvas Area */}
          <div className="visual-canvas h-full flex-1 overflow-auto">
            <VisualCanvas
              components={canvas}
              selectedNodeIds={selectedNodeIds}
              onSelectNode={handleSelectNode}
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
          <div className="live-preview w-96 flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-gray-100">
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
