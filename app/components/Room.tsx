"use client";

import { ReactNode } from "react";
import { RoomProvider } from "@liveblocks/react";

export function Room({ children }: { children: ReactNode }) {
  return (
    <RoomProvider 
      id="artifact-studio-room" 
      initialPresence={{ cursor: null }}
    >
      {children}
    </RoomProvider>
  );
}
