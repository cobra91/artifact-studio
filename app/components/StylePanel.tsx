"use client";

import { useState } from "react";

import { ComponentNode } from "../types/artifact";
import { MobileOptimizationPanel } from "./MobileOptimizationPanel";
import { AppearanceTab } from "./StylePanel/AppearanceTab";

interface StylePanelProps {
  selectedNode: ComponentNode | null;
  onUpdateNode: (_updates: Partial<ComponentNode>) => void;
}

export const StylePanel = ({ selectedNode, onUpdateNode }: StylePanelProps) => {
  const [activeTab, setActiveTab] = useState<
    "layout" | "typography" | "appearance" | "responsive" | "optimization"
  >("layout");
  const [activeBreakpoint, setActiveBreakpoint] = useState<
    "base" | "sm" | "md" | "lg"
  >("base");

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
        <label className="block text-xs text-gray-600 mb-1">Display</label>
        <select
          value={selectedNode.styles.display || "block"}
          onChange={(e) => updateStyle("display", e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded"
        >
          <option value="block">Block</option>
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
          <option value="inline-block">Inline Block</option>
        </select>
      </div>
      {selectedNode.styles.display === "flex" && (
        <div className="space-y-4 p-2 border rounded">
          <h5 className="text-xs font-medium text-gray-500">Flexbox</h5>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Direction
            </label>
            <select
              value={selectedNode.styles.flexDirection || "row"}
              onChange={(e) => updateStyle("flexDirection", e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded"
            >
              <option value="row">Row</option>
              <option value="col">Column</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Justify Content
            </label>
            <select
              value={selectedNode.styles.justifyContent || "flex-start"}
              onChange={(e) => updateStyle("justifyContent", e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded"
            >
              <option value="flex-start">Start</option>
              <option value="center">Center</option>
              <option value="flex-end">End</option>
              <option value="space-between">Space Between</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Align Items
            </label>
            <select
              value={selectedNode.styles.alignItems || "stretch"}
              onChange={(e) => updateStyle("alignItems", e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded"
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
        <label className="block text-xs text-gray-600 mb-1">Font Size</label>
        <input
          type="text"
          value={selectedNode.styles.fontSize || "16px"}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d+(px|em|rem|%)$/.test(value)) {
              updateStyle("fontSize", value);
            }
          }}
          className="w-full p-2 text-sm border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
        <select
          value={selectedNode.styles.fontWeight || "normal"}
          onChange={(e) => updateStyle("fontWeight", e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded"
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="lighter">Lighter</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Text Align</label>
        <select
          value={selectedNode.styles.textAlign || "left"}
          onChange={(e) => updateStyle("textAlign", e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Color</label>
        <input
          type="color"
          value={selectedNode.styles.color || "#000000"}
          onChange={(e) => updateStyle("color", e.target.value)}
          className="w-full h-8 border border-gray-300 rounded"
        />
      </div>
    </div>
  );

  

  const renderResponsiveTab = () => (
    <div className="space-y-4">
      <div className="flex justify-around">
        <button
          onClick={() => setActiveBreakpoint("base")}
          className={`px-3 py-1 text-sm rounded ${activeBreakpoint === "base" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Base
        </button>
        <button
          onClick={() => setActiveBreakpoint("sm")}
          className={`px-3 py-1 text-sm rounded ${activeBreakpoint === "sm" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          SM
        </button>
        <button
          onClick={() => setActiveBreakpoint("md")}
          className={`px-3 py-1 text-sm rounded ${activeBreakpoint === "md" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          MD
        </button>
        <button
          onClick={() => setActiveBreakpoint("lg")}
          className={`px-3 py-1 text-sm rounded ${activeBreakpoint === "lg" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          LG
        </button>
      </div>
      <div className="p-2 border rounded">
        <h5 className="text-xs font-medium text-gray-500">
          {activeBreakpoint.toUpperCase()} Styles
        </h5>
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width</label>
            <input
              type="text"
              value={
                selectedNode.responsiveStyles?.[activeBreakpoint]?.width || ""
              }
              onChange={(e) => updateResponsiveStyle("width", e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Display</label>
            <select
              value={
                selectedNode.responsiveStyles?.[activeBreakpoint]?.display || ""
              }
              onChange={(e) => updateResponsiveStyle("display", e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded"
            >
              <option value="">Inherit</option>
              <option value="block">Block</option>
              <option value="flex">Flex</option>
              <option value="grid">Grid</option>
              <option value="inline-block">Inline Block</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Properties</h3>
        <div className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
          {selectedNode.type} • {selectedNode.id}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Content</h4>
        {selectedNode.type === "text" && (
          <input
            type="text"
            value={selectedNode.props.children || ""}
            onChange={(e) => updateProp("children", e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded"
          />
        )}
        {selectedNode.type === "button" && (
          <input
            type="text"
            value={selectedNode.props.children || ""}
            onChange={(e) => updateProp("children", e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded"
          />
        )}
        {selectedNode.type === "input" && (
          <input
            type="text"
            value={selectedNode.props.placeholder || ""}
            onChange={(e) => updateProp("placeholder", e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded"
          />
        )}
      </div>

      <div className="mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("layout")}
            className={`px-4 py-2 text-sm ${activeTab === "layout" ? "border-b-2 border-blue-500" : ""}`}
          >
            Layout
          </button>
          <button
            onClick={() => setActiveTab("typography")}
            className={`px-4 py-2 text-sm ${activeTab === "typography" ? "border-b-2 border-blue-500" : ""}`}
          >
            Typography
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`px-4 py-2 text-sm ${activeTab === "appearance" ? "border-b-2 border-blue-500" : ""}`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab("responsive")}
            className={`px-4 py-2 text-sm ${activeTab === "responsive" ? "border-b-2 border-blue-500" : ""}`}
          >
            Responsive
          </button>
          <button
            onClick={() => setActiveTab("optimization")}
            className={`px-4 py-2 text-sm ${activeTab === "optimization" ? "border-b-2 border-blue-500" : ""}`}
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
          {activeTab === "responsive" && renderResponsiveTab()}
          {activeTab === "optimization" && <MobileOptimizationPanel />}
        </div>
      </div>
    </div>
  );
};
