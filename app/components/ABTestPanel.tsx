"use client";

import { useEffect, useState } from "react";

import { ABTest, abTestingModule } from "../lib/abTesting";
import { ComponentNode } from "../types/artifact";

interface ABTestPanelProps {
  selectedNode: ComponentNode | null;
}

export const ABTestPanel = ({ selectedNode }: ABTestPanelProps) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [newTestName, setNewTestName] = useState("");
  const [newTestMetric, setNewTestMetric] = useState("");

  useEffect(() => {
    if (selectedNode) {
      setTests(abTestingModule.getTestsForComponent(selectedNode.id));
    }
  }, [selectedNode]);

  const handleCreateTest = () => {
    if (!selectedNode || !newTestName.trim() || !newTestMetric.trim()) return;
    abTestingModule.createTest(newTestName, selectedNode.id, newTestMetric);
    setTests(abTestingModule.getTestsForComponent(selectedNode.id));
    setNewTestName("");
    setNewTestMetric("");
  };

  if (!selectedNode) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-gray-500">
        <div className="text-center">
          <div className="mb-2 text-4xl">📊</div>
          <p>Select a component to create an A/B test</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          A/B Testing
        </h3>
        <div className="rounded border p-2">
          <h4 className="mb-2 text-sm font-medium">New Test</h4>
          <input
            type="text"
            placeholder="Test name..."
            className="mb-2 w-full rounded border p-2"
            value={newTestName}
            onChange={e => setNewTestName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tracking metric (e.g., clicks)"
            className="mb-2 w-full rounded border p-2"
            value={newTestMetric}
            onChange={e => setNewTestMetric(e.target.value)}
          />
          <button
            onClick={handleCreateTest}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create Test
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {tests.map(test => (
          <div key={test.id} className="rounded border p-2">
            <h4 className="font-semibold">{test.name}</h4>
            <div className="text-xs text-gray-500">
              Metric: {test.trackingMetric}
            </div>
            {/* Variant management will be added here */}
          </div>
        ))}
      </div>
    </div>
  );
};
