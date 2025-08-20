import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

// IMPORTANT: Replace this with your actual secret API key
const LIVEBLOCKS_SECRET_KEY = "sk_YOUR_SECRET_API_KEY";

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

  // Get the room from the request body
  const { room } = await request.json();

  // If the user has access to the room, authorize them
  if (room) {
    session.allow(room, session.FULL_ACCESS);
  }

  // Authorize the user and return the result
  const { status, body } = await session.authorize();
  return new NextResponse(body, { status });
}
