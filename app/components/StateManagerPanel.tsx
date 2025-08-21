"use client";

import { useState } from "react";

import { ComponentNode } from "../types/artifact";

interface StateManagerPanelProps {
  selectedNode: ComponentNode | null;
  onUpdateNode: (_updates: Partial<ComponentNode>) => void;
  onAddState: (_key: string, _value: any) => void;
}

export const StateManagerPanel = ({
  selectedNode,
  onUpdateNode,
  onAddState,
}: StateManagerPanelProps) => {
  const [stateKey, setStateKey] = useState("");
  const [stateValue, setStateValue] = useState("");

  const handleAddState = () => {
    if (stateKey) {
      onAddState(stateKey, stateValue);
      setStateKey("");
      setStateValue("");
    }
  };

  const handleUseState = () => {
    if (selectedNode && stateKey) {
      onUpdateNode({
        props: {
          ...selectedNode.props,
          children: `{${stateKey}}`,
        },
      });
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
        />
        <input
          type="text"
          placeholder="Default Value"
          value={stateValue}
          onChange={(e) => setStateValue(e.target.value)}
          className="w-1/2 p-2 border rounded"
        />
      </div>
      <button
        onClick={handleAddState}
        className="w-full p-2 bg-blue-600 text-white rounded mb-2"
        disabled={!stateKey}
      >
        Add State Variable
      </button>
      <button
        onClick={handleUseState}
        className="w-full p-2 bg-green-600 text-white rounded"
        disabled={!selectedNode || !stateKey}
      >
        Use State in Selected Component
      </button>
    </div>
  );
};
