import { create } from "zustand";
import { persist } from "zustand/middleware";

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

interface CanvasStore {
  elements: CanvasElement[];
  selectedElementId: string | null;
  recentColors: string[];
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  addRecentColor: (color: string) => void;
  clearRecentColors: () => void;
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set) => ({
      elements: [],
      selectedElementId: null,
      recentColors: ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"],

      addElement: (element) =>
        set((state) => ({
          elements: [...state.elements, element],
        })),

      updateElement: (id, updates) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } : el,
          ),
        })),

      deleteElement: (id) =>
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          selectedElementId:
            state.selectedElementId === id ? null : state.selectedElementId,
        })),

      selectElement: (id) =>
        set(() => ({
          selectedElementId: id,
        })),

      addRecentColor: (color) =>
        set((state) => {
          const normalizedColor = color.toLowerCase();
          const filteredColors = state.recentColors.filter(
            (c) => c.toLowerCase() !== normalizedColor,
          );
          const newColors = [color, ...filteredColors].slice(0, 20);
          return { recentColors: newColors };
        }),

      clearRecentColors: () =>
        set(() => ({
          recentColors: [],
        })),
    }),
    {
      name: "canvas-store",
      partialize: (state) => ({
        recentColors: state.recentColors,
      }),
    },
  ),
);
