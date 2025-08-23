import { AIGenerationRequest, ComponentNode } from "../types/artifact";
import { aiCodeGen } from "./aiCodeGen";
import { aimlCodeGen } from "./aimlProvider";
import { openRouterCodeGen } from "./openRouterProvider";

export type AIProvider = "openai" | "aiml" | "openrouter";

export interface AIProviderConfig {
  provider: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class UnifiedAIProvider {
  private readonly defaultConfig: AIProviderConfig = {
    provider: "openrouter" as AIProvider,
    temperature: 0.7,
    maxTokens: 4000,
  };

  async create(
    request: AIGenerationRequest,
    config?: AIProviderConfig & { availableProviders?: AIProvider[] }
  ): Promise<{ code: string; components: ComponentNode[] }> {
    // Use provided available providers or fallback to checking environment variables
    const availableProviders =
      config?.availableProviders || this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw new Error(
        "No AI providers are configured. Please set at least one API key (OPENAI_API_KEY, AIML_API_KEY, or OPENROUTER_API_KEY)."
      );
    }

    // Use the first available provider as default if the requested one is not available
    const finalConfig = {
      ...this.defaultConfig,
      provider: availableProviders[0],
      ...config,
    };

    try {
      switch (finalConfig.provider) {
        case "aiml":
          console.log("Using AIML provider...");
          return await aimlCodeGen.create(request, finalConfig.model);

        case "openrouter":
          console.log("Using OpenRouter provider...");
          return await openRouterCodeGen.create(request, finalConfig.model);

        case "openai":
        default:
          console.log("Using OpenAI provider...");
          return await aiCodeGen.create(request, finalConfig.model);
      }
    } catch (error) {
      console.error(`Error with ${finalConfig.provider} provider:`, error);

      // Try other available providers as fallback
      const otherProviders = availableProviders.filter(
        p => p !== finalConfig.provider
      );

      for (const fallbackProvider of otherProviders) {
        try {
          console.log(`Falling back to ${fallbackProvider} provider...`);
          switch (fallbackProvider) {
            case "aiml":
              return await aimlCodeGen.create(request, finalConfig.model);
            case "openrouter":
              return await openRouterCodeGen.create(request, finalConfig.model);
            case "openai":
              return await aiCodeGen.create(request, finalConfig.model);
          }
        } catch (fallbackError) {
          console.error(
            `Error with ${fallbackProvider} fallback provider:`,
            fallbackError
          );
        }
      }

      throw error;
    }
  }

  async createWithFallback(
    request: AIGenerationRequest,
    config?: AIProviderConfig
  ): Promise<{
    code: string;
    components: ComponentNode[];
    provider: AIProvider;
  }> {
    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw new Error(
        "No AI providers are configured. Please set at least one API key (OPENAI_API_KEY, AIML_API_KEY, or OPENROUTER_API_KEY)."
      );
    }

    const finalConfig = {
      ...this.defaultConfig,
      provider: availableProviders[0],
      ...config,
    };

    try {
      switch (finalConfig.provider) {
        case "aiml":
          console.log("Using AIML provider...");
          const aimlResult = await aimlCodeGen.create(
            request,
            finalConfig.model
          );
          return { ...aimlResult, provider: "aiml" };

        case "openrouter":
          console.log("Using OpenRouter provider...");
          const openRouterResult = await openRouterCodeGen.create(
            request,
            finalConfig.model
          );
          return { ...openRouterResult, provider: "openrouter" };

        case "openai":
        default:
          console.log("Using OpenAI provider...");
          const openaiResult = await aiCodeGen.create(
            request,
            finalConfig.model
          );
          return { ...openaiResult, provider: "openai" };
      }
    } catch (error) {
      console.error(`Error with ${finalConfig.provider} provider:`, error);

      // Try other available providers as fallback
      const otherProviders = availableProviders.filter(
        p => p !== finalConfig.provider
      );

      for (const fallbackProvider of otherProviders) {
        try {
          console.log(`Falling back to ${fallbackProvider} provider...`);
          switch (fallbackProvider) {
            case "aiml":
              const aimlFallbackResult = await aimlCodeGen.create(
                request,
                finalConfig.model
              );
              return { ...aimlFallbackResult, provider: "aiml" };
            case "openrouter":
              const openRouterFallbackResult = await openRouterCodeGen.create(
                request,
                finalConfig.model
              );
              return { ...openRouterFallbackResult, provider: "openrouter" };
            case "openai":
              const openaiFallbackResult = await aiCodeGen.create(
                request,
                finalConfig.model
              );
              return { ...openaiFallbackResult, provider: "openai" };
          }
        } catch (fallbackError) {
          console.error(
            `Error with ${fallbackProvider} fallback provider:`,
            fallbackError
          );
        }
      }

      throw error;
    }
  }

  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];

    // Add OpenRouter first (preferred provider)
    if (
      process.env.OPENROUTER_API_KEY &&
      process.env.OPENROUTER_API_KEY.trim() !== ""
    ) {
      providers.push("openrouter");
    }

    // Add AIML if API key is configured and not empty
    if (process.env.AIML_API_KEY && process.env.AIML_API_KEY.trim() !== "") {
      providers.push("aiml");
    }

    // Add OpenAI if API key is configured (including "empty" for testing)
    if (
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY.trim() !== ""
    ) {
      providers.push("openai");
    }

    return providers;
  }

  getProviderInfo(provider: AIProvider): {
    name: string;
    model: string;
    description: string;
  } {
    switch (provider) {
      case "aiml":
        return {
          name: "AIML API",
          model: "GPT-5",
          description:
            "Advanced AI provider with GPT-5 model for enhanced component generation",
        };
      case "openrouter":
        return {
          name: "OpenRouter",
          model: "Multiple Models",
          description:
            "Access to multiple AI models including Claude, GPT-4o, Gemini, and more",
        };
      case "openai":
      default:
        return {
          name: "OpenAI",
          model: "GPT-4 Turbo",
          description: "Standard OpenAI provider with GPT-4 Turbo model",
        };
    }
  }

  isProviderAvailable(provider: AIProvider): boolean {
    switch (provider) {
      case "aiml":
        return !!(
          process.env.AIML_API_KEY && process.env.AIML_API_KEY.trim() !== ""
        );
      case "openrouter":
        return !!(
          process.env.OPENROUTER_API_KEY &&
          process.env.OPENROUTER_API_KEY.trim() !== ""
        );
      case "openai":
        return !!(
          process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== ""
        );
      default:
        return false;
    }
  }
}

export const unifiedAIProvider = new UnifiedAIProvider();
