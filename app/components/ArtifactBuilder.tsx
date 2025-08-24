"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AIProvider } from "../lib/aiProvider";
import {
  analytics,
  trackComponentCreate,
  trackComponentDelete,
  trackFeature,
} from "../lib/analytics";
import { useCanvasStore } from "../lib/canvasStore";
import { debug } from "../lib/debug";
import {
  AIGenerationRequest,
  ComponentNode,
  ComponentType,
  SandboxResult,
} from "../types/artifact";
import { AIPromptPanel } from "./AIPromptPanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { AnimationPanel } from "./AnimationPanel";
import { CommandPalette } from "./CommandPalette";
import { ComponentLibrary } from "./ComponentLibrary";
import { ExportPackageModal } from "./ExportPackageModal";
import { HelpModal } from "./HelpModal";
import { LivePreview } from "./LivePreview";
import { StylePanel } from "./StylePanel";
import { useQuickNotifications } from "./ui/notifications";
import { Tooltip } from "./ui/tooltip";
import { VisualCanvas } from "./VisualCanvas/VisualCanvas";

// Hook to detect screen size
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

type RightPanelTab = "AI" | "Style" | "Animate" | "State";

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
        textAlign: "center",
        color: "#ffffff",
        backgroundColor: "#1f2937",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #374151",
      },
      responsiveStyles: {
        base: { fontSize: "14px", width: "100%", color: "#ffffff" },
        sm: { fontSize: "16px", width: "auto", color: "#ffffff" },
        md: { fontSize: "18px", color: "#60a5fa", backgroundColor: "#1e3a8a" },
        lg: {
          fontSize: "20px",
          fontWeight: "900",
          color: "#ffffff",
          backgroundColor: "#1f2937",
        },
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

  // Panel visibility states - adapted according to screen size
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(
    () => screenSize === "desktop"
  );
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(
    () => screenSize === "desktop"
  );
  const [isPreviewPanelOpen, setIsPreviewPanelOpen] = useState(
    () => screenSize === "desktop"
  );

  // Automatically adapt panels according to screen size
  useEffect(() => {
    if (screenSize === "mobile") {
      setIsLeftPanelOpen(false);
      setIsRightPanelOpen(false);
      setIsPreviewPanelOpen(false);
    } else if (screenSize === "tablet") {
      setIsLeftPanelOpen(true); // Keep left panel open on tablet to access AI/Style/Animate/State buttons
      setIsRightPanelOpen(true);
      setIsPreviewPanelOpen(false);
    } else {
      // Desktop - all panels open by default
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
    debug.log("🔍 setSingleNodeSelection called with:", nodeId);
    setSelectedNodeIds([nodeId]);
  }, []);

  const handleSelectNode = useCallback(
    (nodeId: string | null, ctrlPressed: boolean) => {
      debug.log("🔍 handleSelectNode called:", {
        nodeId,
        ctrlPressed,
        currentSelection: selectedNodeIds,
      });

      if (nodeId === null) {
        debug.log("🔍 Deselecting all");
        setSelectedNodeIds([]);
      } else if (ctrlPressed) {
        debug.log("🔍 Toggle selection for:", nodeId);
        toggleNodeSelection(nodeId);
      } else {
        debug.log("🔍 Single selection for:", nodeId);
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

  // Function to restore components from history
  const handleRestoreComponents = useCallback(
    (components: ComponentNode[]) => {
      // Clear current canvas and add restored components
      updateCanvas(components);

      // Show notification
      notifications.success(
        `Restored ${components.length} components from history`
      );
    },
    [updateCanvas, notifications]
  );

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
    request: AIGenerationRequest,
    config?: { provider: AIProvider }
  ): Promise<SandboxResult> => {
    debug.log("generateFromPrompt called with:", { request, config });
    setIsGenerating(true);
    setFramework(request.framework);
    try {
      debug.log("Calling generate API...");
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aiRequest: request,
          config: {
            provider: config?.provider,
            model: (config as any)?.model,
          },
        }),
      });

      let result;

      // Check if response is streaming
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/event-stream")) {
        debug.log("Handling streaming response...");

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    fullContent += parsed.choices[0].delta.content;
                  }
                } catch {
                  // Ignore parsing errors for incomplete chunks
                }
              }
            }
          }
          reader.releaseLock();
        }

        // Clean the content and extract JSON from markdown if needed
        let cleanContent = fullContent.trim();

        // Remove markdown code blocks if present
        if (cleanContent.startsWith("```json")) {
          cleanContent = cleanContent
            .replace(/^```json\s*/, "")
            .replace(/\s*```$/, "");
        } else if (cleanContent.startsWith("```")) {
          cleanContent = cleanContent
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "");
        }

        debug.log("Cleaned content:", cleanContent.substring(0, 200) + "...");

        // Parse the complete JSON response
        const parsedContent = JSON.parse(cleanContent);
        debug.log("Parsed streaming content:", parsedContent);

        // Convert the parsed content to components and code
        let components: ComponentNode[] = [];
        let xOffset = 100;
        let yOffset = 100;

        if (parsedContent.componentDetails) {
          Object.entries(parsedContent.componentDetails).forEach(
            ([id, details]: [string, any]) => {
              const componentType = details.type;
              const componentId = `ai-${id}-${Date.now()}`;

              // Determine component size based on type
              let defaultSize = { width: 150, height: 50 };
              if (componentType === "image") {
                defaultSize = { width: 200, height: 150 };
              } else if (componentType === "container") {
                defaultSize = { width: 300, height: 200 };
              } else if (componentType === "input") {
                defaultSize = { width: 200, height: 40 };
              } else if (componentType === "button") {
                defaultSize = { width: 120, height: 50 };
              } else if (componentType === "text") {
                defaultSize = { width: 200, height: 40 };
              }

              // Create component based on type
              const newComponent: ComponentNode = {
                id: componentId,
                type: componentType as ComponentType,
                position: { x: xOffset, y: yOffset },
                size: defaultSize,
                props: details.props || {},
                styles: {},
              };

              // Add default styles for better visibility
              if (componentType === "text") {
                newComponent.styles = {
                  color: "#ffffff",
                  backgroundColor: "#374151",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "2px solid #4b5563",
                  fontSize: "16px",
                  fontWeight: "600",
                  textAlign: "left",
                  minHeight: "20px",
                  display: "flex",
                  alignItems: "center",
                  ...details.props?.styles,
                };
              } else if (componentType === "button") {
                newComponent.styles = {
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  ...details.props?.styles,
                };
              } else if (componentType === "input") {
                newComponent.styles = {
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "2px solid #d1d5db",
                  fontSize: "14px",
                  minHeight: "20px",
                  ...details.props?.styles,
                };

                // Special styling for range inputs (sliders)
                if (details.props?.type === "range") {
                  newComponent.styles = {
                    width: "100%",
                    height: "20px",
                    borderRadius: "10px",
                    background:
                      "linear-gradient(to right, #3b82f6 0%, #3b82f6 50%, #e5e7eb 50%, #e5e7eb 100%)",
                    outline: "none",
                    opacity: "1",
                    transition: "all 0.3s",
                    cursor: "pointer",
                    border: "2px solid #3b82f6",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    ...details.props?.styles,
                  };
                }
              } else if (componentType === "container") {
                newComponent.styles = {
                  backgroundColor: "#1f2937",
                  border: "2px solid #4b5563",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  ...details.props?.styles,
                };
              }

              // Add content if present
              if (details.content) {
                newComponent.props.content = details.content;
                // For text components, also set children
                if (componentType === "text") {
                  newComponent.props.children = details.content;
                }
              }

              // Add specific props based on component type
              if (componentType === "button" && details.content) {
                newComponent.props.children = details.content;
              }

              if (componentType === "input" && details.props?.placeholder) {
                newComponent.props.placeholder = details.props.placeholder;
              }

              if (componentType === "image" && details.props?.src) {
                newComponent.props.src = details.props.src;
                newComponent.props.alt = details.props.alt || "Image";
              }

              components.push(newComponent);

              // Offset next component
              xOffset += defaultSize.width + 20;
              if (xOffset > 600) {
                xOffset = 100;
                yOffset += defaultSize.height + 20;
              }
            }
          );
        }

        // Create a parent container to group all components
        if (components.length > 0) {
          const parentContainer: ComponentNode = {
            id: `ai-parent-container-${Date.now()}`,
            type: "container",
            position: { x: 50, y: 50 },
            size: { width: 600, height: Math.max(400, yOffset + 50) },
            props: {
              content: request.prompt,
              children: components.map(c => c.id).join(", "),
            },
            styles: {
              backgroundColor: "#1f2937",
              border: "3px solid #3b82f6",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              minHeight: "400px",
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.2)",
            },
            children: components,
          };

          // Update component positions to be relative to parent
          components.forEach((component, index) => {
            component.position = {
              x: 24 + (index % 2) * 280,
              y: 24 + Math.floor(index / 2) * 60,
            };
          });

          // Replace components array with just the parent container
          components = [parentContainer];
        }

        // If no componentDetails, create a container with the prompt
        if (components.length === 0 && parsedContent.components) {
          const canvasComponent: ComponentNode = {
            id: `ai-generated-container-${Date.now()}`,
            type: "container",
            position: { x: 100, y: 100 },
            size: { width: 300, height: 200 },
            props: { content: request.prompt },
            styles: parsedContent.layout?.root?.styles || {},
          };
          components.push(canvasComponent);
        }

        // Generate code from the parsed content
        const code = JSON.stringify(parsedContent, null, 2);

        result = {
          success: true,
          code: code,
          components: components,
          preview: "Generated successfully",
        };
      } else {
        // Handle regular JSON response
        const jsonResult = await response.json();
        debug.log("Generate API result:", jsonResult);

        if (!jsonResult.success) {
          throw new Error(jsonResult.error || "Generation failed");
        }

        result = jsonResult;
      }

      // Process the result
      updateCanvas(prev => [...prev, ...result.components]);
      setLivePreview(result.code);

      return {
        success: true,
        code: result.code,
        preview: "Generated successfully",
      };
    } catch (error) {
      console.error("Error in generateFromPrompt:", error);
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
    (
      type: ComponentType,
      position: { x: number; y: number },
      parentContainerId?: string
    ) => {
      const defaults = getComponentDefaults(type);
      const newComponent: ComponentNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        props: defaults.props,
        size: defaults.size,
        styles: {},
      };

      if (parentContainerId) {
        // Add component as child of container
        updateCanvas(prev =>
          prev.map(component => {
            if (
              component.id === parentContainerId &&
              component.type === "container"
            ) {
              return {
                ...component,
                children: [...(component.children || []), newComponent],
              };
            }
            return component;
          })
        );
      } else {
        // Add component to canvas
        updateCanvas(prev => [...prev, newComponent]);
      }

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
      debug.log("🔍 updateComponent called with:", id, updates);
      updateCanvas(prev =>
        prev.map(comp => {
          if (comp.id === id) {
            // Always update position and size regardless of breakpoint
            if (updates.position || updates.size) {
              return { ...comp, ...updates };
            }

            // For style updates, handle responsive styles
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

  /* const handleAddState = (key: string, value: any) => {
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
  }; */

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
      /* {
        id: "open-deploy-panel",
        name: "Open Deploy Panel",
        description: "Switch to the deployment panel",
        shortcut: "",
        category: "Panels",
        action: () => setActiveTab("Deploy"),
      }, */
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
      isLeftPanelOpen,
      isPreviewPanelOpen,
      isRightPanelOpen,
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
              debug.log("📋 Copied component:", selectedNode.id);
            }
            break;
          case "v":
            e.preventDefault();
            handlePaste();
            debug.log("📋 Pasting component...");
            break;
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
              debug.log("↪️ Redo");
            } else {
              handleUndo();
              debug.log("↩️ Undo");
            }
            break;
          case "a":
            e.preventDefault();
            // Select all components
            setSelectedNodeIds(canvas.map(c => c.id));
            debug.log("🔵 Selected all components");
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
              debug.log("📄 Duplicated component:", duplicated.id);
            }
            break;
          case "s":
            e.preventDefault();
            handleSave();
            debug.log("💾 Saved project");
            break;
          case "k":
            e.preventDefault();
            setIsCommandPaletteOpen(true);
            debug.log("⌘ Opened command palette");
            break;
          case "l":
            if (e.shiftKey) {
              e.preventDefault();
              setIsLeftPanelOpen(!isLeftPanelOpen);
              debug.log("🔧 Toggled left panel");
            }
            break;
          case "r":
            if (e.shiftKey) {
              e.preventDefault();
              setIsRightPanelOpen(!isRightPanelOpen);
              debug.log("🔧 Toggled right panel");
            }
            break;
          case "p":
            if (e.shiftKey) {
              e.preventDefault();
              setIsPreviewPanelOpen(!isPreviewPanelOpen);
              debug.log("🔧 Toggled preview panel");
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
              debug.log("🗑️ Deleted selected components");
            }
            break;
          case "escape":
            e.preventDefault();
            setSelectedNodeIds([]);
            debug.log("❌ Cleared selection");
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
    isLeftPanelOpen,
    isPreviewPanelOpen,
    isRightPanelOpen,
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
            onRestoreComponents={handleRestoreComponents}
          />
        );
      case "Style":
        return <StylePanel {...panelProps} />;
      case "Animate":
        return <AnimationPanel {...panelProps} />;
      /*       case "State":
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
        return <DeploymentPanel />; */
      default:
        return null;
    }
  };


  return (
    <div className="relative flex h-screen font-sans">
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
        <div className="glass border-border/20 flex h-16 flex-shrink-0 items-center justify-between border-b px-1 md:px-4 overflow-hidden">
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
          <div className={`flex items-center gap-2`}>
            {/* Boutons essentiels seulement */}
            <Tooltip content="Undo (Ctrl+Z)" position="bottom">
              <button
                onClick={() => {
                  handleUndo();
                  notifications.info("Action undone");
                }}
                disabled={historyIndex === 0}
                className="glass text-foreground hover:bg-accent hover-lift rounded-md px-2 py-1 text-sm transition-all duration-200 disabled:opacity-50"
              >
                ↶
              </button>
            </Tooltip>

            <Tooltip content="Redo (Ctrl+Y)" position="bottom">
              <button
                onClick={() => {
                  handleRedo();
                  notifications.info("Action restored");
                }}
                disabled={historyIndex === history.length - 1}
                className="glass text-foreground hover:bg-accent hover-lift rounded-md px-2 py-1 text-sm transition-all duration-200 disabled:opacity-50"
              >
                ↷
              </button>
            </Tooltip>

            <Tooltip content="Export" position="bottom">
              <button
                className="glass bg-secondary text-secondary-foreground hover:bg-secondary/90 hover-lift rounded-md px-2 py-1 text-sm transition-all duration-200"
                onClick={() => {
                  setIsExportModalOpen(true);
                  notifications.info("Opening export...");
                }}
              >
                📦
              </button>
            </Tooltip>

            <Tooltip content={`${isEditMode ? "Preview" : "Edit"} mode`} position="bottom">
              <button
                className={`glass hover-lift rounded-md px-2 py-1 text-sm transition-all duration-200 ${isEditMode ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                onClick={() => {
                  toggleEditMode();
                  notifications.info(`${isEditMode ? "Preview" : "Edit"} mode activated`);
                }}
              >
                {isEditMode ? "👀" : "✏️"}
              </button>
            </Tooltip>

            <button
              className="glass bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md px-2 py-1 text-sm transition-all duration-200"
              onClick={() => setIsCommandPaletteOpen(true)}
              title="Commands (Ctrl+K)"
            >
              ⌘
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
                    ? "w-48 min-w-48 max-w-48"
                    : "w-56 min-w-56 max-w-56"
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
                <ComponentLibrary
                  onAddTemplate={components => {
                    updateCanvas(prev => [...prev, ...components]);
                    notifications.success(
                      `Added ${components.length} components from template`
                    );
                  }}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>
            </div>
          )}

          {/* Canvas Area - Main workspace */}
          <div className="visual-canvas relative h-full flex-1 overflow-hidden">
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

            {/* Panel toggle buttons - positioned on left edge of canvas to avoid collisions */}
            <div className="absolute top-1/2 left-4 z-30 flex flex-col gap-2 -translate-y-1/2">
              <Tooltip
                content={
                  isLeftPanelOpen
                    ? "Hide Left Panel (Ctrl+Shift+L)"
                    : "Show Left Panel (Ctrl+Shift+L)"
                }
                position="right"
              >
                <button
                  onClick={() => {
                    setIsLeftPanelOpen(!isLeftPanelOpen);
                    notifications.info(
                      isLeftPanelOpen ? "Left panel hidden" : "Left panel shown"
                    );
                  }}
                  className="glass hover-lift rounded-md px-3 py-2 text-sm text-gray-200 transition-all duration-200 hover:text-gray-100"
                >
                  {isLeftPanelOpen ? "🗂️" : "📁"}
                </button>
              </Tooltip>

              <Tooltip
                content={
                  isRightPanelOpen
                    ? "Hide Right Panel (Ctrl+Shift+R)"
                    : "Show Right Panel (Ctrl+Shift+R)"
                }
                position="right"
              >
                <button
                  onClick={() => {
                    setIsRightPanelOpen(!isRightPanelOpen);
                    notifications.info(
                      isRightPanelOpen
                        ? "Right panel hidden"
                        : "Right panel shown"
                    );
                  }}
                  className="glass hover-lift rounded-md px-3 py-2 text-sm text-gray-200 transition-all duration-200 hover:text-gray-100"
                >
                  {isRightPanelOpen ? "⚙️" : "🔧"}
                </button>
              </Tooltip>

              <Tooltip
                content={
                  isPreviewPanelOpen
                    ? "Hide Preview (Ctrl+Shift+P)"
                    : "Show Preview (Ctrl+Shift+P)"
                }
                position="right"
              >
                <button
                  onClick={() => {
                    setIsPreviewPanelOpen(!isPreviewPanelOpen);
                    notifications.info(
                      isPreviewPanelOpen ? "Preview hidden" : "Preview shown"
                    );
                  }}
                  className="glass hover-lift rounded-md px-3 py-2 text-sm text-gray-200 transition-all duration-200 hover:text-gray-100"
                >
                  {isPreviewPanelOpen ? "👁️" : "👀"}
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
              className={`glass style-panel border-border/20 flex-shrink-0 border-l ${
                screenSize === "mobile"
                  ? "absolute right-0 z-50 h-full w-full"
                  : screenSize === "tablet"
                    ? "w-64 min-w-64 max-w-64"
                    : "w-72 min-w-72 max-w-72"
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
                    ? "w-72 min-w-72 max-w-72"
                    : "w-80 min-w-80 max-w-80"
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
