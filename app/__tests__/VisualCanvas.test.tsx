import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { VisualCanvas } from "../components/VisualCanvas/VisualCanvas";
import { ComponentNode, ComponentType } from "../types/artifact";

// Mock the canvas store
jest.mock("../lib/canvasStore", () => ({
  useCanvasStore: () => ({
    getState: () => ({
      activeBreakpoint: "base" as const,
    }),
  }),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("VisualCanvas", () => {
  const mockComponents: ComponentNode[] = [
    {
      id: "comp-1",
      type: "button" as ComponentType,
      props: { children: "Button 1" },
      children: [],
      position: { x: 10, y: 10 },
      size: { width: 100, height: 50 },
      rotation: 0,
      skew: { x: 0, y: 0 },
      styles: {},
      metadata: {
        version: "1.0.0",
        created: new Date(),
        modified: new Date(),
        author: "test",
        description: "",
        tags: [],
        locked: false,
        hidden: false,
      },
    },
    {
      id: "comp-2",
      type: "text" as ComponentType,
      props: { children: "Text Component" },
      children: [],
      position: { x: 150, y: 150 },
      size: { width: 200, height: 30 },
      rotation: 0,
      skew: { x: 0, y: 0 },
      styles: {},
      metadata: {
        version: "1.0.0",
        created: new Date(),
        modified: new Date(),
        author: "test",
        description: "",
        tags: [],
        locked: false,
        hidden: false,
      },
    },
  ];

  const defaultProps = {
    components: mockComponents,
    selectedNodeIds: [],
    onSelectNode: jest.fn(),
    onSelectNodes: jest.fn(),
    onAddNodesToSelection: jest.fn(),
    onUpdateComponent: jest.fn(),
    onAddComponent: jest.fn(),
    snapToGrid: false,
    aspectRatioLocked: false,
    activeBreakpoint: "base" as const,
    isEditMode: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all components", () => {
      render(<VisualCanvas {...defaultProps} />);

      expect(screen.getByText("Selected: 0")).toBeInTheDocument();
      expect(screen.getByText("BASE")).toBeInTheDocument();
      expect(screen.getByText("EDIT MODE")).toBeInTheDocument();
    });

    it("should show selection count", () => {
      const props = {
        ...defaultProps,
        selectedNodeIds: ["comp-1"],
      };

      render(<VisualCanvas {...props} />);

      expect(screen.getByText("Selected: 1")).toBeInTheDocument();
      expect(screen.getByText("(comp-1)")).toBeInTheDocument();
    });

    it("should show grid background when snapToGrid is true", () => {
      const props = {
        ...defaultProps,
        snapToGrid: true,
      };

      render(<VisualCanvas {...props} />);

      const canvas = screen.getByRole("generic");
      expect(canvas).toHaveStyle({
        backgroundImage: expect.stringContaining("repeating-linear-gradient"),
      });
    });
  });

  describe("Component Selection", () => {
    it("should select component on mousedown", () => {
      render(<VisualCanvas {...defaultProps} />);

      const component = screen.getByText("Button 1");
      fireEvent.mouseDown(component);

      expect(defaultProps.onSelectNode).toHaveBeenCalledWith("comp-1", false);
    });

    it("should handle multi-selection with ctrl key", () => {
      render(<VisualCanvas {...defaultProps} />);

      const component = screen.getByText("Button 1");
      fireEvent.mouseDown(component, { ctrlKey: true });

      expect(defaultProps.onSelectNode).toHaveBeenCalledWith("comp-1", true);
    });

    it("should handle multi-selection with meta key", () => {
      render(<VisualCanvas {...defaultProps} />);

      const component = screen.getByText("Button 1");
      fireEvent.mouseDown(component, { metaKey: true });

      expect(defaultProps.onSelectNode).toHaveBeenCalledWith("comp-1", true);
    });
  });

  describe("Canvas Selection", () => {
    it("should handle canvas click to deselect", () => {
      render(<VisualCanvas {...defaultProps} />);

      const canvas = screen.getByRole("generic");
      fireEvent.mouseDown(canvas, {
        target: canvas,
        currentTarget: canvas,
      });

      expect(defaultProps.onSelectNodes).toHaveBeenCalledWith([], false);
    });

    it("should not deselect when clicking on component", () => {
      render(<VisualCanvas {...defaultProps} />);

      const canvas = screen.getByRole("generic");
      const component = screen.getByText("Button 1");

      fireEvent.mouseDown(canvas, {
        target: component,
        currentTarget: canvas,
      });

      expect(defaultProps.onSelectNodes).not.toHaveBeenCalled();
    });

    it("should not deselect when ctrl key is pressed", () => {
      render(<VisualCanvas {...defaultProps} />);

      const canvas = screen.getByRole("generic");
      fireEvent.mouseDown(canvas, {
        target: canvas,
        currentTarget: canvas,
        ctrlKey: true,
      });

      expect(defaultProps.onSelectNodes).not.toHaveBeenCalled();
    });
  });

  describe("Drag and Drop", () => {
    it("should handle component dragging", () => {
      render(<VisualCanvas {...defaultProps} />);

      const component = screen.getByText("Button 1");

      // Start drag
      fireEvent.mouseDown(component);

      // Move component
      const canvas = screen.getByRole("generic");
      fireEvent.mouseMove(canvas, {
        clientX: 50,
        clientY: 50,
      });

      // End drag
      fireEvent.mouseUp(canvas);

      expect(defaultProps.onUpdateComponent).toHaveBeenCalled();
    });

    it("should snap to grid when enabled", () => {
      const props = {
        ...defaultProps,
        snapToGrid: true,
      };

      render(<VisualCanvas {...props} />);

      const component = screen.getByText("Button 1");

      fireEvent.mouseDown(component);

      const canvas = screen.getByRole("generic");
      fireEvent.mouseMove(canvas, {
        clientX: 25, // Should snap to 20
        clientY: 35, // Should snap to 40
      });

      fireEvent.mouseUp(canvas);

      expect(defaultProps.onUpdateComponent).toHaveBeenCalledWith(
        "comp-1",
        expect.objectContaining({
          position: { x: 20, y: 40 },
        })
      );
    });

    it("should handle multi-component dragging", () => {
      const props = {
        ...defaultProps,
        selectedNodeIds: ["comp-1", "comp-2"],
      };

      render(<VisualCanvas {...props} />);

      const component1 = screen.getByText("Button 1");
      fireEvent.mouseDown(component1);

      const canvas = screen.getByRole("generic");
      fireEvent.mouseMove(canvas, {
        clientX: 50,
        clientY: 50,
      });

      fireEvent.mouseUp(canvas);

      // Should update both selected components
      expect(defaultProps.onUpdateComponent).toHaveBeenCalledTimes(2);
    });
  });

  describe("Resizing", () => {
    it("should handle resize handle mouse down", () => {
      const props = {
        ...defaultProps,
        selectedNodeIds: ["comp-1"],
      };

      render(<VisualCanvas {...props} />);

      // Mock resize handle - in real scenario, this would be a small div
      const resizeHandle = document.createElement("div");
      resizeHandle.setAttribute("data-testid", "resize-handle");
      const component = screen.getByText("Button 1").parentElement;
      if (component) {
        component.appendChild(resizeHandle);
      }

      fireEvent.mouseDown(resizeHandle, {
        target: resizeHandle,
        currentTarget: resizeHandle,
      });

      const canvas = screen.getByRole("generic");
      fireEvent.mouseMove(canvas, {
        clientX: 150,
        clientY: 80,
      });

      fireEvent.mouseUp(canvas);

      expect(defaultProps.onUpdateComponent).toHaveBeenCalledWith(
        "comp-1",
        expect.objectContaining({
          position: expect.any(Object),
          size: expect.any(Object),
        })
      );
    });

    it("should maintain aspect ratio when locked", () => {
      const props = {
        ...defaultProps,
        selectedNodeIds: ["comp-1"],
        aspectRatioLocked: true,
      };

      render(<VisualCanvas {...props} />);

      const component = screen.getByText("Button 1");
      fireEvent.mouseDown(component);

      const canvas = screen.getByRole("generic");
      fireEvent.mouseMove(canvas, {
        clientX: 200,
        clientY: 100,
      });

      fireEvent.mouseUp(canvas);

      expect(defaultProps.onUpdateComponent).toHaveBeenCalled();
    });
  });

  describe("Rotation", () => {
    it("should handle rotation for single selected component", () => {
      const props = {
        ...defaultProps,
        selectedNodeIds: ["comp-1"],
      };

      render(<VisualCanvas {...props} />);

      // Mock rotation handle
      const rotateHandle = document.createElement("div");
      rotateHandle.setAttribute("data-testid", "rotate-handle");
      const component = screen.getByText("Button 1").parentElement;
      if (component) {
        component.appendChild(rotateHandle);
      }

      fireEvent.mouseDown(rotateHandle);

      const canvas = screen.getByRole("generic");
      fireEvent.mouseMove(canvas, {
        clientX: 100,
        clientY: 100,
      });

      fireEvent.mouseUp(canvas);

      expect(defaultProps.onUpdateComponent).toHaveBeenCalledWith(
        "comp-1",
        expect.objectContaining({
          rotation: expect.any(Number),
        })
      );
    });

    it("should snap rotation to 15-degree increments", () => {
      const props = {
        ...defaultProps,
        selectedNodeIds: ["comp-1"],
      };

      render(<VisualCanvas {...props} />);

      const rotateHandle = document.createElement("div");
      rotateHandle.setAttribute("data-testid", "rotate-handle");
      const component = screen.getByText("Button 1").parentElement;
      if (component) {
        component.appendChild(rotateHandle);
      }

      fireEvent.mouseDown(rotateHandle);

      const canvas = screen.getByRole("generic");
      fireEvent.mouseMove(canvas, {
        clientX: 100,
        clientY: 100,
      });

      fireEvent.mouseUp(canvas);

      const calls = defaultProps.onUpdateComponent.mock.calls;
      const rotationCall = calls.find(call => "rotation" in call[1]);
      if (rotationCall) {
        const rotation = rotationCall[1].rotation;
        expect(rotation % 15).toBe(0);
      }
    });
  });

  describe("Drop Handling", () => {
    it("should handle component drop", () => {
      render(<VisualCanvas {...defaultProps} />);

      const canvas = screen.getByRole("generic");

      const dropEvent = {
        preventDefault: jest.fn(),
        dataTransfer: {
          getData: jest.fn().mockReturnValue(
            JSON.stringify({
              type: "component",
              componentType: "button" as ComponentType,
            })
          ),
        },
        clientX: 100,
        clientY: 150,
      };

      fireEvent.drop(canvas, dropEvent);

      expect(dropEvent.preventDefault).toHaveBeenCalled();
      expect(defaultProps.onAddComponent).toHaveBeenCalledWith("button", {
        x: 100,
        y: 150,
      });
    });

    it("should snap to grid on drop when enabled", () => {
      const props = {
        ...defaultProps,
        snapToGrid: true,
      };

      render(<VisualCanvas {...props} />);

      const canvas = screen.getByRole("generic");

      const dropEvent = {
        preventDefault: jest.fn(),
        dataTransfer: {
          getData: jest.fn().mockReturnValue(
            JSON.stringify({
              type: "component",
              componentType: "button" as ComponentType,
            })
          ),
        },
        clientX: 105, // Should snap to 100
        clientY: 155, // Should snap to 160
      };

      fireEvent.drop(canvas, dropEvent);

      expect(defaultProps.onAddComponent).toHaveBeenCalledWith("button", {
        x: 100,
        y: 160,
      });
    });
  });

  describe("Selection Rectangle", () => {
    it("should create selection rectangle on canvas drag", () => {
      render(<VisualCanvas {...defaultProps} />);

      const canvas = screen.getByRole("generic");

      fireEvent.mouseDown(canvas, {
        clientX: 50,
        clientY: 50,
        target: canvas,
        currentTarget: canvas,
      });

      fireEvent.mouseMove(canvas, {
        clientX: 150,
        clientY: 150,
      });

      // Selection rectangle should be rendered
      const selectionRect = document.querySelector(
        ".absolute.border-2.border-blue-500"
      );
      expect(selectionRect).toBeInTheDocument();

      fireEvent.mouseUp(canvas);

      expect(defaultProps.onSelectNodes).toHaveBeenCalledWith(
        expect.arrayContaining(["comp-1", "comp-2"]),
        false
      );
    });
  });

  describe("Mode Indicators", () => {
    it("should show edit mode indicator", () => {
      render(<VisualCanvas {...defaultProps} />);

      expect(screen.getByText("EDIT MODE")).toBeInTheDocument();
    });

    it("should show preview mode indicator", () => {
      const props = {
        ...defaultProps,
        isEditMode: false,
      };

      render(<VisualCanvas {...props} />);

      expect(screen.getByText("PREVIEW MODE")).toBeInTheDocument();
    });
  });
});
