"use client";

import { RoomProvider } from "@liveblocks/react";
import { ReactNode } from "react";

export function Room({ children }: { children: ReactNode }) {
  return (
    <RoomProvider id="artifact-studio-room" initialPresence={{ cursor: null }}>
      {children}
    </RoomProvider>
  );
}
