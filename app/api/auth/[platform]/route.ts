import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;

  // Return authentication URL for the platform
  const authUrls: Record<string, string> = {
    vercel: process.env.VERCEL_AUTH_URL || "https://vercel.com/oauth/authorize",
    netlify:
      process.env.NETLIFY_AUTH_URL || "https://app.netlify.com/authorize",
    "github-pages":
      process.env.GITHUB_AUTH_URL || "https://github.com/login/oauth/authorize",
  };

  const authUrl = authUrls[platform];

  if (!authUrl) {
    return NextResponse.json(
      { error: "Authentication not supported for this platform" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    authUrl,
    clientId:
      process.env[`${platform.toUpperCase()}_CLIENT_ID`] || "mock-client-id",
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/${platform}/callback`,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  const { code, _state } = await request.json();

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code is required" },
      { status: 400 },
    );
  }

  try {
    // Exchange code for tokens (mock implementation)
    // In a real implementation, this would make HTTP requests to the platform's OAuth server
    const mockResponse = {
      accessToken: `mock_access_token_${platform}_${Date.now()}`,
      refreshToken: `mock_refresh_token_${platform}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      scope: ["read", "write"],
      platform,
    };

    // In a real implementation, you would:
    // 1. Exchange the authorization code for access/refresh tokens
    // 2. Store the tokens securely
    // 3. Validate the against replay attacks (using state)

    return NextResponse.json({
      success: true,
      credentials: mockResponse,
      message: "Authentication successful",
    });
  } catch (error) {
    console.error(`Error authenticating with ${platform}:`, error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
