"use client";

import { useCanvasStore } from "../lib/canvasStore";
import { breakpointInfo } from "../lib/responsiveStyles";
import { ComponentNode } from "../types/artifact";
import { ComponentRenderer } from "./VisualCanvas/ComponentRenderer";

interface ResponsiveTesterProps {
  selectedNode: ComponentNode | null;
}

export const ResponsiveTester = ({ selectedNode }: ResponsiveTesterProps) => {
  const { activeBreakpoint, setActiveBreakpoint } = useCanvasStore();

  if (!selectedNode) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-gray-500">
        <div className="text-center">
          <div className="mb-2 text-4xl">📱</div>
          <p>Select a component to test responsive styles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-gray-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          Responsive Tester
        </h3>
        <p className="text-sm text-gray-600">
          Test how your component looks across different screen sizes
        </p>
      </div>

      {/* Breakpoint Switcher */}
      <div className="border-b p-4">
        <div className="flex gap-2">
          {(["base", "sm", "md", "lg"] as const).map(breakpoint => {
            const info = breakpointInfo[breakpoint];
            const isActive = activeBreakpoint === breakpoint;

            return (
              <button
                key={breakpoint}
                onClick={() => setActiveBreakpoint(breakpoint)}
                className={`flex-1 rounded-lg border p-3 transition-all ${
                  isActive
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-medium">{info.label}</div>
                  <div className="text-xs opacity-75">{info.width}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="flex justify-center">
          <div
            className="border border-gray-200 bg-white shadow-lg transition-all duration-300"
            style={{
              width: breakpointInfo[activeBreakpoint].width,
              maxWidth: "100%",
              minHeight: "300px",
              position: "relative",
            }}
          >
            {/* Device Frame */}
            <div className="pointer-events-none absolute inset-0 rounded-lg border-4 border-gray-800">
              <div className="absolute top-0 left-1/2 h-1 w-12 -translate-x-1/2 transform rounded-b-lg bg-gray-800"></div>
            </div>

            {/* Content Area */}
            <div className="flex h-full items-center justify-center p-4">
              <div
                style={{
                  width: selectedNode.size.width,
                  height: selectedNode.size.height,
                  position: "relative",
                }}
              >
                <ComponentRenderer
                  node={selectedNode}
                  activeBreakpoint={activeBreakpoint}
                  isEditMode={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="border-t bg-gray-50 p-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-medium text-gray-700">
              Current Breakpoint:
            </span>
            <div className="text-gray-600">
              {breakpointInfo[activeBreakpoint].label} (
              {breakpointInfo[activeBreakpoint].width})
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Component Size:</span>
            <div className="text-gray-600">
              {selectedNode.size.width} × {selectedNode.size.height}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
