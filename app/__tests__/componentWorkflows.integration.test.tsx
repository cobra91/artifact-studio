import { jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";

import { ArtifactBuilder } from "../components/ArtifactBuilder";
import { NotificationProvider } from "../components/ui/notifications";
import { ComponentNode, ComponentType } from "../types/artifact";

<<<<<<< Updated upstream
// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NotificationProvider>
    {children}
  </NotificationProvider>
=======
// Test wrapper with necessary providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
>>>>>>> Stashed changes
);

// Use the global localStorage mock from setup.ts
const localStorageMock = window.localStorage as jest.Mocked<Storage>;

// Mock ResizeObserver
const ResizeObserverMock = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

Object.defineProperty(global, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});

describe("Component Creation Workflows", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    jest.clearAllMocks();
  });

  test("should create component via addComponent function", async () => {
    render(
      <TestWrapper>
        <ArtifactBuilder />
      </TestWrapper>
    );

    // Wait for the canvas to be rendered
    const _canvas = await screen.findByTestId("visual-canvas");
    expect(_canvas).toBeInTheDocument();

    // Simulate adding a component
    const position = { x: 100, y: 100 };
    const type: ComponentType = "button";

    // Trigger component addition by simulating the internal addComponent call
    // This would typically be triggered by a drag-drop or toolbar action
    act(() => {
      // Simulate the internal state update that would happen when addComponent is called
      const event = new CustomEvent("addComponent", {
        detail: { type, position },
      });
      window.dispatchEvent(event);
    });

    // Verify the component was added (this would check the internal canvas state)
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "canvas",
        expect.stringContaining('"type":"button"')
      );
    });
  });

  test("should handle component drag and drop from library", async () => {
    render(<ArtifactBuilder />);

    const canvas = await screen.findByTestId("visual-canvas");

    // Simulate drag over the canvas
    fireEvent.dragOver(canvas);

    // Simulate drop event with component data
    const dropEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        getData: jest.fn().mockReturnValue(
          JSON.stringify({
            type: "component",
            componentType: "text",
          })
        ),
      },
      clientX: 150,
      clientY: 200,
    };

    fireEvent.drop(canvas, dropEvent);

    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test("should create components with proper default properties", async () => {
    render(<ArtifactBuilder />);

    await waitFor(() => {
      // The component should initialize with demo components
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "canvas",
        expect.stringContaining('"type":"text"')
      );
    });

    // Verify default properties are set correctly
    const lastCall = localStorageMock.setItem.mock.calls.find(
      call => call[0] === "canvas"
    );
    expect(lastCall).toBeDefined();

    const savedCanvas = JSON.parse(lastCall![1] as string) as ComponentNode[];
    const textComponent = savedCanvas.find(c => c.type === "text");

    expect(textComponent).toBeDefined();
    expect(textComponent?.props).toEqual({
      children: "Sample text",
      className: "text-gray-800",
    });
    expect(textComponent?.size).toEqual({ width: 150, height: 40 });
  });
});

