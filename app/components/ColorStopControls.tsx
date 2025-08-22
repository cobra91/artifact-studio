import { useState } from "react";

interface ColorStopControlsProps {
  stops: Array<{
    id: string;
    color: string;
    position: number;
  }>;
  onChange: (
    stops: Array<{
      id: string;
      color: string;
      position: number;
    }>,
  ) => void;
  onAddStop: () => void;
  onRemoveStop: (id: string) => void;
}

export const ColorStopControls = ({
  stops,
  onChange,
  onAddStop,
  onRemoveStop,
}: ColorStopControlsProps) => {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const updateStop = (
    id: string,
    updates: Partial<{ color: string; position: number }>,
  ) => {
    const newStops = stops.map((stop) =>
      stop.id === id ? { ...stop, ...updates } : stop,
    );
    onChange(newStops);
  };

  const handleColorChange = (id: string, color: string) => {
    updateStop(id, { color });
  };

  const handlePositionChange = (id: string, position: number) => {
    updateStop(id, { position });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Color Stops</h4>
        <button
          onClick={onAddStop}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Add Stop
        </button>
      </div>

      <div className="space-y-2">
        {stops.map((stop) => (
          <div
            key={stop.id}
            className={`p-3 border rounded-lg transition-colors ${
              selectedStopId === stop.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
            onClick={() => setSelectedStopId(stop.id)}
          >
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => handleColorChange(stop.id, e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />

              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">
                  Position: {stop.position}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stop.position}
                  onChange={(e) =>
                    handlePositionChange(stop.id, parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {stops.length > 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStop(stop.id);
                  }}
                  className="text-red-600 hover:text-red-800 text-lg font-bold"
                  title="Remove stop"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {stops.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No color stops defined. Add one to get started.
        </p>
      )}
    </div>
  );
};
