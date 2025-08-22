import Image from "next/image";
import { CSSProperties } from "react";

import { ComponentNode } from "../../types/artifact";

interface ComponentRendererProps {
  node: ComponentNode;
  activeBreakpoint: "base" | "sm" | "md" | "lg";
}

export const ComponentRenderer = ({ node, activeBreakpoint }: ComponentRendererProps) => {
  // Combine base styles with responsive overrides
  const combinedStyles = {
    ...node.styles,
    ...(activeBreakpoint !== "base" && node.responsiveStyles?.[activeBreakpoint]),
  } as CSSProperties;

  switch (node.type) {
    case "text":
      return (
        <span className="block p-2 text-gray-800" style={combinedStyles}>
          {node.props.children || "Text Component"}
        </span>
      );

    case "button":
      return (
        <button
          className="w-full h-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          style={combinedStyles}
        >
          {node.props.children || "Button"}
        </button>
      );

    case "input":
      return (
        <input
          className="w-full h-full border border-gray-300 rounded px-3 py-2"
          placeholder={node.props.placeholder || "Input field"}
          style={combinedStyles}
        />
      );

    case "container":
      return (
        <div
          className="w-full h-full bg-white border border-gray-200 rounded p-2"
          style={combinedStyles}
        >
          {node.children?.map((child) => (
            <ComponentRenderer key={child.id} node={child} activeBreakpoint={activeBreakpoint} />
          ))}
        </div>
      );

    case "image":
      return (
        <Image
          className="w-full h-full object-cover rounded"
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
        <div className="w-full h-full bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
          <span className="text-gray-600 text-sm">{node.type}</span>
        </div>
      );
  }
};
