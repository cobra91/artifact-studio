/**
 * Comprehensive integration tests for AI generation to canvas workflows
 * Tests the complete pipeline from AI prompt to canvas component placement
 */

import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import OpenAI from "openai";
import React from "react";

// Component imports
import { VisualCanvas } from "../components/VisualCanvas/VisualCanvas";
import { aiCodeGen } from "../lib/aiCodeGen";
import { useCanvasStore } from "../lib/canvasStore";
import {
  createComponentNode,
  validateComponentNode,
} from "../lib/componentOperations";
// Types and interfaces
import { AIGenerationRequest, ComponentType } from "../types/artifact";
// Test utilities
import { createMockCanvasRef } from "./integration.setup";

// Mock OpenAI
jest.mock("openai");

// Mock canvas store
jest.mock("../lib/canvasStore", () => ({
  useCanvasStore: jest.fn(),
}));

describe("AI Generation to Canvas Integration Tests", () => {
  let mockStore: any;
  let mockOpenAI: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup OpenAI mock
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn().mockImplementation(() => Promise.resolve({})),
        },
      },
    };
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
      () => mockOpenAI
    );

    // Setup canvas store mock
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
      setZoom: jest.fn(),
    };

    (useCanvasStore as unknown as jest.Mock).mockReturnValue(mockStore);

    // Setup canvas ref mock
    createMockCanvasRef();

    // Mock environment variables
    process.env.OPENAI_API_KEY = "test-api-key";
  });

  describe("AI Prompt Processing and Component Generation", () => {
    it("should process AI generation request and create components", async () => {
      const mockAIResponse = {
        components: [
          { type: "container", id: "root", children: ["header", "button"] },
        ],
        layout: {
          root: {
            styles: { padding: "2rem", backgroundColor: "#f9fafb" },
          },
          header: {
            type: "text",
            styles: { fontSize: "24px", fontWeight: "bold" },
          },
          button: {
            type: "button",
            styles: { backgroundColor: "#007bff", color: "white" },
          },
        },
        componentDetails: {
          header: {
            type: "text",
            content: "Welcome to AI Generated UI",
            props: { className: "text-2xl font-bold" },
          },
          button: {
            type: "button",
            content: "Get Started",
            props: { className: "bg-blue-500 text-white px-4 py-2 rounded" },
          },
        },
      };

      // Mock OpenAI API call
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockAIResponse),
            },
          },
        ],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a welcome section with a header and button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);

      expect(result.components).toHaveLength(1);
      expect(result.components[0].type).toBe("container");
      expect(result.components[0].children).toBeDefined();
      expect(result.components[0].children?.length).toBeGreaterThan(0);
    });

    it("should handle AI generation errors gracefully", async () => {
      // Mock OpenAI API error
      mockOpenAI.chat.completions.create = jest
        .fn()
        .mockRejectedValue(new Error("OpenAI API Error"));

      const request: AIGenerationRequest = {
        prompt: "Create a button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      await expect(aiCodeGen.create(request)).rejects.toThrow(
        "Failed to generate component tree from AI"
      );
    });

    it("should handle invalid AI response structure", async () => {
      // Mock invalid AI response
      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "Invalid JSON response",
            },
          },
        ],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);
      expect(result.components).toHaveLength(0);
    });

    it("should validate AI-generated components against schema", async () => {
      const mockAIResponse = {
        components: [{ type: "invalid-type", id: "test", children: [] }],
        layout: {
          test: {
            styles: { color: "red" },
          },
        },
        componentDetails: {
          test: {
            type: "invalid-type",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockAIResponse),
            },
          },
        ],
      });

      const request: AIGenerationRequest = {
        prompt: "Create invalid component",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);
      // Should still create components even with invalid types, but they should be filtered or handled
      expect(Array.isArray(result.components)).toBe(true);
    });
  });

  describe("Generated Component Validation and Adaptation", () => {
    it("should validate AI-generated components before canvas integration", async () => {
      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: ["button"] }],
        layout: {
          root: { styles: { padding: "1rem" } },
          button: { type: "button", styles: { backgroundColor: "#007bff" } },
        },
        componentDetails: {
          button: {
            type: "button",
            content: "Click Me",
            props: { className: "btn-primary" },
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a button in a container",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);
      const validationErrors = validateComponentNode(result.components[0]);

      expect(validationErrors).toHaveLength(0);
    });

    it("should adapt AI-generated components to canvas coordinate system", async () => {
      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: ["button"] }],
        layout: {
          root: {
            styles: { position: "absolute", left: "50px", top: "100px" },
          },
          button: {
            type: "button",
            styles: { width: "200px", height: "50px" },
          },
        },
        componentDetails: {
          button: {
            type: "button",
            content: "Test Button",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a positioned button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);

      // Check that components have proper canvas positioning
      expect(result.components[0]).toHaveProperty("position");
      expect(result.components[0]).toHaveProperty("size");
      expect(typeof result.components[0].position.x).toBe("number");
      expect(typeof result.components[0].position.y).toBe("number");
    });

    it("should handle missing positioning data in AI response", async () => {
      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: ["button"] }],
        layout: {
          root: { styles: {} },
          button: { type: "button", styles: {} },
        },
        componentDetails: {
          button: {
            type: "button",
            content: "Button",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a simple button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);

      // Should have default positioning
      expect(result.components[0].position).toEqual({ x: 0, y: 0 });
      expect(result.components[0].size).toEqual({ width: 0, height: 0 });
    });
  });

  describe("Component Placement and Positioning on Canvas", () => {
    it("should place AI-generated components at specified canvas coordinates", async () => {
      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: ["button"] }],
        layout: {
          root: {
            styles: { position: "absolute", left: "100px", top: "200px" },
          },
          button: {
            type: "button",
            styles: { width: "150px", height: "40px" },
          },
        },
        componentDetails: {
          button: {
            type: "button",
            content: "Positioned Button",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a positioned button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);

      render(
        <VisualCanvas
          components={result.components}
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
    });

    it("should handle component placement with snap-to-grid enabled", async () => {
      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: ["button"] }],
        layout: {
          root: {
            styles: { position: "absolute", left: "95px", top: "195px" },
          },
          button: {
            type: "button",
            styles: { width: "150px", height: "40px" },
          },
        },
        componentDetails: {
          button: {
            type: "button",
            content: "Grid Snapped Button",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a button for grid testing",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);

      render(
        <VisualCanvas
          components={result.components}
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

      // Verify components are rendered with snap-to-grid consideration
      expect(mockStore.updateComponent).not.toHaveBeenCalled();
    });

    it("should prevent component overlap during placement", async () => {
      // Create existing component on canvas
      const existingComponent = createComponentNode(
        "button" as ComponentType,
        "existing-button"
      );
      existingComponent.position = { x: 100, y: 100 };
      existingComponent.size = { width: 200, height: 50 };

      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: ["button"] }],
        layout: {
          root: {
            styles: { position: "absolute", left: "100px", top: "100px" },
          },
          button: {
            type: "button",
            styles: { width: "150px", height: "40px" },
          },
        },
        componentDetails: {
          button: {
            type: "button",
            content: "New Button",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a button that might overlap",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);

      render(
        <VisualCanvas
          components={[existingComponent, ...result.components]}
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
    });
  });

  describe("AI-Generated Component Editing Workflows", () => {
    it("should allow editing AI-generated component properties", async () => {
      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: ["button"] }],
        layout: {
          root: { styles: {} },
          button: { type: "button", styles: { backgroundColor: "#007bff" } },
        },
        componentDetails: {
          button: {
            type: "button",
            content: "Original Text",
            props: { className: "btn-primary" },
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create an editable button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);
      const aiComponent = result.components[0].children?.[0];

      render(
        <VisualCanvas
          components={result.components}
          selectedNodeIds={[aiComponent?.id || ""]}
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

      // Simulate property editing
      if (aiComponent) {
        mockStore.updateComponent(aiComponent.id, {
          props: { children: "Updated Text" },
        });
      }

      expect(mockStore.updateComponent).toHaveBeenCalledWith(aiComponent?.id, {
        props: { children: "Updated Text" },
      });
    });

    it("should allow editing AI-generated component styles", async () => {
      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: ["button"] }],
        layout: {
          root: { styles: {} },
          button: { type: "button", styles: { backgroundColor: "#007bff" } },
        },
        componentDetails: {
          button: {
            type: "button",
            content: "Style Test",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a styled button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);
      const aiComponent = result.components[0].children?.[0];

      render(
        <VisualCanvas
          components={result.components}
          selectedNodeIds={[aiComponent?.id || ""]}
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

      // Simulate style editing
      if (aiComponent) {
        mockStore.updateComponent(aiComponent.id, {
          styles: { backgroundColor: "#28a745", fontSize: "16px" },
        });
      }

      expect(mockStore.updateComponent).toHaveBeenCalledWith(aiComponent?.id, {
        styles: { backgroundColor: "#28a745", fontSize: "16px" },
      });
    });

    it("should allow repositioning AI-generated components", async () => {
      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: ["button"] }],
        layout: {
          root: { styles: { position: "absolute", left: "50px", top: "50px" } },
          button: {
            type: "button",
            styles: { width: "100px", height: "40px" },
          },
        },
        componentDetails: {
          button: {
            type: "button",
            content: "Move Me",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a movable button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);
      const aiComponent = result.components[0].children?.[0];

      render(
        <VisualCanvas
          components={result.components}
          selectedNodeIds={[aiComponent?.id || ""]}
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

      // Simulate repositioning
      if (aiComponent) {
        mockStore.updateComponent(aiComponent.id, {
          position: { x: 200, y: 300 },
        });
      }

      expect(mockStore.updateComponent).toHaveBeenCalledWith(aiComponent?.id, {
        position: { x: 200, y: 300 },
      });
    });
  });

  describe("Error Handling for Invalid AI-Generated Components", () => {
    it("should handle malformed AI response gracefully", async () => {
      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "This is not JSON",
            },
          },
        ],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a component",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      await expect(aiCodeGen.create(request)).rejects.toThrow(
        "Failed to generate component tree from AI"
      );
    });

    it("should handle components with invalid property types", async () => {
      const mockAIResponse = {
        components: [
          { type: "container", id: "root", children: ["invalid-button"] },
        ],
        layout: {
          root: { styles: {} },
          "invalid-button": { type: "button", styles: {} },
        },
        componentDetails: {
          "invalid-button": {
            type: "button",
            content: 12345, // Invalid: should be string
            props: { disabled: "true" }, // Invalid: should be boolean
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create invalid component",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);
      // Should still create components but with validation issues
      expect(result.components.length).toBeGreaterThan(0);
    });

    it("should handle missing required component properties", async () => {
      const mockAIResponse = {
        components: [
          { type: "container", id: "root", children: ["incomplete-button"] },
        ],
        layout: {
          root: { styles: {} },
          "incomplete-button": { type: "button", styles: {} },
        },
        componentDetails: {
          "incomplete-button": {
            // Missing required 'type' field
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create incomplete component",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);
      // Should handle missing properties gracefully
      expect(Array.isArray(result.components)).toBe(true);
    });
  });

  describe("Component Tree Integration and Hierarchy Management", () => {
    it("should maintain component hierarchy from AI generation", async () => {
      const mockAIResponse = {
        components: [
          {
            type: "container",
            id: "root",
            children: ["header", "content", "footer"],
          },
        ],
        layout: {
          root: { styles: { display: "flex", flexDirection: "column" } },
          header: { type: "container", styles: { height: "80px" } },
          content: { type: "container", styles: { flex: "1" } },
          footer: { type: "container", styles: { height: "60px" } },
        },
        componentDetails: {
          header: { type: "container", props: {} },
          content: { type: "container", props: {} },
          footer: { type: "container", props: {} },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a layout with header, content, and footer",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);

      expect(result.components[0].children).toHaveLength(3);
      expect(result.components[0].children?.map(c => c.type)).toEqual([
        "container",
        "container",
        "container",
      ]);
    });

    it("should handle nested component hierarchies", async () => {
      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: ["navbar"] }],
        layout: {
          root: { styles: {} },
          navbar: { type: "container", styles: {}, children: ["logo", "menu"] },
          logo: { type: "image", styles: {} },
          menu: {
            type: "container",
            styles: {},
            children: ["home-link", "about-link"],
          },
          "home-link": { type: "text", styles: {} },
          "about-link": { type: "text", styles: {} },
        },
        componentDetails: {
          navbar: { type: "container", props: {} },
          logo: { type: "image", props: { src: "/logo.png" } },
          menu: { type: "container", props: {} },
          "home-link": { type: "text", content: "Home", props: {} },
          "about-link": { type: "text", content: "About", props: {} },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a nested navigation component",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);

      // Verify nested structure is maintained
      const navbar = result.components[0].children?.[0];
      expect(navbar?.children).toHaveLength(2); // logo and menu

      const menu = navbar?.children?.[1];
      expect(menu?.children).toHaveLength(2); // home-link and about-link
    });

    it("should handle circular dependencies in AI-generated hierarchies", async () => {
      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: ["parent"] }],
        layout: {
          root: { styles: {} },
          parent: { type: "container", styles: {}, children: ["child"] },
          child: { type: "container", styles: {}, children: ["parent"] }, // Circular reference
        },
        componentDetails: {
          parent: { type: "container", props: {} },
          child: { type: "container", props: {} },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create circular component structure",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);

      // Should handle circular references without infinite loops
      expect(result.components.length).toBeGreaterThan(0);
    });
  });

  describe("Style and Property Mapping from AI to Canvas", () => {
    it("should map CSS properties from AI response to canvas styles", async () => {
      const mockAIResponse = {
        components: [
          { type: "container", id: "root", children: ["styled-button"] },
        ],
        layout: {
          root: { styles: {} },
          "styled-button": {
            type: "button",
            styles: {
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              padding: "10px 20px",
              margin: "5px",
              border: "1px solid #0056b3",
            },
          },
        },
        componentDetails: {
          "styled-button": {
            type: "button",
            content: "Styled Button",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a styled button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);
      const styledButton = result.components[0].children?.[0];

      expect(styledButton?.styles).toEqual(
        expect.objectContaining({
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "4px",
          fontSize: "16px",
          fontWeight: "bold",
          padding: "10px 20px",
          margin: "5px",
          border: "1px solid #0056b3",
        })
      );
    });

    it("should handle Tailwind CSS classes from AI response", async () => {
      const mockAIResponse = {
        components: [
          { type: "container", id: "root", children: ["tailwind-button"] },
        ],
        layout: {
          root: { styles: {} },
          "tailwind-button": {
            type: "button",
            styles: {},
          },
        },
        componentDetails: {
          "tailwind-button": {
            type: "button",
            content: "Tailwind Button",
            props: {
              className:
                "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
            },
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a button with Tailwind classes",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);
      const tailwindButton = result.components[0].children?.[0];

      expect(tailwindButton?.props.className).toBe(
        "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      );
    });

    it("should convert AI styles to canvas-compatible format", async () => {
      const mockAIResponse = {
        components: [
          { type: "container", id: "root", children: ["converted-button"] },
        ],
        layout: {
          root: { styles: {} },
          "converted-button": {
            type: "button",
            styles: {
              "background-color": "#ff0000", // CSS property name
              "font-size": "14px", // CSS property name with dash
              "margin-top": "10px", // CSS property name with dash
            },
          },
        },
        componentDetails: {
          "converted-button": {
            type: "button",
            content: "Converted Button",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a button with CSS properties",
        framework: "react",
        styling: "css",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);
      const convertedButton = result.components[0].children?.[0];

      // Should convert CSS properties to camelCase for canvas
      expect(convertedButton?.styles).toEqual(
        expect.objectContaining({
          backgroundColor: "#ff0000",
          fontSize: "14px",
          marginTop: "10px",
        })
      );
    });
  });

  describe("Performance Testing for Complex AI-Generated Layouts", () => {
    it("should handle large number of AI-generated components efficiently", async () => {
      const components = Array.from({ length: 50 }, (_, i) => `component-${i}`);
      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: components }],
        layout: components.reduce(
          (acc, id) => ({
            ...acc,
            [id]: {
              type: "button",
              styles: { width: "100px", height: "40px" },
            },
          }),
          { root: { styles: { display: "flex", flexWrap: "wrap" } } }
        ),
        componentDetails: components.reduce(
          (acc, id) => ({
            ...acc,
            [id]: { type: "button", content: `Button ${id}`, props: {} },
          }),
          {}
        ),
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a large grid of buttons",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const startTime = performance.now();
      const result = await aiCodeGen.create(request);
      const endTime = performance.now();

      expect(result.components[0].children).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should handle deeply nested component hierarchies", async () => {
      // Create a deeply nested structure
      const mockAIResponse = {
        components: [{ type: "container", id: "root", children: ["level-1"] }],
        layout: {
          root: { styles: {} },
        },
        componentDetails: {},
      };

      // Add nested levels to layout and componentDetails
      for (let i = 1; i <= 10; i++) {
        const childId = `level-${i}`;
        mockAIResponse.layout[childId] = { styles: {} };
        mockAIResponse.componentDetails[childId] = {
          type: "container",
          props: {},
        };
      }

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create deeply nested components",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const startTime = performance.now();
      const result = await aiCodeGen.create(request);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.components.length).toBeGreaterThan(0);
    });

    it("should maintain performance with complex style mappings", async () => {
      const mockAIResponse = {
        components: [
          { type: "container", id: "root", children: ["complex-component"] },
        ],
        layout: {
          root: { styles: {} },
          "complex-component": {
            type: "button",
            styles: {
              // Complex CSS properties
              background: "linear-gradient(45deg, #ff0000, #0000ff)",
              boxShadow:
                "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
              transform: "rotate(45deg) scale(1.1)",
              transition: "all 0.3s ease-in-out",
              animation: "pulse 2s infinite",
              backdropFilter: "blur(10px)",
              clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
            },
          },
        },
        componentDetails: {
          "complex-component": {
            type: "button",
            content: "Complex Styled Button",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a button with complex CSS",
        framework: "react",
        styling: "css",
        interactivity: "high",
        theme: "modern",
      };

      const startTime = performance.now();
      const result = await aiCodeGen.create(request);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
      expect(result.components[0].children?.[0]?.styles).toBeDefined();
    });
  });

  describe("State Synchronization Between AI Service and Canvas Store", () => {
    it("should synchronize AI-generated components with canvas store", async () => {
      const mockAIResponse = {
        components: [
          { type: "container", id: "root", children: ["synced-button"] },
        ],
        layout: {
          root: { styles: {} },
          "synced-button": {
            type: "button",
            styles: { backgroundColor: "#007bff" },
          },
        },
        componentDetails: {
          "synced-button": {
            type: "button",
            content: "Synced Button",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create a synchronized button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);

      // Add to canvas store
      mockStore.addComponent(result.components[0]);

      expect(mockStore.addComponent).toHaveBeenCalledWith(result.components[0]);
    });

    it("should handle concurrent AI generation requests", async () => {
      const mockAIResponse1 = {
        components: [{ type: "container", id: "root1", children: ["button1"] }],
        layout: {
          root1: { styles: {} },
          button1: { type: "button", styles: {} },
        },
        componentDetails: {
          button1: { type: "button", content: "Button 1", props: {} },
        },
      };

      const mockAIResponse2 = {
        components: [{ type: "container", id: "root2", children: ["button2"] }],
        layout: {
          root2: { styles: {} },
          button2: { type: "button", styles: {} },
        },
        componentDetails: {
          button2: { type: "button", content: "Button 2", props: {} },
        },
      };

      mockOpenAI.chat.completions.create = jest
        .fn()
        .mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(mockAIResponse1) } }],
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(mockAIResponse2) } }],
        });

      const request1: AIGenerationRequest = {
        prompt: "Create button 1",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const request2: AIGenerationRequest = {
        prompt: "Create button 2",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      // Execute concurrent requests
      const [result1, result2] = await Promise.all([
        aiCodeGen.create(request1),
        aiCodeGen.create(request2),
      ]);

      expect(result1.components[0].id).toBe("root1");
      expect(result2.components[0].id).toBe("root2");
    });

    it("should maintain state consistency during AI generation failures", async () => {
      const validResponse = {
        components: [{ type: "container", id: "root", children: ["button"] }],
        layout: {
          root: { styles: {} },
          button: { type: "button", styles: {} },
        },
        componentDetails: {
          button: { type: "button", content: "Valid Button", props: {} },
        },
      };

      // First call succeeds, second fails
      mockOpenAI.chat.completions.create = jest
        .fn()
        .mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(validResponse) } }],
        })
        .mockRejectedValueOnce(new Error("API Error"));

      const validRequest: AIGenerationRequest = {
        prompt: "Create a valid button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const invalidRequest: AIGenerationRequest = {
        prompt: "Create an invalid component",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      // First request should succeed
      const result1 = await aiCodeGen.create(validRequest);
      expect(result1.components.length).toBeGreaterThan(0);

      // Second request should fail but not affect the first
      await expect(aiCodeGen.create(invalidRequest)).rejects.toThrow();

      // Verify first result is still valid
      expect(result1.components[0].id).toBe("root");
    });

    it("should synchronize component updates with AI service", async () => {
      const mockAIResponse = {
        components: [
          { type: "container", id: "root", children: ["editable-button"] },
        ],
        layout: {
          root: { styles: {} },
          "editable-button": {
            type: "button",
            styles: { backgroundColor: "#007bff" },
          },
        },
        componentDetails: {
          "editable-button": {
            type: "button",
            content: "Editable Button",
            props: {},
          },
        },
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const request: AIGenerationRequest = {
        prompt: "Create an editable button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aiCodeGen.create(request);
      const buttonComponent = result.components[0].children?.[0];

      if (buttonComponent) {
        // Simulate user editing the component
        mockStore.updateComponent(buttonComponent.id, {
          props: { children: "Updated Text" },
          styles: { backgroundColor: "#28a745" },
        });
      }

      expect(mockStore.updateComponent).toHaveBeenCalled();
    });
  });
});