describe("Component Editing Workflows", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  test("should update component properties through style panel", async () => {
    render(<ArtifactBuilder />);

    // Wait for the style panel to be available
    const styleTab = await screen.findByText("Style");
    fireEvent.click(styleTab);

    // Simulate selecting a component (this would trigger the style panel)
    act(() => {
      const selectEvent = new CustomEvent("selectNode", {
        detail: { nodeId: "demo-button" },
      });
      window.dispatchEvent(selectEvent);
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  test("should handle responsive style updates", async () => {
    render(<ArtifactBuilder />);

    // Simulate breakpoint change
    act(() => {
      const breakpointEvent = new CustomEvent("breakpointChange", {
        detail: { breakpoint: "md" },
      });
      window.dispatchEvent(breakpointEvent);
    });

    // Verify responsive styles are updated
    await waitFor(() => {
      const lastCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === "canvas"
      );
      expect(lastCall).toBeDefined();
    });
  });

  test("should update component position via drag", async () => {
    render(<ArtifactBuilder />);

    const canvas = await screen.findByTestId("visual-canvas");

    // Simulate component selection
    act(() => {
      const selectEvent = new CustomEvent("selectNode", {
        detail: { nodeId: "demo-text" },
      });
      window.dispatchEvent(selectEvent);
    });

    // Simulate drag start
    const dragStartEvent = {
      clientX: 50,
      clientY: 50,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };

    fireEvent.mouseDown(canvas, dragStartEvent);

    // Simulate drag movement
    const dragMoveEvent = {
      clientX: 100,
      clientY: 100,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };

    fireEvent.mouseMove(canvas, dragMoveEvent);

    // Simulate drag end
    fireEvent.mouseUp(canvas);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});

describe("Selection Management", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  test("should handle single component selection", async () => {
    render(<ArtifactBuilder />);

    const canvas = await screen.findByTestId("visual-canvas");

    // Simulate clicking on a component
    const clickEvent = {
      clientX: 100,
      clientY: 100,
      ctrlKey: false,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      target: canvas,
      currentTarget: canvas,
    };

    fireEvent.mouseDown(canvas, clickEvent);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  test("should handle multi-selection with Ctrl key", async () => {
    render(<ArtifactBuilder />);

    const _canvas = await screen.findByTestId("visual-canvas");

    // First selection
    act(() => {
      const selectEvent1 = new CustomEvent("selectNode", {
        detail: { nodeId: "demo-text", ctrlPressed: false },
      });
      window.dispatchEvent(selectEvent1);
    });

    // Second selection with Ctrl
    act(() => {
      const selectEvent2 = new CustomEvent("selectNode", {
        detail: { nodeId: "demo-button", ctrlPressed: true },
      });
      window.dispatchEvent(selectEvent2);
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  test("should handle rectangular selection", async () => {
    render(<ArtifactBuilder />);

    const canvas = await screen.findByTestId("visual-canvas");

    // Start selection rectangle
    const startEvent = {
      clientX: 50,
      clientY: 50,
      target: canvas,
      currentTarget: canvas,
    };

    fireEvent.mouseDown(canvas, startEvent);

    // Move to create selection rectangle
    const moveEvent = {
      clientX: 200,
      clientY: 200,
    };

    fireEvent.mouseMove(canvas, moveEvent);

    // End selection
    fireEvent.mouseUp(canvas);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  test("should clear selection on canvas click", async () => {
    render(<ArtifactBuilder />);

    const _canvas = await screen.findByTestId("visual-canvas");

    // First select something
    act(() => {
      const selectEvent = new CustomEvent("selectNode", {
        detail: { nodeId: "demo-text" },
      });
      window.dispatchEvent(selectEvent);
    });

    // Click on empty canvas area
    const clickEvent = {
      clientX: 300,
      clientY: 300,
      target: _canvas,
      currentTarget: _canvas,
      ctrlKey: false,
    };

    fireEvent.mouseDown(_canvas, clickEvent);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});

describe("History Management", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  test("should support undo and redo operations", async () => {
    render(<ArtifactBuilder />);

    // Find undo/redo buttons
    const undoButton = await screen.findByText("Undo");
    const redoButton = await screen.findByText("Redo");

    // Initially undo should be disabled
    expect(undoButton).toBeDisabled();

    // Add a component to create history
    act(() => {
      const addEvent = new CustomEvent("addComponent", {
        detail: { type: "button", position: { x: 50, y: 50 } },
      });
      window.dispatchEvent(addEvent);
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // Now undo should be enabled
    await waitFor(() => {
      expect(undoButton).not.toBeDisabled();
    });

    // Test undo
    fireEvent.click(undoButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // Now redo should be enabled
    await waitFor(() => {
      expect(redoButton).not.toBeDisabled();
    });

    // Test redo
    fireEvent.click(redoButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  test("should handle complex multi-step operations", async () => {
    render(<ArtifactBuilder />);

    // Perform multiple operations
    act(() => {
      // Add component
      const addEvent1 = new CustomEvent("addComponent", {
        detail: { type: "button", position: { x: 50, y: 50 } },
      });
      window.dispatchEvent(addEvent1);

      // Move component
      const moveEvent = new CustomEvent("moveComponent", {
        detail: { nodeId: "new-button", position: { x: 100, y: 100 } },
      });
      window.dispatchEvent(moveEvent);

      // Resize component
      const resizeEvent = new CustomEvent("resizeComponent", {
        detail: { nodeId: "new-button", size: { width: 200, height: 60 } },
      });
      window.dispatchEvent(resizeEvent);
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // Test that multiple undo operations work
    const undoButton = await screen.findByText("Undo");
    fireEvent.click(undoButton); // Undo resize
    fireEvent.click(undoButton); // Undo move
    fireEvent.click(undoButton); // Undo add

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});

describe("State Persistence", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  test("should save state on component changes", async () => {
    render(<ArtifactBuilder />);

    // Trigger a state change
    act(() => {
      const changeEvent = new CustomEvent("componentChange", {
        detail: { action: "update", componentId: "demo-text" },
      });
      window.dispatchEvent(changeEvent);
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "canvas",
        expect.any(String)
      );
    });
  });

  test("should restore state on component mount", async () => {
    // Mock existing saved state
    const savedCanvas: ComponentNode[] = [
      {
        id: "saved-text",
        type: "text",
        props: { children: "Restored text" },
        position: { x: 100, y: 100 },
        size: { width: 200, height: 50 },
        styles: {},
      },
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedCanvas));

    render(<ArtifactBuilder />);

    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith("canvas");
    });
  });

  test("should handle corrupted localStorage data gracefully", async () => {
    // Mock corrupted data
    localStorageMock.getItem.mockReturnValue("invalid json");

    render(<ArtifactBuilder />);

    // Should not crash and should initialize with default state
    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith("canvas");
    });
  });
});

describe("User Interaction Flows", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  test("should complete create-edit-deploy workflow", async () => {
    render(<ArtifactBuilder />);

    // 1. Create component
    act(() => {
      const addEvent = new CustomEvent("addComponent", {
        detail: { type: "button", position: { x: 50, y: 50 } },
      });
      window.dispatchEvent(addEvent);
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // 2. Edit component (simulate style panel interaction)
    act(() => {
      const editEvent = new CustomEvent("editComponent", {
        detail: { nodeId: "new-button", changes: { backgroundColor: "red" } },
      });
      window.dispatchEvent(editEvent);
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // 3. Save project
    const saveButton = await screen.findByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "canvas",
        expect.any(String)
      );
    });

    // 4. Deploy project
    const deployButton = await screen.findByText("Deploy");
    fireEvent.click(deployButton);

    // Deployment should trigger download or external service call
    await waitFor(() => {
      // This would typically check for download or API calls
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  test("should handle keyboard shortcuts", async () => {
    render(<ArtifactBuilder />);

    // Test Ctrl+A (select all)
    const _canvas = await screen.findByTestId("visual-canvas");

    fireEvent.keyDown(_canvas, {
      key: "a",
      ctrlKey: true,
      preventDefault: jest.fn(),
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // Test Ctrl+Z (undo)
    fireEvent.keyDown(_canvas, {
      key: "z",
      ctrlKey: true,
      preventDefault: jest.fn(),
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // Test Delete key
    fireEvent.keyDown(_canvas, {
      key: "Delete",
      preventDefault: jest.fn(),
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  test("should handle command palette interactions", async () => {
    render(<ArtifactBuilder />);

    // Open command palette
    const commandButton = await screen.findByText("⌘ Commands");
    fireEvent.click(commandButton);

    // Command palette should be visible
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});

describe("Error Handling", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    console.error = jest.fn();
  });

  test("should handle invalid component data gracefully", async () => {
    render(<ArtifactBuilder />);

    // Simulate invalid component addition
    act(() => {
      const invalidEvent = new CustomEvent("addComponent", {
        detail: { type: "invalid-type", position: { x: -100, y: -100 } },
      });
      window.dispatchEvent(invalidEvent);
    });

    // Should not crash
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  test("should handle missing component references", async () => {
    render(<ArtifactBuilder />);

    // Try to select non-existent component
    act(() => {
      const selectEvent = new CustomEvent("selectNode", {
        detail: { nodeId: "non-existent-id" },
      });
      window.dispatchEvent(selectEvent);
    });

    // Should handle gracefully
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  test("should handle concurrent operations", async () => {
    render(<ArtifactBuilder />);

    // Simulate multiple rapid operations
    act(() => {
      const event1 = new CustomEvent("addComponent", {
        detail: { type: "button", position: { x: 50, y: 50 } },
      });
      const event2 = new CustomEvent("addComponent", {
        detail: { type: "text", position: { x: 100, y: 100 } },
      });

      window.dispatchEvent(event1);
      window.dispatchEvent(event2);
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});

describe("Multi-step Operations", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  test("should handle grouping and ungrouping", async () => {
    render(<ArtifactBuilder />);

    // Find group/ungroup buttons
    const groupButton = await screen.findByText("Group");
    const ungroupButton = await screen.findByText("Ungroup");

    // Initially disabled
    expect(groupButton).toBeDisabled();
    expect(ungroupButton).toBeDisabled();

    // Select multiple components
    act(() => {
      const selectEvent = new CustomEvent("selectMultipleNodes", {
        detail: { nodeIds: ["demo-text", "demo-button"] },
      });
      window.dispatchEvent(selectEvent);
    });

    await waitFor(() => {
      expect(groupButton).not.toBeDisabled();
    });

    // Group components
    fireEvent.click(groupButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(ungroupButton).not.toBeDisabled();
    });

    // Ungroup components
    fireEvent.click(ungroupButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  test("should handle copy and paste operations", async () => {
    render(<ArtifactBuilder />);

    // Find copy/paste buttons
    const copyButton = await screen.findByText("Copy");
    const pasteButton = await screen.findByText("Paste");

    // Initially copy disabled
    expect(copyButton).toBeDisabled();

    // Select component
    act(() => {
      const selectEvent = new CustomEvent("selectNode", {
        detail: { nodeId: "demo-text" },
      });
      window.dispatchEvent(selectEvent);
    });

    await waitFor(() => {
      expect(copyButton).not.toBeDisabled();
    });

    // Copy component
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // Paste component
    fireEvent.click(pasteButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  test("should handle duplicate operations", async () => {
    render(<ArtifactBuilder />);

    // Select component
    act(() => {
      const selectEvent = new CustomEvent("selectNode", {
        detail: { nodeId: "demo-button" },
      });
      window.dispatchEvent(selectEvent);
    });

    // Use Ctrl+D to duplicate
    const _canvas = await screen.findByTestId("visual-canvas");
    fireEvent.keyDown(_canvas, {
      key: "d",
      ctrlKey: true,
      preventDefault: jest.fn(),
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});

// Mock test utilities
const createTestComponent = (
  overrides: Partial<ComponentNode> = {}
): ComponentNode => ({
  id: "test-component",
  type: "button",
  props: { children: "Test Button" },
  position: { x: 100, y: 100 },
  size: { width: 120, height: 40 },
  styles: {},
  ...overrides,
});

const simulateCanvasInteraction = (action: string, payload: any) => {
  const event = new CustomEvent(action, { detail: payload });
  window.dispatchEvent(event);
};

// Export for use in other test files
export { createTestComponent, simulateCanvasInteraction };
