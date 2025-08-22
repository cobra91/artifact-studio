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
    <div className="p-4 border-b">
      <h3 className="text-lg font-semibold mb-3">Responsive Design</h3>
      <div className="flex space-x-2">
        {breakpoints.map((bp) => (
          <button
            key={bp.value}
            onClick={() => setActiveBreakpoint(bp.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeBreakpoint === bp.value
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {bp.label}
          </button>
        ))}
      </div>
    </div>
  );
};
