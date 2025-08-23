// services/openai-scraper.service.ts

// Simple logger replacement
const log = {
  info: (context: string, message: string) =>
    console.log(`[${context}] ${message}`),
  warn: (context: string, message: string) =>
    console.warn(`[${context}] ${message}`),
  error: (context: string, message: string) =>
    console.error(`[${context}] ${message}`),
};

interface ModelPricing {
  prompt: string;
  completion: string;
  request: string;
  image: string;
  web_search: string;
  internal_reasoning: string;
  training?: string; // Added for fine-tuning
  cost?: string; // Added for tools/embeddings/moderation
  cached_input?: string; // Added for GPT-5 models
}

interface ModelInfo {
  id: string;
  name: string;
  context_length: string; // Keep as string for simplicity
  pricing: ModelPricing;
  owned_by: string;
}

/**
 * OpenAI Models Data Service
 * Provides up-to-date information about OpenAI models
 * Last updated: August 2025 based on https://platform.openai.com/docs/pricing & https://platform.openai.com/docs/models
 */
export class OpenAIScraperService {
  /**
   * Get OpenAI models data
   * Returns hardcoded data since scraping is unreliable and resource-intensive
   */
  async scrapeModels(_maxRetries: number = 3): Promise<ModelInfo[]> {
    // Return pre-defined data instead of scraping
    log.info(
      "OPENAI_SCRAPER_SERVICE",
      "📊 Using pre-defined OpenAI models data"
    );
    return this.getOpenAIModels();
  }

