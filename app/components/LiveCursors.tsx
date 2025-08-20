"use client";

import { useOthers, useMyPresence } from "@liveblocks/react";
import { Presence } from "../types/liveblocks";

export function LiveCursors() {
  const others = useOthers();
  const [, updateMyPresence] = useMyPresence();

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const cursor = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
    updateMyPresence({ cursor });
  }

  function handlePointerLeave() {
    updateMyPresence({ cursor: null });
  }

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="fixed inset-0"
    >
      {others.map(({ connectionId, presence }) => {
        const p = presence as Presence;
        if (!p?.cursor) {
          return null;
        }
        return (
          <div
            key={connectionId}
            style={{
              position: "absolute",
              left: p.cursor.x,
              top: p.cursor.y,
              width: "10px",
              height: "10px",
              backgroundColor: "red",
              borderRadius: "50%",
            }}
          />
        );
      })}
    </div>
  );
}
