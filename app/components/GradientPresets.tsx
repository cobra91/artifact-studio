import { useState } from "react";

interface GradientPreset {
  id: string;
  name: string;
  gradient: string;
  type: "linear" | "radial";
}

interface GradientPresetsProps {
  onSelect: (gradient: string, type: "linear" | "radial") => void;
}

const gradientPresets: GradientPreset[] = [
  {
    id: "sunset",
    name: "Sunset",
    gradient: "linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)",
    type: "linear",
  },
  {
    id: "ocean",
    name: "Ocean",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    type: "linear",
  },
  {
    id: "forest",
    name: "Forest",
    gradient: "linear-gradient(to right, #134e5e, #71b280)",
    type: "linear",
  },
  {
    id: "fire",
    name: "Fire",
    gradient: "linear-gradient(to right, #ff416c, #ff4b2b)",
    type: "linear",
  },
  {
    id: "sky",
    name: "Sky",
    gradient: "linear-gradient(to bottom, #2980b9, #6dd5fa, #ffffff)",
    type: "linear",
  },
  {
    id: "purple",
    name: "Purple",
    gradient: "radial-gradient(circle, #8e2de2, #4a00e0)",
    type: "radial",
  },
  {
    id: "gold",
    name: "Gold",
    gradient: "radial-gradient(circle, #ffd700, #ff8c00)",
    type: "radial",
  },
  {
    id: "silver",
    name: "Silver",
    gradient: "radial-gradient(circle, #c0c0c0, #808080)",
    type: "radial",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    gradient:
      "linear-gradient(90deg, #ff0000, #ff8000, #ffff00, #00ff00, #0080ff, #8000ff)",
    type: "linear",
  },
  {
    id: "neon",
    name: "Neon",
    gradient: "linear-gradient(45deg, #00ffff, #ff00ff, #ffff00)",
    type: "linear",
  },
  {
    id: "warm",
    name: "Warm",
    gradient: "linear-gradient(to right, #ffecd2, #fcb69f)",
    type: "linear",
  },
  {
    id: "cool",
    name: "Cool",
    gradient: "linear-gradient(to right, #a8edea, #fed6e3)",
    type: "linear",
  },
];

export const GradientPresets = ({ onSelect }: GradientPresetsProps) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetClick = (preset: GradientPreset) => {
    setSelectedPreset(preset.id);
    onSelect(preset.gradient, preset.type);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Gradient Presets</h3>

      <div className="grid grid-cols-2 gap-2">
        {gradientPresets.map(preset => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className={`relative rounded-lg border-2 p-2 transition-all ${
              selectedPreset === preset.id
                ? "border-blue-500 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            } `}
            title={preset.name}
          >
            <div
              className="h-12 w-full rounded"
              style={{ background: preset.gradient }}
            />
            <span className="mt-1 block text-xs">{preset.name}</span>
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-500">
        Click a preset to apply it to your gradient
      </div>
    </div>
  );
};
