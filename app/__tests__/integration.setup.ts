// Integration test setup with comprehensive mocks and utilities
import "@testing-library/jest-dom";

import { jest } from "@jest/globals";

// Mock ResizeObserver
const ResizeObserverMock = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

(global as any).ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
const IntersectionObserverMock = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

(global as any).IntersectionObserver = IntersectionObserverMock;

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

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
  writable: true,
});

// Mock crypto
Object.defineProperty(window, "crypto", {
  value: {
    randomUUID: () => "mock-uuid-" + Math.random().toString(36).substr(2, 9),
  },
  writable: true,
});

// Mock fetch
(global as any).fetch = jest.fn();

// Mock FileReader
const FileReaderMock = jest.fn(() => ({
  readAsDataURL: jest.fn(),
  readAsText: jest.fn(),
  onload: jest.fn(),
  onerror: jest.fn(),
  EMPTY: 0,
  LOADING: 1,
  DONE: 2,
}));

(global as any).FileReader = FileReaderMock;

// Mock URL.createObjectURL
Object.defineProperty(window.URL, "createObjectURL", {
  value: jest.fn(() => "mock-object-url"),
  writable: true,
});

// Mock URL.revokeObjectURL
Object.defineProperty(window.URL, "revokeObjectURL", {
  value: jest.fn(),
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  value: jest.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
  writable: true,
});

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.clear.mockClear();
  localStorageMock.removeItem.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.clear.mockClear();
  sessionStorageMock.removeItem.mockClear();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Test utilities
export const createMockComponentNode = (overrides = {}) => ({
  id: "mock-component-id",
  type: "button",
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
    author: "system",
    description: "",
    tags: [],
    locked: false,
    hidden: false,
  },
  ...overrides,
});

export const createMockCanvasState = (overrides = {}) => ({
  components: [],
  selectedNodes: [],
  clipboard: [],
  draggedComponent: undefined,
  hoveredComponent: undefined,
  gridVisible: true,
  snapToGrid: true,
  zoom: 1,
  activeBreakpoint: "base" as const,
  ...overrides,
});

export const createMockTemplate = (overrides = {}) => ({
  id: "mock-template-id",
  name: "Mock Template",
  description: "A mock template for testing",
  category: "ui",
  tags: ["button", "mock"],
  thumbnail: "mock-thumbnail.png",
  created: new Date(),
  modified: new Date(),
  rating: 4.5,
  reviews: [],
  version: "1.0.0",
  author: "test-author",
  components: [],
  ...overrides,
});

export const createMockUserEvent = (type: string, overrides = {}) => ({
  type,
  target: { value: "", files: [] },
  currentTarget: { value: "" },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  clientX: 100,
  clientY: 100,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  ...overrides,
});

export const createMockDragEvent = (overrides = {}): any => ({
  dataTransfer: {
    getData: jest.fn((type: string) =>
      type === "text/plain"
        ? JSON.stringify({ type: "component", componentType: "button" })
        : ""
    ),
    setData: jest.fn(),
    clearData: jest.fn(),
    setDragImage: jest.fn(),
    dropEffect: "copy",
    effectAllowed: "copy",
    files: [] as any,
    items: [] as any,
    types: [] as any,
  },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  clientX: 100,
  clientY: 100,
  ...overrides,
});

export const simulateUserInteraction = {
  click: (element: HTMLElement, options = {}) => {
    const event = createMockUserEvent("click", options);
    element.dispatchEvent(new MouseEvent("click", event));
  },

  doubleClick: (element: HTMLElement, options = {}) => {
    const event = createMockUserEvent("dblclick", options);
    element.dispatchEvent(new MouseEvent("dblclick", event));
  },

  mouseDown: (element: HTMLElement, options = {}) => {
    const event = createMockUserEvent("mousedown", options);
    element.dispatchEvent(new MouseEvent("mousedown", event));
  },

  mouseUp: (element: HTMLElement, options = {}) => {
    const event = createMockUserEvent("mouseup", options);
    element.dispatchEvent(new MouseEvent("mouseup", event));
  },

  mouseMove: (element: HTMLElement, options = {}) => {
    const event = createMockUserEvent("mousemove", options);
    element.dispatchEvent(new MouseEvent("mousemove", event));
  },

  dragStart: (element: HTMLElement, options = {}) => {
    const event = createMockDragEvent({ ...options, type: "dragstart" });
    element.dispatchEvent(new DragEvent("dragstart", event));
    return event.dataTransfer;
  },

  drop: (element: HTMLElement, options = {}) => {
    const event = createMockDragEvent({ ...options, type: "drop" });
    element.dispatchEvent(new DragEvent("drop", event));
  },

  dragOver: (element: HTMLElement, options = {}) => {
    const event = createMockDragEvent({ ...options, type: "dragover" });
    element.dispatchEvent(new DragEvent("dragover", event));
  },

  keyDown: (
    element: HTMLElement,
    key: string,
    options: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } = {}
  ) => {
    const event = new KeyboardEvent("keydown", {
      key,
      ctrlKey: options.ctrlKey || false,
      metaKey: options.metaKey || false,
      shiftKey: options.shiftKey || false,
      ...options,
    });
    element.dispatchEvent(event);
  },

  input: (element: HTMLInputElement, value: string) => {
    element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
  },

  change: (
    element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    value: string
  ) => {
    element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  },
};

export const waitForAsync = (callback: () => void, timeout = 100) => {
  return new Promise(resolve => {
    setTimeout(() => {
      callback();
      resolve(void 0);
    }, timeout);
  });
};

export const createMockCanvasRef = (overrides = {}) => ({
  current: {
    getBoundingClientRect: jest.fn(() => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: jest.fn(),
    })),
    ...overrides,
  },
});
