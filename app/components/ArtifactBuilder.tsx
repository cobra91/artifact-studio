"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Hook pour détecter la taille d'écran
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
      } else if (width < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return screenSize;
};

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
import { HelpModal } from "./HelpModal";
import { LiveCursors } from "./LiveCursors";
import { LivePreview } from "./LivePreview";
import { PerformancePanel } from "./PerformancePanel";
import { ResponsivePanel } from "./ResponsivePanel";
import { StateManagerPanel } from "./StateManagerPanel";
import { StylePanel } from "./StylePanel";
import { ButtonWithFeedback } from "./ui/feedback";
import { useQuickNotifications } from "./ui/notifications";
import { Tooltip } from "./ui/tooltip";
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
    case "text":
      return {
        props: { children: "New Text" },
        size: { width: 100, height: 40 },
      };
    case "button":
      return {
        props: { children: "Click Me" },
        size: { width: 120, height: 50 },
      };
    case "input":
      return {
        props: { placeholder: "Enter text..." },
        size: { width: 200, height: 40 },
      };
    case "image":
      return {
        props: { src: "https://via.placeholder.com/200x150", alt: "Image" },
        size: { width: 200, height: 150 },
      };
    case "container":
      return {
        props: {},
        size: { width: 300, height: 200 },
      };
    default:
      return {
        props: {},
        size: { width: 100, height: 100 },
      };
  }
};

