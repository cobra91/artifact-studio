"use client";

import { useEffect, useState } from "react";

import { analytics } from "../lib/analytics";

interface AnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsPanel = ({ isOpen, onClose }: AnalyticsPanelProps) => {
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "components" | "features" | "performance"
  >("overview");

  useEffect(() => {
    if (isOpen) {
      setStats(analytics.getSessionStats());

      // Update stats every 5 seconds when panel is open
      const interval = setInterval(() => {
        setStats(analytics.getSessionStats());
      }, 5000);

      return () => clearInterval(interval);
    }
    
    // Always return a cleanup function or undefined
    return undefined;
  }, [isOpen]);

  if (!isOpen || !stats) return null;

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const downloadData = () => {
    const data = analytics.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    if (confirm("Are you sure you want to clear all analytics data?")) {
      analytics.clearData();
      setStats(analytics.getSessionStats());
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Analytics Dashboard
            </h2>
            <button onClick={onClose} className="hover: text-gray-500">
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex space-x-4">
            {[
              { id: "overview", label: "Overview" },
              { id: "components", label: "Components" },
              { id: "features", label: "Features" },
              { id: "performance", label: "Performance" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="text-sm font-medium text-blue-600">
                    Session Duration
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatDuration(stats.duration)}
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="text-sm font-medium text-green-600">
                    Total Events
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {stats.eventCount}
                  </div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4">
                  <div className="text-sm font-medium text-purple-600">
                    Component Actions
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {stats.componentActions}
                  </div>
                </div>
                <div className="rounded-lg bg-orange-50 p-4">
                  <div className="text-sm font-medium text-orange-600">
                    Features Used
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {Object.keys(stats.featureUsage).length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "components" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Top Components</h3>
              {stats.topComponents.length > 0 ? (
                <div className="space-y-2">
                  {stats.topComponents.map((component: any, index: number) => (
                    <div
                      key={component.type}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div className="flex items-center">
                        <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="font-medium">{component.type}</span>
                      </div>
                      <span className="text-sm">{component.count} actions</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No component usage recorded yet.
                </p>
              )}
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Feature Usage</h3>
              {Object.keys(stats.featureUsage).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(stats.featureUsage)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([feature, count]) => (
                      <div
                        key={feature}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <span className="font-medium">{feature}</span>
                        <span className="text-sm">{count as number} uses</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500">No feature usage recorded yet.</p>
              )}
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Metrics</h3>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-sm">
                  Performance monitoring is active. Real-time metrics are
                  displayed in the performance monitor.
                </p>
                <div className="text-sm text-gray-500">
                  • Render time tracking
                  <br />
                  • FPS monitoring
                  <br />
                  • Memory usage (when available)
                  <br />• Component count tracking
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Data is stored locally and never sent to external servers.
            </div>
            <div className="space-x-2">
              <button
                onClick={downloadData}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Export Data
              </button>
              <button
                onClick={clearData}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
