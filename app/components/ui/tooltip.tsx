"use client";

import { ReactNode, useState } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  position?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  delay?: number;
  className?: string;
  showArrow?: boolean;
  maxWidth?: number;
}

export const Tooltip = ({
  children,
  content,
  position = "top",
  delay = 300,
  className = "",
  showArrow = true,
  maxWidth = 200,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    const baseClasses =
      "absolute z-[9999] px-3 py-2 text-sm rounded-lg shadow-lg backdrop-blur-sm";

    switch (position) {
      case "top":
        return `${baseClasses} bottom-full left-1/2 mb-2 -translate-x-1/2`;
      case "bottom":
        return `${baseClasses} top-full left-1/2 mt-2 -translate-x-1/2`;
      case "left":
        return `${baseClasses} top-1/2 right-full mr-2 -translate-y-1/2`;
      case "right":
        return `${baseClasses} top-1/2 left-full ml-2 -translate-y-1/2`;
      case "top-left":
        return `${baseClasses} bottom-full left-0 mb-2`;
      case "top-right":
        return `${baseClasses} bottom-full right-0 mb-2`;
      case "bottom-left":
        return `${baseClasses} top-full left-0 mt-2`;
      case "bottom-right":
        return `${baseClasses} top-full right-0 mt-2`;
      default:
        return `${baseClasses} bottom-full left-1/2 mb-2 -translate-x-1/2`;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = "absolute w-2 h-2 bg-gray-900 transform rotate-45";

    switch (position) {
      case "top":
        return `${baseClasses} top-full left-1/2 -mt-1 -translate-x-1/2`;
      case "bottom":
        return `${baseClasses} bottom-full left-1/2 -mb-1 -translate-x-1/2`;
      case "left":
        return `${baseClasses} left-full top-1/2 -ml-1 -translate-y-1/2`;
      case "right":
        return `${baseClasses} right-full top-1/2 -mr-1 -translate-y-1/2`;
      case "top-left":
        return `${baseClasses} top-full left-3 -mt-1`;
      case "top-right":
        return `${baseClasses} top-full right-3 -mt-1`;
      case "bottom-left":
        return `${baseClasses} bottom-full left-3 -mb-1`;
      case "bottom-right":
        return `${baseClasses} bottom-full right-3 -mb-1`;
      default:
        return `${baseClasses} top-full left-1/2 -mt-1 -translate-x-1/2`;
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          className={`${getPositionClasses()} ${className}`}
          style={{ maxWidth: `${maxWidth}px` }}
        >
          <div className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white">
            {content}
            {showArrow && <div className={getArrowClasses()} />}
          </div>
        </div>
      )}
    </div>
  );
};

// Component for tooltips with entrance animation
export const AnimatedTooltip = ({ children, ...props }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <div
        className={`absolute z-[9999] transition-all duration-200 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-1 scale-95 opacity-0"
        }`}
        style={{
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: "8px",
        }}
      >
        <div className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg backdrop-blur-sm">
          {props.content}
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform bg-gray-900" />
        </div>
      </div>
    </div>
  );
};
