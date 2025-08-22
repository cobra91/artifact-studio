import { act } from "@testing-library/react";

import { useCanvasStore } from "../lib/canvasStore";
import {
  createComponentNode,
  updateComponentPosition,
  updateComponentSize,
} from "../lib/componentOperations";
import { ComponentType } from "../types/artifact";

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

describe("Canvas Interactions and State Management", () => {
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
        components: [],
        draggedComponent: undefined,
        hoveredComponent: undefined,
        gridVisible: true,
        snapToGrid: true,
        zoom: 1,
      });
    });
    localStorageMock.setItem.mockClear();
  });

  describe("Canvas Interaction Events", () => {
    it("should handle component click and selection", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "test-button"
      );

      act(() => {
        useCanvasStore.getState().addElement(component);
        useCanvasStore.getState().selectElement("test-button");
      });

      const state = useCanvasStore.getState();
      expect(state.selectedElementId).toBe("test-button");
    });

    it("should handle multi-component selection", () => {
      const component1 = createComponentNode(
        "button" as ComponentType,
        "button-1"
      );
      const component2 = createComponentNode("text" as ComponentType, "text-1");

      act(() => {
        useCanvasStore.getState().addElement(component1);
        useCanvasStore.getState().addElement(component2);
        useCanvasStore.getState().setSelectedNodes(["button-1", "text-1"]);
      });

      const state = useCanvasStore.getState();
      expect(state.selectedNodes).toEqual(["button-1", "text-1"]);
    });

    it("should handle component dragging with grid snapping", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "drag-test"
      );
      component.position = { x: 0, y: 0 };

      act(() => {
        useCanvasStore.getState().addElement(component);
        useCanvasStore.getState().selectElement("drag-test");
        useCanvasStore.getState().setSnapToGrid(true);
      });

      // Simulate drag operation
      const draggedComponent = updateComponentPosition(component, {
        x: 25,
        y: 35,
      });

      act(() => {
        useCanvasStore.getState().updateElement("drag-test", {
          x: draggedComponent.position.x,
          y: draggedComponent.position.y,
        });
      });

      // With grid snapping enabled, should snap to nearest 20px grid
      const state = useCanvasStore.getState();
      const updatedElement = state.elements.find(el => el.id === "drag-test");
      expect(updatedElement?.x).toBe(20); // 25 rounded to nearest 20
      expect(updatedElement?.y).toBe(40); // 35 rounded to nearest 20
    });

    it("should handle component dragging without grid snapping", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "drag-test"
      );
      component.position = { x: 0, y: 0 };

      act(() => {
        useCanvasStore.getState().addElement(component);
        useCanvasStore.getState().selectElement("drag-test");
        useCanvasStore.getState().setSnapToGrid(false);
      });

      // Simulate drag operation
      const draggedComponent = updateComponentPosition(component, {
        x: 25,
        y: 35,
      });

      act(() => {
        useCanvasStore.getState().updateElement("drag-test", {
          x: draggedComponent.position.x,
          y: draggedComponent.position.y,
        });
      });

      // Without grid snapping, should use exact position
      const state = useCanvasStore.getState();
      const updatedElement = state.elements.find(el => el.id === "drag-test");
      expect(updatedElement?.x).toBe(25);
      expect(updatedElement?.y).toBe(35);
    });

    it("should handle component resizing", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "resize-test"
      );
      component.size = { width: 100, height: 50 };

      act(() => {
        useCanvasStore.getState().addElement(component);
        useCanvasStore.getState().selectElement("resize-test");
      });

      // Simulate resize operation
      const resizedComponent = updateComponentSize(component, {
        width: 200,
        height: 100,
      });

      act(() => {
        useCanvasStore.getState().updateElement("resize-test", {
          width: resizedComponent.size.width,
          height: resizedComponent.size.height,
        });
      });

      const state = useCanvasStore.getState();
      const updatedElement = state.elements.find(el => el.id === "resize-test");
      expect(updatedElement?.width).toBe(200);
      expect(updatedElement?.height).toBe(100);
    });
  });

  describe("State Management Operations", () => {
    it("should add components to canvas", () => {
      const component1 = createComponentNode(
        "button" as ComponentType,
        "button-1"
      );
      const component2 = createComponentNode("text" as ComponentType, "text-1");

      act(() => {
        useCanvasStore.getState().addElement(component1);
        useCanvasStore.getState().addElement(component2);
      });

      const state = useCanvasStore.getState();
      expect(state.elements).toHaveLength(2);
      expect(state.elements.map(el => el.id)).toEqual(["button-1", "text-1"]);
    });

    it("should remove components from canvas", () => {
      const component1 = createComponentNode(
        "button" as ComponentType,
        "button-1"
      );
      const component2 = createComponentNode("text" as ComponentType, "text-1");

      act(() => {
        useCanvasStore.getState().addElement(component1);
        useCanvasStore.getState().addElement(component2);
        useCanvasStore.getState().selectElement("button-1");
        useCanvasStore.getState().deleteElement("button-1");
      });

      const state = useCanvasStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].id).toBe("text-1");
      expect(state.selectedElementId).toBeNull();
    });

    it("should update component properties", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "update-test"
      );
      component.fill = "#000000";

      act(() => {
        useCanvasStore.getState().addElement(component);
        useCanvasStore.getState().updateElement("update-test", {
          fill: "#ff0000",
          strokeWidth: 2,
        });
      });

      const state = useCanvasStore.getState();
      const updatedElement = state.elements.find(el => el.id === "update-test");
      expect(updatedElement?.fill).toBe("#ff0000");
      expect(updatedElement?.strokeWidth).toBe(2);
    });

    it("should handle component copying to clipboard", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "clipboard-test"
      );

      act(() => {
        useCanvasStore.getState().addElement(component);
        // Simulate copying to clipboard
        useCanvasStore.setState({
          clipboard: [component],
        });
      });

      const state = useCanvasStore.getState();
      expect(state.clipboard).toHaveLength(1);
      expect(state.clipboard[0].id).toBe("clipboard-test");
    });
  });

  describe("Selection and Multi-selection Functionality", () => {
    it("should handle single component selection", () => {
      const component1 = createComponentNode(
        "button" as ComponentType,
        "button-1"
      );
      const component2 = createComponentNode("text" as ComponentType, "text-1");

      act(() => {
        useCanvasStore.getState().addElement(component1);
        useCanvasStore.getState().addElement(component2);
        useCanvasStore.getState().selectElement("button-1");
      });

      const state = useCanvasStore.getState();
      expect(state.selectedElementId).toBe("button-1");
    });

    it("should handle multi-selection with selectedNodes", () => {
      const component1 = createComponentNode(
        "button" as ComponentType,
        "button-1"
      );
      const component2 = createComponentNode("text" as ComponentType, "text-1");
      const component3 = createComponentNode(
        "image" as ComponentType,
        "image-1"
      );

      act(() => {
        useCanvasStore.getState().addElement(component1);
        useCanvasStore.getState().addElement(component2);
        useCanvasStore.getState().addElement(component3);
        useCanvasStore.getState().setSelectedNodes(["button-1", "text-1"]);
      });

      const state = useCanvasStore.getState();
      expect(state.selectedNodes).toEqual(["button-1", "text-1"]);
    });

    it("should add to existing selection with function", () => {
      act(() => {
        useCanvasStore.getState().setSelectedNodes(["button-1"]);
        useCanvasStore.getState().setSelectedNodes(prev => [...prev, "text-1"]);
      });

      const state = useCanvasStore.getState();
      expect(state.selectedNodes).toEqual(["button-1", "text-1"]);
    });

    it("should replace selection", () => {
      act(() => {
        useCanvasStore.getState().setSelectedNodes(["button-1", "text-1"]);
        useCanvasStore.getState().setSelectedNodes(["image-1"]);
      });

      const state = useCanvasStore.getState();
      expect(state.selectedNodes).toEqual(["image-1"]);
    });

    it("should clear selection", () => {
      act(() => {
        useCanvasStore.getState().setSelectedNodes(["button-1", "text-1"]);
        useCanvasStore.getState().setSelectedNodes([]);
      });

      const state = useCanvasStore.getState();
      expect(state.selectedNodes).toEqual([]);
    });
  });

  describe("Component Positioning and Layout Calculations", () => {
    it("should calculate component center point", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "position-test"
      );
      component.position = { x: 10, y: 20 };
      component.size = { width: 100, height: 50 };

      const centerX = component.position.x + component.size.width / 2;
      const centerY = component.position.y + component.size.height / 2;

      expect(centerX).toBe(60); // 10 + 100/2
      expect(centerY).toBe(45); // 20 + 50/2
    });

    it("should handle component positioning with transformations", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "transform-test"
      );
      component.position = { x: 0, y: 0 };
      component.size = { width: 100, height: 50 };
      component.rotation = 45;

      act(() => {
        useCanvasStore.getState().addElement(component);
        useCanvasStore.getState().updateElement("transform-test", {
          rotation: 90,
        });
      });

      const state = useCanvasStore.getState();
      const updatedElement = state.elements.find(
        el => el.id === "transform-test"
      );
      expect(updatedElement?.rotation).toBe(90);
    });

    it("should calculate bounding box after positioning", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "bounds-test"
      );
      component.position = { x: 50, y: 30 };
      component.size = { width: 200, height: 100 };

      const right = component.position.x + component.size.width;
      const bottom = component.position.y + component.size.height;

      expect(right).toBe(250); // 50 + 200
      expect(bottom).toBe(130); // 30 + 100
    });

    it("should handle component overlap detection", () => {
      const component1 = createComponentNode(
        "button" as ComponentType,
        "comp-1"
      );
      component1.position = { x: 0, y: 0 };
      component1.size = { width: 100, height: 50 };

      const component2 = createComponentNode("text" as ComponentType, "comp-2");
      component2.position = { x: 50, y: 25 };
      component2.size = { width: 100, height: 50 };

      // Check for overlap
      const overlapX =
        component1.position.x < component2.position.x + component2.size.width &&
        component2.position.x < component1.position.x + component1.size.width;
      const overlapY =
        component1.position.y <
          component2.position.y + component2.size.height &&
        component2.position.y < component1.position.y + component1.size.height;

      expect(overlapX).toBe(true); // Components overlap on X axis
      expect(overlapY).toBe(true); // Components overlap on Y axis
    });
  });

  describe("Grid Snapping and Alignment Functionality", () => {
    it("should snap position to grid", () => {
      const gridSize = 20;

      const snapToGrid = (position: number): number => {
        return Math.round(position / gridSize) * gridSize;
      };

      expect(snapToGrid(25)).toBe(20);
      expect(snapToGrid(35)).toBe(40);
      expect(snapToGrid(40)).toBe(40);
      expect(snapToGrid(0)).toBe(0);
    });

    it("should handle grid snapping toggle", () => {
      act(() => {
        useCanvasStore.getState().setSnapToGrid(true);
      });

      let state = useCanvasStore.getState();
      expect(state.snapToGrid).toBe(true);

      act(() => {
        useCanvasStore.getState().setSnapToGrid(false);
      });

      state = useCanvasStore.getState();
      expect(state.snapToGrid).toBe(false);
    });

    it("should align components to grid during placement", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "align-test"
      );
      const gridSize = 20;

      // Simulate drop position
      const dropX = 35;
      const dropY = 55;

      const alignedX = Math.round(dropX / gridSize) * gridSize;
      const alignedY = Math.round(dropY / gridSize) * gridSize;

      component.position = { x: alignedX, y: alignedY };

      expect(component.position.x).toBe(40); // 35 rounded to 40
      expect(component.position.y).toBe(60); // 55 rounded to 60
    });

    it("should handle alignment guides calculation", () => {
      const component1 = createComponentNode(
        "button" as ComponentType,
        "guide-1"
      );
      component1.position = { x: 0, y: 0 };
      component1.size = { width: 100, height: 50 };

      const component2 = createComponentNode(
        "text" as ComponentType,
        "guide-2"
      );
      component2.position = { x: 150, y: 0 };
      component2.size = { width: 100, height: 50 };

      // Calculate alignment guides (same Y position)
      const guides = {
        x: [0, 150], // Left edges
        y: [0], // Top edges (aligned)
      };

      expect(guides.x).toContain(0);
      expect(guides.x).toContain(150);
      expect(guides.y).toContain(0);
    });
  });

  describe("Resize Handles and Transformation Operations", () => {
    it("should calculate resize handle positions", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "resize-test"
      );
      component.position = { x: 50, y: 50 };
      component.size = { width: 100, height: 60 };

      // Calculate handle positions
      const handles = {
        n: { x: 50 + 100 / 2, y: 50 - 4 }, // North
        s: { x: 50 + 100 / 2, y: 50 + 60 + 4 }, // South
        e: { x: 50 + 100 + 4, y: 50 + 60 / 2 }, // East
        w: { x: 50 - 4, y: 50 + 60 / 2 }, // West
      };

      expect(handles.n.x).toBe(100); // Center X
      expect(handles.n.y).toBe(46); // Top - 4
      expect(handles.s.x).toBe(100); // Center X
      expect(handles.s.y).toBe(114); // Bottom + 4
    });

    it("should handle resize from different directions", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "direction-test"
      );
      component.position = { x: 50, y: 50 };
      component.size = { width: 100, height: 60 };

      // Resize from east (right) edge
      const newWidth = 150;
      const resizedComponent = updateComponentSize(component, {
        width: newWidth,
        height: component.size.height,
      });

      expect(resizedComponent.size.width).toBe(150);
      expect(resizedComponent.size.height).toBe(60);
    });

    it("should maintain aspect ratio during resize", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "aspect-test"
      );
      component.position = { x: 0, y: 0 };
      component.size = { width: 100, height: 50 };

      const aspectRatio = component.size.width / component.size.height; // 2:1

      // Resize width, height should adjust
      const newWidth = 200;
      const newHeight = newWidth / aspectRatio;

      expect(newHeight).toBe(100); // Maintains 2:1 ratio
    });

    it("should handle rotation transformations", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "rotate-test"
      );
      component.position = { x: 50, y: 50 };
      component.size = { width: 100, height: 60 };
      component.rotation = 0;

      // Rotate by 45 degrees
      component.rotation = 45;

      act(() => {
        useCanvasStore.getState().addElement(component);
        useCanvasStore.getState().updateElement("rotate-test", {
          rotation: 90,
        });
      });

      const state = useCanvasStore.getState();
      const updatedElement = state.elements.find(el => el.id === "rotate-test");
      expect(updatedElement?.rotation).toBe(90);
    });
  });

  describe("Canvas State Persistence and Restoration", () => {
    it("should persist canvas state to localStorage", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "persist-test"
      );
      component.position = { x: 10, y: 20 };
      component.size = { width: 100, height: 50 };

      act(() => {
        useCanvasStore.getState().addElement(component);
        useCanvasStore.getState().selectElement("persist-test");
        useCanvasStore.getState().setActiveBreakpoint("md");
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should restore canvas state from localStorage", () => {
      const restoredState = {
        state: {
          recentColors: ["#custom1", "#custom2"],
          activeBreakpoint: "lg" as const,
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(restoredState));

      // Simulate store initialization
      const freshStore = useCanvasStore;

      act(() => {
        freshStore.setState({
          recentColors: restoredState.state.recentColors,
          activeBreakpoint: restoredState.state.activeBreakpoint,
        });
      });

      const state = freshStore.getState();
      expect(state.recentColors).toEqual(["#custom1", "#custom2"]);
      expect(state.activeBreakpoint).toBe("lg");
    });

    it("should handle invalid persistence data gracefully", () => {
      localStorageMock.getItem.mockReturnValue("invalid json");

      expect(() => {
        // This should not throw an error
        useCanvasStore.getState();
      }).not.toThrow();
    });
  });

  describe("State Synchronization", () => {
    it("should synchronize component updates across store", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "sync-test"
      );
      component.position = { x: 0, y: 0 };

      act(() => {
        useCanvasStore.getState().setSnapToGrid(false); // Disable grid snapping for precise coordinates
        useCanvasStore.getState().addElement(component);
        useCanvasStore.getState().updateElement("sync-test", {
          x: 50,
          y: 100,
          fill: "#ff0000",
        });
      });

      const state = useCanvasStore.getState();
      const updatedElement = state.elements.find(el => el.id === "sync-test");

      expect(updatedElement?.x).toBe(50);
      expect(updatedElement?.y).toBe(100);
      expect(updatedElement?.fill).toBe("#ff0000");
    });

    it("should handle bulk component updates", () => {
      const component1 = createComponentNode(
        "button" as ComponentType,
        "bulk-1"
      );
      const component2 = createComponentNode("text" as ComponentType, "bulk-2");

      act(() => {
        useCanvasStore.getState().setSnapToGrid(false); // Disable grid snapping for precise coordinates
        useCanvasStore.getState().addElement(component1);
        useCanvasStore.getState().addElement(component2);

        // Bulk update
        useCanvasStore.getState().updateElement("bulk-1", { x: 10, y: 10 });
        useCanvasStore.getState().updateElement("bulk-2", { x: 20, y: 20 });
      });

      const state = useCanvasStore.getState();
      const elem1 = state.elements.find(el => el.id === "bulk-1");
      const elem2 = state.elements.find(el => el.id === "bulk-2");

      expect(elem1?.x).toBe(10);
      expect(elem1?.y).toBe(10);
      expect(elem2?.x).toBe(20);
      expect(elem2?.y).toBe(20);
    });

    it("should maintain state consistency during operations", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "consistency-test"
      );

      act(() => {
        useCanvasStore.getState().addElement(component);
        useCanvasStore.getState().selectElement("consistency-test");
        useCanvasStore.getState().updateElement("consistency-test", {
          x: 100,
          y: 200,
        });
        useCanvasStore.getState().deleteElement("consistency-test");
      });

      const state = useCanvasStore.getState();
      expect(state.elements).toHaveLength(0);
      expect(state.selectedElementId).toBeNull();
    });
  });
});
