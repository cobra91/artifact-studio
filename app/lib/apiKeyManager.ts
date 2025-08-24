import crypto from "crypto";

// API Key configuration
export interface APIKeyConfig {
  key: string;
  provider: "openai" | "openrouter" | "aiml";
  permissions: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  expiresAt: number;
  lastUsed: number;
  usageCount: number;
}

// Usage tracking
interface UsageRecord {
  timestamp: number;
  endpoint: string;
  cost: number;
  tokens: number;
}

export class APIKeyManager {
  private static instance: APIKeyManager;
  private readonly apiKeys: Map<string, APIKeyConfig> = new Map();
  private readonly usageHistory: Map<string, UsageRecord[]> = new Map();
  private readonly rateLimitStore: Map<
    string,
    { count: number; resetTime: number }
  > = new Map();

  static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager();
    }
    return APIKeyManager.instance;
  }

  // Initialize API keys from environment variables
  initializeFromEnv(): void {
    // OpenAI
    if (
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY.trim() !== "" &&
      process.env.OPENAI_API_KEY !== "your_openai_api_key_here"
    ) {
      this.addAPIKey({
        key: process.env.OPENAI_API_KEY,
        provider: "openai",
        permissions: ["generate", "read"],
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerHour: 3500,
          requestsPerDay: 100000,
        },
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        lastUsed: 0,
        usageCount: 0,
      });
    }

    // OpenRouter
    if (
      process.env.OPENROUTER_API_KEY &&
      process.env.OPENROUTER_API_KEY.trim() !== "" &&
      process.env.OPENROUTER_API_KEY !== "your_openrouter_api_key_here"
    ) {
      this.addAPIKey({
        key: process.env.OPENROUTER_API_KEY,
        provider: "openrouter",
        permissions: ["generate", "read"],
        rateLimit: {
          requestsPerMinute: 100,
          requestsPerHour: 6000,
          requestsPerDay: 100000,
        },
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        lastUsed: 0,
        usageCount: 0,
      });
    }

    // AIML
    if (
      process.env.AIML_API_KEY &&
      process.env.AIML_API_KEY.trim() !== "" &&
      process.env.AIML_API_KEY !== "your_aiml_api_key_here"
    ) {
      this.addAPIKey({
        key: process.env.AIML_API_KEY,
        provider: "aiml",
        permissions: ["generate", "read"],
        rateLimit: {
          requestsPerMinute: 50,
          requestsPerHour: 3000,
          requestsPerDay: 50000,
        },
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        lastUsed: 0,
        usageCount: 0,
      });
    }
  }

  // Add a new API key
  addAPIKey(config: APIKeyConfig): void {
    this.apiKeys.set(config.key, config);
    this.usageHistory.set(config.key, []);
  }

  // Get API key for a specific provider
  getAPIKey(provider: "openai" | "openrouter" | "aiml"): string | null {
    for (const [key, config] of this.apiKeys.entries()) {
      if (config.provider === provider && this.isValidAPIKey(key)) {
        return key;
      }
    }
    return null;
  }

  // Check if API key is valid
  isValidAPIKey(key: string): boolean {
    const config = this.apiKeys.get(key);
    if (!config) return false;

    // Check expiration
    if (config.expiresAt < Date.now()) {
      this.removeAPIKey(key);
      return false;
    }

    return true;
  }

  // Check rate limits for an API key
  checkRateLimit(
    key: string,
    window: "minute" | "hour" | "day" = "minute"
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const config = this.apiKeys.get(key);
    if (!config) {
      return { allowed: false, remaining: 0, resetTime: 0 };
    }

    const now = Date.now();
    const windowMs =
      window === "minute"
        ? 60 * 1000
        : window === "hour"
          ? 60 * 60 * 1000
          : 24 * 60 * 60 * 1000;
    const maxRequests =
      config.rateLimit[
        `requestsPer${window.charAt(0).toUpperCase() + window.slice(1)}` as keyof typeof config.rateLimit
      ];

    const windowStart = now - (now % windowMs);
    const rateLimitKey = `${key}:${window}:${windowStart}`;

    const current = this.rateLimitStore.get(rateLimitKey);

    if (!current || current.resetTime < now) {
      // First request or window expired
      this.rateLimitStore.set(rateLimitKey, {
        count: 1,
        resetTime: windowStart + windowMs,
      });

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: windowStart + windowMs,
      };
    }

    if (current.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }

    // Increment count
    current.count++;
    this.rateLimitStore.set(rateLimitKey, current);

    return {
      allowed: true,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime,
    };
  }

  // Record API usage
  recordUsage(
    key: string,
    endpoint: string,
    cost: number = 0,
    tokens: number = 0
  ): void {
    const config = this.apiKeys.get(key);
    if (!config) return;

    // Update usage count and last used time
    config.usageCount++;
    config.lastUsed = Date.now();

    // Record usage history
    const usage: UsageRecord = {
      timestamp: Date.now(),
      endpoint,
      cost,
      tokens,
    };

    const history = this.usageHistory.get(key) || [];
    history.push(usage);

    // Keep only last 1000 records
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }

    this.usageHistory.set(key, history);
  }

  // Get usage statistics
  getUsageStats(
    key: string,
    period: "day" | "week" | "month" = "day"
  ): {
    totalRequests: number;
    totalCost: number;
    totalTokens: number;
    averageCost: number;
    averageTokens: number;
  } {
    const history = this.usageHistory.get(key) || [];
    const now = Date.now();
    const periodMs =
      period === "day"
        ? 24 * 60 * 60 * 1000
        : period === "week"
          ? 7 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;

    const recentHistory = history.filter(
      record => record.timestamp > now - periodMs
    );

    const totalRequests = recentHistory.length;
    const totalCost = recentHistory.reduce(
      (sum, record) => sum + record.cost,
      0
    );
    const totalTokens = recentHistory.reduce(
      (sum, record) => sum + record.tokens,
      0
    );

    return {
      totalRequests,
      totalCost,
      totalTokens,
      averageCost: totalRequests > 0 ? totalCost / totalRequests : 0,
      averageTokens: totalRequests > 0 ? totalTokens / totalRequests : 0,
    };
  }

  // Get all API keys with their status
  getAllAPIKeys(): Array<
    APIKeyConfig & { status: "active" | "expired" | "rate_limited" }
  > {
    const result: Array<
      APIKeyConfig & { status: "active" | "expired" | "rate_limited" }
    > = [];

    for (const [key, config] of this.apiKeys.entries()) {
      let status: "active" | "expired" | "rate_limited" = "active";

      if (config.expiresAt < Date.now()) {
        status = "expired";
      } else {
        const rateLimit = this.checkRateLimit(key, "minute");
        if (!rateLimit.allowed) {
          status = "rate_limited";
        }
      }

      result.push({ ...config, status });
    }

    return result;
  }

  // Remove API key
  removeAPIKey(key: string): boolean {
    const removed = this.apiKeys.delete(key);
    this.usageHistory.delete(key);
    return removed;
  }

  // Rotate API key (generate new key and invalidate old one)
  rotateAPIKey(oldKey: string): string | null {
    const config = this.apiKeys.get(oldKey);
    if (!config) return null;

    // Generate new key
    const newKey = crypto.randomBytes(32).toString("hex");

    // Create new config with same settings but new key
    const newConfig: APIKeyConfig = {
      ...config,
      key: newKey,
      lastUsed: 0,
      usageCount: 0,
    };

    // Add new key and remove old one
    this.addAPIKey(newConfig);
    this.removeAPIKey(oldKey);

    return newKey;
  }

  // Get expiring keys (expire within 7 days)
  getExpiringKeys(): string[] {
    const now = Date.now();
    const warningThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

    return Array.from(this.apiKeys.entries())
      .filter(([_, config]) => config.expiresAt - now < warningThreshold)
      .map(([key, _]) => key);
  }

  // Cleanup expired rate limit records
  cleanupExpiredRateLimits(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, record] of this.rateLimitStore.entries()) {
      if (record.resetTime < now) {
        this.rateLimitStore.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

// Initialize the API key manager
const apiKeyManager = APIKeyManager.getInstance();
apiKeyManager.initializeFromEnv();

// Cleanup expired rate limits every hour
setInterval(
  () => {
    apiKeyManager.cleanupExpiredRateLimits();
  },
  60 * 60 * 1000
); // 1 hour

export { apiKeyManager };
