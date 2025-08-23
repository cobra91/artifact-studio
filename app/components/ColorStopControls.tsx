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
    }>
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
    updates: Partial<{ color: string; position: number }>
  ) => {
    const newStops = stops.map(stop =>
      stop.id === id ? { ...stop, ...updates } : stop
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
        <h4 className="text-sm font-medium">Color Stops</h4>
        <button
          onClick={onAddStop}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Add Stop
        </button>
      </div>

      <div className="space-y-2">
        {stops.map(stop => (
          <div
            key={stop.id}
            className={`rounded-lg border p-3 transition-colors ${
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
                onChange={e => handleColorChange(stop.id, e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border border-gray-300"
              />

              <div className="flex-1">
                <label className="mb-1 block text-xs">
                  Position: {stop.position}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stop.position}
                  onChange={e =>
                    handlePositionChange(stop.id, parseInt(e.target.value))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-600"
                />
              </div>

              {stops.length > 2 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onRemoveStop(stop.id);
                  }}
                  className="text-lg font-bold text-red-600 hover:text-red-800"
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
        <p className="py-4 text-center text-sm text-gray-500">
          No color stops defined. Add one to get started.
        </p>
      )}
    </div>
  );
};
