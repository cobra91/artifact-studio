"use client";

import { useState } from "react";

import { ComponentNode } from "../types/artifact";

interface ApiConnectionPanelProps {
  selectedNode: ComponentNode | null;
  onUpdateNode: (_updates: Partial<ComponentNode>) => void;
}

export const ApiConnectionPanel = ({
  selectedNode,
  onUpdateNode,
}: ApiConnectionPanelProps) => {
  const [apiUrl, setApiUrl] = useState("");

  const handleConnectApi = () => {
    if (selectedNode && apiUrl) {
      onUpdateNode({
        props: {
          ...selectedNode.props,
          "data-source": apiUrl,
        },
      });
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">API Connection</h3>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="API URL"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={!selectedNode}
        />
      </div>
      <button
        onClick={handleConnectApi}
        className="w-full p-2 bg-blue-600 text-white rounded"
        disabled={!selectedNode || !apiUrl}
      >
        Connect API
      </button>
    </div>
  );
};
