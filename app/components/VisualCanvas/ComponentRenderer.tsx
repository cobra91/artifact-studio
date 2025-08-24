import Image from "next/image";
import { CSSProperties, useEffect, useState } from "react";

import {
  applyResponsiveOverrides,
  generateResponsiveStyles,
} from "../../lib/responsiveStyles";
import { ComponentNode } from "../../types/artifact";

interface ComponentRendererProps {
  node: ComponentNode;
  activeBreakpoint: "base" | "sm" | "md" | "lg";
  isEditMode: boolean;
}

export const ComponentRenderer = ({
  node,
  activeBreakpoint,
  isEditMode,
}: ComponentRendererProps) => {
  // Fix hydration mismatch by only applying responsive styles after client-side mount
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate default responsive styles for the component type
  const defaultResponsiveStyles = generateResponsiveStyles(node.type);

  // Only apply responsive overrides on client side to avoid hydration mismatch
  const responsiveOverrides = isClient
    ? applyResponsiveOverrides(
        { ...defaultResponsiveStyles.base, ...node.styles },
        node.responsiveStyles || defaultResponsiveStyles,
        activeBreakpoint
      )
    : defaultResponsiveStyles.base;

  // Filter out responsive styles that would override custom styles (only on client)
  const filteredResponsiveOverrides = isClient
    ? { ...responsiveOverrides }
    : {};
  if (isClient) {
    Object.keys(node.styles).forEach(key => {
      if (filteredResponsiveOverrides[key]) {
        delete filteredResponsiveOverrides[key];
      }
    });
  }

  const combinedStyles = {
    ...defaultResponsiveStyles.base,
    ...(isClient ? filteredResponsiveOverrides : {}),
    ...node.styles, // Apply custom styles LAST to override responsive styles
    transform: node.rotation ? `rotate(${node.rotation}deg)` : undefined,
  } as CSSProperties;

  switch (node.type) {
    case "text":
      return (
        <span
          className={`block p-2 ${isEditMode ? "pointer-events-none" : ""}`}
          style={{
            ...combinedStyles,
            color: combinedStyles.color || "#ffffff",
            backgroundColor: combinedStyles.backgroundColor || "#374151",
            fontWeight: combinedStyles.fontWeight || "600",
            textAlign: combinedStyles.textAlign || "left",
            display: "flex",
            alignItems: "center",
            minHeight: "20px",
          }}
          onMouseDown={isEditMode ? e => e.stopPropagation() : undefined}
        >
          {node.props.children || "Text Component"}
        </span>
      );

    case "button":
      return (
        <button
          className={`h-full w-full rounded px-4 py-2 ${isEditMode ? "pointer-events-none" : ""}`}
          style={{
            ...combinedStyles,
            color: combinedStyles.color || "white",
            // Force the backgroundColor to be applied last
            backgroundColor:
              node.styles.backgroundColor ||
              combinedStyles.backgroundColor ||
              "#3b82f6",
          }}
        >
          {node.props.children || "Button"}
        </button>
      );

    case "input":
      return (
        <input
          className={`h-full w-full rounded px-3 py-2 ${isEditMode ? "pointer-events-none" : ""}`}
          type={String(node.props.type) || "text"}
          placeholder={node.props.placeholder || "Input field"}
          min={node.props.min ? String(node.props.min) : undefined}
          max={node.props.max ? String(node.props.max) : undefined}
          step={node.props.step ? String(node.props.step) : undefined}
          value={node.props.value ? String(node.props.value) : undefined}
          style={{
            ...combinedStyles,
            border: combinedStyles.border || "1px solid #d1d5db",
            // Special styling for range inputs (sliders)
            ...(node.props.type === "range" && {
              WebkitAppearance: "none",
              appearance: "none",
              background: "transparent",
              cursor: "pointer",
              "&::-webkit-slider-track": {
                background:
                  "linear-gradient(to right, #3b82f6 0%, #3b82f6 50%, #e5e7eb 50%, #e5e7eb 100%)",
                height: "8px",
                borderRadius: "4px",
                border: "none",
              },
              "&::-webkit-slider-thumb": {
                WebkitAppearance: "none",
                appearance: "none",
                height: "20px",
                width: "20px",
                borderRadius: "50%",
                background: "#3b82f6",
                cursor: "pointer",
                border: "2px solid #ffffff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              },
              "&::-moz-range-track": {
                background:
                  "linear-gradient(to right, #3b82f6 0%, #3b82f6 50%, #e5e7eb 50%, #e5e7eb 100%)",
                height: "8px",
                borderRadius: "4px",
                border: "none",
              },
              "&::-moz-range-thumb": {
                height: "20px",
                width: "20px",
                borderRadius: "50%",
                background: "#3b82f6",
                cursor: "pointer",
                border: "2px solid #ffffff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              },
            }),
          }}
        />
      );

    case "container":
      return (
        <div
          className={`h-full w-full rounded border border-gray-200 bg-white p-2 ${isEditMode ? "pointer-events-auto" : ""}`}
          style={combinedStyles}
        >
          {node.children?.map(child => (
            <ComponentRenderer
              key={child.id}
              node={child}
              activeBreakpoint={activeBreakpoint}
              isEditMode={isEditMode}
            />
          ))}
        </div>
      );

    case "image":
      return (
        <Image
          className={`h-full w-full rounded object-cover ${isEditMode ? "pointer-events-none" : ""}`}
          src={
            node.props.src || "https://via.placeholder.com/300x200?text=Image"
          }
          alt={node.props.alt || "Image component"}
          style={combinedStyles}
          width={node.styles?.width ? parseInt(String(node.styles.width)) : 300}
          height={
            node.styles?.height ? parseInt(String(node.styles.height)) : 200
          }
        />
      );

    default:
      return (
        <div
          className={`flex h-full w-full items-center justify-center rounded border border-gray-300 bg-gray-600 ${isEditMode ? "pointer-events-none" : ""}`}
        >
          <span className="text-sm">{node.type}</span>
        </div>
      );
  }
};
