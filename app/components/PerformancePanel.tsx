"use client";

import { ComponentNode } from "../types/artifact";

interface PerformancePanelProps {
  selectedNode: ComponentNode | null;
}

export const PerformancePanel = ({
  selectedNode,
}: PerformancePanelProps) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Performance</h3>
      {selectedNode ? (
        <div>
          <p>Render Time: 12ms</p>
          <p>Bundle Size: 2.5kb</p>
        </div>
      ) : (
        <p>Select a component to see performance metrics.</p>
      )}
    </div>
  );
};
