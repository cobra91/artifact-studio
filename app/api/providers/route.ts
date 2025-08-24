import { NextRequest, NextResponse } from "next/server";

import { RateLimiter } from "../../lib/security";
import { OpenAIScraperService } from "../../services/openai-scraper.service";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting check
    const clientId = RateLimiter.getClientId(request);
    const rateLimitResult = RateLimiter.checkRateLimit(clientId);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.retryAfter.toString(),
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    // Authentication disabled for /api/providers endpoint
    // This endpoint only returns public information about available AI providers
    // No sensitive data is exposed, authentication is not required
    
    // Session validation - disabled for this public endpoint
    // if (process.env.NODE_ENV === "production") {
    //   const sessionToken = request.cookies.get("session-token")?.value;
    //   const authHeader = request.headers.get("Authorization");

    //   if (!sessionToken && !authHeader) {
    //     return NextResponse.json(
    //       { error: "Authentication required" },
    //       { status: 401 }
    //     );
    //   }

    //   if (sessionToken) {
    //     const sessionValidation = SessionManager.validateSession(sessionToken);
    //     if (!sessionValidation.valid) {
    //       return NextResponse.json(
    //         { error: "Invalid session" },
    //         { status: 401 }
    //       );
    //     }
    //   }
    // }
    const providers = [];
    let openRouterModels = [];
    let aimlModels = [];
    let openaiModels: Array<{ id: string; name: string; description: string }> =
      [];

    // Add OpenRouter if API key is configured
    if (
      process.env.OPENROUTER_API_KEY &&
      process.env.OPENROUTER_API_KEY.trim() !== ""
    ) {
      providers.push("openrouter");

      // Get OpenRouter models
      try {
        const OPENROUTER_API_URL =
          process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1";
        const response = await fetch(`${OPENROUTER_API_URL}/models`, {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Artifact Studio",
          },
        });

        if (response.ok) {
          const data = await response.json();
          openRouterModels =
            data.data?.map((model: any) => ({
              id: model.id,
              name: model.name || model.id,
              description: model.description || `Model: ${model.id}`,
            })) || [];
        } else {
          // Fallback to default models
          openRouterModels = [
            {
              id: "anthropic/claude-3.5-sonnet",
              name: "Claude 3.5 Sonnet",
              description:
                "Anthropic's Claude 3.5 Sonnet model for advanced reasoning",
            },
            {
              id: "openai/gpt-4o",
              name: "GPT-4o",
              description: "OpenAI's GPT-4o model for general purpose tasks",
            },
            {
              id: "google/gemini-pro",
              name: "Gemini Pro",
              description:
                "Google's Gemini Pro model for creative and analytical tasks",
            },
            {
              id: "meta-llama/llama-3.1-8b-instruct",
              name: "Llama 3.1 8B",
              description: "Meta's Llama 3.1 8B instruction-tuned model",
            },
          ];
        }
      } catch (error) {
        console.warn("Error fetching OpenRouter models:", error);
        // Fallback to default models
        openRouterModels = [
          {
            id: "anthropic/claude-3.5-sonnet",
            name: "Claude 3.5 Sonnet",
            description:
              "Anthropic's Claude 3.5 Sonnet model for advanced reasoning",
          },
          {
            id: "openai/gpt-4o",
            name: "GPT-4o",
            description: "OpenAI's GPT-4o model for general purpose tasks",
          },
          {
            id: "google/gemini-pro",
            name: "Gemini Pro",
            description:
              "Google's Gemini Pro model for creative and analytical tasks",
          },
          {
            id: "meta-llama/llama-3.1-8b-instruct",
            name: "Llama 3.1 8B",
            description: "Meta's Llama 3.1 8B instruction-tuned model",
          },
        ];
      }
    }

    // Add OpenAI if API key is configured
    if (
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY.trim() !== ""
    ) {
      providers.push("openai");

      // Get OpenAI models using the scraper service
      try {
        const scraperService = new OpenAIScraperService();
        const openaiModelsData = await scraperService.scrapeModels();
        openaiModels = openaiModelsData
          .filter((model: any) => model.name.includes("gpt-5"))
          .map((model: any) => ({
            id: model.id,
            name: model.name,
            description: `OpenAI ${model.name} - ${model.context_length} tokens`,
          }));
      } catch (error) {
        console.warn("Error fetching OpenAI models:", error);
        // Fallback to default OpenAI models (only GPT-5)
        openaiModels = [
          {
            id: "openai/gpt-5",
            name: "GPT-5",
            description: "OpenAI GPT-5 - 400000 tokens",
          },
        ];
      }
    }

    // Add AIML if API key is configured
    if (process.env.AIML_API_KEY && process.env.AIML_API_KEY.trim() !== "") {
      providers.push("aiml");

      // Get AIML models
      try {
        const AIML_API_URL =
          process.env.AIML_API_URL || "https://api.aimlapi.com/v1";
        const model_url = AIML_API_URL.replace("/v1", "");
        const response = await fetch(`${model_url}/models`, {
          headers: {
            Authorization: `Bearer ${process.env.AIML_API_KEY}`,
            "Content-Type": "application/json",
            Connection: "close",
          },
        });

        if (response.ok) {
          const data = await response.json();
          aimlModels =
            data.data
              .filter((model: any) => model.id.includes("gpt-5"))
              .map((model: any) => ({
                id: model.id,
                name: model.name || model.id,
                description: model.description || `Model: ${model.id}`,
              })) || [];
        } else {
          // Fallback to default AIML models (only GPT-5)
          aimlModels = [
            {
              id: "gpt-5",
              name: "GPT-5",
              description:
                "Advanced AI model for enhanced component generation",
            },
          ];
        }
      } catch (error) {
        console.warn("Error fetching AIML models:", error);
        // Fallback to default AIML models (only GPT-5)
        aimlModels = [
          {
            id: "gpt-5",
            name: "GPT-5",
            description: "Advanced AI model for enhanced component generation",
          },
        ];
      }
    }

    return NextResponse.json(
      {
        providers,
        openRouterModels,
        aimlModels,
        openaiModels,
        rateLimit: {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
      },
      {
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        },
      }
    );
  } catch (error) {
    console.error("Error in providers API:", error);
    // Return empty arrays as fallback
    return NextResponse.json({
      providers: [],
      openRouterModels: [],
      aimlModels: [],
      openaiModels: [],
    });
  }
}
