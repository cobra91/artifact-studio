/**
 * Integration tests for component creation workflows
 * Tests the core component creation, editing, and interaction flows
 */

import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import React from "react";

// Component imports
import { VisualCanvas } from "../components/VisualCanvas/VisualCanvas";
import { useCanvasStore } from "../lib/canvasStore";
// Test utilities
import { createMockComponentNode } from "./integration.setup";

// Mock dependencies
jest.mock("../lib/canvasStore", () => ({
  useCanvasStore: jest.fn(),
}));

describe("Component Creation Workflow Integration Tests", () => {
  let mockStore: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock store
    mockStore = {
      components: [],
      selectedNodes: [],
      clipboard: [],
      draggedComponent: undefined,
      hoveredComponent: undefined,
      gridVisible: true,
      snapToGrid: true,
      zoom: 1,
      activeBreakpoint: "base" as const,
      addComponent: jest.fn(),
      updateComponent: jest.fn(),
      deleteComponent: jest.fn(),
      selectNodes: jest.fn(),
      setSelectedNodes: jest.fn(),
      setActiveBreakpoint: jest.fn(),
      setSnapToGrid: jest.fn(),
    };

    (useCanvasStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  describe("Component Creation via Canvas", () => {
    it("should create component when dropped on canvas", () => {
      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onAddNodesToSelection={jest.fn()}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      const canvas = screen.getByRole("presentation");
      expect(canvas).toBeInTheDocument();

      // Simulate drag and drop
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() =>
            JSON.stringify({
              type: "component",
              componentType: "button",
            })
          ),
        },
      });

      canvas.dispatchEvent(dropEvent);

      expect(mockStore.addComponent).toHaveBeenCalledWith(
        "button",
        expect.any(Object)
      );
    });

    it("should handle component positioning with snap to grid", () => {
      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onAddNodesToSelection={jest.fn()}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      const canvas = screen.getByRole("presentation");

      // Simulate drop at position (15, 15) - should snap to (20, 20)
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() =>
            JSON.stringify({
              type: "component",
              componentType: "button",
            })
          ),
        },
      });

      // Mock clientX and clientY
      Object.defineProperty(dropEvent, "clientX", { value: 15 });
      Object.defineProperty(dropEvent, "clientY", { value: 15 });

      canvas.dispatchEvent(dropEvent);

      expect(mockStore.addComponent).toHaveBeenCalledWith("button", {
        x: 20,
        y: 20,
      });
    });

    it("should handle component positioning without snap to grid", () => {
      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onAddNodesToSelection={jest.fn()}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={false}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      const canvas = screen.getByRole("presentation");

      // Simulate drop at exact position (15, 15)
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() =>
            JSON.stringify({
              type: "component",
              componentType: "button",
            })
          ),
        },
      });

      Object.defineProperty(dropEvent, "clientX", { value: 15 });
      Object.defineProperty(dropEvent, "clientY", { value: 15 });

      canvas.dispatchEvent(dropEvent);

      expect(mockStore.addComponent).toHaveBeenCalledWith("button", {
        x: 15,
        y: 15,
      });
    });
  });

  describe("Component Selection and Editing", () => {
    it("should select component on click", () => {
      const component = createMockComponentNode({
        id: "test-component",
        type: "button",
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={[]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onAddNodesToSelection={jest.fn()}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      const canvas = screen.getByRole("presentation");
      expect(canvas).toBeInTheDocument();

      // Click on the component
      const mouseEvent = new MouseEvent("mousedown", {
        bubbles: true,
        clientX: 50,
        clientY: 25,
      });

      canvas.dispatchEvent(mouseEvent);

      expect(mockStore.selectNodes).toHaveBeenCalledWith(
        "test-component",
        false
      );
    });

    it("should support multi-selection with Ctrl key", () => {
      const component1 = createMockComponentNode({
        id: "component-1",
        type: "button",
        position: { x: 0, y: 0 },
      }) as any;

      const component2 = createMockComponentNode({
        id: "component-2",
        type: "input",
        position: { x: 100, y: 0 },
      }) as any;

      render(
        <VisualCanvas
          components={[component1, component2]}
          selectedNodeIds={["component-1"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onAddNodesToSelection={jest.fn()}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      const canvas = screen.getByRole("presentation");

      // Click second component with Ctrl key
      const mouseEvent = new MouseEvent("mousedown", {
        bubbles: true,
        clientX: 150,
        clientY: 25,
        ctrlKey: true,
      });

      canvas.dispatchEvent(mouseEvent);

      expect(mockStore.selectNodes).toHaveBeenCalledWith("component-2", true);
    });
  });

  describe("Component Interaction Flows", () => {
    it("should handle drag and drop component movement", () => {
      const component = createMockComponentNode({
        id: "draggable-component",
        type: "button",
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["draggable-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onAddNodesToSelection={jest.fn()}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      const canvas = screen.getByRole("presentation");

      // Start drag
      const mouseDownEvent = new MouseEvent("mousedown", {
        bubbles: true,
        clientX: 50,
        clientY: 25,
      });

      canvas.dispatchEvent(mouseDownEvent);

      // Simulate mouse move (drag)
      const mouseMoveEvent = new MouseEvent("mousemove", {
        bubbles: true,
        clientX: 70,
        clientY: 45,
      });

      canvas.dispatchEvent(mouseMoveEvent);

      // Release mouse (drop)
      const mouseUpEvent = new MouseEvent("mouseup", {
        bubbles: true,
        clientX: 70,
        clientY: 45,
      });

      canvas.dispatchEvent(mouseUpEvent);

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "draggable-component",
        expect.objectContaining({
          position: expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number),
          }),
        })
      );
    });

    it("should handle component resizing", () => {
      const component = createMockComponentNode({
        id: "resizable-component",
        type: "button",
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["resizable-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onAddNodesToSelection={jest.fn()}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      const canvas = screen.getByRole("presentation");

      // Simulate resize handle interaction
      const mouseDownEvent = new MouseEvent("mousedown", {
        bubbles: true,
        clientX: 100,
        clientY: 50,
      });

      // Add resize direction to event detail
      Object.defineProperty(mouseDownEvent, "target", {
        value: { dataset: { direction: "se" } },
      });

      canvas.dispatchEvent(mouseDownEvent);

      // Simulate resize drag
      const mouseMoveEvent = new MouseEvent("mousemove", {
        bubbles: true,
        clientX: 120,
        clientY: 70,
      });

      canvas.dispatchEvent(mouseMoveEvent);

      // Release resize
      const mouseUpEvent = new MouseEvent("mouseup", {
        bubbles: true,
        clientX: 120,
        clientY: 70,
      });

      canvas.dispatchEvent(mouseUpEvent);

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "resizable-component",
        expect.objectContaining({
          size: expect.objectContaining({
            width: expect.any(Number),
            height: expect.any(Number),
          }),
        })
      );
    });
  });

  describe("Multi-step Component Workflows", () => {
    it("should complete full component creation and editing workflow", () => {
      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onAddNodesToSelection={jest.fn()}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      const canvas = screen.getByRole("presentation");

      // Step 1: Create component
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() =>
            JSON.stringify({
              type: "component",
              componentType: "button",
            })
          ),
        },
      });
      Object.defineProperty(dropEvent, "clientX", { value: 50 });
      Object.defineProperty(dropEvent, "clientY", { value: 50 });

      canvas.dispatchEvent(dropEvent);

      expect(mockStore.addComponent).toHaveBeenCalledWith("button", {
        x: 60,
        y: 60,
      });

      // Step 2: Select component (simulate component was added)
      const component = createMockComponentNode({
        id: "created-component",
        type: "button",
        position: { x: 60, y: 60 },
      }) as any;

      // Re-render with component
      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={[]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onAddNodesToSelection={jest.fn()}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      const updatedCanvas = screen.getByRole("presentation");

      // Click to select
      const clickEvent = new MouseEvent("mousedown", {
        bubbles: true,
        clientX: 110,
        clientY: 85,
      });

      updatedCanvas.dispatchEvent(clickEvent);

      expect(mockStore.selectNodes).toHaveBeenCalledWith(
        "created-component",
        false
      );

      // Step 3: Move component
      const mouseDownEvent = new MouseEvent("mousedown", {
        bubbles: true,
        clientX: 110,
        clientY: 85,
      });

      updatedCanvas.dispatchEvent(mouseDownEvent);

      const mouseMoveEvent = new MouseEvent("mousemove", {
        bubbles: true,
        clientX: 130,
        clientY: 105,
      });

      updatedCanvas.dispatchEvent(mouseMoveEvent);

      const mouseUpEvent = new MouseEvent("mouseup", {
        bubbles: true,
        clientX: 130,
        clientY: 105,
      });

      updatedCanvas.dispatchEvent(mouseUpEvent);

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "created-component",
        expect.objectContaining({
          position: expect.any(Object),
        })
      );
    });
  });
});
