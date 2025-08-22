"use client";

import { useState } from "react";

import { useCanvasStore } from "../lib/canvasStore";
import { generateResponsiveStyles } from "../lib/responsiveStyles";
import { ComponentNode } from "../types/artifact";
import { MobileOptimizationPanel } from "./MobileOptimizationPanel";
import { ResponsiveStylesOverview } from "./ResponsiveStylesOverview";
import { AppearanceTab } from "./StylePanel/AppearanceTab";

interface StylePanelProps {
  selectedNode: ComponentNode | null;
  onUpdateNode: (_updates: Partial<ComponentNode>) => void;
}

export const StylePanel = ({ selectedNode, onUpdateNode }: StylePanelProps) => {
  const [activeTab, setActiveTab] = useState<
    "layout" | "typography" | "appearance" | "responsive" | "optimization"
  >("layout");
  const { activeBreakpoint, setActiveBreakpoint } = useCanvasStore();

  if (!selectedNode) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-2 text-4xl">🎨</div>
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateStyle = (property: string, value: string | number) => {
    onUpdateNode({
      styles: {
        ...selectedNode.styles,
        [property]: String(value),
      },
    });
  };

  const updateResponsiveStyle = (property: string, value: string | number) => {
    onUpdateNode({
      responsiveStyles: {
        ...selectedNode.responsiveStyles,
        [activeBreakpoint]: {
          ...selectedNode.responsiveStyles?.[activeBreakpoint],
          [property]: String(value),
        },
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

  const renderLayoutTab = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs">Display</label>
        <select
          value={selectedNode.styles.display || "block"}
          onChange={e => updateStyle("display", e.target.value)}
          className="w-full rounded border border-gray-300 p-2 text-sm"
        >
          <option value="block">Block</option>
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
          <option value="inline-block">Inline Block</option>
        </select>
      </div>
      {selectedNode.styles.display === "flex" && (
        <div className="space-y-4 rounded border p-2">
          <h5 className="text-xs font-medium text-gray-500">Flexbox</h5>
          <div>
            <label className="mb-1 block text-xs">Direction</label>
            <select
              value={selectedNode.styles.flexDirection || "row"}
              onChange={e => updateStyle("flexDirection", e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            >
              <option value="row">Row</option>
              <option value="col">Column</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs">Justify Content</label>
            <select
              value={selectedNode.styles.justifyContent || "flex-start"}
              onChange={e => updateStyle("justifyContent", e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            >
              <option value="flex-start">Start</option>
              <option value="center">Center</option>
              <option value="flex-end">End</option>
              <option value="space-between">Space Between</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs">Align Items</label>
            <select
              value={selectedNode.styles.alignItems || "stretch"}
              onChange={e => updateStyle("alignItems", e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            >
              <option value="stretch">Stretch</option>
              <option value="flex-start">Start</option>
              <option value="center">Center</option>
              <option value="flex-end">End</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  const renderTypographyTab = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs">Font Size</label>
        <input
          type="text"
          value={selectedNode.styles.fontSize || "16px"}
          onChange={e => {
            const value = e.target.value;
            if (/^\d+(px|em|rem|%)$/.test(value)) {
              updateStyle("fontSize", value);
            }
          }}
          className="w-full rounded border border-gray-300 p-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs">Font Weight</label>
        <select
          value={selectedNode.styles.fontWeight || "normal"}
          onChange={e => updateStyle("fontWeight", e.target.value)}
          className="w-full rounded border border-gray-300 p-2 text-sm"
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="lighter">Lighter</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs">Text Align</label>
        <select
          value={selectedNode.styles.textAlign || "left"}
          onChange={e => updateStyle("textAlign", e.target.value)}
          className="w-full rounded border border-gray-300 p-2 text-sm"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs">Color</label>
        <input
          type="color"
          value={selectedNode.styles.color || "#000000"}
          onChange={e => updateStyle("color", e.target.value)}
          className="h-8 w-full rounded border border-gray-300"
        />
      </div>
    </div>
  );

  const renderResponsiveTab = () => (
    <div className="space-y-4">
      {/* Breakpoint Selector */}
      <div className="flex justify-around">
        {(["base", "sm", "md", "lg"] as const).map(breakpoint => {
          const hasCustomStyles =
            selectedNode.responsiveStyles?.[breakpoint] &&
            Object.keys(selectedNode.responsiveStyles[breakpoint]).length > 0;

          return (
            <button
              key={breakpoint}
              onClick={() => setActiveBreakpoint(breakpoint)}
              className={`relative rounded px-3 py-1 text-sm ${
                activeBreakpoint === breakpoint
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {breakpoint.toUpperCase()}
              {hasCustomStyles && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Responsive Preview */}
      <div className="rounded border bg-gray-50 p-3">
        <h5 className="mb-2 text-xs font-medium text-gray-500">
          Preview: {activeBreakpoint.toUpperCase()}
        </h5>
        <div
          className="border-2 border-dashed border-gray-300 bg-white p-2"
          style={{
            width:
              activeBreakpoint === "base"
                ? "100%"
                : activeBreakpoint === "sm"
                  ? "640px"
                  : activeBreakpoint === "md"
                    ? "768px"
                    : "1024px",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        >
          <div className="mb-1 text-xs text-gray-500">
            {activeBreakpoint === "base"
              ? "Mobile (< 640px)"
              : activeBreakpoint === "sm"
                ? "Small (640px+)"
                : activeBreakpoint === "md"
                  ? "Medium (768px+)"
                  : "Large (1024px+)"}
          </div>
        </div>
      </div>

      {/* Responsive Styles Editor */}
      <div className="rounded border p-3">
        <h5 className="mb-3 text-xs font-medium text-gray-500">
          {activeBreakpoint.toUpperCase()} Styles
        </h5>
        <div className="space-y-3">
          {/* Layout Properties */}
          <div>
            <label className="mb-1 block text-xs">Width</label>
            <input
              type="text"
              placeholder="e.g., 100%, 200px, auto"
              value={
                selectedNode.responsiveStyles?.[activeBreakpoint]?.width || ""
              }
              onChange={e => updateResponsiveStyle("width", e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs">Height</label>
            <input
              type="text"
              placeholder="e.g., 100px, auto"
              value={
                selectedNode.responsiveStyles?.[activeBreakpoint]?.height || ""
              }
              onChange={e => updateResponsiveStyle("height", e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs">Display</label>
            <select
              value={
                selectedNode.responsiveStyles?.[activeBreakpoint]?.display || ""
              }
              onChange={e => updateResponsiveStyle("display", e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            >
              <option value="">Inherit</option>
              <option value="block">Block</option>
              <option value="flex">Flex</option>
              <option value="grid">Grid</option>
              <option value="inline-block">Inline Block</option>
              <option value="none">None</option>
            </select>
          </div>

          {/* Typography Properties */}
          <div>
            <label className="mb-1 block text-xs">Font Size</label>
            <input
              type="text"
              placeholder="e.g., 16px, 1.2rem"
              value={
                selectedNode.responsiveStyles?.[activeBreakpoint]?.fontSize ||
                ""
              }
              onChange={e => updateResponsiveStyle("fontSize", e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs">Text Align</label>
            <select
              value={
                selectedNode.responsiveStyles?.[activeBreakpoint]?.textAlign ||
                ""
              }
              onChange={e => updateResponsiveStyle("textAlign", e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            >
              <option value="">Inherit</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>

          {/* Spacing Properties */}
          <div>
            <label className="mb-1 block text-xs">Padding</label>
            <input
              type="text"
              placeholder="e.g., 10px, 1rem"
              value={
                selectedNode.responsiveStyles?.[activeBreakpoint]?.padding || ""
              }
              onChange={e => updateResponsiveStyle("padding", e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs">Margin</label>
            <input
              type="text"
              placeholder="e.g., 10px, 1rem"
              value={
                selectedNode.responsiveStyles?.[activeBreakpoint]?.margin || ""
              }
              onChange={e => updateResponsiveStyle("margin", e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  // Copy base styles to current breakpoint
                  const baseStyles = selectedNode.styles;
                  Object.entries(baseStyles).forEach(([key, value]) => {
                    if (value) updateResponsiveStyle(key, value);
                  });
                }}
                className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200"
              >
                Copy Base
              </button>
              <button
                onClick={() => {
                  // Apply default responsive styles for this component type
                  const defaultStyles = generateResponsiveStyles(
                    selectedNode.type
                  );
                  const currentBreakpointStyles =
                    defaultStyles[activeBreakpoint];
                  Object.entries(currentBreakpointStyles).forEach(
                    ([key, value]) => {
                      if (value) updateResponsiveStyle(key, value);
                    }
                  );
                }}
                className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200"
              >
                Apply Default
              </button>
              <button
                onClick={() => {
                  // Clear current breakpoint styles
                  onUpdateNode({
                    responsiveStyles: {
                      ...selectedNode.responsiveStyles,
                      [activeBreakpoint]: {},
                    },
                  });
                }}
                className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-100">Properties</h3>
        <div className="glass rounded px-2 py-1 text-sm text-gray-300">
          {selectedNode.type} • {selectedNode.id}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-gray-200">Content</h4>
        {selectedNode.type === "text" && (
          <input
            type="text"
            value={selectedNode.props.children || ""}
            onChange={e => updateProp("children", e.target.value)}
            className="glass w-full rounded border border-border p-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all duration-200"
          />
        )}
        {selectedNode.type === "button" && (
          <input
            type="text"
            value={selectedNode.props.children || ""}
            onChange={e => updateProp("children", e.target.value)}
            className="glass w-full rounded border border-border p-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all duration-200"
          />
        )}
        {selectedNode.type === "input" && (
          <input
            type="text"
            value={selectedNode.props.placeholder || ""}
            onChange={e => updateProp("placeholder", e.target.value)}
            className="glass w-full rounded border border-border p-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all duration-200"
          />
        )}
      </div>

      <div className="mb-6">
        <div className="flex border-b border-border/20">
          <button
            onClick={() => setActiveTab("layout")}
            className={`px-4 py-2 text-sm transition-all duration-200 ${activeTab === "layout" ? "border-b-2 border-primary text-primary" : "text-gray-300 hover:text-gray-100"}`}
          >
            Layout
          </button>
          <button
            onClick={() => setActiveTab("typography")}
            className={`px-4 py-2 text-sm transition-all duration-200 ${activeTab === "typography" ? "border-b-2 border-primary text-primary" : "text-gray-300 hover:text-gray-100"}`}
          >
            Typography
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`px-4 py-2 text-sm transition-all duration-200 ${activeTab === "appearance" ? "border-b-2 border-primary text-primary" : "text-gray-300 hover:text-gray-100"}`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab("responsive")}
            className={`px-4 py-2 text-sm transition-all duration-200 ${activeTab === "responsive" ? "border-b-2 border-primary text-primary" : "text-gray-300 hover:text-gray-100"}`}
          >
            Responsive
          </button>
          <button
            onClick={() => setActiveTab("optimization")}
            className={`px-4 py-2 text-sm transition-all duration-200 ${activeTab === "optimization" ? "border-b-2 border-primary text-primary" : "text-gray-300 hover:text-gray-100"}`}
          >
            Optimization
          </button>
        </div>
        <div className="py-4">
          {activeTab === "layout" && renderLayoutTab()}
          {activeTab === "typography" && renderTypographyTab()}
          {activeTab === "appearance" && (
            <AppearanceTab
              selectedElement={selectedNode}
              onUpdateElement={onUpdateNode}
              activeBreakpoint={activeBreakpoint}
            />
          )}
          {activeTab === "responsive" && (
            <div className="space-y-4">
              {renderResponsiveTab()}
              <ResponsiveStylesOverview selectedNode={selectedNode} />
            </div>
          )}
          {activeTab === "optimization" && <MobileOptimizationPanel />}
        </div>
      </div>
    </div>
  );
};