export const ArtifactBuilder = () => {
  // All hooks must be called before any conditional returns
  const screenSize = useScreenSize();
  const notifications = useQuickNotifications();
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
        base: { fontSize: "14px", padding: "8px 16px", width: "100%" },
        sm: { fontSize: "16px", padding: "10px 20px", width: "auto" },
        md: { fontSize: "18px", backgroundColor: "#1d4ed8" },
        lg: { fontSize: "20px", padding: "12px 24px" },
      },
    },
    {
      id: "demo-input",
      type: "input",
      props: { placeholder: "Enter text..." },
      position: { x: 50, y: 250 },
      size: { width: 180, height: 40 },
      styles: {
        fontSize: "14px",
        padding: "8px 12px",
        width: "100%",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "#d1d5db",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
      },
      responsiveStyles: {
        base: { fontSize: "12px", padding: "6px 10px", width: "100%" },
        sm: { fontSize: "14px", padding: "8px 12px", width: "auto" },
        md: { fontSize: "16px", borderColor: "#2563eb" },
        lg: { fontSize: "18px", padding: "10px 14px" },
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
  const { snapToGrid, setSnapToGrid, activeBreakpoint } = useCanvasStore();
  const [aspectRatioLocked, setAspectRatioLocked] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] =
    useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isAnalyticsPanelOpen, setIsAnalyticsPanelOpen] =
    useState<boolean>(false);

  // Panel visibility states - adaptés selon la taille d'écran
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(
    () => screenSize === "desktop"
  );
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(
    () => screenSize === "desktop"
  );
  const [isPreviewPanelOpen, setIsPreviewPanelOpen] = useState(
    () => screenSize === "desktop"
  );

  // Adapter automatiquement les panneaux selon la taille d'écran
  useEffect(() => {
    if (screenSize === "mobile") {
      setIsLeftPanelOpen(false);
      setIsRightPanelOpen(false);
      setIsPreviewPanelOpen(false);
    } else if (screenSize === "tablet") {
      setIsLeftPanelOpen(false);
      setIsRightPanelOpen(true);
      setIsPreviewPanelOpen(false);
    } else {
      // Desktop - tous les panneaux ouverts par défaut
      setIsLeftPanelOpen(true);
      setIsRightPanelOpen(true);
      setIsPreviewPanelOpen(true);
    }
  }, [screenSize]);

  // Toggle edit mode function
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

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
    if (typeof window !== "undefined") {
      try {
        const savedCanvas = localStorage.getItem("canvas");
        if (savedCanvas) {
          updateCanvas(JSON.parse(savedCanvas));
        }
      } catch (error) {
        console.warn("Failed to parse saved canvas data:", error);
      }

      try {
        const savedState = localStorage.getItem("appState");
        if (savedState) {
          setAppState(JSON.parse(savedState));
        }
      } catch (error) {
        console.warn("Failed to parse saved app state:", error);
      }

      try {
        const savedApiData = localStorage.getItem("apiData");
        if (savedApiData) {
          setApiData(JSON.parse(savedApiData));
        }
      } catch (error) {
        console.warn("Failed to parse saved API data:", error);
      }
    }
  }, [updateCanvas]);

  const handleSave = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("canvas", JSON.stringify(canvas));
      localStorage.setItem("appState", JSON.stringify(appState));
      localStorage.setItem("apiData", JSON.stringify(apiData));
      trackFeature("save-project", { componentCount: canvas.length });
      alert("Canvas, state, and API data saved!");
    }
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
                    ...updates.styles,
                  },
                },
              };
            }
          }
          return comp;
        })
      );
    },
    [updateCanvas, activeBreakpoint]
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
        action: toggleEditMode,
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
        action: () => setIsHelpModalOpen(true),
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
      // Panel controls
      {
        id: "toggle-left-panel",
        name: "Toggle Left Panel",
        description: "Show/hide component library and navigation",
        shortcut: "Ctrl+Shift+L",
        category: "View",
        action: () => setIsLeftPanelOpen(!isLeftPanelOpen),
      },
      {
        id: "toggle-right-panel",
        name: "Toggle Right Panel",
        description: "Show/hide properties panel",
        shortcut: "Ctrl+Shift+R",
        category: "View",
        action: () => setIsRightPanelOpen(!isRightPanelOpen),
      },
      {
        id: "toggle-preview-panel",
        name: "Toggle Preview Panel",
        description: "Show/hide live preview",
        shortcut: "Ctrl+Shift+P",
        category: "View",
        action: () => setIsPreviewPanelOpen(!isPreviewPanelOpen),
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
      toggleEditMode,
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
          case "l":
            if (e.shiftKey) {
              e.preventDefault();
              setIsLeftPanelOpen(!isLeftPanelOpen);
              console.log("🔧 Toggled left panel");
            }
            break;
          case "r":
            if (e.shiftKey) {
              e.preventDefault();
              setIsRightPanelOpen(!isRightPanelOpen);
              console.log("🔧 Toggled right panel");
            }
            break;
          case "p":
            if (e.shiftKey) {
              e.preventDefault();
              setIsPreviewPanelOpen(!isPreviewPanelOpen);
              console.log("🔧 Toggled preview panel");
            }
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

  const TabButton = ({ tabName }: { tabName: RightPanelTab }) => {
    const getIcon = (tab: string) => {
      switch (tab) {
        case "AI":
          return "🤖";
        case "Style":
          return "🎨";
        case "Animate":
          return "✨";
        case "State":
          return "⚡";
        case "API":
          return "🔌";
        case "Perf":
          return "📊";
        case "Versions":
          return "📝";
        case "A/B":
          return "🧪";
        case "Deploy":
          return "🚀";
        default:
          return "📄";
      }
    };

    return (
      <button
        onClick={() => setActiveTab(tabName)}
        className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
          activeTab === tabName
            ? "bg-primary/10 text-primary border-primary border-r-2"
            : "hover:bg-accent/50 text-gray-300 hover:text-gray-100"
        }`}
      >
        <span className="mr-2">{getIcon(tabName)}</span>
        {tabName}
      </button>
    );
  };

  return (
    <div className="relative flex h-screen font-sans">
      <LiveCursors />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />

      {/* Analytics Panel */}
      <AnalyticsPanel
        isOpen={isAnalyticsPanelOpen}
        onClose={() => setIsAnalyticsPanelOpen(false)}
      />

      {/* Main Area */}
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="glass border-border/20 flex h-16 flex-shrink-0 items-center justify-between border-b px-2 md:px-4">
          <div className="flex items-center gap-2">
            {/* Menu burger pour mobile */}
            {screenSize === "mobile" && (
              <button
                onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
                className="glass text-foreground hover:bg-accent rounded-md px-2 py-2 text-sm transition-all duration-200"
                title="Toggle Menu"
              >
                ☰
              </button>
            )}
            <h1
              className={`gradient-text font-semibold ${screenSize === "mobile" ? "text-lg" : "text-xl"}`}
            >
              {screenSize === "mobile"
                ? "Artifact Studio"
                : "Visual Artifact Studio"}
            </h1>
          </div>
          <div
            className={`flex items-center ${screenSize === "mobile" ? "gap-1" : "gap-2"}`}
          >
            {screenSize !== "mobile" && <ResponsivePanel />}

                          {/* Boutons principaux - toujours visibles */}
              <Tooltip content="Undo last action (Ctrl+Z)" position="bottom">
                <button
                  onClick={() => {
                    handleUndo();
                    notifications.info("Action annulée");
                  }}
                  disabled={historyIndex === 0}
                  className={`glass text-foreground hover:bg-accent rounded-md text-sm transition-all duration-200 disabled:opacity-50 hover-lift ${screenSize === "mobile" ? "px-2 py-1" : "px-4 py-2"}`}
                >
                  {screenSize === "mobile" ? "↶" : "Undo"}
                </button>
              </Tooltip>
              
              <Tooltip content="Redo last action (Ctrl+Y)" position="bottom">
                <button
                  onClick={() => {
                    handleRedo();
                    notifications.info("Action rétablie");
                  }}
                  disabled={historyIndex === history.length - 1}
                  className={`glass text-foreground hover:bg-accent rounded-md text-sm transition-all duration-200 disabled:opacity-50 hover-lift ${screenSize === "mobile" ? "px-2 py-1" : "px-4 py-2"}`}
                >
                  {screenSize === "mobile" ? "↷" : "Redo"}
                </button>
              </Tooltip>

                          {/* Boutons masqués sur mobile */}
              {screenSize !== "mobile" && (
                <>
                  <Tooltip content="Copy selected component (Ctrl+C)" position="bottom">
                    <ButtonWithFeedback
                      onClick={() => {
                        handleCopy();
                        notifications.success("Composant copié !");
                      }}
                      disabled={!selectedNode}
                      className="glass text-foreground hover:bg-accent rounded-md px-4 py-2 text-sm transition-all duration-200 disabled:opacity-50 hover-lift"
                    >
                      Copy
                    </ButtonWithFeedback>
                  </Tooltip>
                  
                  <Tooltip content="Paste component (Ctrl+V)" position="bottom">
                    <ButtonWithFeedback
                      onClick={() => {
                        handlePaste();
                        notifications.success("Composant collé !");
                      }}
                      className="glass text-foreground hover:bg-accent rounded-md px-4 py-2 text-sm transition-all duration-200 hover-lift"
                    >
                      Paste
                    </ButtonWithFeedback>
                  </Tooltip>
                </>
              )}
                          {/* Boutons de configuration - masqués sur mobile */}
              {screenSize !== "mobile" && (
                <>
                  <Tooltip content={`${snapToGrid ? 'Disable' : 'Enable'} snap to grid`} position="bottom">
                    <button
                      className={`glass rounded-md px-4 py-2 text-sm transition-all duration-200 hover-lift ${snapToGrid ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"}`}
                      onClick={() => {
                        setSnapToGrid(!snapToGrid);
                        notifications.info(snapToGrid ? "Snap to grid désactivé" : "Snap to grid activé");
                      }}
                    >
                      {screenSize === "tablet" ? "⊞" : "Snap to Grid"}
                    </button>
                  </Tooltip>
                  
                  <Tooltip content={`${aspectRatioLocked ? 'Unlock' : 'Lock'} aspect ratio`} position="bottom">
                    <button
                      className={`glass rounded-md px-4 py-2 text-sm transition-all duration-200 hover-lift ${aspectRatioLocked ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"}`}
                      onClick={() => {
                        setAspectRatioLocked(!aspectRatioLocked);
                        notifications.info(aspectRatioLocked ? "Aspect ratio déverrouillé" : "Aspect ratio verrouillé");
                      }}
                    >
                      {screenSize === "tablet" ? "🔒" : "Lock Aspect Ratio"}
                    </button>
                  </Tooltip>
                </>
              )}

            {/* Boutons d'actions - simplifiés selon l'écran */}
            {screenSize === "desktop" && (
              <>
                <button
                  className="glass text-foreground hover:bg-accent rounded-md px-4 py-2 text-sm transition-all duration-200 disabled:opacity-50"
                  onClick={groupSelectedNodes}
                  disabled={selectedNodeIds.length < 2}
                >
                  Group
                </button>
                <button
                  className="glass text-foreground hover:bg-accent rounded-md px-4 py-2 text-sm transition-all duration-200 disabled:opacity-50"
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
                  className="glass text-foreground hover:bg-accent rounded-md px-4 py-2 text-sm transition-all duration-200 disabled:opacity-50"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="glass text-foreground hover:bg-accent rounded-md px-4 py-2 text-sm transition-all duration-200 disabled:opacity-50"
                  onClick={handleDeploy}
                >
                  Deploy
                </button>
              </>
            )}

                          {/* Actions principales - toujours visibles mais adaptées */}
              <Tooltip content="Export project package" position="bottom">
                <button
                  className={`glass bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md text-sm transition-all duration-200 hover-lift ${screenSize === "mobile" ? "px-2 py-1" : "px-4 py-2"}`}
                  onClick={() => {
                    setIsExportModalOpen(true);
                    notifications.info("Ouverture de l'export...");
                  }}
                >
                  {screenSize === "mobile" ? "📦" : "Export Package"}
                </button>
              </Tooltip>
              
              <Tooltip content={`Switch to ${isEditMode ? 'preview' : 'edit'} mode`} position="bottom">
                <button
                  className={`glass rounded-md text-sm transition-all duration-200 hover-lift ${isEditMode ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"} ${screenSize === "mobile" ? "px-2 py-1" : "px-4 py-2"}`}
                  onClick={() => {
                    toggleEditMode();
                    notifications.info(`Mode ${isEditMode ? 'preview' : 'édition'} activé`);
                  }}
                >
                  {screenSize === "mobile"
                    ? isEditMode
                      ? "👀"
                      : "✏️"
                    : isEditMode
                      ? "Preview"
                      : "Edit"}
                </button>
              </Tooltip>

            {/* Indicateur de mode - masqué sur mobile */}
            {screenSize !== "mobile" && (
              <div
                className={`glass rounded-md px-3 py-2 text-sm font-medium ${isEditMode ? "bg-primary/20 text-primary border-primary/30 border" : "bg-secondary/20 text-secondary border-secondary/30 border"}`}
              >
                {isEditMode ? "EDIT MODE" : "PREVIEW MODE"}
              </div>
            )}

            {/* Boutons d'outils - adaptatifs */}
            {screenSize === "desktop" && (
              <button
                className="glass bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md px-4 py-2 text-sm transition-all duration-200"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    (window as any).togglePerformanceMonitor
                  ) {
                    (window as any).togglePerformanceMonitor();
                  }
                }}
              >
                Show Monitor
              </button>
            )}

            <button
              className={`glass bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md text-sm transition-all duration-200 ${screenSize === "mobile" ? "px-2 py-1" : "px-4 py-2"}`}
              onClick={() => setIsCommandPaletteOpen(true)}
              title="Open Command Palette (Ctrl+K)"
            >
              {screenSize === "mobile" ? "⌘" : "⌘ Commands"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1">
          {/* Left Panel - Component Library & Navigation */}
          {isLeftPanelOpen && (
            <div
              className={`glass border-border/20 flex flex-shrink-0 flex-col border-r ${
                screenSize === "mobile"
                  ? "absolute z-50 h-full w-full"
                  : screenSize === "tablet"
                    ? "w-56"
                    : "w-64"
              }`}
            >
              {/* Bouton de fermeture sur mobile */}
              {screenSize === "mobile" && (
                <div className="border-border/20 flex justify-end border-b p-2">
                  <button
                    onClick={() => setIsLeftPanelOpen(false)}
                    className="glass rounded-md px-3 py-2 text-sm text-gray-200 hover:text-gray-100"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Component Library */}
              <div className="flex-1">
                <ComponentLibrary />
              </div>

              {/* Navigation Tabs */}
              <div className="border-border/20 border-t">
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
            </div>
          )}

          {/* Canvas Area - Main workspace */}
          <div className="visual-canvas relative h-full flex-1 overflow-auto">
            <VisualCanvas
              components={canvas}
              selectedNodeIds={selectedNodeIds}
              onSelectNode={handleSelectNode}
              onSelectNodes={handleSelectNodes}
              onAddComponent={addComponent}
              snapToGrid={snapToGrid}
              aspectRatioLocked={aspectRatioLocked}
              onUpdateComponent={updateComponent}
              activeBreakpoint={activeBreakpoint}
              isEditMode={isEditMode}
            />

                         {/* Panel toggle buttons */}
             <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
               <Tooltip content={isLeftPanelOpen ? "Hide Left Panel (Ctrl+Shift+L)" : "Show Left Panel (Ctrl+Shift+L)"} position="right">
                 <button
                   onClick={() => {
                     setIsLeftPanelOpen(!isLeftPanelOpen);
                     notifications.info(isLeftPanelOpen ? "Panneau gauche masqué" : "Panneau gauche affiché");
                   }}
                   className="glass rounded-md px-3 py-2 text-sm text-gray-200 transition-all duration-200 hover:text-gray-100 hover-lift"
                 >
                   {isLeftPanelOpen ? "◀" : "▶"}
                 </button>
               </Tooltip>
               
               <Tooltip content={isRightPanelOpen ? "Hide Right Panel (Ctrl+Shift+R)" : "Show Right Panel (Ctrl+Shift+R)"} position="right">
                 <button
                   onClick={() => {
                     setIsRightPanelOpen(!isRightPanelOpen);
                     notifications.info(isRightPanelOpen ? "Panneau droit masqué" : "Panneau droit affiché");
                   }}
                   className="glass rounded-md px-3 py-2 text-sm text-gray-200 transition-all duration-200 hover:text-gray-100 hover-lift"
                 >
                   {isRightPanelOpen ? "▶" : "◀"}
                 </button>
               </Tooltip>
               
               <Tooltip content={isPreviewPanelOpen ? "Hide Preview (Ctrl+Shift+P)" : "Show Preview (Ctrl+Shift+P)"} position="right">
                 <button
                   onClick={() => {
                     setIsPreviewPanelOpen(!isPreviewPanelOpen);
                     notifications.info(isPreviewPanelOpen ? "Aperçu masqué" : "Aperçu affiché");
                   }}
                   className="glass rounded-md px-3 py-2 text-sm text-gray-200 transition-all duration-200 hover:text-gray-100 hover-lift"
                 >
                   {isPreviewPanelOpen ? "◀" : "▶"}
                 </button>
               </Tooltip>

              {/* Fullscreen indicator */}
              {!isLeftPanelOpen && !isRightPanelOpen && !isPreviewPanelOpen && (
                <div className="glass text-primary rounded-md px-3 py-2 text-sm font-medium">
                  🖥️ Fullscreen
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Properties & Settings */}
          {isRightPanelOpen && (
            <div
              className={`glass style-panel border-border/20 flex-shrink-0 overflow-y-auto border-l ${
                screenSize === "mobile"
                  ? "absolute right-0 z-50 h-full w-full"
                  : screenSize === "tablet"
                    ? "w-72"
                    : "w-80"
              }`}
            >
              {/* Bouton de fermeture sur mobile */}
              {screenSize === "mobile" && (
                <div className="border-border/20 flex justify-end border-b p-2">
                  <button
                    onClick={() => setIsRightPanelOpen(false)}
                    className="glass rounded-md px-3 py-2 text-sm text-gray-200 hover:text-gray-100"
                  >
                    ✕
                  </button>
                </div>
              )}
              {renderPanel()}
            </div>
          )}

          {/* Preview Panel */}
          {isPreviewPanelOpen && (
            <div
              className={`glass live-preview border-border/20 flex-shrink-0 overflow-y-auto border-l ${
                screenSize === "mobile"
                  ? "absolute right-0 z-40 h-full w-full"
                  : screenSize === "tablet"
                    ? "w-80"
                    : "w-96"
              }`}
            >
              {/* Bouton de fermeture sur mobile */}
              {screenSize === "mobile" && (
                <div className="border-border/20 flex justify-end border-b p-2">
                  <button
                    onClick={() => setIsPreviewPanelOpen(false)}
                    className="glass rounded-md px-3 py-2 text-sm text-gray-200 hover:text-gray-100"
                  >
                    ✕
                  </button>
                </div>
              )}
              <LivePreview code={livePreview} framework={framework} />
            </div>
          )}
        </div>
      </div>

      {/* Export Package Modal */}
      <ExportPackageModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        components={canvas}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};
