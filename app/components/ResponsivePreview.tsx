"use client";

import { useCanvasStore } from "../lib/canvasStore";
import { ComponentNode } from "../types/artifact";
import { ComponentRenderer } from "./VisualCanvas/ComponentRenderer";

interface ResponsivePreviewProps {
  components: ComponentNode[];
  selectedNodeIds: string[];
}

export const ResponsivePreview = ({
  components,
  selectedNodeIds,
}: ResponsivePreviewProps) => {
  const { activeBreakpoint } = useCanvasStore();

  const getPreviewWidth = () => {
    switch (activeBreakpoint) {
      case "base":
        return "100%";
      case "sm":
        return "640px";
      case "md":
        return "768px";
      case "lg":
        return "1024px";
      default:
        return "100%";
    }
  };

  const getPreviewLabel = () => {
    switch (activeBreakpoint) {
      case "base":
        return "Mobile (< 640px)";
      case "sm":
        return "Small (640px+)";
      case "md":
        return "Medium (768px+)";
      case "lg":
        return "Large (1024px+)";
      default:
        return "Mobile";
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          Responsive Preview
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span>Current breakpoint:</span>
          <span className="rounded bg-blue-100 px-2 py-1 font-medium text-blue-700">
            {activeBreakpoint.toUpperCase()}
          </span>
          <span>• {getPreviewLabel()}</span>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="flex justify-center">
          <div
            className="border border-gray-200 bg-white shadow-lg transition-all duration-300"
            style={{
              width: getPreviewWidth(),
              maxWidth: "100%",
              minHeight: "400px",
              position: "relative",
            }}
          >
            {/* Device Frame */}
            <div className="pointer-events-none absolute inset-0 rounded-lg border-8 border-gray-800">
              <div className="absolute top-0 left-1/2 h-2 w-16 -translate-x-1/2 transform rounded-b-lg bg-gray-800"></div>
            </div>

            {/* Content Area */}
            <div className="h-full overflow-auto p-4">
              {components.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">📱</div>
                    <p>No components to preview</p>
                    <p className="text-sm">
                      Add components to the canvas to see them here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {components.map(component => (
                    <div
                      key={component.id}
                      className={`absolute ${
                        selectedNodeIds.includes(component.id)
                          ? "ring-opacity-50 ring-2 ring-blue-500"
                          : ""
                      }`}
                      style={{
                        left: component.position.x,
                        top: component.position.y,
                        width: component.size.width,
                        height: component.size.height,
                        zIndex: selectedNodeIds.includes(component.id) ? 10 : 1,
                      }}
                    >
                      <ComponentRenderer
                        node={component}
                        activeBreakpoint={activeBreakpoint}
                        isEditMode={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t p-3 text-xs">
        <div className="flex items-center justify-between">
          <span>Preview: {getPreviewLabel()}</span>
          <span>Width: {getPreviewWidth()}</span>
        </div>
      </div>
    </div>
  );
};
