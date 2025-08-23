import { jest } from "@jest/globals";

import { AIMLCodeGenerator } from "../lib/aimlProvider";
import { AIGenerationRequest } from "../types/artifact";

// Mock fetch globally with proper typing
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe("AIMLCodeGenerator", () => {
  let aimlCodeGen: AIMLCodeGenerator;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    aimlCodeGen = new AIMLCodeGenerator();
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    // Reset environment variables
    delete process.env.AIML_API_KEY;
    delete process.env.AIML_API_URL;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Environment Configuration", () => {
    it("should throw error when AIML_API_KEY is not set", async () => {
      const request: AIGenerationRequest = {
        prompt: "Create a simple button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      await expect(aimlCodeGen.create(request)).rejects.toThrow(
        "AIML_API_KEY environment variable is not set."
      );
    });

    it("should use default AIML API URL when not configured", async () => {
      process.env.AIML_API_KEY = "test-api-key";

      const mockResponse = {
        components: [{ type: "button", id: "btn1" }],
        layout: { btn1: { styles: {} } },
        componentDetails: {
          btn1: {
            type: "button",
            props: { children: "Click me" },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
        }),
      } as any);

      const request: AIGenerationRequest = {
        prompt: "Create a simple button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aimlCodeGen.create(request);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.aimlapi.com/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          },
        })
      );

      expect(result).toHaveProperty("code");
      expect(result).toHaveProperty("components");
    });
  });

  describe("API Integration", () => {
    beforeEach(() => {
      process.env.AIML_API_KEY = "test-api-key";
    });

    it("should make correct API call to AIML", async () => {
      const mockResponse = {
        components: [{ type: "button", id: "btn1" }],
        layout: { btn1: { styles: {} } },
        componentDetails: {
          btn1: {
            type: "button",
            props: { children: "Click me" },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
        }),
      } as any);

      const request: AIGenerationRequest = {
        prompt: "Create a simple button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aimlCodeGen.create(request);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.aimlapi.com/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          },
          body: expect.stringContaining('"model":"gpt-5"'),
        })
      );

      expect(result).toHaveProperty("code");
      expect(result).toHaveProperty("components");
    });

    it("should handle API errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      } as any);

      const request: AIGenerationRequest = {
        prompt: "Create a simple button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      await expect(aimlCodeGen.create(request)).rejects.toThrow(
        "AIML API error: 401 - Unauthorized"
      );
    });

    it("should handle empty response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [],
        }),
      } as any);

      const request: AIGenerationRequest = {
        prompt: "Create a simple button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      await expect(aimlCodeGen.create(request)).rejects.toThrow(
        "Empty response from AIML API"
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const request: AIGenerationRequest = {
        prompt: "Create a simple button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      await expect(aimlCodeGen.create(request)).rejects.toThrow(
        "Failed to generate component tree from AIML API."
      );
    });
  });

  describe("Code Generation", () => {
    beforeEach(() => {
      process.env.AIML_API_KEY = "test-api-key";
    });

    it("should generate React code correctly", async () => {
      const mockResponse = {
        components: [{ type: "container", id: "root", children: ["button"] }],
        layout: {
          root: { styles: { padding: "1rem" } },
          button: { styles: { backgroundColor: "blue" } },
        },
        componentDetails: {
          root: {
            type: "container",
            props: {},
          },
          button: {
            type: "button",
            content: "Click me",
            props: { className: "btn" },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
        }),
      } as any);

      const request: AIGenerationRequest = {
        prompt: "Create a button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aimlCodeGen.create(request);

      expect(result.code).toContain("import React");
      expect(result.code).toContain("GeneratedArtifact");
      expect(result.components).toHaveLength(1);
    });

    it("should generate Vue code correctly", async () => {
      const mockResponse = {
        components: [{ type: "button", id: "btn1" }],
        layout: { btn1: { styles: {} } },
        componentDetails: {
          btn1: {
            type: "button",
            content: "Click me",
            props: { className: "btn" },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
        }),
      } as any);

      const request: AIGenerationRequest = {
        prompt: "Create a button",
        framework: "vue",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aimlCodeGen.create(request);

      expect(result.code).toContain("<template>");
      expect(result.code).toContain("<script setup>");
      expect(result.code).toContain("import { ref, onMounted }");
    });

    it("should generate Svelte code correctly", async () => {
      const mockResponse = {
        components: [{ type: "button", id: "btn1" }],
        layout: { btn1: { styles: {} } },
        componentDetails: {
          btn1: {
            type: "button",
            content: "Click me",
            props: { className: "btn" },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
        }),
      } as any);

      const request: AIGenerationRequest = {
        prompt: "Create a button",
        framework: "svelte",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aimlCodeGen.create(request);

      expect(result.code).toContain("<script>");
      expect(result.code).toContain("import { onMount }");
      expect(result.code).toContain("<style>");
    });
  });

  describe("Component Tree Building", () => {
    beforeEach(() => {
      process.env.AIML_API_KEY = "test-api-key";
    });

    it("should build component tree correctly", async () => {
      const mockResponse = {
        components: [
          { type: "container", id: "root", children: ["header", "content"] },
        ],
        layout: {
          root: { styles: { padding: "1rem" } },
          header: { styles: { fontSize: "24px" } },
          content: { styles: { marginTop: "1rem" } },
        },
        componentDetails: {
          root: {
            type: "container",
            props: {},
          },
          header: {
            type: "text",
            content: "Header",
            props: { className: "text-xl" },
          },
          content: {
            type: "text",
            content: "Content",
            props: { className: "text-base" },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
        }),
      } as any);

      const request: AIGenerationRequest = {
        prompt: "Create a header with content",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aimlCodeGen.create(request);

      expect(result.components).toHaveLength(1);
      expect(result.components[0].type).toBe("container");
      expect(result.components[0].children).toHaveLength(2);
      expect(result.components[0].children?.[0].type).toBe("text");
      expect(result.components[0].children?.[1].type).toBe("text");
    });

    it("should handle invalid AI response", async () => {
      const mockResponse = {
        // Missing required fields
        components: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
        }),
      } as any);

      const request: AIGenerationRequest = {
        prompt: "Create a button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await aimlCodeGen.create(request);

      expect(result.components).toHaveLength(0);
      expect(result.code).toContain("GeneratedArtifact");
    });
  });
});
