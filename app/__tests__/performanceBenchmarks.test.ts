// Comprehensive performance benchmarks for the visual canvas application

// Mock the entire aiCodeGen module to avoid OpenAI dependency
jest.mock("../lib/aiCodeGen", () => ({
  aiCodeGen: {
    create: jest.fn().mockResolvedValue({
      components: [
        {
          id: "test-component",
          type: "button",
          position: { x: 0, y: 0 },
          size: { width: 100, height: 40 },
          props: { children: "Test Button" },
          styles: {},
        },
      ],
      code: "export const TestComponent = () => <button>Test</button>",
    }),
    generateReactCode: jest
      .fn()
      .mockReturnValue("export const TestComponent = () => <div>Test</div>"),
    generateVueCode: jest
      .fn()
      .mockReturnValue("<template><div>Test</div></template>"),
    generateSvelteCode: jest.fn().mockReturnValue("<div>Test</div>"),
  },
}));

import { aiCodeGen } from "../lib/aiCodeGen";
import { useCanvasStore } from "../lib/canvasStore";
import { createComponentNode } from "../lib/componentOperations";
import { GenerationHistory } from "../lib/history";
import {
  BenchmarkRunner,
  createPerformanceTestSuite,
} from "../lib/performanceUtils";
import { createTemplate } from "../lib/templateManagement";
import { ComponentNode, ComponentType } from "../types/artifact";

// Mock the OpenAI API for testing
jest.mock("openai", () => ({
  default: jest.fn().mockImplementation(() => ({})),
}));

// Mock React for canvas testing
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: jest.fn(() => ({ current: null })),
  useState: jest.fn(initial => [initial, jest.fn()]),
}));

