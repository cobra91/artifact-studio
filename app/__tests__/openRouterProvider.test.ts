import { jest } from "@jest/globals";

import { OpenRouterCodeGenerator } from "../lib/openRouterProvider";
import { AIGenerationRequest } from "../types/artifact";

// Mock fetch globally with proper typing
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe("OpenRouterCodeGenerator", () => {
  let openRouterCodeGen: OpenRouterCodeGenerator;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    openRouterCodeGen = new OpenRouterCodeGenerator();
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    // Reset environment variables
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_URL;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Environment Configuration", () => {
    it("should throw error when OPENROUTER_API_KEY is not set", async () => {
      const request: AIGenerationRequest = {
        prompt: "Create a simple button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      await expect(openRouterCodeGen.create(request)).rejects.toThrow(
        "OPENROUTER_API_KEY environment variable is not set."
      );
    });

    it("should use default OpenRouter API URL when not configured", async () => {
      process.env.OPENROUTER_API_KEY = "test-api-key";

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

      const result = await openRouterCodeGen.create(request);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
            "HTTP-Referer": expect.any(String),
            "X-Title": "Artifact Studio",
          },
        })
      );

      expect(result).toHaveProperty("code");
      expect(result).toHaveProperty("components");
    });
  });

  describe("API Integration", () => {
    beforeEach(() => {
      process.env.OPENROUTER_API_KEY = "test-api-key";
    });

    it("should make correct API call to OpenRouter with default model", async () => {
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

      const result = await openRouterCodeGen.create(request);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
            "HTTP-Referer": expect.any(String),
            "X-Title": "Artifact Studio",
          },
          body: expect.stringContaining(
            '"model":"anthropic/claude-3.5-sonnet"'
          ),
        })
      );

      expect(result).toHaveProperty("code");
      expect(result).toHaveProperty("components");
    });

    it("should make correct API call with custom model", async () => {
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
        }),
      } as any);

      const request: AIGenerationRequest = {
        prompt: "Create a simple button",
        framework: "react",
        styling: "tailwindcss",
        interactivity: "low",
        theme: "default",
      };

      const result = await openRouterCodeGen.create(request, "openai/gpt-4o");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          body: expect.stringContaining('"model":"openai/gpt-4o"'),
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

      await expect(openRouterCodeGen.create(request)).rejects.toThrow(
        "OpenRouter API error: 401 - Unauthorized"
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

      await expect(openRouterCodeGen.create(request)).rejects.toThrow(
        "Empty response from OpenRouter API"
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

      await expect(openRouterCodeGen.create(request)).rejects.toThrow(
        "Failed to generate component tree from OpenRouter API."
      );
    });
  });

  describe("Model Management", () => {
    beforeEach(() => {
      process.env.OPENROUTER_API_KEY = "test-api-key";
    });

    it("should return default models when API is not available", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const models = await openRouterCodeGen.getAvailableModels();

      expect(models).toHaveLength(4);
      expect(models[0].id).toBe("anthropic/claude-3.5-sonnet");
      expect(models[1].id).toBe("openai/gpt-4o");
      expect(models[2].id).toBe("google/gemini-pro");
      expect(models[3].id).toBe("meta-llama/llama-3.1-8b-instruct");
    });

    it("should fetch models from OpenRouter API", async () => {
      const mockModelsResponse = {
        data: [
          {
            id: "anthropic/claude-3.5-sonnet",
            name: "Claude 3.5 Sonnet",
            description: "Anthropic's Claude 3.5 Sonnet model",
          },
          {
            id: "openai/gpt-4o",
            name: "GPT-4o",
            description: "OpenAI's GPT-4o model",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockModelsResponse,
      } as any);

      const models = await openRouterCodeGen.getAvailableModels();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/models",
        expect.objectContaining({
          headers: {
            Authorization: "Bearer test-api-key",
            "HTTP-Referer": expect.any(String),
            "X-Title": "Artifact Studio",
          },
        })
      );

      expect(models).toHaveLength(2);
      expect(models[0].id).toBe("anthropic/claude-3.5-sonnet");
      expect(models[0].name).toBe("Claude 3.5 Sonnet");
      expect(models[1].id).toBe("openai/gpt-4o");
      expect(models[1].name).toBe("GPT-4o");
    });

    it("should return default models when API returns error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as any);

      const models = await openRouterCodeGen.getAvailableModels();

      expect(models).toHaveLength(4);
      expect(models[0].id).toBe("anthropic/claude-3.5-sonnet");
    });

    it("should return empty array when no API key", async () => {
      delete process.env.OPENROUTER_API_KEY;

      const models = await openRouterCodeGen.getAvailableModels();

      expect(models).toHaveLength(0);
    });
  });

  describe("Code Generation", () => {
    beforeEach(() => {
      process.env.OPENROUTER_API_KEY = "test-api-key";
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

      const result = await openRouterCodeGen.create(request);

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

      const result = await openRouterCodeGen.create(request);

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

      const result = await openRouterCodeGen.create(request);

      expect(result.code).toContain("<script>");
      expect(result.code).toContain("import { onMount }");
      expect(result.code).toContain("<style>");
    });
  });

  describe("Component Tree Building", () => {
    beforeEach(() => {
      process.env.OPENROUTER_API_KEY = "test-api-key";
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

      const result = await openRouterCodeGen.create(request);

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

      const result = await openRouterCodeGen.create(request);

      expect(result.components).toHaveLength(0);
      expect(result.code).toContain("GeneratedArtifact");
    });
  });
});
