import { NextRequest, NextResponse } from "next/server";

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW || 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = process.env.RATE_LIMIT_MAX_REQUESTS || 10; // 10 requests per minute

// API keys validation
const VALID_API_KEYS = new Set(
  [process.env.INTERNAL_API_KEY, process.env.WEBHOOK_SECRET].filter(Boolean)
);

// CORS configuration
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  "https://artifact-studio.vercel.app",
];

// Protected API routes that require authentication
const PROTECTED_ROUTES = ["/api/generate", "/api/deploy"];
// Note: /api/providers removed - endpoint only returns public information about AI providers

// Routes that require API key authentication
const API_KEY_ROUTES = ["/api/webhooks", "/api/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS
  const origin = request.headers.get("origin");
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin || "");

  // Create response headers
  const responseHeaders = new Headers();

  if (isAllowedOrigin) {
    responseHeaders.set("Access-Control-Allow-Origin", origin!);
  }
  responseHeaders.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  responseHeaders.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key"
  );
  responseHeaders.set("Access-Control-Max-Age", "86400");

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: responseHeaders,
    });
  }

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const clientId = getClientId(request);
    const rateLimitResult = await checkRateLimit(clientId);

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
            "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
            ...Object.fromEntries(responseHeaders.entries()),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    responseHeaders.set(
      "X-RateLimit-Limit",
      RATE_LIMIT_MAX_REQUESTS.toString()
    );
    responseHeaders.set(
      "X-RateLimit-Remaining",
      rateLimitResult.remaining.toString()
    );
    responseHeaders.set(
      "X-RateLimit-Reset",
      rateLimitResult.resetTime.toString()
    );
  }

  // API key authentication for specific routes
  if (API_KEY_ROUTES.some(route => pathname.startsWith(route))) {
    const apiKey =
      request.headers.get("X-API-Key") ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!apiKey || !VALID_API_KEYS.has(apiKey)) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401, headers: responseHeaders }
      );
    }
  }

  // Session-based authentication for protected routes
  // Temporarily disabled for development - enable in production
  if (
    process.env.NODE_ENV === "production" &&
    PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  ) {
    const sessionToken = request.cookies.get("session-token")?.value;
    const authHeader = request.headers.get("Authorization");

    // Check for session token or Bearer token
    if (!sessionToken && !authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: responseHeaders }
      );
    }

    // Validate session (implement your session validation logic here)
    if (sessionToken && !(await validateSession(sessionToken))) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401, headers: responseHeaders }
      );
    }

    // Validate Bearer token (implement your token validation logic here)
    if (authHeader && !(await validateBearerToken(authHeader))) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401, headers: responseHeaders }
      );
    }
  }

  // Security headers
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set("X-Frame-Options", "DENY");
  responseHeaders.set("X-XSS-Protection", "1; mode=block");
  responseHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  responseHeaders.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Continue with the request
  const response = NextResponse.next();

  // Add security headers to the response
  Object.entries(responseHeaders.entries()).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Helper functions
function getClientId(request: NextRequest): string {
  // Use IP address as client identifier (in production, consider using user ID)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}

async function checkRateLimit(clientId: string): Promise<{
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  resetTime: number;
}> {
  const now = Date.now();
  const windowStart = now - (now % RATE_LIMIT_WINDOW);

  const current = rateLimitStore.get(clientId);

  if (!current || current.resetTime < now) {
    // First request or window expired
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: windowStart + RATE_LIMIT_WINDOW,
    });

    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      retryAfter: 0,
      resetTime: windowStart + RATE_LIMIT_WINDOW,
    };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
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
    remaining: RATE_LIMIT_MAX_REQUESTS - current.count,
    retryAfter: 0,
    resetTime: current.resetTime,
  };
}

async function validateSession(_sessionToken: string): Promise<boolean> {
  // Implement your session validation logic here
  // This could involve checking against a database, Redis, etc.
  try {
    // Example: validate JWT token
    // const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET!);
    // return !!decoded;

    // For now, return true (implement proper validation)
    return true;
  } catch (error) {
    console.error("Session validation error:", error);
    return false;
  }
}

async function validateBearerToken(authHeader: string): Promise<boolean> {
  // Implement your Bearer token validation logic here
  try {
    const _token = authHeader.replace("Bearer ", "");

    // Example: validate against your auth service
    // const response = await fetch('https://your-auth-service.com/validate', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.ok;

    // For now, return true (implement proper validation)
    return true;
  } catch (error) {
    console.error("Bearer token validation error:", error);
    return false;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