  /**
   * Get current OpenAI models with pricing and specifications
   */
  private getOpenAIModels(): ModelInfo[] {
    const models = [
      // Text tokens - Latest models (GPT-5 series)
      {
        name: "gpt-5",
        context_length: "400000", // Actual context window
        pricing: {
          prompt: "1.25",
          completion: "10.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cached_input: "0.125",
        },
      },
      {
        name: "gpt-5-mini",
        context_length: "400000", // Actual context window
        pricing: {
          prompt: "0.25",
          completion: "2.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cached_input: "0.025",
        },
      },
      {
        name: "gpt-5-nano",
        context_length: "400000", // Actual context window
        pricing: {
          prompt: "0.05",
          completion: "0.40",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cached_input: "0.005",
        },
      },
      {
        name: "gpt-4.1",
        context_length: "128000", // Estimated from context window of similar models
        pricing: {
          prompt: "2.00",
          completion: "8.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-4.1-mini",
        context_length: "128000", // Estimated
        pricing: {
          prompt: "0.40",
          completion: "1.60",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-4.1-nano",
        context_length: "128000", // Estimated
        pricing: {
          prompt: "0.10",
          completion: "0.40",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-4.5-preview",
        context_length: "128000", // Estimated
        pricing: {
          prompt: "75.00",
          completion: "150.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-4o",
        context_length: "128000",
        pricing: {
          prompt: "2.50",
          completion: "10.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-4o-mini",
        context_length: "128000",
        pricing: {
          prompt: "0.15",
          completion: "0.60",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "o1",
        context_length: "4096", // Estimated
        pricing: {
          prompt: "15.00",
          completion: "60.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "o1-pro",
        context_length: "4096", // Estimated
        pricing: {
          prompt: "150.00",
          completion: "600.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "o3",
        context_length: "128000", // Estimated
        pricing: {
          prompt: "10.00",
          completion: "40.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "o4-mini",
        context_length: "128000", // Estimated
        pricing: {
          prompt: "1.10",
          completion: "4.40",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "o3-mini",
        context_length: "128000", // Estimated
        pricing: {
          prompt: "1.10",
          completion: "4.40",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "o1-mini",
        context_length: "4096", // Estimated
        pricing: {
          prompt: "1.10",
          completion: "4.40",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "codex-mini-latest",
        context_length: "8000", // Estimated
        pricing: {
          prompt: "1.50",
          completion: "6.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-4o-mini-search-preview",
        context_length: "128000", // Estimated
        pricing: {
          prompt: "0.15",
          completion: "0.60",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-4o-search-preview",
        context_length: "128000", // Estimated
        pricing: {
          prompt: "2.50",
          completion: "10.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "computer-use-preview",
        context_length: "128000", // Estimated
        pricing: {
          prompt: "3.00",
          completion: "12.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-image-1",
        context_length: "0", // Image model, context not applicable in same way
        pricing: {
          // Pricing per 1M tokens (input/cached input/output)
          prompt: "5.00",
          completion: "-", // Not applicable for output tokens
          request: "0",
          image: "-",
          web_search: "0",
          internal_reasoning: "0",
          cost: "Various based on quality/size", // Image output pricing is separate
        },
      },
      // Text tokens (Flex Processing)
      {
        name: "o3-flex",
        context_length: "128000", // Estimated
        pricing: {
          prompt: "5.00",
          completion: "20.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "o4-mini-flex",
        context_length: "128000", // Estimated
        pricing: {
          prompt: "0.55",
          completion: "2.20",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },

      // Audio tokens
      {
        name: "gpt-4o-audio-preview",
        context_length: "128000", // Estimated
        pricing: {
          // Pricing per 1M tokens
          prompt: "40.00", // Input audio tokens
          completion: "80.00", // Output audio tokens
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-4o-mini-audio-preview",
        context_length: "128000", // Estimated
        pricing: {
          // Pricing per 1M tokens
          prompt: "10.00", // Input audio tokens
          completion: "20.00", // Output audio tokens
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-4o-realtime-preview",
        context_length: "128000", // Estimated
        pricing: {
          // Pricing per 1M tokens
          prompt: "40.00", // Input audio tokens
          completion: "80.00", // Output audio tokens
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-4o-mini-realtime-preview",
        context_length: "128000", // Estimated
        pricing: {
          // Pricing per 1M tokens
          prompt: "10.00", // Input audio tokens
          completion: "20.00", // Output audio tokens
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },

      // Fine-tuning
      {
        name: "o4-mini-2025-04-16",
        context_length: "128000", // Estimated
        pricing: {
          // Pricing per 1M tokens (Input/Output) and Training (per hour)
          prompt: "4.00",
          completion: "16.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          training: "100.00 / hour",
        },
      },
      {
        name: "o4-mini-2025-04-16-data-sharing",
        context_length: "128000", // Estimated
        pricing: {
          // Pricing per 1M tokens (Input/Output) and Training (per hour)
          prompt: "2.00",
          completion: "8.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          training: "100.00 / hour",
        },
      },
      {
        name: "gpt-4.1-2025-04-14",
        context_length: "128000", // Estimated
        pricing: {
          // Pricing per 1M tokens (Input/Output) and Training (per hour)
          prompt: "3.00",
          completion: "12.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          training: "25.00",
        },
      },
      {
        name: "gpt-4.1-mini-2025-04-14",
        context_length: "128000", // Estimated
        pricing: {
          // Pricing per 1M tokens (Input/Output) and Training (per hour)
          prompt: "0.80",
          completion: "3.20",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          training: "5.00",
        },
      },
      {
        name: "gpt-4.1-nano-2025-04-14",
        context_length: "128000", // Estimated
        pricing: {
          // Pricing per 1M tokens (Input/Output) and Training (per hour)
          prompt: "0.20",
          completion: "0.80",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          training: "1.50",
        },
      },
      {
        name: "gpt-4o-2024-08-06",
        context_length: "128000", // Estimated
        pricing: {
          // Pricing per 1M tokens (Input/Output) and Training (per hour)
          prompt: "3.75",
          completion: "15.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          training: "25.00",
        },
      },
      {
        name: "gpt-4o-mini-2024-07-18",
        context_length: "128000", // Estimated
        pricing: {
          // Pricing per 1M tokens (Input/Output) and Training (per hour)
          prompt: "0.30",
          completion: "1.20",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          training: "3.00",
        },
      },
      {
        name: "gpt-3.5-turbo-0125",
        context_length: "16385", // Estimated
        pricing: {
          // Pricing per 1M tokens (Input/Output) and Training (per hour)
          prompt: "3.00",
          completion: "6.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          training: "8.00", // Estimated, not explicitly listed on page
        },
      },
      {
        name: "davinci-002",
        context_length: "4097", // Estimated
        pricing: {
          // Pricing per 1M tokens (Input/Output) and Training (per hour)
          prompt: "12.00",
          completion: "12.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          training: "6.00", // Estimated, not explicitly listed on page
        },
      },
      {
        name: "babbage-002",
        context_length: "4097", // Estimated
        pricing: {
          // Pricing per 1M tokens (Input/Output) and Training (per hour)
          prompt: "1.60",
          completion: "1.60",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          training: "0.40", // Estimated, not explicitly listed on page
        },
      },

      // Built-in tools
      {
        name: "code-interpreter",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "0.03 / container",
        },
      },
      {
        name: "file-search-storage",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "0.10 / GB/day (1GB free)",
        },
      },
      {
        name: "file-search-tool-call",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "2.50 / 1k calls",
        },
      },
      {
        name: "web-search-tool",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "Various based on model and context", // See Web Search section
        },
      },

      // Web Search - specific pricing per 1k calls
      {
        name: "web-search-gpt-4.1/gpt-4o/gpt-4o-search-preview-low",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "30.00 / 1k calls",
        },
      },
      {
        name: "web-search-gpt-4.1/gpt-4o/gpt-4o-search-preview-medium",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "35.00 / 1k calls",
        },
      },
      {
        name: "web-search-gpt-4.1/gpt-4o/gpt-4o-search-preview-high",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "50.00 / 1k calls",
        },
      },
      {
        name: "web-search-gpt-4.1-mini/gpt-4o-mini/gpt-4o-mini-search-preview-low",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "25.00 / 1k calls",
        },
      },
      {
        name: "web-search-gpt-4.1-mini/gpt-4o-mini/gpt-4o-mini-search-preview-medium",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "27.50 / 1k calls",
        },
      },
      {
        name: "web-search-gpt-4.1-mini/gpt-4o-mini/gpt-4o-mini-search-preview-high",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "30.00 / 1k calls",
        },
      },

      // Transcription and Speech Generation (Estimated cost per minute)
      {
        name: "gpt-4o-mini-tts",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0.60",
          completion: "-",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "0.015 / minute", // Estimated cost
        },
      },
      {
        name: "gpt-4o-transcribe",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "2.50",
          completion: "10.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "0.006 / minute", // Estimated cost
        },
      },
      {
        name: "gpt-4o-mini-transcribe",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "1.25",
          completion: "5.00",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "0.003 / minute", // Estimated cost
        },
      },
      {
        name: "whisper",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "0.006 / minute", // Estimated cost
        },
      },
      {
        name: "tts",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "15.00 / 1M characters",
        },
      },
      {
        name: "tts-hd",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "30.00 / 1M characters",
        },
      },

      // Image Generation (Pricing per image output)
      // Note: Input text/image tokens for gpt-image-1 are billed separately (see Text tokens section)
      {
        name: "gpt-image-1-low-1024x1024",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.011",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-image-1-low-1024x1536",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.016",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-image-1-low-1536x1024",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.016",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-image-1-medium-1024x1024",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.042",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-image-1-medium-1024x1536",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.063",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-image-1-medium-1536x1024",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.063",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-image-1-high-1024x1024",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.167",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-image-1-high-1024x1536",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.25",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "gpt-image-1-high-1536x1024",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.25",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "dall-e-3-standard-1024x1024",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.04",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "dall-e-3-standard-1024x1792",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.08",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "dall-e-3-standard-1792x1024",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.08",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "dall-e-3-hd-1024x1024",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.08",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "dall-e-3-hd-1024x1792",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.12",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "dall-e-3-hd-1792x1024",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.12",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "dall-e-2-standard-256x256",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.016",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "dall-e-2-standard-512x512",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.018",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "dall-e-2-standard-1024x1024",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0.02",
          web_search: "0",
          internal_reasoning: "0",
        },
      },

      // Embeddings (Pricing per 1M tokens)
      {
        name: "text-embedding-3-small",
        context_length: "8191", // Found from docs
        pricing: {
          prompt: "0.02",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "text-embedding-3-large",
        context_length: "8191", // Found from docs
        pricing: {
          prompt: "0.13",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },
      {
        name: "text-embedding-ada-002",
        context_length: "8191", // Found from docs
        pricing: {
          prompt: "0.10",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
        },
      },

      // Moderation (Free)
      {
        name: "omni-moderation-latest",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "Free",
        },
      },
      {
        name: "text-moderation-latest",
        context_length: "0", // Not applicable
        pricing: {
          prompt: "0",
          completion: "0",
          request: "0",
          image: "0",
          web_search: "0",
          internal_reasoning: "0",
          cost: "Free",
        },
      },
    ];

    // Format models with proper IDs
    return models.map(model => ({
      ...model,
      id: `openai/${model.name}`,
      owned_by: "openai-official",
    }));
  }
}
