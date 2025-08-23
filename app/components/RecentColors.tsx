import { useEffect, useState } from "react";

import { ColorUtils } from "../lib/colorUtils";

interface RecentColorsProps {
  onColorSelect: (color: string) => void;
  maxColors?: number;
}

export const RecentColors = ({
  onColorSelect,
  maxColors = 12,
}: RecentColorsProps) => {
  const [recentColors, setRecentColors] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("recentColors");
    if (stored) {
      try {
        const colors = JSON.parse(stored);
        if (Array.isArray(colors)) {
          setRecentColors(colors.slice(0, maxColors));
        }
      } catch (error) {
        console.error("Failed to parse recent colors:", error);
      }
    }
  }, [maxColors]);

  const _addRecentColor = (color: string) => {
    const normalizedColor = ColorUtils.normalizeHex(color);

    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== normalizedColor);
      const updated = [normalizedColor, ...filtered].slice(0, maxColors);

      localStorage.setItem("recentColors", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentColors = () => {
    setRecentColors([]);
    localStorage.removeItem("recentColors");
  };

  if (recentColors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Recent Colors</h3>
        <button
          onClick={clearRecentColors}
          className="hover: text-xs text-gray-500"
          aria-label="Clear recent colors"
        >
          Clear
        </button>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {recentColors.map((color, index) => (
          <button
            key={`${color}-${index}`}
            onClick={() => onColorSelect(color)}
            className="h-8 w-8 rounded border border-gray-300 transition-colors hover:border-gray-400"
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`Select recent color ${color}`}
          />
        ))}
      </div>
    </div>
  );
};
