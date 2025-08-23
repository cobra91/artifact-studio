import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CanvasState, ComponentNode, ComponentType } from "../types/artifact";

interface CanvasElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  [key: string]: any;
}

interface CanvasStore extends CanvasState {
  elements: CanvasElement[];
  selectedElementId: string | null;
  recentColors: string[];
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  addRecentColor: (color: string) => void;
  clearRecentColors: () => void;
  setActiveBreakpoint: (breakpoint: "base" | "sm" | "md" | "lg") => void;
  setSelectedNodes: (nodes: string[] | ((prev: string[]) => string[])) => void;
  setSnapToGrid: (snap: boolean) => void;
  addComponent: (type: ComponentType, componentData?: Partial<ComponentNode>) => void;
  updateComponent: (id: string, updates: Partial<ComponentNode>) => void;
  deleteComponent: (id: string) => void;
  setComponents: (components: ComponentNode[]) => void;
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    set => ({
      components: [], // Added
      selectedNodes: [], // Added
      clipboard: [], // Added
      draggedComponent: undefined, // Added
      hoveredComponent: undefined, // Added
      gridVisible: true, // Added
      snapToGrid: true, // Added
      zoom: 1, // Added
      elements: [],
      selectedElementId: null,
      recentColors: ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"],
      activeBreakpoint: "base",

      addElement: element =>
        set(state => ({
          elements: [...state.elements, element],
        })),

      updateElement: (id, updates) =>
        set(state => ({
          elements: state.elements.map(el =>
            el.id === id ? { ...el, ...updates } : el
          ),
        })),

      deleteElement: id =>
        set(state => ({
          elements: state.elements.filter(el => el.id !== id),
          selectedElementId:
            state.selectedElementId === id ? null : state.selectedElementId,
        })),

      selectElement: id =>
        set(() => ({
          selectedElementId: id,
        })),

      addRecentColor: color =>
        set(state => {
          const normalizedColor = color.toLowerCase();
          const filteredColors = state.recentColors.filter(
            c => c.toLowerCase() !== normalizedColor
          );
          const newColors = [color, ...filteredColors].slice(0, 20);
          return { recentColors: newColors };
        }),

      clearRecentColors: () =>
        set(() => ({
          recentColors: [],
        })),

      setActiveBreakpoint: breakpoint =>
        set(() => ({ activeBreakpoint: breakpoint })),
      setSelectedNodes: nodes =>
        set(state => ({
          selectedNodes:
            typeof nodes === "function" ? nodes(state.selectedNodes) : nodes,
        })),
      setSnapToGrid: snap => set(() => ({ snapToGrid: snap })),

      // Component management methods
      addComponent: (type, componentData = {}) => {
        const newComponent: ComponentNode = {
          id: componentData.id || `component_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type,
          props: componentData.props || {},
          position: componentData.position || { x: 100, y: 100 },
          size: componentData.size || { width: 200, height: 100 },
          styles: componentData.styles || {},
          children: componentData.children || [],
          responsiveStyles: componentData.responsiveStyles || {
            base: {},
            sm: {},
            md: {},
            lg: {},
          },
          metadata: componentData.metadata || {
            version: "1.0.0",
            created: new Date(),
            modified: new Date(),
          },
        };

        set(state => ({
          components: [...state.components, newComponent],
        }));
      },

      updateComponent: (id, updates) =>
        set(state => ({
          components: state.components.map(component =>
            component.id === id ? { ...component, ...updates } : component
          ),
        })),

      deleteComponent: (id) =>
        set(state => ({
          components: state.components.filter(component => component.id !== id),
          selectedNodes: state.selectedNodes.filter(nodeId => nodeId !== id),
        })),

      setComponents: (components) =>
        set(() => ({ components })),
    }),
    {
      name: "canvas-store",
      partialize: state => ({
        recentColors: state.recentColors,
        activeBreakpoint: state.activeBreakpoint,
        components: state.components,
      }),
    }
  )
);
