"use client";

import { useCallback } from "react";

import { useOthers, useUpdateMyPresence } from "../liveblocks.config";

export function LiveCursors() {
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      updateMyPresence({
        cursor: {
          x: Math.round(event.clientX),
          y: Math.round(event.clientY),
        },
      });
    },
    [updateMyPresence],
  );

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="fixed inset-0 pointer-events-none z-50"
    >
      {others.map(({ connectionId, presence }) => {
        if (!presence.cursor) {
          return null;
        }

        return (
          <Cursor
            key={connectionId}
            x={presence.cursor.x}
            y={presence.cursor.y}
            color={COLORS[connectionId % COLORS.length]}
            name={`User ${connectionId}`}
          />
        );
      })}
    </div>
  );
}

function Cursor({
  x,
  y,
  color,
  name,
}: {
  x: number;
  y: number;
  color: string;
  name: string;
}) {
  return (
    <div
      className="absolute top-0 left-0 transition-transform duration-75"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      <div
        className="absolute top-5 left-2 px-2 py-1 rounded-md text-xs text-white font-medium whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
}

const COLORS = [
  "#E11D48",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];