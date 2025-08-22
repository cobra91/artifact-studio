// Jest setup file for DOM testing
import "@testing-library/jest-dom";

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

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

// Mock crypto
Object.defineProperty(window, "crypto", {
  value: {
    randomUUID: () => "mock-uuid-" + Math.random().toString(36).substring(2, 9),
  },
  writable: true,
});

// Mock OpenAI
jest.mock("openai", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    components: [{ type: "container", id: "root" }],
                    layout: { root: { styles: {} } },
                    componentDetails: { root: { type: "container", props: {} } }
                  })
                }
              }
            ]
          })
        }
      }
    }))
  };
});

// Mock performance.now for performance tests
global.performance = global.performance || {
  now: jest.fn(() => Date.now())
} as any;

// Mock Liveblocks hooks
jest.mock("../liveblocks.config", () => ({
  useOthers: jest.fn(() => []),
  useUpdateMyPresence: jest.fn(() => jest.fn()),
  useRoom: jest.fn(() => ({ id: "test-room" })),
  useSelf: jest.fn(() => ({ connectionId: 1, presence: {} })),
}));

// Mock fetch for tests
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
  })
) as jest.Mock;
