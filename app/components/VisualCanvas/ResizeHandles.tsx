import { CSSProperties } from "react";

interface ResizeHandleProps {
  nodeId: string;
  isSelected: boolean;
  onResize: (
    nodeId: string,
    direction: string,
    event: React.MouseEvent,
  ) => void;
  onRotate: (event: React.MouseEvent) => void;
}

export const ResizeHandles = ({
  nodeId,
  isSelected,
  onResize,
  onRotate,
}: ResizeHandleProps) => {
  if (!isSelected) return null;

  const handles = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

  return (
    <>
      {handles.map((direction) => (
        <div
          key={direction}
          className="absolute w-2 h-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 shadow-md"
          style={getResizeHandleStyle(direction)}
          onMouseDown={(e) => onResize(nodeId, direction, e)}
        />
      ))}
      {/* Rotation handle */}
      <div
        className="absolute w-3 h-3 bg-gray-600 rounded-full cursor-pointer hover:bg-gray-700 shadow-md"
        style={{
          top: -10,
          left: "50%",
          transform: "translateX(-50%)",
        }}
        onMouseDown={onRotate}
      />
    </>
  );
};

const getResizeHandleStyle = (direction: string): CSSProperties => {
  const style: CSSProperties = {
    pointerEvents: "auto",
  };

  if (direction.includes("n")) style.top = -4;
  if (direction.includes("s")) style.bottom = -4;
  if (direction.includes("w")) style.left = -4;
  if (direction.includes("e")) style.right = -4;

  if (!direction.includes("n") && !direction.includes("s")) {
    style.top = "50%";
    style.transform = "translateY(-50%)";
  }
  if (!direction.includes("e") && !direction.includes("w")) {
    style.left = "50%";
    style.transform = "translateX(-50%)";
  }

  // Combine transforms when both are needed
  if (
    !direction.includes("n") &&
    !direction.includes("s") &&
    !direction.includes("e") &&
    !direction.includes("w")
  ) {
    style.transform = "translate(-50%, -50%)";
  }

  return style;
};
