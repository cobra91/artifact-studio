"use client";

import React, { useEffect, useState } from "react";

import { performanceMonitor } from "../lib/performanceUtils";

interface PerformanceMetrics {
  name: string;
  duration: number;
  memoryUsage: number;
  operationsPerSecond: number;
  timestamp: number;
}

interface PerformanceMonitorProps {
  isActive?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isActive = true,
  showDetails = false,
  className = "",
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [currentMemory, setCurrentMemory] = useState<{
    used: number;
    total: number;
    limit: number;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const updateInterval = setInterval(() => {
      const memoryInfo = performanceMonitor.getMemoryUsage();
      setCurrentMemory({
        used: Math.round((memoryInfo.usedJSHeapSize / 1024 / 1024) * 100) / 100,
        total:
          Math.round((memoryInfo.totalJSHeapSize / 1024 / 1024) * 100) / 100,
        limit:
          Math.round((memoryInfo.jsHeapSizeLimit / 1024 / 1024) * 100) / 100,
      });
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [isActive]);

  const startRecording = () => {
    setIsRecording(true);
    setMetrics([]);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const clearMetrics = () => {
    setMetrics([]);
  };

  const exportMetrics = () => {
    const dataStr = JSON.stringify(metrics, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `performance-metrics-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const getMemoryUsagePercentage = () => {
    if (!currentMemory) return 0;
    return (currentMemory.used / currentMemory.limit) * 100;
  };

  const getMemoryStatus = () => {
    const percentage = getMemoryUsagePercentage();
    if (percentage > 80) return "critical";
    if (percentage > 60) return "warning";
    return "normal";
  };

  if (!isActive) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 rounded-lg border bg-white shadow-lg dark:bg-gray-800 ${className}`}
    >
      <div className="min-w-80 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Monitor
          </h3>
          <div className="flex space-x-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="rounded bg-green-500 px-3 py-1 text-sm text-white transition-colors hover:bg-green-600"
              >
                Start
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="rounded bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
              >
                Stop
              </button>
            )}
            <button
              onClick={clearMetrics}
              className="rounded bg-gray-500 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-600"
            >
              Clear
            </button>
            <button
              onClick={exportMetrics}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
            >
              Export
            </button>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Memory Usage
            </span>
            {currentMemory && (
              <span className="text-sm text-gray-700">
                {currentMemory.used}MB / {currentMemory.limit}MB
              </span>
            )}
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                getMemoryStatus() === "critical"
                  ? "bg-red-500"
                  : getMemoryStatus() === "warning"
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${getMemoryUsagePercentage()}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {getMemoryStatus() === "critical" &&
              "Critical: High memory usage detected"}
            {getMemoryStatus() === "warning" && "Warning: Memory usage is high"}
            {getMemoryStatus() === "normal" && "Normal memory usage"}
          </div>
        </div>

        {/* Performance Metrics */}
        {showDetails && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Recent Metrics ({metrics.length})
            </h4>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {metrics.slice(-10).map((metric, index) => (
                <div
                  key={index}
                  className="rounded bg-gray-50 p-2 text-xs dark:bg-gray-700"
                >
                  <div className="flex justify-between">
                    <span className="truncate font-medium">{metric.name}</span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {metric.duration.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {metric.operationsPerSecond.toFixed(0)} ops/s •{" "}
                    {metric.memoryUsage.toFixed(1)}MB
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {metrics.length > 0 && (
          <div className="border-t pt-3 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">
                  Total Operations
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {metrics.length}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">
                  Avg. Ops/sec
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {metrics.length > 0
                    ? (
                        metrics.reduce(
                          (sum, m) => sum + m.operationsPerSecond,
                          0
                        ) / metrics.length
                      ).toFixed(0)
                    : "0"}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">
                  Avg. Duration
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {metrics.length > 0
                    ? (
                        metrics.reduce((sum, m) => sum + m.duration, 0) /
                        metrics.length
                      ).toFixed(2)
                    : "0"}
                  ms
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">
                  Peak Memory
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {metrics.length > 0
                    ? Math.max(...metrics.map(m => m.memoryUsage)).toFixed(1)
                    : "0"}
                  MB
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Recording...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook for using performance monitoring in components
export const usePerformanceMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMeasurement = (name: string) => {
    performanceMonitor.startMeasurement(name);
    setIsMonitoring(true);
  };

  const endMeasurement = (name: string) => {
    const metrics = performanceMonitor.endMeasurement(name);
    setIsMonitoring(false);
    return metrics;
  };

  const measureExecutionTime = async <T,>(
    fn: () => Promise<T>,
    name: string
  ): Promise<{ result: T; metrics: any }> => {
    startMeasurement(name);
    try {
      const result = await fn();
      const metrics = endMeasurement(name);
      return { result, metrics };
    } catch (error) {
      endMeasurement(name);
      throw error;
    }
  };

  return {
    isMonitoring,
    startMeasurement,
    endMeasurement,
    measureExecutionTime,
    memoryUsage: performanceMonitor.getMemoryUsage(),
  };
};
