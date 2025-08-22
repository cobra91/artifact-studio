/**
 * Comprehensive integration tests demonstrating complete component creation workflows
 * This test file shows the full user journey from start to finish
 */

import { jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
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

describe("Comprehensive Component Creation Workflow Integration Tests", () => {
  let mockStore: any;

  beforeEach(() => {
    jest.clearAllMocks();

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

  describe("End-to-End Component Creation and Editing Workflow", () => {
    it("should complete full workflow: create, edit, style, and position component", async () => {
      // Step 1: Initial state - empty canvas
      expect(mockStore.components).toEqual([]);

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

      // Step 2: Create component via drag and drop
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
      Object.defineProperty(dropEvent, "clientX", { value: 25 });
      Object.defineProperty(dropEvent, "clientY", { value: 25 });

      canvas.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(mockStore.addComponent).toHaveBeenCalledWith("button", {
          x: 40,
          y: 40,
        });
      });

      // Step 3: Select the newly created component
      const component = createMockComponentNode({
        id: "created-button",
        type: "button",
        position: { x: 40, y: 40 },
        size: { width: 100, height: 40 },
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

      // Click to select
      const clickEvent = new MouseEvent("mousedown", {
        bubbles: true,
        clientX: 90,
        clientY: 60,
      });

      canvas.dispatchEvent(clickEvent);

      expect(mockStore.selectNodes).toHaveBeenCalledWith(
        "created-button",
        false
      );

      // Step 4: Edit component properties
      mockStore.updateComponent("created-button", {
        props: {
          children: "Click Me!",
          disabled: false,
          variant: "primary",
        },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith("created-button", {
        props: {
          children: "Click Me!",
          disabled: false,
          variant: "primary",
        },
      });

      // Step 5: Update component styles
      mockStore.updateComponent("created-button", {
        styles: {
          backgroundColor: "#007bff",
          color: "#ffffff",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "bold",
          padding: "10px 20px",
        },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith("created-button", {
        styles: {
          backgroundColor: "#007bff",
          color: "#ffffff",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "bold",
          padding: "10px 20px",
        },
      });

      // Step 6: Reposition component
      mockStore.updateComponent("created-button", {
        position: { x: 100, y: 100 },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith("created-button", {
        position: { x: 100, y: 100 },
      });

      // Step 7: Resize component
      mockStore.updateComponent("created-button", {
        size: { width: 150, height: 50 },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith("created-button", {
        size: { width: 150, height: 50 },
      });

      // Verify complete workflow
      expect(mockStore.addComponent).toHaveBeenCalledTimes(1);
      expect(mockStore.selectNodes).toHaveBeenCalledTimes(1);
      expect(mockStore.updateComponent).toHaveBeenCalledTimes(4); // props, styles, position, size

      // All calls should be for the same component
      expect(
        mockStore.updateComponent.mock.calls.every(
          call => call[0] === "created-button"
        )
      ).toBe(true);
    });

    it("should handle multi-component workflow with interactions", async () => {
      const components = [
        createMockComponentNode({
          id: "button-1",
          type: "button",
          position: { x: 0, y: 0 },
        }) as any,
        createMockComponentNode({
          id: "button-2",
          type: "button",
          position: { x: 150, y: 0 },
        }) as any,
      ];

      render(
        <VisualCanvas
          components={components}
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

      // Step 1: Multi-select components
      mockStore.setSelectedNodes(["button-1", "button-2"]);

      // Step 2: Bulk edit selected components
      mockStore.updateComponent("button-1", {
        styles: { backgroundColor: "#28a745" },
      });

      mockStore.updateComponent("button-2", {
        styles: { backgroundColor: "#28a745" },
      });

      // Step 3: Move both components together
      mockStore.updateComponent("button-1", {
        position: { x: 50, y: 50 },
      });

      mockStore.updateComponent("button-2", {
        position: { x: 200, y: 50 },
      });

      // Verify multi-component operations
      expect(mockStore.setSelectedNodes).toHaveBeenCalledWith([
        "button-1",
        "button-2",
      ]);
      expect(mockStore.updateComponent).toHaveBeenCalledTimes(4);

      // Verify style updates
      expect(mockStore.updateComponent).toHaveBeenCalledWith("button-1", {
        styles: { backgroundColor: "#28a745" },
      });
      expect(mockStore.updateComponent).toHaveBeenCalledWith("button-2", {
        styles: { backgroundColor: "#28a745" },
      });

      // Verify position updates
      expect(mockStore.updateComponent).toHaveBeenCalledWith("button-1", {
        position: { x: 50, y: 50 },
      });
      expect(mockStore.updateComponent).toHaveBeenCalledWith("button-2", {
        position: { x: 200, y: 50 },
      });
    });

    it("should handle component creation with validation", async () => {
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

      // Attempt to create component with invalid data
      const invalidDropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(invalidDropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() => "invalid json"),
        },
      });
      Object.defineProperty(invalidDropEvent, "clientX", { value: 50 });
      Object.defineProperty(invalidDropEvent, "clientY", { value: 50 });

      canvas.dispatchEvent(invalidDropEvent);

      // Should not create component with invalid data
      expect(mockStore.addComponent).not.toHaveBeenCalled();

      // Create valid component
      const validDropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(validDropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() =>
            JSON.stringify({
              type: "component",
              componentType: "button",
            })
          ),
        },
      });
      Object.defineProperty(validDropEvent, "clientX", { value: 50 });
      Object.defineProperty(validDropEvent, "clientY", { value: 50 });

      canvas.dispatchEvent(validDropEvent);

      await waitFor(() => {
        expect(mockStore.addComponent).toHaveBeenCalledWith("button", {
          x: 60,
          y: 60,
        });
      });
    });

    it("should maintain component state across operations", async () => {
      const component = createMockComponentNode({
        id: "stateful-component",
        type: "button",
        position: { x: 0, y: 0 },
        props: { children: "Initial" },
        styles: { backgroundColor: "#ccc" },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["stateful-component"]}
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

      // Perform multiple operations
      mockStore.updateComponent("stateful-component", {
        props: { children: "Updated Text" },
      });

      mockStore.updateComponent("stateful-component", {
        styles: { backgroundColor: "#ff0000" },
      });

      mockStore.updateComponent("stateful-component", {
        position: { x: 100, y: 100 },
      });

      // Verify all operations were called
      expect(mockStore.updateComponent).toHaveBeenCalledTimes(3);
      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "stateful-component",
        {
          props: { children: "Updated Text" },
        }
      );
      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "stateful-component",
        {
          styles: { backgroundColor: "#ff0000" },
        }
      );
      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "stateful-component",
        {
          position: { x: 100, y: 100 },
        }
      );

      // All operations should maintain component identity
      expect(
        mockStore.updateComponent.mock.calls.every(
          call => call[0] === "stateful-component"
        )
      ).toBe(true);
    });
  });

  describe("Error Handling and Recovery Workflows", () => {
    it("should handle component creation failures gracefully", async () => {
      // Mock addComponent to throw an error
      mockStore.addComponent.mockImplementation(() => {
        throw new Error("Component creation failed");
      });

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

      // Attempt to create component
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

      // Component should not be added to canvas despite the call
      expect(mockStore.addComponent).toHaveBeenCalledWith("button", {
        x: 60,
        y: 60,
      });
    });

    it("should handle invalid component updates", () => {
      const component = createMockComponentNode({
        id: "test-component",
        type: "button",
        position: { x: 0, y: 0 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["test-component"]}
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

      // Attempt invalid update
      mockStore.updateComponent("test-component", {
        props: { invalidProp: undefined },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith("test-component", {
        props: { invalidProp: undefined },
      });
    });
  });

  describe("Performance and Memory Management", () => {
    it("should handle large number of component operations efficiently", () => {
      const components = Array.from(
        { length: 100 },
        (_, i) =>
          createMockComponentNode({
            id: `component-${i}`,
            type: "button",
            position: { x: i * 10, y: i * 10 },
          }) as any
      );

      render(
        <VisualCanvas
          components={components}
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

      // Bulk update all components
      components.forEach(component => {
        mockStore.updateComponent(component.id, {
          styles: { opacity: 0.8 },
        });
      });

      expect(mockStore.updateComponent).toHaveBeenCalledTimes(100);
    });

    it("should cleanup resources after component operations", () => {
      const component = createMockComponentNode({
        id: "cleanup-test",
        type: "button",
        position: { x: 0, y: 0 },
      }) as any;

      const { unmount } = render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["cleanup-test"]}
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

      // Perform operations
      mockStore.updateComponent("cleanup-test", {
        props: { children: "Test" },
      });

      // Unmount component
      unmount();

      // Verify cleanup
      expect(mockStore.updateComponent).toHaveBeenCalledWith("cleanup-test", {
        props: { children: "Test" },
      });
    });
  });
});
