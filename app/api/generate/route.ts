import { NextRequest, NextResponse } from "next/server";

import { aiCodeGen as openAiCodeGen } from "../../lib/aiCodeGen";
import { aimlCodeGen } from "../../lib/aimlProvider";
import { debug } from "../../lib/debug";
import {
  InputValidator,
  RateLimiter,
} from "../../lib/security";
import { StreamHandlerApi } from "../../utils/stream-handler";

export async function POST(request: NextRequest) {
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

    // Session validation - disabled for development
    // let _userId: string | undefined;

    // Temporarily disabled authentication for development
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
    //     _userId = sessionValidation.userId;
    //   }
    // }

    // Parse and validate request body
    const body = await request.json();
    const { aiRequest, config } = body;

    // Validate and sanitize input
    try {
      aiRequest.prompt = InputValidator.validatePrompt(aiRequest.prompt);
      aiRequest.framework = InputValidator.validateFramework(
        aiRequest.framework
      );
      aiRequest.styling = InputValidator.validateStyling(aiRequest.styling);
      aiRequest.interactivity = InputValidator.validateInteractivity(
        aiRequest.interactivity
      );
      aiRequest.theme = InputValidator.validateTheme(aiRequest.theme);
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details:
            error instanceof Error ? error.message : "Unknown validation error",
        },
        { status: 400 }
      );
    }

    const { provider, model } = config || {};

    // For OpenRouter, we need to handle streaming
    if (provider === "openrouter") {
      // Make the OpenRouter API call
      const OPENROUTER_API_URL =
        process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1";
      const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

      if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.trim() === "") {
        throw new Error(
          "OPENROUTER_API_KEY environment variable is not set or is empty."
        );
      }

      const systemPrompt = `
Be the more concise.

You are an expert web developer specializing in creating component trees from user prompts.
Your task is to generate a JSON object representing the component structure based on the user's request.
The JSON object must have three top-level keys: "components", "layout", and "componentDetails".

1.  **components**: An array defining the high-level structure.
2.  **layout**: An object defining styles and children for each component ID. The root container must have an ID of "root".
3.  **componentDetails**: An object providing the specific props for each component ID (e.g., text content, image src).

**Component Types and Examples:**

*   **container**: A flexible layout element. Use it for grouping other components.
    *   { "type": "container", "id": "root", "children": ["header", "content"] }
*   **text**: For displaying static text.
    *   { "type": "text", "content": "Hello, World!", "props": { "className": "text-xl" } }
*   **button**: An interactive button.
    *   { "type": "button", "content": "Click Me", "props": { "className": "btn-primary" } }
*   **input**: A text input field.
    *   { "type": "input", "props": { "placeholder": "Enter your name" } }
*   **image**: For displaying images.
    *   { "type": "image", "props": { "src": "/placeholder.png", "alt": "Placeholder" } }
*   **slider**: A range input for interactive values.
    *   { "type": "input", "props": { "type": "range", "min": "0", "max": "100", "value": "50", "className": "w-full" } }
*   **calculator**: A component with state and logic for calculations.
    *   { "type": "calculator", "id": "my-calculator" }
*   **quiz**: A component with questions, answers, and scoring.
    *   { "type": "quiz", "id": "tech-quiz", "props": { "questions": [...] } }
*   **chart**: For data visualization.
    *   { "type": "chart", "id": "sales-chart", "props": { "chartType": "bar", "data": {...} } }

**IMPORTANT**: When creating interactive components like calculators, loan calculators, or any component with sliders, you MUST break them down into individual interactive elements:
- Use "input" with type="range" for sliders
- Use "text" for labels and results
- Use "button" for actions
- Use "container" to group related elements

**Styling:**
*   Use the "styles" property in the "layout" object for CSS styles.
*   For frameworks like TailwindCSS, use the "className" property in "props".

Here is an example of the required JSON structure for a "loan calculator with sliders" prompt:
{
  "components": [
    { "type": "container", "id": "root", "children": ["loan-amount-slider", "interest-rate-slider", "loan-term-slider", "monthly-payment", "total-cost"] }
  ],
  "layout": {
    "root": {
      "styles": { "padding": "2rem", "backgroundColor": "#f9fafb", "borderRadius": "12px", "maxWidth": "500px", "margin": "0 auto" }
    }
  },
  "componentDetails": {
    "loan-amount-slider": { 
      "type": "input", 
      "props": { 
        "type": "range", 
        "min": "1000", 
        "max": "100000", 
        "value": "50000", 
        "className": "w-full mb-4",
        "placeholder": "Loan Amount"
      } 
    },
    "interest-rate-slider": { 
      "type": "input", 
      "props": { 
        "type": "range", 
        "min": "1", 
        "max": "20", 
        "value": "5", 
        "className": "w-full mb-4",
        "placeholder": "Interest Rate (%)"
      } 
    },
    "loan-term-slider": { 
      "type": "input", 
      "props": { 
        "type": "range", 
        "min": "1", 
        "max": "30", 
        "value": "15", 
        "className": "w-full mb-4",
        "placeholder": "Loan Term (years)"
      } 
    },
    "monthly-payment": { 
      "type": "text", 
      "content": "Monthly Payment: $0", 
      "props": { "className": "text-lg font-bold text-center mb-2" } 
    },
    "total-cost": { 
      "type": "text", 
      "content": "Total Cost: $0", 
      "props": { "className": "text-md text-center" } 
    }
  }
}
`;

      const userPrompt = `
Generate a component tree for the following request:
- Prompt: "${aiRequest.prompt}"
- Framework: "${aiRequest.framework}"
- Styling: "${aiRequest.styling}"
- Theme: "${aiRequest.theme}"
`;

      const openRouterRequest = {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000,
        stream: true, // Enable streaming
      };

      const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Artifact Studio",
        },
        body: JSON.stringify(openRouterRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorText}`
        );
      }

      // Use your existing StreamHandlerApi
      const streamResponse =
        await StreamHandlerApi.handleStreamResponse(response);
      return new Response(streamResponse, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // For other providers, use the existing approach
    let result;
    debug.log("Generating component tree with provider:", provider);

    switch (provider) {
      case "aiml":
        try {
          result = await aimlCodeGen.create(aiRequest, model);
        } catch (error) {
          debug.log("Error in generate API:", error);
          return NextResponse.json(
            { error: "Failed to generate component tree" },
            { status: 500 }
          );
        }
        break;

      case "openai":
        try {
          result = await openAiCodeGen.create(aiRequest, model);
        } catch (error) {
          debug.log("Error in generate API:", error);
          return NextResponse.json(
            { error: "Failed to generate component tree" },
            { status: 500 }
          );
        }
        break;
    }

    return NextResponse.json(
      {
        success: true,
        ...result,
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
    console.error("Error in generate API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
