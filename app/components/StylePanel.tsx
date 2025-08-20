"use client";

import { ComponentNode } from "../types/artifact";

interface StylePanelProps {
  selectedNode: ComponentNode | null;
  onUpdateNode: (_updates: Partial<ComponentNode>) => void;
}

export const StylePanel = ({ selectedNode, onUpdateNode }: StylePanelProps) => {
  if (!selectedNode) {
    return (
      <div className="h-full p-4 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🎨</div>
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const updatePosition = (axis: "x" | "y", value: number) => {
    onUpdateNode({
      position: {
        ...selectedNode.position,
        [axis]: value,
      },
    });
  };

  const updateSize = (dimension: "width" | "height", value: number) => {
    onUpdateNode({
      size: {
        ...selectedNode.size,
        [dimension]: value,
      },
    });
  };

  const updateRotation = (value: number) => {
    onUpdateNode({
      rotation: value,
    });
  };

  const updateSkew = (axis: "x" | "y", value: number) => {
    onUpdateNode({
      skew: {
        x: selectedNode.skew?.x || 0,
        y: selectedNode.skew?.y || 0,
        [axis]: value,
      },
    });
  };

  const updateProp = (key: string, value: any) => {
    onUpdateNode({
      props: {
        ...selectedNode.props,
        [key]: value,
      },
    });
  };

  const updateStyle = (property: string, value: string) => {
    onUpdateNode({
      styles: {
        ...selectedNode.styles,
        [property]: value,
      },
    });
  };

  return (
    <div className="h-full p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Properties</h3>
        <div className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
          {selectedNode.type} • {selectedNode.id}
        </div>
      </div>

      {/* Position & Size */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Position & Size
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">X</label>
            <input
              type="number"
              value={selectedNode.position.x}
              onChange={(e) =>
                updatePosition("x", parseInt(e.target.value) || 0)
              }
              className="w-full p-2 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Y</label>
            <input
              type="number"
              value={selectedNode.position.y}
              onChange={(e) =>
                updatePosition("y", parseInt(e.target.value) || 0)
              }
              className="w-full p-2 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width</label>
            <input
              type="number"
              value={selectedNode.size.width}
              onChange={(e) =>
                updateSize("width", parseInt(e.target.value) || 0)
              }
              className="w-full p-2 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Height</label>
            <input
              type="number"
              value={selectedNode.size.height}
              onChange={(e) =>
                updateSize("height", parseInt(e.target.value) || 0)
              }
              className="w-full p-2 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Transform */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Transform
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Rotation</label>
            <input
              type="number"
              value={selectedNode.rotation || 0}
              onChange={(e) =>
                updateRotation(parseInt(e.target.value) || 0)
              }
              className="w-full p-2 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Skew X</label>
            <input
              type="number"
              value={selectedNode.skew?.x || 0}
              onChange={(e) =>
                updateSkew("x", parseInt(e.target.value) || 0)
              }
              className="w-full p-2 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Skew Y</label>
            <input
              type="number"
              value={selectedNode.skew?.y || 0}
              onChange={(e) =>
                updateSkew("y", parseInt(e.target.value) || 0)
              }
              className="w-full p-2 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Component-specific Properties */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Content</h4>
        {selectedNode.type === "text" && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Text Content
            </label>
            <input
              type="text"
              value={selectedNode.props.children || ""}
              onChange={(e) => updateProp("children", e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded"
            />
          </div>
        )}

        {selectedNode.type === "button" && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={selectedNode.props.children || ""}
              onChange={(e) => updateProp("children", e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded"
            />
          </div>
        )}

        {selectedNode.type === "input" && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={selectedNode.props.placeholder || ""}
              onChange={(e) => updateProp("placeholder", e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded"
            />
          </div>
        )}
      </div>

      {/* Styling */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Styling</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Background Color
            </label>
            <input
              type="color"
              value={selectedNode.styles.backgroundColor || "#ffffff"}
              onChange={(e) => updateStyle("backgroundColor", e.target.value)}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Text Color
            </label>
            <input
              type="color"
              value={selectedNode.styles.color || "#000000"}
              onChange={(e) => updateStyle("color", e.target.value)}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Font Size
            </label>
            <select
              value={selectedNode.styles.fontSize || "16px"}
              onChange={(e) => updateStyle("fontSize", e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded"
            >
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="32px">32px</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Border Radius
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={parseInt(selectedNode.styles.borderRadius || "0")}
              onChange={(e) =>
                updateStyle("borderRadius", `${e.target.value}px`)
              }
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {selectedNode.styles.borderRadius || "0px"}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              updateStyle("boxShadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
            }
            className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Add Shadow
          </button>
          <button
            onClick={() => updateStyle("border", "2px solid #e5e7eb")}
            className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Add Border
          </button>
          <button
            onClick={() => updateStyle("opacity", "0.8")}
            className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Fade
          </button>
        </div>
      </div>
    </div>
  );
};
