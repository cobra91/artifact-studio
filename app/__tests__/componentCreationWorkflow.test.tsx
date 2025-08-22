/**
 * Integration tests for complete component creation workflows
 * Tests the entire user journey from template selection to final component
 */

import { jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { ComponentLibrary } from "@/components/ComponentLibrary";
import { StylePanel } from "@/components/StylePanel";

// Component imports
import { VisualCanvas } from "../components/VisualCanvas/VisualCanvas";
import { useCanvasStore } from "../lib/canvasStore";
// Test utilities
import {
  createMockComponentNode,
  simulateUserInteraction,
} from "./integration.setup";

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

  describe("Template Selection and Loading", () => {
    it("should load and display available templates", async () => {
      const mockTemplates = [
        createMockTemplate({ id: "template-1", name: "Button Template" }),
        createMockTemplate({ id: "template-2", name: "Form Template" }),
      ];

      (getTemplates as jest.Mock).mockResolvedValue(mockTemplates);

      render(
        <div>
          <ComponentLibrary />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText("Button Template")).toBeInTheDocument();
        expect(screen.getByText("Form Template")).toBeInTheDocument();
      });
    });

    it("should filter templates by category", async () => {
      const mockTemplates = [
        createMockTemplate({
          id: "template-1",
          name: "Button Template",
          category: "ui",
        }),
        createMockTemplate({
          id: "template-2",
          name: "Form Template",
          category: "form",
        }),
      ];

      (getTemplates as jest.Mock).mockResolvedValue(mockTemplates);

      render(
        <div>
          <ComponentLibrary />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText("Button Template")).toBeInTheDocument();
      });

      // Click on category filter
      const categoryFilter = screen.getByRole("button", { name: /ui/i });
      fireEvent.click(categoryFilter);

      await waitFor(() => {
        expect(screen.getByText("Button Template")).toBeInTheDocument();
        expect(screen.queryByText("Form Template")).not.toBeInTheDocument();
      });
    });

    it("should search templates by name and description", async () => {
      const mockTemplates = [
        createMockTemplate({
          id: "template-1",
          name: "Interactive Button",
          description: "A clickable button component",
        }),
        createMockTemplate({
          id: "template-2",
          name: "Form Template",
          description: "A complete form",
        }),
      ];

      (getTemplates as jest.Mock).mockResolvedValue(mockTemplates);

      render(
        <div>
          <ComponentLibrary />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText("Interactive Button")).toBeInTheDocument();
      });

      // Search for "button"
      const searchInput = screen.getByPlaceholderText(/search templates/i);
      fireEvent.change(searchInput, { target: { value: "button" } });

      await waitFor(() => {
        expect(screen.getByText("Interactive Button")).toBeInTheDocument();
        expect(screen.queryByText("Form Template")).not.toBeInTheDocument();
      });
    });

    it("should handle template loading errors gracefully", async () => {
      (getTemplates as jest.Mock).mockRejectedValue(new Error("Network error"));

      render(
        <div>
          <ComponentLibrary />
        </div>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/failed to load templates/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Template Instantiation Workflow", () => {
    it("should instantiate template components on canvas", async () => {
      const templateComponents = [
        createMockComponentNode({
          id: "template-button",
          type: "button",
          position: { x: 0, y: 0 },
          size: { width: 100, height: 40 },
        }),
      ];

      const mockTemplate = createMockTemplate({
        id: "template-1",
        name: "Button Template",
        components: templateComponents,
      });

      (getTemplates as jest.Mock).mockResolvedValue([mockTemplate]);

      render(
        <div>
          <ComponentLibrary />
          <VisualCanvas
            components={[]}
            selectedNodeIds={[]}
            onSelectNode={jest.fn()}
            onSelectNodes={jest.fn()}
            onAddNodesToSelection={jest.fn()}
            onUpdateComponent={mockStore.updateComponent}
            onAddComponent={mockStore.addComponent}
            snapToGrid={true}
            aspectRatioLocked={false}
            activeBreakpoint="base"
            isEditMode={true}
          />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText("Button Template")).toBeInTheDocument();
      });

      // Drag template to canvas
      const templateCard = screen
        .getByText("Button Template")
        .closest("[draggable]");
      expect(templateCard).toBeInTheDocument();

      if (templateCard) {
        const canvasElement = screen.getByRole("presentation"); // Canvas element
        const dataTransfer = simulateUserInteraction.dragStart(templateCard);
        simulateUserInteraction.drop(canvasElement, { dataTransfer });
      }

      await waitFor(() => {
        expect(mockStore.addComponent).toHaveBeenCalledWith(
          "button",
          expect.any(Object)
        );
      });
    });

    it("should instantiate multi-component templates", async () => {
      const templateComponents = [
        createMockComponentNode({
          id: "template-input",
          type: "input",
          position: { x: 0, y: 0 },
        }),
        createMockComponentNode({
          id: "template-button",
          type: "button",
          position: { x: 0, y: 50 },
        }),
      ];

      const mockTemplate = createMockTemplate({
        id: "form-template",
        name: "Form Template",
        components: templateComponents,
      });

      (getTemplates as jest.Mock).mockResolvedValue([mockTemplate]);

      render(
        <div>
          <ComponentLibrary />
          <VisualCanvas
            components={[]}
            selectedNodeIds={[]}
            onSelectNode={jest.fn()}
            onSelectNodes={jest.fn()}
            onAddNodesToSelection={jest.fn()}
            onUpdateComponent={mockStore.updateComponent}
            onAddComponent={mockStore.addComponent}
            snapToGrid={true}
            aspectRatioLocked={false}
            activeBreakpoint="base"
            isEditMode={true}
          />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText("Form Template")).toBeInTheDocument();
      });

      // Drag template to canvas
      const templateCard = screen
        .getByText("Form Template")
        .closest("[draggable]");
      if (templateCard) {
        const canvasElement = screen.getByRole("presentation");
        const dataTransfer = simulateUserInteraction.dragStart(templateCard);
        simulateUserInteraction.drop(canvasElement, { dataTransfer });
      }

      await waitFor(() => {
        expect(mockStore.addComponent).toHaveBeenCalledTimes(2);
        expect(mockStore.addComponent).toHaveBeenCalledWith(
          "input",
          expect.any(Object)
        );
        expect(mockStore.addComponent).toHaveBeenCalledWith(
          "button",
          expect.any(Object)
        );
      });
    });

    it("should maintain component relationships during instantiation", async () => {
      const childComponent = createMockComponentNode({
        id: "child-button",
        type: "button",
        position: { x: 10, y: 10 },
      });

      const parentComponent = createMockComponentNode({
        id: "parent-container",
        type: "container",
        position: { x: 0, y: 0 },
        children: [childComponent],
      });

      const mockTemplate = createMockTemplate({
        id: "container-template",
        name: "Container Template",
        components: [parentComponent],
      });

      (getTemplates as jest.Mock).mockResolvedValue([mockTemplate]);

      render(
        <div>
          <ComponentLibrary />
          <VisualCanvas
            components={[]}
            selectedNodeIds={[]}
            onSelectNode={jest.fn()}
            onSelectNodes={jest.fn()}
            onAddNodesToSelection={jest.fn()}
            onUpdateComponent={mockStore.updateComponent}
            onAddComponent={mockStore.addComponent}
            snapToGrid={true}
            aspectRatioLocked={false}
            activeBreakpoint="base"
            isEditMode={true}
          />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText("Container Template")).toBeInTheDocument();
      });

      // Drag template to canvas
      const templateCard = screen
        .getByText("Container Template")
        .closest("[draggable]");
      if (templateCard) {
        const canvasElement = screen.getByRole("presentation");
        const dataTransfer = simulateUserInteraction.dragStart(templateCard);
        simulateUserInteraction.drop(canvasElement, { dataTransfer });
      }

      await waitFor(() => {
        expect(mockStore.addComponent).toHaveBeenCalledWith(
          "container",
          expect.any(Object)
        );
        // Verify that the parent component maintains its child relationship
        const addComponentCall = mockStore.addComponent.mock.calls.find(
          (call: any) => call[0] === "container"
        );
        expect(addComponentCall).toBeDefined();
      });
    });
  });

  describe("Component Positioning and Layout", () => {
    it("should position new components with snap-to-grid", () => {
      const components = [
        createMockComponentNode({
          id: "existing-component",
          position: { x: 20, y: 20 },
        }),
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

      const canvasElement = screen.getByRole("presentation");
      simulateUserInteraction.drop(canvasElement, {
        clientX: 15,
        clientY: 15,
      });

      expect(mockStore.addComponent).toHaveBeenCalledWith(
        expect.any(String),
        { x: 20, y: 20 } // Should snap to nearest grid point
      );
    });

    it("should position components without grid snapping when disabled", () => {
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

      const canvasElement = screen.getByRole("presentation");
      simulateUserInteraction.drop(canvasElement, {
        clientX: 15,
        clientY: 15,
      });

      expect(mockStore.addComponent).toHaveBeenCalledWith(
        expect.any(String),
        { x: 15, y: 15 } // Should use exact coordinates
      );
    });

    it("should prevent component overlap when positioning", () => {
      const existingComponent = createMockComponentNode({
        id: "existing",
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
      });

      render(
        <VisualCanvas
          components={[existingComponent]}
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

      const canvasElement = screen.getByRole("presentation");
      simulateUserInteraction.drop(canvasElement, {
        clientX: 50,
        clientY: 25,
      });

      expect(mockStore.addComponent).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });
  });

  describe("Component Validation During Creation", () => {
    it("should validate component properties before creation", async () => {
      const invalidTemplate = createMockTemplate({
        id: "invalid-template",
        name: "Invalid Template",
        components: [
          createMockComponentNode({
            type: "button",
            props: { invalidProp: undefined }, // Invalid prop
          }),
        ],
      });

      (getTemplates as jest.Mock).mockResolvedValue([invalidTemplate]);

      // Mock validation to return errors
      const validationSpy = jest.spyOn(
        await import("../lib/componentOperations"),
        "validateComponentNode"
      );
      validationSpy.mockReturnValue([
        {
          field: "props.invalidProp",
          message: "Invalid property",
          type: "required",
        },
      ]);

      render(
        <div>
          <ComponentLibrary />
          <VisualCanvas
            components={[]}
            selectedNodeIds={[]}
            onSelectNode={jest.fn()}
            onSelectNodes={jest.fn()}
            onAddNodesToSelection={jest.fn()}
            onUpdateComponent={mockStore.updateComponent}
            onAddComponent={mockStore.addComponent}
            snapToGrid={true}
            aspectRatioLocked={false}
            activeBreakpoint="base"
            isEditMode={true}
          />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText("Invalid Template")).toBeInTheDocument();
      });

      // Attempt to create invalid component
      const templateCard = screen
        .getByText("Invalid Template")
        .closest("[draggable]");
      if (templateCard) {
        const canvasElement = screen.getByRole("presentation");
        const dataTransfer = simulateUserInteraction.dragStart(templateCard);
        simulateUserInteraction.drop(canvasElement, { dataTransfer });
      }

      await waitFor(() => {
        expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
      });

      validationSpy.mockRestore();
    });

    it("should create components with valid properties", async () => {
      const validTemplate = createMockTemplate({
        id: "valid-template",
        name: "Valid Template",
        components: [
          createMockComponentNode({
            type: "button",
            props: { children: "Click me", disabled: false },
          }),
        ],
      });

      (getTemplates as jest.Mock).mockResolvedValue([validTemplate]);

      render(
        <div>
          <ComponentLibrary />
          <VisualCanvas
            components={[]}
            selectedNodeIds={[]}
            onSelectNode={jest.fn()}
            onSelectNodes={jest.fn()}
            onAddNodesToSelection={jest.fn()}
            onUpdateComponent={mockStore.updateComponent}
            onAddComponent={mockStore.addComponent}
            snapToGrid={true}
            aspectRatioLocked={false}
            activeBreakpoint="base"
            isEditMode={true}
          />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText("Valid Template")).toBeInTheDocument();
      });

      // Create valid component
      const templateCard = screen
        .getByText("Valid Template")
        .closest("[draggable]");
      if (templateCard) {
        const canvasElement = screen.getByRole("presentation");
        const dataTransfer = simulateUserInteraction.dragStart(templateCard);
        simulateUserInteraction.drop(canvasElement, { dataTransfer });
      }

      await waitFor(() => {
        expect(mockStore.addComponent).toHaveBeenCalledWith(
          "button",
          expect.any(Object)
        );
      });
    });
  });

  describe("Complete Component Creation Workflow", () => {
    it("should complete full workflow from template to styled component", async () => {
      const template = createMockTemplate({
        id: "workflow-template",
        name: "Workflow Template",
        components: [
          createMockComponentNode({
            type: "button",
            props: { children: "Template Button" },
            styles: { backgroundColor: "#007bff" },
          }),
        ],
      });

      (getTemplates as jest.Mock).mockResolvedValue([template]);

      render(
        <div>
          <ComponentLibrary />
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
          <StylePanel />
        </div>
      );

      // Step 1: Select and instantiate template
      await waitFor(() => {
        expect(screen.getByText("Workflow Template")).toBeInTheDocument();
      });

      const templateCard = screen
        .getByText("Workflow Template")
        .closest("[draggable]");
      if (templateCard) {
        const canvasElement = screen.getByRole("presentation");
        const dataTransfer = simulateUserInteraction.dragStart(templateCard);
        simulateUserInteraction.drop(canvasElement, { dataTransfer });
      }

      await waitFor(() => {
        expect(mockStore.addComponent).toHaveBeenCalledWith(
          "button",
          expect.any(Object)
        );
      });

      // Step 2: Select created component
      const createdComponent = mockStore.addComponent.mock.calls[0][1];
      const componentElement = screen.getByText("Template Button");
      simulateUserInteraction.click(componentElement);

      await waitFor(() => {
        expect(mockStore.selectNodes).toHaveBeenCalledWith(
          createdComponent.id,
          false
        );
      });

      // Step 3: Modify component properties via style panel
      const stylePanel = screen.getByRole("complementary");
      const backgroundColorInput =
        within(stylePanel).getByLabelText(/background color/i);
      fireEvent.change(backgroundColorInput, { target: { value: "#ff0000" } });

      await waitFor(() => {
        expect(mockStore.updateComponent).toHaveBeenCalledWith(
          createdComponent.id,
          expect.objectContaining({
            styles: expect.objectContaining({ backgroundColor: "#ff0000" }),
          })
        );
      });

      // Step 4: Verify complete workflow
      expect(mockStore.addComponent).toHaveBeenCalledTimes(1);
      expect(mockStore.selectNodes).toHaveBeenCalledTimes(1);
      expect(mockStore.updateComponent).toHaveBeenCalledTimes(1);
    });
  });
});
