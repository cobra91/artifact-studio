import React from "react";

import { useCanvasStore } from "../lib/canvasStore";

export const ResponsivePanel: React.FC = () => {
  const { activeBreakpoint, setActiveBreakpoint } = useCanvasStore();

  const breakpoints: { label: string; value: "base" | "sm" | "md" | "lg" }[] = [
    { label: "Base", value: "base" },
    { label: "Small", value: "sm" },
    { label: "Medium", value: "md" },
    { label: "Large", value: "lg" },
  ];

  return (
    <div className="border-b p-4">
      <div className="flex space-x-2">
      <h3 className="mb-3 text-lg font-semibold">Component Size</h3>
        {breakpoints.map(bp => (
          <button
            key={bp.value}
            onClick={() => setActiveBreakpoint(bp.value)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              activeBreakpoint === bp.value
                ? "bg-blue-500 text-white"
                : "bg-gray-600 hover:bg-gray-300"
            }`}
          >
            {bp.label}
          </button>
        ))}
      </div>
    </div>
  );
};
