import { create } from "zustand";
import { persist } from "zustand/middleware";

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
