import { useEffect, useState } from "react";

import { ColorUtils } from "../lib/colorUtils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  showAlpha?: boolean;
  alpha?: number;
  onAlphaChange?: (alpha: number) => void;
}

export const ColorPicker = ({
  color,
  onChange,
  showAlpha = false,
  alpha = 1,
  onAlphaChange,
}: ColorPickerProps) => {
  const [activeTab, setActiveTab] = useState<"hex" | "rgb" | "hsl">("hex");
  const [hexValue, setHexValue] = useState("");
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });
  const [hslValues, setHslValues] = useState({ h: 0, s: 0, l: 0 });
  const [alphaValue, setAlphaValue] = useState(alpha);

  useEffect(() => {
    const normalizedColor = ColorUtils.normalizeHex(color) || "#000000";
    setHexValue(normalizedColor);

    const rgb = ColorUtils.hexToRgb(normalizedColor);
    if (rgb) {
      setRgbValues(rgb);
      const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
      setHslValues(hsl);
    }
  }, [color]);

  const handleHexChange = (value: string) => {
    setHexValue(value);
    if (ColorUtils.isValidHex(value)) {
      onChange(value);
    }
  };

  const handleRgbChange = (channel: "r" | "g" | "b", value: number) => {
    const newRgb = { ...rgbValues, [channel]: value };
    setRgbValues(newRgb);
    const hex = ColorUtils.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    onChange(hex);
  };

  const handleHslChange = (channel: "h" | "s" | "l", value: number) => {
    const newHsl = { ...hslValues, [channel]: value };
    setHslValues(newHsl);
    const rgb = ColorUtils.hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const hex = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
    onChange(hex);
  };

  const handleAlphaChange = (value: number) => {
    setAlphaValue(value);
    if (onAlphaChange) {
      onAlphaChange(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-1 border-b">
        <button
          onClick={() => setActiveTab("hex")}
          className={`px-3 py-1 text-sm font-medium ${
            activeTab === "hex"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          HEX
        </button>
        <button
          onClick={() => setActiveTab("rgb")}
          className={`px-3 py-1 text-sm font-medium ${
            activeTab === "rgb"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          RGB
        </button>
        <button
          onClick={() => setActiveTab("hsl")}
          className={`px-3 py-1 text-sm font-medium ${
            activeTab === "hsl"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          HSL
        </button>
      </div>

      {activeTab === "hex" && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-12 h-12 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value)}
              className="flex-1 px-3 py-2 border rounded font-mono text-sm"
              placeholder="#000000"
            />
          </div>
        </div>
      )}

      {activeTab === "rgb" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Red</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="255"
                value={rgbValues.r}
                onChange={(e) => handleRgbChange("r", parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={rgbValues.r}
                onChange={(e) => handleRgbChange("r", parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Green</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="255"
                value={rgbValues.g}
                onChange={(e) => handleRgbChange("g", parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={rgbValues.g}
                onChange={(e) => handleRgbChange("g", parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Blue</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="255"
                value={rgbValues.b}
                onChange={(e) => handleRgbChange("b", parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={rgbValues.b}
                onChange={(e) => handleRgbChange("b", parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "hsl" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hue</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="360"
                value={hslValues.h}
                onChange={(e) => handleHslChange("h", parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="360"
                value={hslValues.h}
                onChange={(e) => handleHslChange("h", parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Saturation
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="100"
                value={hslValues.s}
                onChange={(e) => handleHslChange("s", parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={hslValues.s}
                onChange={(e) => handleHslChange("s", parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Lightness
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="100"
                value={hslValues.l}
                onChange={(e) => handleHslChange("l", parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={hslValues.l}
                onChange={(e) => handleHslChange("l", parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {showAlpha && onAlphaChange && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Alpha</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={alphaValue}
              onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={alphaValue}
              onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
              className="w-16 px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Preview</label>
        <div
          className="h-12 rounded border"
          style={{
            backgroundColor: hexValue,
            opacity: showAlpha ? alphaValue : 1,
          }}
        />
      </div>
    </div>
  );
};
