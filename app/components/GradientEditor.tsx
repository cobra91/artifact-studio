import { useCallback, useEffect, useRef, useState } from "react";

import { ColorUtils } from "../lib/colorUtils";

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface GradientEditorProps {
  gradient: string;
  onChange: (gradient: string) => void;
  type: "linear" | "radial";
}

export const GradientEditor = ({
  gradient,
  onChange,
  type,
}: GradientEditorProps) => {
  const [colorStops, setColorStops] = useState<ColorStop[]>([]);
  const [angle, setAngle] = useState(90);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const parsed = ColorUtils.parseGradientString(gradient);
    if (parsed) {
      setColorStops(
        parsed.stops.map((stop, index) => ({
          id: `stop-${index}-${Date.now()}`,
          color: stop.color,
          position: stop.position,
        }))
      );

      if (parsed.type === "linear" && parsed.angle) {
        setAngle(parsed.angle);
      }
    }
  }, [gradient]);

  const updateGradient = (newStops: ColorStop[], newAngle?: number) => {
    const stops = newStops.map(stop => ({
      color: stop.color,
      position: stop.position,
    }));

    const newGradient = ColorUtils.generateGradientString(
      type,
      stops,
      newAngle || angle
    );

    onChange(newGradient);
  };

  const addColorStop = () => {
    const newStop: ColorStop = {
      id: `stop-${Date.now()}`,
      color: "#ffffff",
      position: 50,
    };

    const newStops = [...colorStops, newStop].sort(
      (a, b) => a.position - b.position
    );
    updateGradient(newStops);
  };

  const removeColorStop = (id: string) => {
    if (colorStops.length <= 2) return;

    const newStops = colorStops.filter(stop => stop.id !== id);
    updateGradient(newStops);
  };

  const updateColorStop = (id: string, updates: Partial<ColorStop>) => {
    const newStops = colorStops.map(stop =>
      stop.id === id ? { ...stop, ...updates } : stop
    );
    updateGradient(newStops);
  };

  const renderGradientPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradientObj =
      type === "linear"
        ? ctx.createLinearGradient(0, 0, canvas.width, 0)
        : ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            Math.min(canvas.width, canvas.height) / 2
          );

    colorStops.forEach(stop => {
      gradientObj.addColorStop(stop.position / 100, stop.color);
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = gradientObj;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [colorStops, type]);

  useEffect(() => {
    renderGradientPreview();
  }, [renderGradientPreview]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          Gradient Preview
        </h3>
        <canvas
          ref={canvasRef}
          width={300}
          height={50}
          className="h-12 w-full rounded border border-gray-300"
        />
      </div>

      {type === "linear" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Angle: {angle}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={e => {
              const newAngle = parseInt(e.target.value);
              setAngle(newAngle);
              updateGradient(colorStops, newAngle);
            }}
            className="w-full"
          />
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Color Stops</h3>
          <button
            onClick={addColorStop}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Add Stop
          </button>
        </div>

        <div className="space-y-2">
          {colorStops.map(stop => (
            <div key={stop.id} className="flex items-center space-x-2">
              <input
                type="color"
                value={stop.color}
                onChange={e =>
                  updateColorStop(stop.id, { color: e.target.value })
                }
                className="h-8 w-8 rounded border border-gray-300"
              />

              <input
                type="range"
                min="0"
                max="100"
                value={stop.position}
                onChange={e =>
                  updateColorStop(stop.id, {
                    position: parseInt(e.target.value),
                  })
                }
                className="flex-1"
              />

              <span className="w-12 text-sm text-gray-600">
                {stop.position}%
              </span>

              {colorStops.length > 2 && (
                <button
                  onClick={() => removeColorStop(stop.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
