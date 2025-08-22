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
      <h3 className="mb-4 text-lg font-semibold">State Management</h3>
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          placeholder="State Key"
          value={stateKey}
          onChange={e => setStateKey(e.target.value)}
          className="w-1/2 rounded border p-2"
        />
        <input
          type="text"
          placeholder="Default Value"
          value={stateValue}
          onChange={e => setStateValue(e.target.value)}
          className="w-1/2 rounded border p-2"
        />
      </div>
      <button
        onClick={handleAddState}
        className="mb-2 w-full rounded bg-blue-600 p-2 text-white"
        disabled={!stateKey}
      >
        Add State Variable
      </button>
      <button
        onClick={handleUseState}
        className="w-full rounded bg-green-600 p-2 text-white"
        disabled={!selectedNode || !stateKey}
      >
        Use State in Selected Component
      </button>
    </div>
  );
};
