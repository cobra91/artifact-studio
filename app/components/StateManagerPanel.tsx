"use client";

import { useState } from "react";

import { ComponentNode } from "../types/artifact";

interface StateManagerPanelProps {
  selectedNode: ComponentNode | null;
  onUpdateNode: (_updates: Partial<ComponentNode>) => void;
}

export const StateManagerPanel = ({
  selectedNode,
  onUpdateNode,
}: StateManagerPanelProps) => {
  const [stateKey, setStateKey] = useState("");
  const [stateValue, setStateValue] = useState("");

  const handleAddState = () => {
    if (selectedNode && stateKey) {
      onUpdateNode({
        props: {
          ...selectedNode.props,
          [stateKey]: stateValue,
        },
      });
      setStateKey("");
      setStateValue("");
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">State Management</h3>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="State Key"
          value={stateKey}
          onChange={(e) => setStateKey(e.target.value)}
          className="w-1/2 p-2 border rounded"
          disabled={!selectedNode}
        />
        <input
          type="text"
          placeholder="State Value"
          value={stateValue}
          onChange={(e) => setStateValue(e.target.value)}
          className="w-1/2 p-2 border rounded"
          disabled={!selectedNode}
        />
      </div>
      <button
        onClick={handleAddState}
        className="w-full p-2 bg-blue-600 text-white rounded"
        disabled={!selectedNode || !stateKey}
      >
        Add State
      </button>
    </div>
  );
};