describe("Performance Benchmarks", () => {
  let benchmarkRunner: BenchmarkRunner;
  let performanceSuite: any;
  let _mockCanvasStore: any;
  let mockComponents: ComponentNode[];
  let mockSelection: string[];

  beforeAll(() => {
    benchmarkRunner = new BenchmarkRunner();
    performanceSuite = createPerformanceTestSuite(
      "Visual Canvas Performance Benchmarks"
    );

    // Set up performance thresholds
    performanceSuite.setThresholds("component-rendering-1000", {
      maxDuration: 5000, // 5 seconds for 1000 components
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      minOperationsPerSecond: 10,
      maxAvgOperationTime: 100,
    });

    performanceSuite.setThresholds("canvas-interactions-drag", {
      maxDuration: 2000,
      maxMemoryUsage: 50 * 1024 * 1024,
      minOperationsPerSecond: 30,
      maxAvgOperationTime: 50,
    });

    performanceSuite.setThresholds("ai-generation", {
      maxDuration: 30000, // 30 seconds for AI generation
      maxMemoryUsage: 200 * 1024 * 1024,
    });
  });

  beforeEach(() => {
    // Reset the canvas store
    useCanvasStore.setState({
      components: [],
      selectedNodes: [],
      clipboard: [],
      draggedComponent: undefined,
      hoveredComponent: undefined,
      gridVisible: true,
      snapToGrid: true,
      zoom: 1,
      elements: [],
      selectedElementId: null,
      recentColors: [],
      activeBreakpoint: "base",
    });

    // Create mock components for testing
    mockComponents = [];
    for (let i = 0; i < 1000; i++) {
      mockComponents.push(
        createComponentNode(
          "container" as ComponentType,
          `component_${i}`,
          { text: `Component ${i}` },
          {},
          { x: (i % 50) * 120, y: Math.floor(i / 50) * 80 },
          { width: 100, height: 60 }
        )
      );
    }

    mockSelection = mockComponents.slice(0, 10).map(c => c.id);
  });

  afterEach(() => {
    // Clean up after each test
    mockComponents = [];
    mockSelection = [];
  });

  describe("Component Rendering Performance", () => {
    test("should measure rendering performance with 1000+ components", async () => {
      const setup = async () => {
        useCanvasStore.setState({
          components: mockComponents,
          selectedNodes: mockSelection,
        });
      };

      const benchmarkFn = async () => {
        // Simulate rendering cycle
        const components = useCanvasStore.getState().components;
        // Force re-render by updating state
        useCanvasStore.setState({ components: [...components] });
      };

      const result = await benchmarkRunner.runBenchmark(
        "component-rendering-1000",
        setup,
        benchmarkFn,
        50
      );

      performanceSuite.addBenchmark("component-rendering-1000", result);

      console.log(`Component rendering benchmark results:`, {
        duration: `${result.duration.toFixed(2)}ms`,
        opsPerSecond: result.operationsPerSecond.toFixed(2),
        memoryUsage: `${(result.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      });

      expect(result.duration).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.memoryUsage.usedJSHeapSize).toBeLessThan(200 * 1024 * 1024); // Less than 200MB
    }, 30000);

    test("should measure rendering performance with complex component hierarchies", async () => {
      const complexComponents: ComponentNode[] = [];

      // Create nested component hierarchies
      for (let i = 0; i < 100; i++) {
        const parentComponent = createComponentNode(
          "container" as ComponentType,
          `parent_${i}`,
          {},
          {},
          { x: i * 200, y: 0 },
          { width: 180, height: 300 }
        );

        parentComponent.children = [];
        for (let j = 0; j < 10; j++) {
          const childComponent = createComponentNode(
            "text" as ComponentType,
            `child_${i}_${j}`,
            { text: `Child ${j}` },
            {},
            { x: 10, y: j * 30 },
            { width: 160, height: 25 }
          );

          childComponent.children = [];
          for (let k = 0; k < 5; k++) {
            const grandChild = createComponentNode(
              "button" as ComponentType,
              `grandchild_${i}_${j}_${k}`,
              { text: `Button ${k}` },
              {},
              { x: 5, y: k * 5 },
              { width: 150, height: 20 }
            );
            childComponent.children.push(grandChild);
          }

          parentComponent.children.push(childComponent);
        }

        complexComponents.push(parentComponent);
      }

      const setup = async () => {
        useCanvasStore.setState({
          components: complexComponents,
          selectedNodes: [],
        });
      };

      const benchmarkFn = async () => {
        const components = useCanvasStore.getState().components;
        useCanvasStore.setState({ components: [...components] });
      };

      const result = await benchmarkRunner.runBenchmark(
        "complex-hierarchy-rendering",
        setup,
        benchmarkFn,
        30
      );

      performanceSuite.addBenchmark("complex-hierarchy-rendering", result);

      expect(result.duration).toBeLessThan(15000);
      expect(result.memoryUsage.usedJSHeapSize).toBeLessThan(300 * 1024 * 1024);
    }, 30000);
  });

  describe("Canvas Interaction Performance", () => {
    test("should measure drag performance with multiple selected components", async () => {
      const selectedComponents = mockComponents.slice(0, 50);
      const selectedIds = selectedComponents.map(c => c.id);

      const setup = async () => {
        useCanvasStore.setState({
          components: mockComponents,
          selectedNodes: selectedIds,
        });
      };

      const benchmarkFn = async () => {
        // Simulate drag operation
        const dx = 10,
          dy = 10;

        selectedIds.forEach(id => {
          const component = mockComponents.find(c => c.id === id);
          if (component) {
            const newPosition = {
              x: component.position.x + dx,
              y: component.position.y + dy,
            };
            useCanvasStore.setState(state => ({
              components: state.components.map(c =>
                c.id === id ? { ...c, position: newPosition } : c
              ),
            }));
          }
        });
      };

      const result = await benchmarkRunner.runBenchmark(
        "canvas-interactions-drag",
        setup,
        benchmarkFn,
        100
      );

      performanceSuite.addBenchmark("canvas-interactions-drag", result);

      expect(result.duration).toBeLessThan(5000);
      expect(result.operationsPerSecond).toBeGreaterThan(10);
    }, 15000);

    test("should measure resize performance", async () => {
      const componentToResize = mockComponents[0];

      const setup = async () => {
        useCanvasStore.setState({
          components: mockComponents,
          selectedNodes: [componentToResize.id],
        });
      };

      const benchmarkFn = async () => {
        // Simulate resize operation
        const newSize = {
          width: componentToResize.size.width + 5,
          height: componentToResize.size.height + 5,
        };

        useCanvasStore.setState(state => ({
          components: state.components.map(c =>
            c.id === componentToResize.id ? { ...c, size: newSize } : c
          ),
        }));
      };

      const result = await benchmarkRunner.runBenchmark(
        "canvas-interactions-resize",
        setup,
        benchmarkFn,
        100
      );

      performanceSuite.addBenchmark("canvas-interactions-resize", result);

      expect(result.duration).toBeLessThan(3000);
      expect(result.operationsPerSecond).toBeGreaterThan(20);
    }, 10000);

    test("should measure selection performance with large component sets", async () => {
      const setup = async () => {
        useCanvasStore.setState({
          components: mockComponents,
          selectedNodes: [],
        });
      };

      const benchmarkFn = async () => {
        // Simulate area selection
        const selectionRect = {
          x: 100,
          y: 100,
          width: 500,
          height: 400,
        };

        const selectedInRect = mockComponents.filter(component => {
          const right = component.position.x + component.size.width;
          const bottom = component.position.y + component.size.height;

          return (
            component.position.x < selectionRect.x + selectionRect.width &&
            right > selectionRect.x &&
            component.position.y < selectionRect.y + selectionRect.height &&
            bottom > selectionRect.y
          );
        });

        const selectedIds = selectedInRect.map(c => c.id);
        useCanvasStore.setState({ selectedNodes: selectedIds });
      };

      const result = await benchmarkRunner.runBenchmark(
        "canvas-interactions-selection",
        setup,
        benchmarkFn,
        50
      );

      performanceSuite.addBenchmark("canvas-interactions-selection", result);

      expect(result.duration).toBeLessThan(2000);
      expect(result.operationsPerSecond).toBeGreaterThan(15);
    }, 10000);
  });

  describe("Memory Usage and Leak Detection", () => {
    test("should detect memory leaks during component operations", async () => {
      const setup = async () => {
        // Start with clean state
        useCanvasStore.setState({
          components: [],
          selectedNodes: [],
        });
      };

      const benchmarkFn = async () => {
        // Simulate component creation and deletion cycle
        const newComponents = [];
        for (let i = 0; i < 100; i++) {
          newComponents.push(
            createComponentNode(
              "container" as ComponentType,
              `temp_${Date.now()}_${i}`,
              {},
              {},
              { x: i * 10, y: i * 10 },
              { width: 50, height: 50 }
            )
          );
        }

        useCanvasStore.setState({ components: newComponents });

        // Immediately remove them to test GC
        useCanvasStore.setState({ components: [] });
      };

      const result = await benchmarkRunner.runMemoryBenchmark(
        "memory-leak-detection",
        setup,
        benchmarkFn,
        20
      );

      performanceSuite.addBenchmark("memory-leak-detection", result);

      // Memory leak should be minimal after GC
      expect((result as any).memoryLeak).toBeLessThan(10 * 1024 * 1024); // Less than 10MB leak
    }, 30000);

    test("should monitor memory usage during extended usage", async () => {
      const setup = async () => {
        useCanvasStore.setState({
          components: mockComponents.slice(0, 100),
          selectedNodes: [],
        });
      };

      const benchmarkFn = async () => {
        // Simulate extended usage with various operations
        const operations = [
          () => {
            // Add components
            const newComp = createComponentNode(
              "text" as ComponentType,
              `extended_${Date.now()}`,
              { text: "Extended test" },
              {},
              { x: Math.random() * 1000, y: Math.random() * 1000 },
              { width: 100, height: 30 }
            );
            useCanvasStore.setState(state => ({
              components: [...state.components, newComp],
            }));
          },
          () => {
            // Select components
            const components = useCanvasStore.getState().components;
            if (components.length > 0) {
              const randomIndex = Math.floor(Math.random() * components.length);
              useCanvasStore.setState({
                selectedNodes: [components[randomIndex].id],
              });
            }
          },
          () => {
            // Move selected components
            const state = useCanvasStore.getState();
            if (state.selectedNodes.length > 0) {
              const dx = (Math.random() - 0.5) * 20;
              const dy = (Math.random() - 0.5) * 20;

              useCanvasStore.setState(state => ({
                components: state.components.map(c =>
                  state.selectedNodes.includes(c.id)
                    ? {
                        ...c,
                        position: {
                          x: c.position.x + dx,
                          y: c.position.y + dy,
                        },
                      }
                    : c
                ),
              }));
            }
          },
          () => {
            // Delete some components
            const state = useCanvasStore.getState();
            if (state.components.length > 50) {
              const componentsToKeep = state.components.slice(0, 50);
              useCanvasStore.setState({ components: componentsToKeep });
            }
          },
        ];

        // Execute random operations
        for (let i = 0; i < 20; i++) {
          const randomOp =
            operations[Math.floor(Math.random() * operations.length)];
          randomOp();
        }
      };

      const result = await benchmarkRunner.runMemoryBenchmark(
        "extended-usage-memory",
        setup,
        benchmarkFn,
        10
      );

      performanceSuite.addBenchmark("extended-usage-memory", result);

      expect(result.memoryUsage.usedJSHeapSize).toBeLessThan(150 * 1024 * 1024);
    }, 60000);
  });

  describe("State Management Performance", () => {
    test("should measure state update performance with complex hierarchies", async () => {
      const setup = async () => {
        useCanvasStore.setState({
          components: mockComponents,
          selectedNodes: mockSelection,
        });
      };

      const benchmarkFn = async () => {
        // Simulate complex state updates
        const updates = mockComponents.map(component => ({
          id: component.id,
          updates: {
            position: {
              x: component.position.x + 1,
              y: component.position.y + 1,
            },
            styles: {
              ...component.styles,
              opacity: Math.random(),
            },
          },
        }));

        updates.forEach(({ id, updates }) => {
          useCanvasStore.setState(state => ({
            components: state.components.map(c =>
              c.id === id ? { ...c, ...updates } : c
            ),
          }));
        });
      };

      const result = await benchmarkRunner.runBenchmark(
        "state-management-complex",
        setup,
        benchmarkFn,
        30
      );

      performanceSuite.addBenchmark("state-management-complex", result);

      expect(result.duration).toBeLessThan(8000);
      expect(result.operationsPerSecond).toBeGreaterThan(3);
    }, 20000);

    test("should measure selector performance", async () => {
      const setup = async () => {
        useCanvasStore.setState({
          components: mockComponents,
          selectedNodes: mockSelection,
        });
      };

      const benchmarkFn = async () => {
        // Simulate frequent state access patterns
        for (let i = 0; i < 100; i++) {
          const state = useCanvasStore.getState();

          // Access various parts of state
          const componentCount = state.components.length;
          const selectedCount = state.selectedNodes.length;
          const hasComponents = componentCount > 0;
          const hasSelection = selectedCount > 0;

          // Simulate derived state calculations
          const selectedComponents = state.components.filter(c =>
            state.selectedNodes.includes(c.id)
          );
          const _averagePosition = selectedComponents.reduce(
            (acc, c) => ({
              x: acc.x + c.position.x / selectedComponents.length,
              y: acc.y + c.position.y / selectedComponents.length,
            }),
            { x: 0, y: 0 }
          );

          // Ensure calculations are used to prevent optimization
          if (!hasComponents || !hasSelection) {
            throw new Error("Invalid state");
          }
        }
      };

      const result = await benchmarkRunner.runBenchmark(
        "state-selector-performance",
        setup,
        benchmarkFn,
        20
      );

      performanceSuite.addBenchmark("state-selector-performance", result);

      expect(result.duration).toBeLessThan(5000);
      expect(result.operationsPerSecond).toBeGreaterThan(4);
    }, 15000);
  });

  describe("AI Generation Performance", () => {
    test("should measure AI code generation performance", async () => {
      const _mockAIResponse = {
        components: [
          { type: "container", id: "root", children: ["header", "content"] },
        ],
        layout: {
          root: {
            styles: { padding: "2rem" },
          },
        },
        componentDetails: {
          header: { type: "text", content: "Header", props: {} },
          content: { type: "text", content: "Content", props: {} },
        },
      };

      // Mock the OpenAI API call
      const originalCreate = aiCodeGen.create;
      aiCodeGen.create = jest.fn().mockResolvedValue({
        code: "mocked code",
        components: mockComponents.slice(0, 10),
      });

      const setup = async () => {
        // Setup is minimal for AI generation
      };

      const benchmarkFn = async () => {
        try {
          await aiCodeGen.create({
            prompt: "Create a simple card component",
            framework: "react",
            styling: "tailwindcss",
            interactivity: "medium",
            theme: "default",
          });
        } catch {
          // Ignore errors in benchmark
        }
      };

      const result = await benchmarkRunner.runBenchmark(
        "ai-generation",
        setup,
        benchmarkFn,
        5 // Fewer iterations for AI generation
      );

      performanceSuite.addBenchmark("ai-generation", result);

      // Restore original function
      aiCodeGen.create = originalCreate;

      expect(result.duration).toBeLessThan(60000); // Should complete within 1 minute
      expect(result.avgOperationTime).toBeLessThan(30000); // Average under 30 seconds
    }, 120000);
  });

  describe("Template Operations Performance", () => {
    test("should measure template loading and instantiation performance", async () => {
      const templateData = createTemplate({
        name: "Performance Test Template",
        description: "Template for performance testing",
        components: mockComponents.slice(0, 100),
        author: "performance-test",
        framework: "react",
        styling: "tailwindcss",
        tags: ["performance", "test"],
      });

      const setup = async () => {
        // Store template in localStorage
        localStorage.setItem(
          `template_${templateData.id}`,
          JSON.stringify(templateData)
        );
      };

      const benchmarkFn = async () => {
        // Simulate template loading and instantiation
        const stored = localStorage.getItem(`template_${templateData.id}`);
        if (stored) {
          const template = JSON.parse(stored);

          // Simulate instantiation
          const instantiatedComponents = template.components.map(
            (comp: ComponentNode, index: number) => ({
              ...comp,
              id: `instance_${index}_${Date.now()}`,
              position: {
                x: comp.position.x + 10,
                y: comp.position.y + 10,
              },
            })
          );

          // Simulate loading into canvas
          useCanvasStore.setState({
            components: instantiatedComponents,
            selectedNodes: [],
          });
        }
      };

      const result = await benchmarkRunner.runBenchmark(
        "template-loading-instantiation",
        setup,
        benchmarkFn,
        30
      );

      performanceSuite.addBenchmark("template-loading-instantiation", result);

      expect(result.duration).toBeLessThan(5000);
      expect(result.operationsPerSecond).toBeGreaterThan(5);
    }, 15000);

    test("should measure template serialization/deserialization performance", async () => {
      const templateData = createTemplate({
        name: "Serialization Test Template",
        description: "Template for serialization testing",
        components: mockComponents.slice(0, 500),
        author: "performance-test",
        framework: "react",
        styling: "tailwindcss",
        tags: ["serialization", "test"],
      });

      const setup = async () => {
        // Clean setup
      };

      const benchmarkFn = async () => {
        // Serialize
        const serialized = JSON.stringify(templateData);

        // Deserialize
        const deserialized = JSON.parse(serialized);

        // Validate structure
        if (
          !deserialized.components ||
          deserialized.components.length !== 500
        ) {
          throw new Error("Serialization failed");
        }
      };

      const result = await benchmarkRunner.runBenchmark(
        "template-serialization",
        setup,
        benchmarkFn,
        50
      );

      performanceSuite.addBenchmark("template-serialization", result);

      expect(result.duration).toBeLessThan(3000);
      expect(result.operationsPerSecond).toBeGreaterThan(15);
    }, 10000);
  });

  describe("Undo/Redo Performance", () => {
    test("should measure undo/redo performance with large operation history", async () => {
      const history = new GenerationHistory();
      const operations: any[] = [];

      // Create a large history of operations
      for (let i = 0; i < 1000; i++) {
        operations.push({
          id: `operation_${i}`,
          timestamp: Date.now() + i,
          request: {
            prompt: `Operation ${i}`,
            framework: "react" as const,
            styling: "tailwind" as const,
            theme: "light" as const,
          },
          components: mockComponents.slice(0, Math.min(10, i + 1)),
        });
      }

      const setup = async () => {
        // Populate history
        operations.forEach(op => {
          history.addGeneration(op.request, op.components);
        });
      };

      const benchmarkFn = async () => {
        // Simulate undo/redo operations
        const historyData = history.getHistory();

        // Simulate accessing different parts of history
        for (let i = 0; i < 100; i++) {
          const randomIndex = Math.floor(Math.random() * historyData.length);
          const entry = historyData[randomIndex];

          // Simulate restoring state
          useCanvasStore.setState({
            components: entry.components,
            selectedNodes: [],
          });
        }
      };

      const result = await benchmarkRunner.runBenchmark(
        "undo-redo-large-history",
        setup,
        benchmarkFn,
        20
      );

      performanceSuite.addBenchmark("undo-redo-large-history", result);

      expect(result.duration).toBeLessThan(10000);
      expect(result.operationsPerSecond).toBeGreaterThan(2);
    }, 30000);
  });

  describe("Search and Filtering Performance", () => {
    test("should measure search performance across large datasets", async () => {
      const searchableComponents = mockComponents.map((comp, index) => ({
        ...comp,
        props: {
          ...comp.props,
          text: `Searchable component ${index} with some searchable content`,
          className: `component-${index} searchable-class`,
        },
      }));

      const setup = async () => {
        useCanvasStore.setState({
          components: searchableComponents,
          selectedNodes: [],
        });
      };

      const benchmarkFn = async () => {
        const searchTerms = [
          "component-500",
          "searchable",
          "content",
          "Searchable component 750",
          "nonexistent",
        ];

        searchTerms.forEach(term => {
          const _results = searchableComponents.filter(
            comp =>
              comp.props.text?.includes(term) ||
              comp.props.className?.includes(term) ||
              comp.id.includes(term)
          );
        });
      };

      const result = await benchmarkRunner.runBenchmark(
        "search-filtering-performance",
        setup,
        benchmarkFn,
        100
      );

      performanceSuite.addBenchmark("search-filtering-performance", result);

      expect(result.duration).toBeLessThan(2000);
      expect(result.operationsPerSecond).toBeGreaterThan(40);
    }, 10000);

    test("should measure complex filtering performance", async () => {
      const setup = async () => {
        useCanvasStore.setState({
          components: mockComponents,
          selectedNodes: [],
        });
      };

      const benchmarkFn = async () => {
        const filters = [
          // Filter by type
          (comp: ComponentNode) => comp.type === "container",
          // Filter by position range
          (comp: ComponentNode) =>
            comp.position.x > 500 && comp.position.x < 800,
          // Filter by size
          (comp: ComponentNode) =>
            comp.size.width > 50 && comp.size.height > 40,
          // Complex multi-condition filter
          (comp: ComponentNode) =>
            comp.type === "container" &&
            comp.position.x > 200 &&
            comp.size.width > 60 &&
            comp.id.includes("5"),
        ];

        filters.forEach(filter => {
          const _results = mockComponents.filter(filter);
        });
      };

      const result = await benchmarkRunner.runBenchmark(
        "complex-filtering-performance",
        setup,
        benchmarkFn,
        100
      );

      performanceSuite.addBenchmark("complex-filtering-performance", result);

      expect(result.duration).toBeLessThan(1500);
      expect(result.operationsPerSecond).toBeGreaterThan(50);
    }, 8000);
  });

  describe("Virtual Scrolling and Pagination Performance", () => {
    test("should measure virtual scrolling performance with large datasets", async () => {
      const largeDataset = [];
      for (let i = 0; i < 10000; i++) {
        largeDataset.push(
          createComponentNode(
            "container" as ComponentType,
            `virtual_${i}`,
            { text: `Virtual component ${i}` },
            {},
            { x: (i % 100) * 120, y: Math.floor(i / 100) * 80 },
            { width: 100, height: 60 }
          )
        );
      }

      const setup = async () => {
        useCanvasStore.setState({
          components: largeDataset,
          selectedNodes: [],
        });
      };

      const benchmarkFn = async () => {
        // Simulate virtual scrolling behavior
        const viewportHeight = 800;
        const itemHeight = 80;
        const scrollTop = Math.random() * 10000 * itemHeight;

        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
          startIndex + Math.ceil(viewportHeight / itemHeight) + 5, // Add buffer
          largeDataset.length
        );

        const visibleComponents = largeDataset.slice(startIndex, endIndex);

        // Simulate rendering visible components
        useCanvasStore.setState({
          components: visibleComponents,
          selectedNodes: [],
        });
      };

      const result = await benchmarkRunner.runBenchmark(
        "virtual-scrolling-performance",
        setup,
        benchmarkFn,
        50
      );

      performanceSuite.addBenchmark("virtual-scrolling-performance", result);

      expect(result.duration).toBeLessThan(3000);
      expect(result.operationsPerSecond).toBeGreaterThan(15);
    }, 15000);

    test("should measure pagination performance", async () => {
      const paginatedDataset = [];
      for (let i = 0; i < 5000; i++) {
        paginatedDataset.push(
          createComponentNode(
            "text" as ComponentType,
            `page_${i}`,
            { text: `Page item ${i}` },
            {},
            { x: (i % 50) * 120, y: Math.floor(i / 50) * 80 },
            { width: 100, height: 60 }
          )
        );
      }

      const setup = async () => {
        useCanvasStore.setState({
          components: paginatedDataset,
          selectedNodes: [],
        });
      };

      const benchmarkFn = async () => {
        const pageSize = 100;
        const totalPages = Math.ceil(paginatedDataset.length / pageSize);

        // Simulate pagination navigation
        for (let page = 0; page < Math.min(10, totalPages); page++) {
          const startIndex = page * pageSize;
          const endIndex = startIndex + pageSize;
          const pageComponents = paginatedDataset.slice(startIndex, endIndex);

          useCanvasStore.setState({
            components: pageComponents,
            selectedNodes: [],
          });
        }
      };

      const result = await benchmarkRunner.runBenchmark(
        "pagination-performance",
        setup,
        benchmarkFn,
        20
      );

      performanceSuite.addBenchmark("pagination-performance", result);

      expect(result.duration).toBeLessThan(2000);
      expect(result.operationsPerSecond).toBeGreaterThan(10);
    }, 10000);
  });

  afterAll(() => {
    // Generate performance report
    const report = performanceSuite.generateReport();
    console.log("\n=== PERFORMANCE BENCHMARK REPORT ===");
    console.log(report);

    // Save report to file (in a real implementation)
    // You would typically write this to a file or send to a monitoring service

    // Validate all thresholds
    const violations = performanceSuite.runValidations();
    if (violations.size > 0) {
      console.warn("\n=== PERFORMANCE THRESHOLD VIOLATIONS ===");
      for (const [benchmarkName, benchmarkViolations] of violations) {
        console.warn(`❌ ${benchmarkName}:`);
        benchmarkViolations.forEach(violation =>
          console.warn(`   ${violation}`)
        );
      }
    } else {
      console.log("\n✅ All performance benchmarks passed their thresholds!");
    }
  });
});
