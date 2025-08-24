import crypto from "crypto";
import { NextRequest } from "next/server";

// Security configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 10,

  // API key rotation
  API_KEY_ROTATION_DAYS: 30,

  // Session management
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours

  // Input validation
  MAX_INPUT_LENGTH: 10000,
  MAX_PROMPT_LENGTH: 2000,

  // Allowed file types for uploads
  ALLOWED_FILE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// API key management
export class APIKeyManager {
  private static instance: APIKeyManager;
  private apiKeys: Map<
    string,
    { key: string; expiresAt: number; permissions: string[] }
  > = new Map();

  static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager();
    }
    return APIKeyManager.instance;
  }

  generateAPIKey(permissions: string[] = ["read"]): string {
    const key = crypto.randomBytes(32).toString("hex");
    const expiresAt =
      Date.now() + SECURITY_CONFIG.API_KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000;

    this.apiKeys.set(key, {
      key,
      expiresAt,
      permissions,
    });

    return key;
  }

  validateAPIKey(key: string, requiredPermissions: string[] = []): boolean {
    const apiKey = this.apiKeys.get(key);

    if (!apiKey || apiKey.expiresAt < Date.now()) {
      return false;
    }

    if (requiredPermissions.length > 0) {
      return requiredPermissions.every(permission =>
        apiKey.permissions.includes(permission)
      );
    }

    return true;
  }

  revokeAPIKey(key: string): boolean {
    return this.apiKeys.delete(key);
  }

  getExpiringKeys(): string[] {
    const now = Date.now();
    const warningThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

    return Array.from(this.apiKeys.entries())
      .filter(([_, apiKey]) => apiKey.expiresAt - now < warningThreshold)
      .map(([key, _]) => key);
  }
}

// Input validation
export class InputValidator {
  static sanitizeString(
    input: string,
    maxLength: number = SECURITY_CONFIG.MAX_INPUT_LENGTH
  ): string {
    if (!input || typeof input !== "string") {
      throw new Error("Invalid input: must be a non-empty string");
    }

    if (input.length > maxLength) {
      throw new Error(
        `Input too long: maximum ${maxLength} characters allowed`
      );
    }

    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, "") // Remove < and > to prevent XSS
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .trim();
  }

  static validatePrompt(prompt: string): string {
    return this.sanitizeString(prompt, SECURITY_CONFIG.MAX_PROMPT_LENGTH);
  }

  static validateFramework(framework: string): "react" | "vue" | "svelte" {
    const validFrameworks = ["react", "vue", "svelte"];
    if (!validFrameworks.includes(framework)) {
      throw new Error(
        `Invalid framework: must be one of ${validFrameworks.join(", ")}`
      );
    }
    return framework as "react" | "vue" | "svelte";
  }

  static validateStyling(
    styling: string
  ): "tailwindcss" | "css" | "styled-components" {
    const validStyling = ["tailwindcss", "css", "styled-components"];
    if (!validStyling.includes(styling)) {
      throw new Error(
        `Invalid styling: must be one of ${validStyling.join(", ")}`
      );
    }
    return styling as "tailwindcss" | "css" | "styled-components";
  }

  static validateInteractivity(
    interactivity: string
  ): "low" | "medium" | "high" {
    const validInteractivity = ["low", "medium", "high"];
    if (!validInteractivity.includes(interactivity)) {
      throw new Error(
        `Invalid interactivity: must be one of ${validInteractivity.join(", ")}`
      );
    }
    return interactivity as "low" | "medium" | "high";
  }

  static validateTheme(theme: string): "default" | "modern" | "minimalist" {
    const validThemes = ["default", "modern", "minimalist"];
    if (!validThemes.includes(theme)) {
      throw new Error(
        `Invalid theme: must be one of ${validThemes.join(", ")}`
      );
    }
    return theme as "default" | "modern" | "minimalist";
  }

  static validateFileUpload(file: File): void {
    if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.type as any)) {
      throw new Error(`File type not allowed: ${file.type}`);
    }

    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      throw new Error(
        `File too large: maximum ${SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB allowed`
      );
    }
  }
}

// Rate limiting
export class RateLimiter {
  static checkRateLimit(clientId: string): {
    allowed: boolean;
    remaining: number;
    retryAfter: number;
    resetTime: number;
  } {
    const now = Date.now();
    const windowStart = now - (now % SECURITY_CONFIG.RATE_LIMIT_WINDOW);

    const current = rateLimitStore.get(clientId);

    if (!current || current.resetTime < now) {
      // First request or window expired
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: windowStart + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
      });

      return {
        allowed: true,
        remaining: SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS - 1,
        retryAfter: 0,
        resetTime: windowStart + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
      };
    }

    if (current.count >= SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
        resetTime: current.resetTime,
      };
    }

    // Increment count
    current.count++;
    rateLimitStore.set(clientId, current);

    return {
      allowed: true,
      remaining: SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS - current.count,
      retryAfter: 0,
      resetTime: current.resetTime,
    };
  }

  static getClientId(request: NextRequest): string {
    // Use IP address as client identifier
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    return ip;
  }
}

// Session management
export class SessionManager {
  private static readonly sessions = new Map<
    string,
    { userId: string; expiresAt: number; data: any }
  >();

  static createSession(userId: string, data: any = {}): string {
    const sessionId = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT;

    this.sessions.set(sessionId, {
      userId,
      expiresAt,
      data,
    });

    return sessionId;
  }

  static validateSession(sessionId: string): {
    valid: boolean;
    userId?: string;
    data?: any;
  } {
    const session = this.sessions.get(sessionId);

    if (!session || session.expiresAt < Date.now()) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: session.userId,
      data: session.data,
    };
  }

  static destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  static cleanupExpiredSessions(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

// Security utilities
export class SecurityUtils {
  static hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static maskSensitiveData(
    data: string,
    type: "email" | "phone" | "credit-card"
  ): string {
    switch (type) {
      case "email":
        const [local, domain] = data.split("@");
        return `${local.charAt(0)}***@${domain}`;

      case "phone":
        return data.replace(/(\d{3})\d{3}(\d{4})/, "$1***$2");

      case "credit-card":
        return data.replace(/\d(?=\d{4})/g, "*");

      default:
        return data;
    }
  }
}

// Cleanup expired sessions periodically
setInterval(() => {
  SessionManager.cleanupExpiredSessions();
}, 60 * 1000); // Run every minute
