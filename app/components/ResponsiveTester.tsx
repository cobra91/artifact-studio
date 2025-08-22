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
      <div className="h-full p-4 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📱</div>
          <p>Select a component to test responsive styles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Responsive Tester
        </h3>
        <p className="text-sm text-gray-600">
          Test how your component looks across different screen sizes
        </p>
      </div>

      {/* Breakpoint Switcher */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          {(["base", "sm", "md", "lg"] as const).map((breakpoint) => {
            const info = breakpointInfo[breakpoint];
            const isActive = activeBreakpoint === breakpoint;

            return (
              <button
                key={breakpoint}
                onClick={() => setActiveBreakpoint(breakpoint)}
                className={`flex-1 p-3 rounded-lg border transition-all ${
                  isActive
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="text-center">
                  <div className="font-medium text-sm">{info.label}</div>
                  <div className="text-xs opacity-75">{info.width}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-4 bg-gray-100 overflow-auto">
        <div className="flex justify-center">
          <div
            className="bg-white shadow-lg border border-gray-200 transition-all duration-300"
            style={{
              width: breakpointInfo[activeBreakpoint].width,
              maxWidth: "100%",
              minHeight: "300px",
              position: "relative",
            }}
          >
            {/* Device Frame */}
            <div className="absolute inset-0 border-4 border-gray-800 rounded-lg pointer-events-none">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-800 rounded-b-lg"></div>
            </div>

            {/* Content Area */}
            <div className="p-4 h-full flex items-center justify-center">
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
      <div className="p-4 border-t bg-gray-50">
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
