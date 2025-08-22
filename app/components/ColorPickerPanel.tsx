"use client";

import { useState } from "react";

import { ColorPalette } from "./ColorPalette";
import { ColorPicker } from "./ColorPicker";
import { Eyedropper } from "./Eyedropper";
import { GradientEditor } from "./GradientEditor";
import { RecentColors } from "./RecentColors";

interface ColorPickerPanelProps {
  color: string;
  onChange: (color: string) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  showGradient?: boolean;
}

export const ColorPickerPanel = ({
  color,
  onChange,
  canvasRef,
  showGradient = false,
}: ColorPickerPanelProps) => {
  const [activeTab, setActiveTab] = useState<"solid" | "gradient">("solid");
  const [gradient, setGradient] = useState(
    "linear-gradient(90deg, #000000 0%, #ffffff 100%)"
  );

  return (
    <div className="w-80 rounded-lg border bg-white shadow-lg">
      <div className="border-b">
        {showGradient && (
          <div className="flex">
            <button
              onClick={() => setActiveTab("solid")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "solid"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Solid
            </button>
            <button
              onClick={() => setActiveTab("gradient")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "gradient"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Gradient
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        {activeTab === "solid" ? (
          <>
            <ColorPicker color={color} onChange={onChange} />

            <ColorPalette onColorSelect={onChange} />

            <RecentColors onColorSelect={onChange} />

            {canvasRef && <Eyedropper onColorSelect={onChange} />}
          </>
        ) : (
          <GradientEditor
            gradient={gradient}
            type="linear"
            onChange={newGradient => {
              setGradient(newGradient);
              onChange(newGradient);
            }}
          />
        )}
      </div>
    </div>
  );
};
