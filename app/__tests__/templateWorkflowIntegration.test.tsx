/**
 * Integration tests for template loading and instantiation workflows
 */

import { jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

// Component imports
import { VisualCanvas } from "../components/VisualCanvas/VisualCanvas";
import { useCanvasStore } from "../lib/canvasStore";
import { fetchTemplates, getTemplates } from "../lib/templates";
// Test utilities
import {
  createMockComponentNode,
  createMockTemplate,
} from "./integration.setup";

// Mock dependencies
jest.mock("../lib/templates", () => ({
  fetchTemplates: jest.fn(),
  getTemplates: jest.fn(),
  getTemplateById: jest.fn(),
}));

jest.mock("../lib/canvasStore", () => ({
  useCanvasStore: jest.fn(),
}));

describe("Template Loading and Instantiation Workflow Integration Tests", () => {
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

  describe("Template Fetching and Caching", () => {
    it("should fetch templates from API on first load", async () => {
      const mockTemplates = [
        createMockTemplate({
          id: "template-1",
          name: "Button Template",
          description: "A simple button template",
        }),
      ];

      (fetchTemplates as jest.Mock).mockResolvedValue(mockTemplates);

      await import("../lib/templates");
      const templates = await getTemplates();

      expect(fetchTemplates).toHaveBeenCalledTimes(1);
      expect(templates).toEqual(mockTemplates);
    });

    it("should cache templates to avoid repeated API calls", async () => {
      const mockTemplates = [
        createMockTemplate({
          id: "template-1",
          name: "Button Template",
        }),
      ];

      (fetchTemplates as jest.Mock).mockResolvedValue(mockTemplates);

      // First call
      const templates1 = await getTemplates();
      expect(fetchTemplates).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const templates2 = await getTemplates();
      expect(fetchTemplates).toHaveBeenCalledTimes(1); // Still 1

      expect(templates1).toEqual(templates2);
    });

    it("should handle template fetch errors gracefully", async () => {
      (fetchTemplates as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const templates = await getTemplates();

      expect(templates).toEqual([]);
      expect(fetchTemplates).toHaveBeenCalledTimes(1);
    });

    it("should filter templates by search criteria", async () => {
      const mockTemplates = [
        createMockTemplate({
          id: "template-1",
          name: "Interactive Button",
          description: "A clickable button component",
          category: "ui",
          tags: ["button", "interactive"],
        }),
        createMockTemplate({
          id: "template-2",
          name: "Form Template",
          description: "A complete form",
          category: "form",
          tags: ["form", "input"],
        }),
        createMockTemplate({
          id: "template-3",
          name: "Card Component",
          description: "A card layout component",
          category: "ui",
          tags: ["card", "layout"],
        }),
      ];

      (fetchTemplates as jest.Mock).mockResolvedValue(mockTemplates);

      // Filter by category
      let templates = await getTemplates({ category: "ui" });
      expect(templates).toHaveLength(2);
      expect(templates[0].id).toBe("template-1");
      expect(templates[1].id).toBe("template-3");

      // Filter by tags
      templates = await getTemplates({ tags: ["button"] });
      expect(templates).toHaveLength(1);
      expect(templates[0].id).toBe("template-1");

      // Search by name
      templates = await getTemplates({ search: "form" });
      expect(templates).toHaveLength(1);
      expect(templates[0].id).toBe("template-2");

      // Search by description
      templates = await getTemplates({ search: "clickable" });
      expect(templates).toHaveLength(1);
      expect(templates[0].id).toBe("template-1");
    });
  });

  describe("Template Instantiation", () => {
    it("should instantiate single component template", async () => {
      const templateComponents = [
        createMockComponentNode({
          id: "template-button",
          type: "button",
          position: { x: 0, y: 0 },
          size: { width: 100, height: 40 },
        }) as any,
      ];

      const mockTemplate = createMockTemplate({
        id: "single-template",
        name: "Single Button Template",
        components: templateComponents,
      });

      (getTemplates as jest.Mock).mockResolvedValue([mockTemplate]);

      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
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

      const canvas = screen.getByRole("presentation");

      // Simulate template drop
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() =>
            JSON.stringify({
              type: "template",
              templateId: "single-template",
            })
          ),
        },
      });
      Object.defineProperty(dropEvent, "clientX", { value: 50 });
      Object.defineProperty(dropEvent, "clientY", { value: 50 });

      canvas.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(mockStore.addComponent).toHaveBeenCalledWith(
          "button",
          expect.any(Object)
        );
      });
    });

    it("should instantiate multi-component template with proper positioning", async () => {
      const templateComponents = [
        createMockComponentNode({
          id: "template-input",
          type: "input",
          position: { x: 0, y: 0 },
          size: { width: 200, height: 40 },
        }) as any,
        createMockComponentNode({
          id: "template-button",
          type: "button",
          position: { x: 0, y: 50 },
          size: { width: 100, height: 40 },
        }) as any,
      ];

      const mockTemplate = createMockTemplate({
        id: "form-template",
        name: "Form Template",
        components: templateComponents,
      });

      (getTemplates as jest.Mock).mockResolvedValue([mockTemplate]);

      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
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

      const canvas = screen.getByRole("presentation");

      // Simulate template drop at position (10, 10)
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() =>
            JSON.stringify({
              type: "template",
              templateId: "form-template",
            })
          ),
        },
      });
      Object.defineProperty(dropEvent, "clientX", { value: 10 });
      Object.defineProperty(dropEvent, "clientY", { value: 10 });

      canvas.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(mockStore.addComponent).toHaveBeenCalledTimes(2);
        expect(mockStore.addComponent).toHaveBeenCalledWith("input", {
          x: 20,
          y: 20,
        });
        expect(mockStore.addComponent).toHaveBeenCalledWith("button", {
          x: 20,
          y: 60,
        });
      });
    });

    it("should instantiate nested component templates", async () => {
      const childComponent = createMockComponentNode({
        id: "child-button",
        type: "button",
        position: { x: 10, y: 10 },
        size: { width: 80, height: 30 },
      }) as any;

      const parentComponent = createMockComponentNode({
        id: "parent-container",
        type: "container",
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 },
        children: [childComponent],
      }) as any;

      const mockTemplate = createMockTemplate({
        id: "nested-template",
        name: "Nested Template",
        components: [parentComponent],
      });

      (getTemplates as jest.Mock).mockResolvedValue([mockTemplate]);

      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
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

      const canvas = screen.getByRole("presentation");

      // Simulate template drop
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() =>
            JSON.stringify({
              type: "template",
              templateId: "nested-template",
            })
          ),
        },
      });
      Object.defineProperty(dropEvent, "clientX", { value: 30 });
      Object.defineProperty(dropEvent, "clientY", { value: 30 });

      canvas.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(mockStore.addComponent).toHaveBeenCalledWith(
          "container",
          expect.any(Object)
        );
      });
    });

    it("should preserve component properties during template instantiation", async () => {
      const templateComponents = [
        createMockComponentNode({
          id: "template-styled-button",
          type: "button",
          position: { x: 0, y: 0 },
          size: { width: 120, height: 45 },
          props: {
            children: "Template Button",
            disabled: false,
            variant: "primary",
          },
          styles: {
            backgroundColor: "#007bff",
            color: "#ffffff",
            borderRadius: "4px",
            fontSize: "14px",
          },
        }) as any,
      ];

      const mockTemplate = createMockTemplate({
        id: "styled-template",
        name: "Styled Button Template",
        components: templateComponents,
      });

      (getTemplates as jest.Mock).mockResolvedValue([mockTemplate]);

      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
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

      const canvas = screen.getByRole("presentation");

      // Simulate template drop
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() =>
            JSON.stringify({
              type: "template",
              templateId: "styled-template",
            })
          ),
        },
      });
      Object.defineProperty(dropEvent, "clientX", { value: 25 });
      Object.defineProperty(dropEvent, "clientY", { value: 25 });

      canvas.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(mockStore.addComponent).toHaveBeenCalledWith(
          "button",
          expect.objectContaining({
            x: 40,
            y: 40,
          })
        );
      });
    });
  });

  describe("Template Drop Zone Handling", () => {
    it("should handle template drops on valid canvas areas", () => {
      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
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

      const canvas = screen.getByRole("presentation");

      // Valid drop
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() =>
            JSON.stringify({
              type: "template",
              templateId: "test-template",
            })
          ),
        },
      });
      Object.defineProperty(dropEvent, "clientX", { value: 100 });
      Object.defineProperty(dropEvent, "clientY", { value: 100 });

      canvas.dispatchEvent(dropEvent);

      expect(mockStore.addComponent).toHaveBeenCalled();
    });

    it("should prevent template drops when canvas is not in edit mode", () => {
      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
          onSelectNode={mockStore.selectNodes}
          onSelectNodes={mockStore.setSelectedNodes}
          onUpdateComponent={mockStore.updateComponent}
          onAddComponent={mockStore.addComponent}
          snapToGrid={true}
          aspectRatioLocked={false}
          activeBreakpoint="base"
          isEditMode={false}
        />
      );

      const canvas = screen.getByRole("presentation");

      // Attempt drop in preview mode
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() =>
            JSON.stringify({
              type: "template",
              templateId: "test-template",
            })
          ),
        },
      });
      Object.defineProperty(dropEvent, "clientX", { value: 100 });
      Object.defineProperty(dropEvent, "clientY", { value: 100 });

      canvas.dispatchEvent(dropEvent);

      expect(mockStore.addComponent).not.toHaveBeenCalled();
    });

    it("should handle drag over events for visual feedback", () => {
      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
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

      const canvas = screen.getByRole("presentation");

      // Drag over event
      const dragOverEvent = new Event("dragover", { bubbles: true });
      Object.defineProperty(dragOverEvent, "dataTransfer", {
        value: {
          dropEffect: "copy",
        },
      });

      canvas.dispatchEvent(dragOverEvent);

      expect(dragOverEvent.dataTransfer.dropEffect).toBe("copy");
    });
  });

  describe("Template Error Handling", () => {
    it("should handle missing template gracefully", async () => {
      (getTemplates as jest.Mock).mockResolvedValue([]);

      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
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

      const canvas = screen.getByRole("presentation");

      // Attempt to drop non-existent template
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() =>
            JSON.stringify({
              type: "template",
              templateId: "non-existent-template",
            })
          ),
        },
      });
      Object.defineProperty(dropEvent, "clientX", { value: 50 });
      Object.defineProperty(dropEvent, "clientY", { value: 50 });

      canvas.dispatchEvent(dropEvent);

      expect(mockStore.addComponent).not.toHaveBeenCalled();
    });

    it("should handle invalid template data", () => {
      render(
        <VisualCanvas
          components={[]}
          selectedNodeIds={[]}
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

      const canvas = screen.getByRole("presentation");

      // Drop invalid data
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: jest.fn(() => "invalid json"),
        },
      });
      Object.defineProperty(dropEvent, "clientX", { value: 50 });
      Object.defineProperty(dropEvent, "clientY", { value: 50 });

      canvas.dispatchEvent(dropEvent);

      expect(mockStore.addComponent).not.toHaveBeenCalled();
    });
  });
});
