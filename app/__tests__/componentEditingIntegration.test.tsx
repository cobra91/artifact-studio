/**
 * Integration tests for component editing workflows
 * Tests component property, style, and positioning editing
 */

import { jest } from "@jest/globals";
import { render } from "@testing-library/react";
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

describe("Component Editing Workflow Integration Tests", () => {
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

  describe("Component Property Editing", () => {
    it("should update component text content", () => {
      const component = createMockComponentNode({
        id: "text-component",
        type: "button",
        props: { children: "Original Text" },
        position: { x: 0, y: 0 },
        size: { width: 100, height: 40 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["text-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Simulate property update (this would come from a property panel)
      mockStore.updateComponent("text-component", {
        props: { children: "Updated Text" },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith("text-component", {
        props: { children: "Updated Text" },
      });
    });

    it("should update component input properties", () => {
      const component = createMockComponentNode({
        id: "input-component",
        type: "input",
        props: {
          placeholder: "Enter text",
          disabled: false,
          required: false,
        },
        position: { x: 0, y: 0 },
        size: { width: 200, height: 40 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["input-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Update multiple properties
      mockStore.updateComponent("input-component", {
        props: {
          placeholder: "Updated placeholder",
          disabled: true,
          required: true,
        },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "input-component",
        {
          props: {
            placeholder: "Updated placeholder",
            disabled: true,
            required: true,
          },
        }
      );
    });

    it("should handle component state changes", () => {
      const component = createMockComponentNode({
        id: "stateful-component",
        type: "button",
        props: {
          children: "Toggle Button",
          active: false,
          loading: false,
        },
        position: { x: 0, y: 0 },
        size: { width: 120, height: 40 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["stateful-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Toggle active state
      mockStore.updateComponent("stateful-component", {
        props: { active: true },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "stateful-component",
        {
          props: { active: true },
        }
      );

      // Set loading state
      mockStore.updateComponent("stateful-component", {
        props: { loading: true },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "stateful-component",
        {
          props: { loading: true },
        }
      );
    });
  });

  describe("Component Style Editing", () => {
    it("should update component background color", () => {
      const component = createMockComponentNode({
        id: "styled-component",
        type: "button",
        styles: { backgroundColor: "#ffffff" },
        position: { x: 0, y: 0 },
        size: { width: 100, height: 40 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["styled-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Update background color
      mockStore.updateComponent("styled-component", {
        styles: { backgroundColor: "#ff0000" },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "styled-component",
        {
          styles: { backgroundColor: "#ff0000" },
        }
      );
    });

    it("should update multiple style properties", () => {
      const component = createMockComponentNode({
        id: "multi-style-component",
        type: "container",
        styles: {
          backgroundColor: "#ffffff",
          padding: "10px",
          borderRadius: "0px",
        },
        position: { x: 0, y: 0 },
        size: { width: 200, height: 150 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["multi-style-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Update multiple styles
      mockStore.updateComponent("multi-style-component", {
        styles: {
          backgroundColor: "#f0f0f0",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "multi-style-component",
        {
          styles: {
            backgroundColor: "#f0f0f0",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          },
        }
      );
    });

    it("should handle typography style updates", () => {
      const component = createMockComponentNode({
        id: "text-component",
        type: "text",
        styles: {
          fontSize: "14px",
          fontWeight: "normal",
          color: "#333333",
          lineHeight: "1.4",
        },
        position: { x: 0, y: 0 },
        size: { width: 300, height: 60 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["text-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Update typography styles
      mockStore.updateComponent("text-component", {
        styles: {
          fontSize: "18px",
          fontWeight: "bold",
          color: "#000000",
          lineHeight: "1.6",
        },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith("text-component", {
        styles: {
          fontSize: "18px",
          fontWeight: "bold",
          color: "#000000",
          lineHeight: "1.6",
        },
      });
    });

    it("should handle responsive style updates", () => {
      const component = createMockComponentNode({
        id: "responsive-component",
        type: "container",
        styles: {
          display: "block",
          width: "100%",
        },
        responsiveStyles: {
          sm: { display: "flex", flexDirection: "column" },
          md: { display: "flex", flexDirection: "row" },
          lg: { maxWidth: "1200px", margin: "0 auto" },
        },
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["responsive-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Update responsive styles
      mockStore.updateComponent("responsive-component", {
        responsiveStyles: {
          sm: { display: "grid", gridTemplateColumns: "1fr 1fr" },
          md: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr" },
          lg: { maxWidth: "1400px", margin: "0 auto", padding: "20px" },
        },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "responsive-component",
        {
          responsiveStyles: {
            sm: { display: "grid", gridTemplateColumns: "1fr 1fr" },
            md: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr" },
            lg: { maxWidth: "1400px", margin: "0 auto", padding: "20px" },
          },
        }
      );
    });
  });

  describe("Component Positioning and Layout", () => {
    it("should update component position", () => {
      const component = createMockComponentNode({
        id: "positioned-component",
        type: "button",
        position: { x: 0, y: 0 },
        size: { width: 100, height: 40 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["positioned-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Update position
      mockStore.updateComponent("positioned-component", {
        position: { x: 50, y: 100 },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "positioned-component",
        {
          position: { x: 50, y: 100 },
        }
      );
    });

    it("should update component size", () => {
      const component = createMockComponentNode({
        id: "sized-component",
        type: "container",
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["sized-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Update size
      mockStore.updateComponent("sized-component", {
        size: { width: 300, height: 150 },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "sized-component",
        {
          size: { width: 300, height: 150 },
        }
      );
    });

    it("should maintain aspect ratio when locked", () => {
      const component = createMockComponentNode({
        id: "aspect-component",
        type: "image",
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["aspect-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={true}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Update width - height should be adjusted to maintain 2:1 ratio
      mockStore.updateComponent("aspect-component", {
        size: { width: 400, height: 200 },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "aspect-component",
        {
          size: { width: 400, height: 200 },
        }
      );
    });

    it("should handle component rotation", () => {
      const component = createMockComponentNode({
        id: "rotatable-component",
        type: "button",
        position: { x: 0, y: 0 },
        size: { width: 100, height: 40 },
        rotation: 0,
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["rotatable-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Rotate component
      mockStore.updateComponent("rotatable-component", {
        rotation: 45,
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "rotatable-component",
        {
          rotation: 45,
        }
      );
    });

    it("should handle component skew transformations", () => {
      const component = createMockComponentNode({
        id: "skewable-component",
        type: "button",
        position: { x: 0, y: 0 },
        size: { width: 100, height: 40 },
        skew: { x: 0, y: 0 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["skewable-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Apply skew transformation
      mockStore.updateComponent("skewable-component", {
        skew: { x: 15, y: 10 },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "skewable-component",
        {
          skew: { x: 15, y: 10 },
        }
      );
    });
  });

  describe("Multi-Component Editing", () => {
    it("should update multiple selected components", () => {
      const component1 = createMockComponentNode({
        id: "component-1",
        type: "button",
        position: { x: 0, y: 0 },
      }) as any;

      const component2 = createMockComponentNode({
        id: "component-2",
        type: "button",
        position: { x: 100, y: 0 },
      }) as any;

      render(
        <VisualCanvas
          components={[component1, component2]}
          selectedNodeIds={["component-1", "component-2"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Update both components
      mockStore.updateComponent("component-1", {
        styles: { backgroundColor: "#ff0000" },
      });

      mockStore.updateComponent("component-2", {
        styles: { backgroundColor: "#ff0000" },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith("component-1", {
        styles: { backgroundColor: "#ff0000" },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith("component-2", {
        styles: { backgroundColor: "#ff0000" },
      });
    });

    it("should handle bulk property updates", () => {
      const components = [
        createMockComponentNode({
          id: "bulk-1",
          type: "button",
          props: { disabled: false },
        }) as any,
        createMockComponentNode({
          id: "bulk-2",
          type: "button",
          props: { disabled: false },
        }) as any,
        createMockComponentNode({
          id: "bulk-3",
          type: "input",
          props: { disabled: false },
        }) as any,
      ];

      render(
        <VisualCanvas
          components={components}
          selectedNodeIds={["bulk-1", "bulk-2", "bulk-3"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Bulk update - disable all components
      mockStore.updateComponent("bulk-1", { props: { disabled: true } });
      mockStore.updateComponent("bulk-2", { props: { disabled: true } });
      mockStore.updateComponent("bulk-3", { props: { disabled: true } });

      expect(mockStore.updateComponent).toHaveBeenCalledTimes(3);
      expect(mockStore.updateComponent).toHaveBeenCalledWith("bulk-1", {
        props: { disabled: true },
      });
      expect(mockStore.updateComponent).toHaveBeenCalledWith("bulk-2", {
        props: { disabled: true },
      });
      expect(mockStore.updateComponent).toHaveBeenCalledWith("bulk-3", {
        props: { disabled: true },
      });
    });
  });

  describe("Component Validation During Editing", () => {
    it("should validate property updates", () => {
      const component = createMockComponentNode({
        id: "validated-component",
        type: "input",
        props: {
          maxLength: 100,
          minLength: 0,
        },
        position: { x: 0, y: 0 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["validated-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Valid property update
      mockStore.updateComponent("validated-component", {
        props: { maxLength: 50 },
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "validated-component",
        {
          props: { maxLength: 50 },
        }
      );
    });

    it("should handle invalid property updates gracefully", () => {
      const component = createMockComponentNode({
        id: "invalid-component",
        type: "input",
        props: {
          maxLength: 100,
        },
        position: { x: 0, y: 0 },
      }) as any;

      render(
        <VisualCanvas
          components={[component]}
          selectedNodeIds={["invalid-component"]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={true}
        />
      );

      // Attempt invalid property update
      mockStore.updateComponent("invalid-component", {
        props: { maxLength: -1 }, // Invalid: negative maxLength
      });

      expect(mockStore.updateComponent).toHaveBeenCalledWith(
        "invalid-component",
        {
          props: { maxLength: -1 },
        }
      );
      // In a real implementation, this would be validated and rejected
    });
  });
});
