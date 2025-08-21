"use client";

import { useMemo } from "react";

import { ComponentNode } from "../types/artifact";

interface PerformancePanelProps {
  selectedNode: ComponentNode | null;
}

export const PerformancePanel = ({ selectedNode }: PerformancePanelProps) => {
  const performanceMetrics = useMemo(() => {
    if (!selectedNode) return null;

    // Simulate render time based on component complexity
    const renderTime = Math.floor(JSON.stringify(selectedNode).length / 100);

    // Simulate bundle size based on props and styles
    const bundleSize = (JSON.stringify(selectedNode.props).length + JSON.stringify(selectedNode.styles).length) / 1024;

    const suggestions = [];
    if (renderTime > 20) {
      suggestions.push("Consider breaking down this component into smaller parts.");
    }
    if (bundleSize > 5) {
      suggestions.push("Try to reduce the amount of props and styles.");
    }

    return { renderTime, bundleSize: bundleSize.toFixed(2), suggestions };
  }, [selectedNode]);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Performance</h3>
      {selectedNode && performanceMetrics ? (
        <div>
          <div className="mb-4">
            <p className="font-semibold">Render Time:</p>
            <p>{performanceMetrics.renderTime}ms</p>
          </div>
          <div className="mb-4">
            <p className="font-semibold">Estimated Bundle Size:</p>
            <p>{performanceMetrics.bundleSize} KB</p>
          </div>
          {performanceMetrics.suggestions.length > 0 && (
            <div>
              <p className="font-semibold">Optimization Suggestions:</p>
              <ul className="list-disc list-inside">
                {performanceMetrics.suggestions.map((s, i) => (
                  <li key={i} className="text-sm">{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p>Select a component to see performance metrics.</p>
      )}
    </div>
  );
};
