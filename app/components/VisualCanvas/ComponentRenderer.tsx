import Image from "next/image";
import { CSSProperties } from "react";

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
  // Generate default responsive styles for the component type
  const defaultResponsiveStyles = generateResponsiveStyles(node.type);

  // Combine base styles with responsive overrides, but preserve custom styles
  const responsiveOverrides = applyResponsiveOverrides(
    { ...defaultResponsiveStyles.base, ...node.styles },
    node.responsiveStyles || defaultResponsiveStyles,
    activeBreakpoint
  );

  // Filter out responsive styles that would override custom styles
  const filteredResponsiveOverrides = { ...responsiveOverrides };
  Object.keys(node.styles).forEach(key => {
    if (filteredResponsiveOverrides[key]) {
      delete filteredResponsiveOverrides[key];
    }
  });

  const combinedStyles = {
    ...defaultResponsiveStyles.base,
    ...filteredResponsiveOverrides,
    ...node.styles, // Apply custom styles LAST to override responsive styles
    transform: node.rotation ? `rotate(${node.rotation}deg)` : undefined,
  } as CSSProperties;

  // Debug: Log styles for gradient debugging
  if (
    node.styles.backgroundColor &&
    node.styles.backgroundColor.includes("gradient")
  ) {
    console.log("🎨 Component styles:", node.styles);
    console.log("🎨 Combined styles:", combinedStyles);
  }

  switch (node.type) {
    case "text":
      return (
        <span
          className={`block p-2 text-gray-800 ${isEditMode ? "pointer-events-none" : ""}`}
          style={combinedStyles}
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
          placeholder={node.props.placeholder || "Input field"}
          style={{
            ...combinedStyles,
            border: combinedStyles.border || "1px solid #d1d5db",
          }}
        />
      );

    case "container":
      return (
        <div
          className={`h-full w-full rounded border border-gray-200 bg-white p-2 ${isEditMode ? "pointer-events-none" : ""}`}
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
          className={`flex h-full w-full items-center justify-center rounded border border-gray-300 bg-gray-200 ${isEditMode ? "pointer-events-none" : ""}`}
        >
          <span className="text-sm text-gray-600">{node.type}</span>
        </div>
      );
  }
};
