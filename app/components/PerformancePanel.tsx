"use client";

import React, { useEffect, useState } from "react";

import { useCanvasStore } from "../lib/canvasStore";
import { createComponentNode } from "../lib/componentOperations";
import {
  BenchmarkResult,
  BenchmarkRunner,
  createPerformanceTestSuite,
  performanceMonitor,
  PerformanceThresholds,
} from "../lib/performanceUtils";
import { ComponentNode, ComponentType } from "../types/artifact";

const PERFORMANCE_THRESHOLDS: Record<string, PerformanceThresholds> = {
  "component-rendering-1000": {
    maxDuration: 5000,
    maxMemoryUsage: 100 * 1024 * 1024,
    minOperationsPerSecond: 10,
    maxAvgOperationTime: 100,
  },
  "canvas-interactions-drag": {
    maxDuration: 2000,
    maxMemoryUsage: 50 * 1024 * 1024,
    minOperationsPerSecond: 30,
    maxAvgOperationTime: 50,
  },
  "ai-generation": {
    maxDuration: 30000,
    maxMemoryUsage: 200 * 1024 * 1024,
  },
};

export const PerformancePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "benchmarks" | "monitoring" | "reports"
  >("benchmarks");
  const [runningBenchmark, setRunningBenchmark] = useState<string | null>(null);
  const [benchmarkResults, setBenchmarkResults] = useState<
    Map<string, BenchmarkResult>
  >(new Map());
  const [performanceSuite] = useState(() =>
    createPerformanceTestSuite("Visual Canvas Performance Suite")
  );
  const [benchmarkRunner] = useState(() => new BenchmarkRunner());

  // Initialize thresholds
  useEffect(() => {
    Object.entries(PERFORMANCE_THRESHOLDS).forEach(([name, thresholds]) => {
      performanceSuite.setThresholds(name, thresholds);
    });
  }, [performanceSuite]);

  const runComponentRenderingBenchmark = async () => {
    const benchmarkName = "component-rendering-1000";
    setRunningBenchmark(benchmarkName);

    try {
      // Create 1000 test components
      const testComponents: ComponentNode[] = [];
      for (let i = 0; i < 1000; i++) {
        testComponents.push(
          createComponentNode(
            "container" as ComponentType,
            `component_${i}`,
            { text: `Component ${i}` },
            {},
            { x: (i % 50) * 120, y: Math.floor(i / 50) * 80 },
            { width: 100, height: 60 }
          )
        );
      }

      const setup = async () => {
        useCanvasStore.setState({
          components: testComponents,
          selectedNodes: testComponents.slice(0, 10).map(c => c.id),
        });
      };

      const benchmarkFn = async () => {
        // Simulate rendering cycle
        const components = useCanvasStore.getState().components;
        useCanvasStore.setState({ components: [...components] });
      };

      const result = await benchmarkRunner.runBenchmark(
        benchmarkName,
        setup,
        benchmarkFn,
        50
      );

      setBenchmarkResults(prev => new Map(prev).set(benchmarkName, result));
      performanceSuite.addBenchmark(benchmarkName, result);
    } catch (error) {
      console.error(`Error running ${benchmarkName} benchmark:`, error);
    } finally {
      setRunningBenchmark(null);
    }
  };

  const runCanvasInteractionBenchmark = async () => {
    const benchmarkName = "canvas-interactions-drag";
    setRunningBenchmark(benchmarkName);

    try {
      // Create test components
      const testComponents: ComponentNode[] = [];
      for (let i = 0; i < 100; i++) {
        testComponents.push(
          createComponentNode(
            "container" as ComponentType,
            `drag_component_${i}`,
            {},
            {},
            { x: i * 120, y: 0 },
            { width: 100, height: 60 }
          )
        );
      }

      const selectedIds = testComponents.slice(0, 10).map(c => c.id);

      const setup = async () => {
        useCanvasStore.setState({
          components: testComponents,
          selectedNodes: selectedIds,
        });
      };

      const benchmarkFn = async () => {
        // Simulate drag operation
        const dx = 5,
          dy = 5;

        selectedIds.forEach(id => {
          const component = testComponents.find(c => c.id === id);
          if (component) {
            const newPosition = {
              x: component.position.x + dx,
              y: component.position.y + dy,
            };
            useCanvasStore.setState(state => ({
              components: state.components.map(c =>
                c.id === id ? { ...c, position: newPosition } : c
              ),
            }));
          }
        });
      };

      const result = await benchmarkRunner.runBenchmark(
        benchmarkName,
        setup,
        benchmarkFn,
        100
      );

      setBenchmarkResults(prev => new Map(prev).set(benchmarkName, result));
      performanceSuite.addBenchmark(benchmarkName, result);
    } catch (error) {
      console.error(`Error running ${benchmarkName} benchmark:`, error);
    } finally {
      setRunningBenchmark(null);
    }
  };

  const runMemoryLeakBenchmark = async () => {
    const benchmarkName = "memory-leak-detection";
    setRunningBenchmark(benchmarkName);

    try {
      const setup = async () => {
        useCanvasStore.setState({
          components: [],
          selectedNodes: [],
        });
      };

      const benchmarkFn = async () => {
        // Simulate component creation and deletion cycle
        const newComponents = [];
        for (let i = 0; i < 50; i++) {
          newComponents.push(
            createComponentNode(
              "container" as ComponentType,
              `temp_${Date.now()}_${i}`,
              {},
              {},
              { x: i * 10, y: i * 10 },
              { width: 50, height: 50 }
            )
          );
        }

        useCanvasStore.setState({ components: newComponents });
        useCanvasStore.setState({ components: [] });
      };

      const result = await benchmarkRunner.runMemoryBenchmark(
        benchmarkName,
        setup,
        benchmarkFn,
        20
      );

      setBenchmarkResults(prev => new Map(prev).set(benchmarkName, result));
      performanceSuite.addBenchmark(benchmarkName, result);
    } catch (error) {
      console.error(`Error running ${benchmarkName} benchmark:`, error);
    } finally {
      setRunningBenchmark(null);
    }
  };

  const runAllBenchmarks = async () => {
    await runComponentRenderingBenchmark();
    await runCanvasInteractionBenchmark();
    await runMemoryLeakBenchmark();
  };

  const generateReport = () => {
    const report = performanceSuite.generateReport();
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getResultStatus = (result: BenchmarkResult) => {
    const thresholds = PERFORMANCE_THRESHOLDS[result.name];
    if (!thresholds) return "unknown";

    const violations = performanceSuite.runValidations().get(result.name) || [];
    return violations.length > 0 ? "fail" : "pass";
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(2)} ms`;
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <h2 className="mb-2 text-2xl font-bold text-white">
          Performance Dashboard
        </h2>
        <p className="text-blue-100">
          Monitor and benchmark your visual canvas performance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(["benchmarks", "monitoring", "reports"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "ray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "benchmarks" && (
          <div className="space-y-6">
            {/* Benchmark Controls */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={runAllBenchmarks}
                disabled={!!runningBenchmark}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {runningBenchmark ? "Running..." : "Run All Benchmarks"}
              </button>
              <button
                onClick={runComponentRenderingBenchmark}
                disabled={!!runningBenchmark}
                className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Component Rendering
              </button>
              <button
                onClick={runCanvasInteractionBenchmark}
                disabled={!!runningBenchmark}
                className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Canvas Interactions
              </button>
              <button
                onClick={runMemoryLeakBenchmark}
                disabled={!!runningBenchmark}
                className="rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Memory Analysis
              </button>
            </div>

            {/* Running Benchmark Indicator */}
            {runningBenchmark && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-center space-x-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Running benchmark: {runningBenchmark}
                  </span>
                </div>
              </div>
            )}

            {/* Benchmark Results */}
            <div className="grid gap-4">
              {Array.from(benchmarkResults.entries()).map(([name, result]) => {
                const status = getResultStatus(result);
                return (
                  <div
                    key={name}
                    className={`rounded-lg border p-4 ${
                      status === "fail"
                        ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                        : status === "pass"
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 capitalize dark:text-white">
                        {name.replace(/-/g, " ")}
                      </h3>
                      <div
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          status === "fail"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : status === "pass"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {status.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <div className="ay-400">
                          Duration
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formatTime(result.duration)}
                        </div>
                      </div>
                      <div>
                        <div className="ay-400">
                          Ops/sec
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {result.operationsPerSecond.toFixed(0)}
                        </div>
                      </div>
                      <div>
                        <div className="ay-400">
                          Memory
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formatBytes(result.memoryUsage.usedJSHeapSize)}
                        </div>
                      </div>
                      <div>
                        <div className="ay-400">
                          Avg Time
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formatTime(result.avgOperationTime)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-600">
                      <div className="grid grid-cols-3 gap-4 text-xs ay-400">
                        <div>Min: {formatTime(result.minTime)}</div>
                        <div>Max: {formatTime(result.maxTime)}</div>
                        <div>P95: {formatTime(result.p95Time)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "monitoring" && (
          <div className="space-y-6">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                Real-time Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {performanceMonitor.getMemoryUsage().usedJSHeapSize /
                      1024 /
                      1024 >
                    0
                      ? (
                          performanceMonitor.getMemoryUsage().usedJSHeapSize /
                          1024 /
                          1024
                        ).toFixed(1)
                      : "0"}
                  </div>
                  <div className="text-sm ay-400">
                    MB Used
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMonitor.getMemoryUsage().totalJSHeapSize /
                      1024 /
                      1024 >
                    0
                      ? (
                          performanceMonitor.getMemoryUsage().totalJSHeapSize /
                          1024 /
                          1024
                        ).toFixed(1)
                      : "0"}
                  </div>
                  <div className="text-sm ay-400">
                    MB Total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {benchmarkResults.size}
                  </div>
                  <div className="text-sm ay-400">
                    Benchmarks
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {
                      Array.from(benchmarkResults.values()).filter(
                        r => getResultStatus(r) === "fail"
                      ).length
                    }
                  </div>
                  <div className="text-sm ay-400">
                    Failed
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance Reports
              </h3>
              <button
                onClick={generateReport}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Generate Report
              </button>
            </div>

            {benchmarkResults.size > 0 && (
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <pre className="font-mono text-sm whitespace-pre-wrap  dark:text-gray-300">
                  {performanceSuite.generateReport()}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
