import { act } from "@testing-library/react";

import { useCanvasStore } from "../lib/canvasStore";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("Canvas Store", () => {
  beforeEach(() => {
    // Reset Zustand store before each test
    act(() => {
      useCanvasStore.setState({
        elements: [],
        selectedElementId: null,
        recentColors: ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"],
        activeBreakpoint: "base",
        selectedNodes: [],
        clipboard: [],
        draggedComponent: undefined,
        hoveredComponent: undefined,
        gridVisible: true,
        snapToGrid: true,
        zoom: 1,
      });
    });
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockClear();
  });

  describe("Element Management", () => {
    it("should add elements to the canvas", () => {
      const element = {
        id: "test-1",
        type: "text",
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: "#ff0000",
      };

      act(() => {
        useCanvasStore.getState().addElement(element);
      });

      const state = useCanvasStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0]).toEqual(element);
    });

    it("should update existing elements", () => {
      const element = {
        id: "test-1",
        type: "text",
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: "#ff0000",
      };

      act(() => {
        useCanvasStore.getState().addElement(element);
        useCanvasStore.getState().updateElement("test-1", {
          x: 50,
          y: 60,
          fill: "#00ff00",
        });
      });

      const state = useCanvasStore.getState();
      expect(state.elements[0]).toEqual({
        ...element,
        x: 50,
        y: 60,
        fill: "#00ff00",
      });
    });

    it("should delete elements by id", () => {
      const element1 = {
        id: "test-1",
        type: "text",
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      };
      const element2 = {
        id: "test-2",
        type: "button",
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      };

      act(() => {
        useCanvasStore.getState().addElement(element1);
        useCanvasStore.getState().addElement(element2);
        useCanvasStore.getState().selectElement("test-1");
        useCanvasStore.getState().deleteElement("test-1");
      });

      const state = useCanvasStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].id).toBe("test-2");
      expect(state.selectedElementId).toBeNull();
    });

    it("should clear selectedElementId when deleting selected element", () => {
      const element = {
        id: "test-1",
        type: "text",
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      };

      act(() => {
        useCanvasStore.getState().addElement(element);
        useCanvasStore.getState().selectElement("test-1");
        useCanvasStore.getState().deleteElement("test-1");
      });

      const state = useCanvasStore.getState();
      expect(state.selectedElementId).toBeNull();
    });
  });

  describe("Selection Management", () => {
    it("should select elements by id", () => {
      const element = {
        id: "test-1",
        type: "text",
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      };

      act(() => {
        useCanvasStore.getState().addElement(element);
        useCanvasStore.getState().selectElement("test-1");
      });

      const state = useCanvasStore.getState();
      expect(state.selectedElementId).toBe("test-1");
    });

    it("should deselect elements", () => {
      const element = {
        id: "test-1",
        type: "text",
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      };

      act(() => {
        useCanvasStore.getState().addElement(element);
        useCanvasStore.getState().selectElement("test-1");
        useCanvasStore.getState().selectElement(null);
      });

      const state = useCanvasStore.getState();
      expect(state.selectedElementId).toBeNull();
    });

    it("should handle multi-selection with selectedNodes", () => {
      const element1 = {
        id: "test-1",
        type: "text",
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      };
      const element2 = {
        id: "test-2",
        type: "button",
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      };

      act(() => {
        useCanvasStore.getState().addElement(element1);
        useCanvasStore.getState().addElement(element2);
        useCanvasStore.getState().setSelectedNodes(["test-1", "test-2"]);
      });

      const state = useCanvasStore.getState();
      expect(state.selectedNodes).toEqual(["test-1", "test-2"]);
    });

    it("should replace selection with function", () => {
      act(() => {
        useCanvasStore.getState().setSelectedNodes(["test-1", "test-2"]);
        useCanvasStore.getState().setSelectedNodes(prev => [...prev, "test-3"]);
      });

      const state = useCanvasStore.getState();
      expect(state.selectedNodes).toEqual(["test-1", "test-2", "test-3"]);
    });
  });

  describe("Color Management", () => {
    it("should add recent colors", () => {
      act(() => {
        useCanvasStore.getState().addRecentColor("#123456");
      });

      const state = useCanvasStore.getState();
      expect(state.recentColors).toContain("#123456");
      expect(state.recentColors).toHaveLength(6); // 5 original + 1 new
    });

    it("should limit recent colors to 20", () => {
      const colors = Array.from(
        { length: 25 },
        (_, i) => `#${i.toString().padStart(6, "0")}`
      );

      act(() => {
        colors.forEach(color =>
          useCanvasStore.getState().addRecentColor(color)
        );
      });

      const state = useCanvasStore.getState();
      expect(state.recentColors).toHaveLength(20);
      expect(state.recentColors[state.recentColors.length - 1]).toBe("#000005");
    });

    it("should normalize color case", () => {
      act(() => {
        useCanvasStore.getState().addRecentColor("#ABCDEF");
        useCanvasStore.getState().addRecentColor("#abcdef");
      });

      const state = useCanvasStore.getState();
      expect(
        state.recentColors.filter(c => c.toLowerCase() === "#abcdef")
      ).toHaveLength(1);
    });

    it("should clear recent colors", () => {
      act(() => {
        useCanvasStore.getState().addRecentColor("#123456");
        useCanvasStore.getState().clearRecentColors();
      });

      const state = useCanvasStore.getState();
      expect(state.recentColors).toEqual([]);
    });
  });

  describe("Breakpoint Management", () => {
    it("should set active breakpoint", () => {
      act(() => {
        useCanvasStore.getState().setActiveBreakpoint("md");
      });

      const state = useCanvasStore.getState();
      expect(state.activeBreakpoint).toBe("md");
    });
  });

  describe("Grid Management", () => {
    it("should toggle snap to grid", () => {
      act(() => {
        useCanvasStore.getState().setSnapToGrid(false);
      });

      const state = useCanvasStore.getState();
      expect(state.snapToGrid).toBe(false);

      act(() => {
        useCanvasStore.getState().setSnapToGrid(true);
      });

      const state2 = useCanvasStore.getState();
      expect(state2.snapToGrid).toBe(true);
    });
  });

  describe("State Persistence", () => {
    it("should call localStorage.setItem on state changes", () => {
      act(() => {
        useCanvasStore.getState().setActiveBreakpoint("lg");
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});
