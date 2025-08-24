"use client";

import { ChangeEvent, useState } from "react";

import { ComponentNode } from "../types/artifact";

interface AnimationPanelProps {
  selectedNode: ComponentNode | null;
  onUpdateNode: (_updates: Partial<ComponentNode>) => void;
}

export const AnimationPanel = ({
  selectedNode,
  onUpdateNode,
}: AnimationPanelProps) => {
  const [animation, setAnimation] = useState("");

  const handleAnimationChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newAnimation = e.target.value;
    setAnimation(newAnimation);
    if (selectedNode) {
      onUpdateNode({
        styles: {
          ...selectedNode.styles,
          animation: newAnimation,
        },
      });
    }
  };

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-semibold">Animations</h3>
      <select
        value={animation}
        onChange={handleAnimationChange}
        className="w-full rounded border bg-gray-800 p-2"
        disabled={!selectedNode}
      >
        <option value="">None</option>
        <option value="spin 1s linear infinite">Spin</option>
        <option value="ping 1s cubic-bezier(0, 0, 0.2, 1) infinite">
          Ping
        </option>
        <option value="bounce 1s infinite">Bounce</option>
      </select>
    </div>
  );
};
