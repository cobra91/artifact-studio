import { create } from "zustand";
import { persist } from "zustand/middleware";

<<<<<<< Updated upstream
import { CanvasState } from "../types/artifact";
import { triggerAutoSave } from "./autoSave";

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
=======
import { CanvasState, ComponentNode } from "../types/artifact";
>>>>>>> Stashed changes

interface CanvasStore extends CanvasState {
  // Canvas-specific properties
  elements: ComponentNode[];
  selectedElementId: string | null;
  recentColors: string[];
  
  // Canvas operations
  addElement: (element: ComponentNode) => void;
  updateElement: (id: string, updates: Partial<ComponentNode>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  
  // Color management
  addRecentColor: (color: string) => void;
  clearRecentColors: () => void;
  
  // State management
  setActiveBreakpoint: (breakpoint: "base" | "sm" | "md" | "lg") => void;
  setSelectedNodes: (nodes: string[] | ((prev: string[]) => string[])) => void;
  setSnapToGrid: (snap: boolean) => void;
  
  // Component management
  addComponent: (component: ComponentNode) => void;
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
      gridVisible: true, // Added
      snapToGrid: true, // Added
      zoom: 1, // Added
      elements: [],
      selectedElementId: null,
      recentColors: ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"],
      activeBreakpoint: "base",

      addElement: element => {
        set(state => ({
          elements: [...state.elements, element],
        }));
        triggerAutoSave();
      },

      updateElement: (id, updates) => {
        set(state => {
          const updatedElement = { ...updates };
          
          // Apply grid snapping if enabled and position is being updated
          if (state.snapToGrid && (updates.x !== undefined || updates.y !== undefined)) {
            const gridSize = 20;
            if (updates.x !== undefined) {
              updatedElement.x = Math.round(updates.x / gridSize) * gridSize;
            }
            if (updates.y !== undefined) {
              updatedElement.y = Math.round(updates.y / gridSize) * gridSize;
            }
          }
          
          return {
            elements: state.elements.map(el =>
              el.id === id ? { ...el, ...updatedElement } : el
            ),
          };
        });
        triggerAutoSave();
      },

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
      addComponent: component =>
        set(state => ({
          components: [...state.components, component],
        })),
      
      updateComponent: (id, updates) =>
        set(state => ({
          components: state.components.map(comp =>
            comp.id === id ? { ...comp, ...updates } : comp
          ),
        })),
      
      deleteComponent: id =>
        set(state => ({
          components: state.components.filter(comp => comp.id !== id),
          selectedNodes: state.selectedNodes.filter(nodeId => nodeId !== id),
        })),
      
      setComponents: components =>
        set(() => ({ components })),
    }),
    {
      name: "canvas-store",
      partialize: state => ({
        recentColors: state.recentColors,
        activeBreakpoint: state.activeBreakpoint,
      }),
    }
  )
);
