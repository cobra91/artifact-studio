import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

// IMPORTANT: Replace this with your actual secret API key
const LIVEBLOCKS_SECRET_KEY = "sk_xxxxxxxxxxxxxxxxx";

const liveblocks = new Liveblocks({
  secret: LIVEBLOCKS_SECRET_KEY,
});

// Mock user data (replace with your actual user authentication)
const MOCK_USER = {
  id: "user-1",
  info: {
    name: "Alex",
    color: "#D583F0",
    picture: "https://liveblocks.io/avatars/avatar-1.png",
  },
};

export async function POST(request: NextRequest) {
  // For this example, we'll just use the mock user
  const user = MOCK_USER;

  // Start an auth session for the user
  const session = liveblocks.prepareSession(user.id, {
    userInfo: user.info,
  });

  // Get the room from the request body (with error handling for empty body)
  let room = null;
  try {
    const body = await request.text();
    if (body.trim()) {
      const parsed = JSON.parse(body);
      room = parsed.room;
    }
  } catch (error) {
    console.warn("Failed to parse request body:", error);
    // Continue with room = null
  }

  // If the user has access to the room, authorize them
  if (room) {
    session.allow(room, session.FULL_ACCESS);
  }

  // Authorize the user and return the result
  const { status, body } = await session.authorize();
  return new NextResponse(body, { status });
}
