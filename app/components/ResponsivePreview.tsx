"use client";

import { useCanvasStore } from "../lib/canvasStore";
import { ComponentNode } from "../types/artifact";
import { ComponentRenderer } from "./VisualCanvas/ComponentRenderer";

interface ResponsivePreviewProps {
  components: ComponentNode[];
  selectedNodeIds: string[];
}

export const ResponsivePreview = ({ components, selectedNodeIds }: ResponsivePreviewProps) => {
  const { activeBreakpoint } = useCanvasStore();

  const getPreviewWidth = () => {
    switch (activeBreakpoint) {
      case "base": return "100%";
      case "sm": return "640px";
      case "md": return "768px";
      case "lg": return "1024px";
      default: return "100%";
    }
  };

  const getPreviewLabel = () => {
    switch (activeBreakpoint) {
      case "base": return "Mobile (< 640px)";
      case "sm": return "Small (640px+)";
      case "md": return "Medium (768px+)";
      case "lg": return "Large (1024px+)";
      default: return "Mobile";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Responsive Preview</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Current breakpoint:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
            {activeBreakpoint.toUpperCase()}
          </span>
          <span>• {getPreviewLabel()}</span>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 p-4 bg-gray-100 overflow-auto">
        <div className="flex justify-center">
          <div 
            className="bg-white shadow-lg border border-gray-200 transition-all duration-300"
            style={{
              width: getPreviewWidth(),
              maxWidth: "100%",
              minHeight: "400px",
              position: "relative"
            }}
          >
            {/* Device Frame */}
            <div className="absolute inset-0 border-8 border-gray-800 rounded-lg pointer-events-none">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-800 rounded-b-lg"></div>
            </div>

            {/* Content Area */}
            <div className="p-4 h-full overflow-auto">
              {components.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <p>No components to preview</p>
                    <p className="text-sm">Add components to the canvas to see them here</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {components.map((component) => (
                    <div
                      key={component.id}
                      className={`absolute ${
                        selectedNodeIds.includes(component.id) 
                          ? "ring-2 ring-blue-500 ring-opacity-50" 
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
      <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
        <div className="flex justify-between items-center">
          <span>Preview: {getPreviewLabel()}</span>
          <span>Width: {getPreviewWidth()}</span>
        </div>
      </div>
    </div>
  );
};

