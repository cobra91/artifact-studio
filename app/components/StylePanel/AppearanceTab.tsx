"use client";

import { useState } from "react";

import { useCanvasStore } from "../../lib/canvasStore";
import { ColorUtils } from "../../lib/colorUtils";
import { styleProperties } from "../../lib/styleProperties";
import { validateProperty } from "../../lib/validationUtils";
import { ComponentNode } from "../../types/artifact"; // Import ComponentNode
import { ColorPalette } from "../ColorPalette";
import { ColorPicker } from "../ColorPicker";
import { Eyedropper } from "../Eyedropper";
import { GradientEditor } from "../GradientEditor";
import { RecentColors } from "../RecentColors";

interface AppearanceTabProps {
  selectedElement: ComponentNode; // Use ComponentNode type
  onUpdateElement: (updates: Partial<ComponentNode>) => void; // Change signature
  activeBreakpoint: "base" | "sm" | "md" | "lg";
}

export const AppearanceTab = ({
  selectedElement,
  onUpdateElement,
  activeBreakpoint: _activeBreakpoint,
}: AppearanceTabProps) => {
  const [activeTab, setActiveTab] = useState<"fill" | "stroke" | "gradient">(
    "fill",
  );
  const [strokeWidthError, setStrokeWidthError] = useState<string | null>(null);
  const { addRecentColor } = useCanvasStore();

  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select an element to edit its appearance
      </div>
    );
  }

  const handleColorChange = (color: string, type: "fill" | "stroke") => {
    const normalizedColor = ColorUtils.normalizeHex(color);
    addRecentColor(normalizedColor);

    // Map fill to backgroundColor and stroke to border for better compatibility with HTML elements
    if (type === "fill") {
      onUpdateElement({
        styles: {
          backgroundColor: normalizedColor,
        },
      });
    } else if (type === "stroke") {
      // For stroke, we need to set border color and ensure border is visible
      const currentBorderWidth = selectedElement.styles.borderWidth || "2px";
      const currentBorderStyle = selectedElement.styles.borderStyle || "solid";
      onUpdateElement({
        styles: {
          borderWidth: currentBorderWidth,
          borderStyle: currentBorderStyle,
          borderColor: normalizedColor,
        },
      });
    }
  };

  const handleGradientChange = (gradient: string) => {
    console.log("🎨 Gradient applied:", gradient);
    onUpdateElement({
      styles: {
        backgroundColor: gradient,
      },
    });
  };

  const handleOpacityChange = (opacity: number, type: "fill" | "stroke") => {
    onUpdateElement({
      styles: {
        [`${type}Opacity`]: String(opacity), // Convert to string
      },
    });
  };

  const handleStrokeWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    const strokeWidthProperty = styleProperties.find(
      (prop) => prop.property === "strokeWidth",
    );

    if (strokeWidthProperty && strokeWidthProperty.validation) {
      const error = validateProperty(newValue, strokeWidthProperty.validation);
      setStrokeWidthError(error);
      if (error) {
        return; // Don't update if there's an error
      }
    }

    onUpdateElement({
      styles: {
        strokeWidth: String(newValue), // Convert to string
      },
    });
  };

  const currentFill =
    selectedElement.styles.backgroundColor ||
    selectedElement.styles.fill ||
    "#000000";
  const currentStroke =
    selectedElement.styles.borderColor ||
    selectedElement.styles.stroke ||
    "#000000";
  const currentFillOpacity = parseFloat(
    selectedElement.styles.fillOpacity || "1",
  );
  const currentStrokeOpacity = parseFloat(
    selectedElement.styles.strokeOpacity || "1",
  );

  return (
    <div className="space-y-4">
      <div className="border-b">
        <div className="flex space-x-4 px-4">
          <button
            onClick={() => setActiveTab("fill")}
            className={`py-2 px-1 text-sm font-medium border-b-2 ${
              activeTab === "fill"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Fill
          </button>
          <button
            onClick={() => setActiveTab("stroke")}
            className={`py-2 px-1 text-sm font-medium border-b-2 ${
              activeTab === "stroke"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Stroke
          </button>
          <button
            onClick={() => setActiveTab("gradient")}
            className={`py-2 px-1 text-sm font-medium border-b-2 ${
              activeTab === "gradient"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Gradient
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {activeTab === "fill" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fill Color
              </label>
              <ColorPicker
                color={currentFill}
                onChange={(color) => handleColorChange(color, "fill")}
                showAlpha={true}
                alpha={currentFillOpacity}
                onAlphaChange={(alpha) => handleOpacityChange(alpha, "fill")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opacity
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentFillOpacity}
                onChange={(e) =>
                  handleOpacityChange(parseFloat(e.target.value), "fill")
                }
                className="w-full"
              />
            </div>
          </>
        )}

        {activeTab === "stroke" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stroke Color
              </label>
              <ColorPicker
                color={currentStroke}
                onChange={(color) => handleColorChange(color, "stroke")}
                showAlpha={true}
                alpha={currentStrokeOpacity}
                onAlphaChange={(alpha) => handleOpacityChange(alpha, "stroke")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opacity
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentStrokeOpacity}
                onChange={(e) =>
                  handleOpacityChange(parseFloat(e.target.value), "stroke")
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stroke Width
              </label>
              <input
                type="number"
                min="0"
                value={parseFloat(selectedElement.styles.strokeWidth || "1")}
                onChange={handleStrokeWidthChange}
                className={`w-full px-3 py-2 border rounded ${
                  strokeWidthError ? "border-red-500" : ""
                }`}
              />
              {strokeWidthError && (
                <p className="text-red-500 text-xs mt-1">{strokeWidthError}</p>
              )}
            </div>
          </>
        )}

        {activeTab === "gradient" && (
          <GradientEditor
            gradient={
              typeof currentFill === "string" &&
              currentFill.includes("gradient")
                ? currentFill
                : "linear-gradient(90deg, #000000, #ffffff)"
            }
            onChange={handleGradientChange}
            type="linear"
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color Palette
          </label>
          <ColorPalette
            onColorSelect={(color) =>
              handleColorChange(color, activeTab === "fill" ? "fill" : "stroke")
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recent Colors
          </label>
          <RecentColors
            onColorSelect={(color) =>
              handleColorChange(color, activeTab === "fill" ? "fill" : "stroke")
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eyedropper
          </label>
          <Eyedropper
            onColorSelect={(color) =>
              handleColorChange(color, activeTab === "fill" ? "fill" : "stroke")
            }
          />
        </div>
      </div>
    </div>
  );
};
