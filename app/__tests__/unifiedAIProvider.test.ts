import { jest } from "@jest/globals";

import { AIProvider, UnifiedAIProvider } from "../lib/aiProvider";
import { AIGenerationRequest } from "../types/artifact";

// Mock fetch globally with proper typing
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock the individual providers
jest.mock("../lib/aiCodeGen", () => ({
  aiCodeGen: {
    create: jest.fn(),
  },
}));

jest.mock("../lib/aimlProvider", () => ({
  aimlCodeGen: {
    create: jest.fn(),
  },
}));

jest.mock("../lib/openRouterProvider", () => ({
  openRouterCodeGen: {
    create: jest.fn(),
  },
}));

describe("UnifiedAIProvider", () => {
  let unifiedProvider: UnifiedAIProvider;
  let mockAiCodeGen: any;
  let mockAimlCodeGen: any;
  let _mockOpenRouterCodeGen: any;

  beforeEach(() => {
    unifiedProvider = new UnifiedAIProvider();

    // Reset environment variables
    delete process.env.OPENAI_API_KEY;
    delete process.env.AIML_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    // Get mocked modules
    mockAiCodeGen = (jest.requireMock("../lib/aiCodeGen") as any).aiCodeGen;
    mockAimlCodeGen = (jest.requireMock("../lib/aimlProvider") as any)
      .aimlCodeGen;
    mockOpenRouterCodeGen = (
      jest.requireMock("../lib/openRouterProvider") as any
    ).openRouterCodeGen;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("Provider Detection", () => {
    it("should return only OpenAI when only OPENAI_API_KEY is set", () => {
      process.env.OPENAI_API_KEY = "test-key";

      const providers = unifiedProvider.getAvailableProviders();

      expect(providers).toEqual(["openai"]);
    });

    it("should return only AIML when only AIML_API_KEY is set", () => {
      process.env.AIML_API_KEY = "test-key";

      const providers = unifiedProvider.getAvailableProviders();

      expect(providers).toEqual(["openai", "aiml"]);
    });

    it("should return both providers when both keys are set", () => {
      process.env.OPENAI_API_KEY = "test-key";
      process.env.AIML_API_KEY = "test-key";

      const providers = unifiedProvider.getAvailableProviders();

      expect(providers).toEqual(["openai", "aiml"]);
    });

    it("should return only OpenAI when no keys are set", () => {
      const providers = unifiedProvider.getAvailableProviders();

      expect(providers).toEqual(["openai"]);
    });
  });

  describe("Provider Information", () => {
    it("should return correct info for OpenAI provider", () => {
      const info = unifiedProvider.getProviderInfo("openai");

      expect(info).toEqual({
        name: "OpenAI",
        model: "GPT-4 Turbo",
        description: "Standard OpenAI provider with GPT-4 Turbo model",
      });
    });

    it("should return correct info for AIML provider", () => {
      const info = unifiedProvider.getProviderInfo("aiml");

      expect(info).toEqual({
        name: "AIML API",
        model: "GPT-5",
        description:
          "Advanced AI provider with GPT-5 model for enhanced component generation",
      });
    });
  });

  describe("Provider Availability", () => {
    it("should return true for OpenAI when key is set", () => {
      process.env.OPENAI_API_KEY = "test-key";

      expect(unifiedProvider.isProviderAvailable("openai")).toBe(true);
    });

    it("should return false for OpenAI when key is not set", () => {
      expect(unifiedProvider.isProviderAvailable("openai")).toBe(false);
    });

    it("should return true for AIML when key is set", () => {
      process.env.AIML_API_KEY = "test-key";

      expect(unifiedProvider.isProviderAvailable("aiml")).toBe(true);
    });

    it("should return false for AIML when key is not set", () => {
      expect(unifiedProvider.isProviderAvailable("aiml")).toBe(false);
    });
  });

  describe("Component Generation", () => {
    const mockRequest: AIGenerationRequest = {
      prompt: "Create a button",
      framework: "react",
      styling: "tailwindcss",
      interactivity: "low",
      theme: "default",
    };

    const mockResult = {
      code: "import React from 'react';",
      components: [{ id: "btn1", type: "button" }],
    };

    beforeEach(() => {
      process.env.OPENAI_API_KEY = "test-key";
      process.env.AIML_API_KEY = "test-key";
    });

    it("should use OpenAI provider by default", async () => {
      mockAiCodeGen.create.mockResolvedValue(mockResult);

      const result = await unifiedProvider.create(mockRequest);

      expect(mockAiCodeGen.create).toHaveBeenCalledWith(mockRequest);
      expect(mockAimlCodeGen.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it("should use OpenAI provider when explicitly specified", async () => {
      mockAiCodeGen.create.mockResolvedValue(mockResult);

      const result = await unifiedProvider.create(mockRequest, {
        provider: "openai",
      });

      expect(mockAiCodeGen.create).toHaveBeenCalledWith(mockRequest);
      expect(mockAimlCodeGen.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it("should use AIML provider when specified", async () => {
      mockAimlCodeGen.create.mockResolvedValue(mockResult);

      const result = await unifiedProvider.create(mockRequest, {
        provider: "aiml",
      });

      expect(mockAimlCodeGen.create).toHaveBeenCalledWith(mockRequest);
      expect(mockAiCodeGen.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it("should fallback to OpenAI when AIML fails", async () => {
      mockAimlCodeGen.create.mockRejectedValue(new Error("AIML API error"));
      mockAiCodeGen.create.mockResolvedValue(mockResult);

      const result = await unifiedProvider.create(mockRequest, {
        provider: "aiml",
      });

      expect(mockAimlCodeGen.create).toHaveBeenCalledWith(mockRequest);
      expect(mockAiCodeGen.create).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResult);
    });

    it("should throw error when OpenAI fails and no fallback is available", async () => {
      mockAiCodeGen.create.mockRejectedValue(new Error("OpenAI API error"));

      await expect(unifiedProvider.create(mockRequest)).rejects.toThrow(
        "OpenAI API error"
      );
    });

    it("should throw error when AIML fails and OpenAI is not available", async () => {
      delete process.env.OPENAI_API_KEY;
      mockAimlCodeGen.create.mockRejectedValue(new Error("AIML API error"));

      await expect(
        unifiedProvider.create(mockRequest, { provider: "aiml" })
      ).rejects.toThrow("AIML API error");
    });
  });

  describe("Component Generation with Fallback Info", () => {
    const mockRequest: AIGenerationRequest = {
      prompt: "Create a button",
      framework: "react",
      styling: "tailwindcss",
      interactivity: "low",
      theme: "default",
    };

    const mockResult = {
      code: "import React from 'react';",
      components: [{ id: "btn1", type: "button" }],
    };

    beforeEach(() => {
      process.env.OPENAI_API_KEY = "test-key";
      process.env.AIML_API_KEY = "test-key";
    });

    it("should return provider info with OpenAI result", async () => {
      mockAiCodeGen.create.mockResolvedValue(mockResult);

      const result = await unifiedProvider.createWithFallback(mockRequest, {
        provider: "openai",
      });

      expect(result).toEqual({
        ...mockResult,
        provider: "openai",
      });
    });

    it("should return provider info with AIML result", async () => {
      mockAimlCodeGen.create.mockResolvedValue(mockResult);

      const result = await unifiedProvider.createWithFallback(mockRequest, {
        provider: "aiml",
      });

      expect(result).toEqual({
        ...mockResult,
        provider: "aiml",
      });
    });

    it("should return fallback provider info when AIML fails", async () => {
      mockAimlCodeGen.create.mockRejectedValue(new Error("AIML API error"));
      mockAiCodeGen.create.mockResolvedValue(mockResult);

      const result = await unifiedProvider.createWithFallback(mockRequest, {
        provider: "aiml",
      });

      expect(result).toEqual({
        ...mockResult,
        provider: "openai",
      });
    });
  });

  describe("Configuration", () => {
    const mockRequest: AIGenerationRequest = {
      prompt: "Create a button",
      framework: "react",
      styling: "tailwindcss",
      interactivity: "low",
      theme: "default",
    };

    it("should use default configuration when none provided", async () => {
      process.env.OPENAI_API_KEY = "test-key";
      mockAiCodeGen.create.mockResolvedValue({ code: "", components: [] });

      await unifiedProvider.create(mockRequest);

      expect(mockAiCodeGen.create).toHaveBeenCalledWith(mockRequest);
    });

    it("should merge custom configuration with defaults", async () => {
      process.env.OPENAI_API_KEY = "test-key";
      mockAiCodeGen.create.mockResolvedValue({ code: "", components: [] });

      const customConfig = {
        provider: "openai" as AIProvider,
        temperature: 0.9,
        maxTokens: 2000,
      };

      await unifiedProvider.create(mockRequest, customConfig);

      expect(mockAiCodeGen.create).toHaveBeenCalledWith(mockRequest);
    });
  });
});
