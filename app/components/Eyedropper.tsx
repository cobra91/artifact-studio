import { useEffect, useRef, useState } from "react";

import { ColorUtils } from "../lib/colorUtils";

interface EyedropperProps {
  onColorSelect: (color: string) => void;
  disabled?: boolean;
}

export const Eyedropper = ({
  onColorSelect,
  disabled = false,
}: EyedropperProps) => {
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleClick = (e: MouseEvent) => {
      if (disabled) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const hex = ColorUtils.rgbToHex(pixelData[0], pixelData[1], pixelData[2]);

      onColorSelect(hex);
      setIsActive(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsActive(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, disabled, onColorSelect]);

  const startEyedropper = () => {
    if (disabled) return;
    setIsActive(true);
  };

  const captureCanvas = () => {
    const canvas = document.querySelector("canvas");
    if (canvas && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = canvas.width;
        canvasRef.current.height = canvas.height;
        ctx.drawImage(canvas, 0, 0);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={startEyedropper}
        disabled={disabled}
        className={`
          px-3 py-2 text-sm font-medium rounded-md transition-colors
          ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }
        `}
        title="Pick color from canvas"
      >
        <svg
          className="w-4 h-4 inline-block mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          />
        </svg>
        Eyedropper
      </button>

      {isActive && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-0"
            onLoad={captureCanvas}
          />
          <div
            className="fixed w-6 h-6 border-2 border-white rounded-full pointer-events-none"
            style={{
              left: cursorPosition.x - 12,
              top: cursorPosition.y - 12,
              boxShadow: "0 0 0 1px black, inset 0 0 0 1px black",
            }}
          />
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded text-sm">
            Click to pick color • ESC to cancel
          </div>
        </div>
      )}
    </div>
  );
};
