"use client";

import { useState } from "react";

import { ColorPicker } from "./ColorPicker";
import { GradientEditor } from "./GradientEditor";
import { GradientPresets } from "./GradientPresets";

interface IntegratedColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  _canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export const IntegratedColorPicker = ({
  color,
  onChange,
}: IntegratedColorPickerProps) => {
  const [activeTab, setActiveTab] = useState<"solid" | "gradient">("solid");

  const handleColorChange = (newColor: string) => {
    onChange(newColor);
  };

  const handleGradientChange = (gradient: string) => {
    onChange(gradient);
  };

  const handlePresetSelect = (gradient: string) => {
    onChange(gradient);
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("solid")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "solid"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Solid
        </button>
        <button
          onClick={() => setActiveTab("gradient")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "gradient"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Gradient
        </button>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === "solid" ? (
          <ColorPicker color={color} onChange={handleColorChange} />
        ) : (
          <>
            <GradientEditor
              gradient={color}
              type="linear"
              onChange={handleGradientChange}
            />
            <GradientPresets onSelect={handlePresetSelect} />
          </>
        )}
      </div>
    </div>
  );
};
