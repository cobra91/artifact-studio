import { GenerationHistory, generationHistory } from "../lib/history";
import {
  AIGenerationRequest,
  ComponentNode,
  ComponentType,
} from "../types/artifact";

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

describe("History Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    // Reset the singleton instance
    (GenerationHistory as any).instance = null;
  });

  describe("GenerationHistory Class", () => {
    let history: GenerationHistory;
    let mockRequest: AIGenerationRequest;
    let mockComponents: ComponentNode[];

    beforeEach(() => {
      history = new GenerationHistory();
      mockRequest = {
        prompt: "Create a login form",
        framework: "react" as const,
        styling: "tailwindcss" as const,
        interactivity: "medium" as const,
        theme: "default" as const,
      };

      mockComponents = [
        {
          id: "comp-1",
          type: "input" as ComponentType,
          props: { placeholder: "Username" },
          children: [],
          position: { x: 0, y: 0 },
          size: { width: 200, height: 40 },
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
    });

    it("should initialize with empty history", () => {
      expect(history.getHistory()).toEqual([]);
    });

    it("should load history from localStorage", () => {
      const storedHistory = [
        {
          id: "history-1",
          timestamp: Date.now() - 1000,
          request: mockRequest,
          components: mockComponents,
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedHistory));

      const newHistory = new GenerationHistory();
      expect(newHistory.getHistory()).toEqual(storedHistory);
    });

    it("should handle invalid localStorage data", () => {
      localStorageMock.getItem.mockReturnValue("invalid json");

      expect(() => new GenerationHistory()).not.toThrow();
      expect(history.getHistory()).toEqual([]);
    });

    it("should add generation to history", () => {
      const entry = history.addGeneration(mockRequest, mockComponents);

      expect(entry).toEqual({
        id: expect.any(String),
        timestamp: expect.any(Number),
        request: mockRequest,
        components: mockComponents,
      });

      expect(history.getHistory()).toHaveLength(1);
      expect(history.getHistory()[0]).toEqual(entry);
    });

    it("should prepend new entries to history", () => {
      const entry1 = history.addGeneration(mockRequest, mockComponents);
      const entry2 = history.addGeneration(
        { ...mockRequest, prompt: "Create a button" },
        mockComponents
      );

      const historyList = history.getHistory();
      expect(historyList).toHaveLength(2);
      expect(historyList[0]).toEqual(entry2);
      expect(historyList[1]).toEqual(entry1);
    });

    it("should save history to localStorage", () => {
      history.addGeneration(mockRequest, mockComponents);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "ai-generation-history",
        expect.any(String)
      );
    });

    it("should clear history", () => {
      history.addGeneration(mockRequest, mockComponents);
      history.clearHistory();

      expect(history.getHistory()).toEqual([]);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "ai-generation-history",
        "[]"
      );
    });

    it("should handle localStorage errors gracefully", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      expect(() => {
        history.addGeneration(mockRequest, mockComponents);
      }).not.toThrow();
    });
  });

  describe("Generation History Singleton", () => {
    it("should return the same instance", () => {
      const instance1 = generationHistory;
      const instance2 = generationHistory;

      expect(instance1).toBe(instance2);
    });

    it("should persist data across imports", () => {
      const mockRequest = {
        prompt: "Test",
        framework: "react" as const,
        styling: "tailwindcss" as const,
        interactivity: "low" as const,
        theme: "default" as const,
      };

      generationHistory.addGeneration(mockRequest, []);

      expect(generationHistory.getHistory()).toHaveLength(1);
    });
  });

  describe("Canvas State History", () => {
    it("should track canvas snapshots", () => {
      // This test demonstrates how canvas snapshots could be implemented
      // extending the current history system

      interface CanvasSnapshot {
        id: string;
        timestamp: Date;
        components: ComponentNode[];
        description: string;
      }

      const snapshots: CanvasSnapshot[] = [];

      const addCanvasSnapshot = (
        components: ComponentNode[],
        description: string
      ): CanvasSnapshot => {
        const snapshot: CanvasSnapshot = {
          id: `snapshot-${Date.now()}`,
          timestamp: new Date(),
          components: JSON.parse(JSON.stringify(components)), // Deep clone
          description,
        };

        snapshots.unshift(snapshot);
        return snapshot;
      };

      const components: ComponentNode[] = [
        {
          id: "comp-1",
          type: "button" as ComponentType,
          props: {},
          children: [],
          position: { x: 0, y: 0 },
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
      ];

      const snapshot = addCanvasSnapshot(components, "Initial state");

      expect(snapshot.components).toEqual(components);
      expect(snapshot.description).toBe("Initial state");
      expect(snapshots).toHaveLength(1);
    });

    it("should implement undo/redo functionality", () => {
      interface CanvasState {
        components: ComponentNode[];
        selectedNodes: string[];
      }

      class CanvasHistory {
        private snapshots: CanvasState[] = [];
        private currentIndex = -1;
        private maxSnapshots = 50;

        snapshot(state: CanvasState): void {
          // Remove any snapshots after current index (for when we're not at the end)
          this.snapshots = this.snapshots.slice(0, this.currentIndex + 1);

          // Add new snapshot
          this.snapshots.push(JSON.parse(JSON.stringify(state)));

          // Trim if we exceed max snapshots
          if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.shift();
          } else {
            this.currentIndex++;
          }
        }

        undo(): CanvasState | null {
          if (this.currentIndex > 0) {
            this.currentIndex--;
            return JSON.parse(
              JSON.stringify(this.snapshots[this.currentIndex])
            );
          }
          return null;
        }

        redo(): CanvasState | null {
          if (this.currentIndex < this.snapshots.length - 1) {
            this.currentIndex++;
            return JSON.parse(
              JSON.stringify(this.snapshots[this.currentIndex])
            );
          }
          return null;
        }

        canUndo(): boolean {
          return this.currentIndex > 0;
        }

        canRedo(): boolean {
          return this.currentIndex < this.snapshots.length - 1;
        }

        clear(): void {
          this.snapshots = [];
          this.currentIndex = -1;
        }
      }

      const history = new CanvasHistory();
      const initialState: CanvasState = {
        components: [],
        selectedNodes: [],
      };

      // Initial snapshot
      history.snapshot(initialState);

      // Modify state
      const modifiedState: CanvasState = {
        components: [
          {
            id: "comp-1",
            type: "button" as ComponentType,
            props: {},
            children: [],
            position: { x: 0, y: 0 },
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
        ],
        selectedNodes: ["comp-1"],
      };

      history.snapshot(modifiedState);

      // Test undo
      expect(history.canUndo()).toBe(true);
      const undoneState = history.undo();
      expect(undoneState).toEqual(initialState);
      expect(history.canUndo()).toBe(false);

      // Test redo
      expect(history.canRedo()).toBe(true);
      const redoneState = history.redo();
      expect(redoneState).toEqual(modifiedState);
      expect(history.canRedo()).toBe(false);
    });
  });
});
