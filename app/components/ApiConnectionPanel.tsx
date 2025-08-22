"use client";

import { useState } from "react";

import { ComponentNode } from "../types/artifact";

interface ApiConnectionPanelProps {
  selectedNode: ComponentNode | null;
  onUpdateNode: (_updates: Partial<ComponentNode>) => void;
  onFetchData: (_url: string, _key: string) => void;
}

export const ApiConnectionPanel = ({
  selectedNode,
  onUpdateNode,
  onFetchData,
}: ApiConnectionPanelProps) => {
  const [apiUrl, setApiUrl] = useState("");
  const [dataKey, setDataKey] = useState("");

  const handleConnectApi = () => {
    if (selectedNode && apiUrl && dataKey) {
      onFetchData(apiUrl, dataKey);
      onUpdateNode({
        props: {
          ...selectedNode.props,
          "data-source": `{${dataKey}}`,
        },
      });
    }
  };

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-semibold">API Connection</h3>
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          placeholder="API URL"
          value={apiUrl}
          onChange={e => setApiUrl(e.target.value)}
          className="w-full rounded border p-2"
          disabled={!selectedNode}
        />
        <input
          type="text"
          placeholder="Data Key"
          value={dataKey}
          onChange={e => setDataKey(e.target.value)}
          className="w-full rounded border p-2"
          disabled={!selectedNode}
        />
      </div>
      <button
        onClick={handleConnectApi}
        className="w-full rounded bg-blue-600 p-2 text-white"
        disabled={!selectedNode || !apiUrl || !dataKey}
      >
        Connect API
      </button>
    </div>
  );
};
