"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
  fps: number;
  lastUpdate: number;
}

interface PerformanceMonitorProps {
  componentCount: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const PerformanceMonitor = ({
  componentCount,
  onMetricsUpdate,
}: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    fps: 60,
    lastUpdate: Date.now(),
  });
  const [isVisible, setIsVisible] = useState(false);

  const renderStartTime = useRef<number>(Date.now());
  const frameCount = useRef<number>(0);
  const lastFpsUpdate = useRef<number>(Date.now());

  // Monitor render performance
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;

    const newMetrics: PerformanceMetrics = {
      renderTime,
      componentCount,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined,
      fps: metrics.fps,
      lastUpdate: Date.now(),
    };

    setMetrics(newMetrics);
    onMetricsUpdate?.(newMetrics);
  }, [componentCount, onMetricsUpdate, metrics.fps]);

  // Monitor FPS
  useEffect(() => {
    let animationId: number;

    const updateFPS = () => {
      frameCount.current++;
      const now = Date.now();

      if (now - lastFpsUpdate.current >= 1000) {
        const fps = Math.round(
          (frameCount.current * 1000) / (now - lastFpsUpdate.current)
        );
        setMetrics(prev => ({ ...prev, fps }));
        frameCount.current = 0;
        lastFpsUpdate.current = now;
      }

      animationId = requestAnimationFrame(updateFPS);
    };

    updateFPS();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const getPerformanceStatus = useCallback(() => {
    if (metrics.renderTime > 100)
      return { status: "poor", color: "text-red-600" };
    if (metrics.renderTime > 50)
      return { status: "fair", color: "text-yellow-600" };
    return { status: "good", color: "text-green-600" };
  }, [metrics.renderTime]);

  const getFpsStatus = useCallback(() => {
    if (metrics.fps < 30) return { status: "poor", color: "text-red-600" };
    if (metrics.fps < 50) return { status: "fair", color: "text-yellow-600" };
    return { status: "good", color: "text-green-600" };
  }, [metrics.fps]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed right-4 bottom-4 z-40 rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700"
        title="Show Performance Monitor"
      >
        📊
      </button>
    );
  }

  const performanceStatus = getPerformanceStatus();
  const fpsStatus = getFpsStatus();

  return (
    <div className="fixed right-4 bottom-4 z-40 min-w-64 rounded-lg border bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Performance</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Render Time:</span>
          <span className={performanceStatus.color}>
            {metrics.renderTime.toFixed(1)}ms ({performanceStatus.status})
          </span>
        </div>

        <div className="flex justify-between">
          <span>Components:</span>
          <span className="text-gray-700">{metrics.componentCount}</span>
        </div>

        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={fpsStatus.color}>
            {metrics.fps} ({fpsStatus.status})
          </span>
        </div>

        {metrics.memoryUsage && (
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className="text-gray-700">
              {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
            </span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2">
          <div className="text-xs text-gray-500">Performance tips:</div>
          <ul className="mt-1 space-y-1 text-xs text-gray-600">
            {metrics.renderTime > 50 && <li>• Reduce component complexity</li>}
            {metrics.componentCount > 50 && (
              <li>• Consider component virtualization</li>
            )}
            {metrics.fps < 50 && (
              <li>• Optimize animations and interactions</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

  const handleMetricsUpdate = useCallback((newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);

    // Generate performance alerts
    const newAlerts: string[] = [];

    if (newMetrics.renderTime > 100) {
      newAlerts.push(
        "High render time detected. Consider optimizing component structure."
      );
    }

    if (newMetrics.componentCount > 100) {
      newAlerts.push(
        "Large number of components. Consider implementing virtualization."
      );
    }

    if (newMetrics.fps < 30) {
      newAlerts.push("Low FPS detected. Check for performance bottlenecks.");
    }

    setAlerts(newAlerts);
  }, []);

  return {
    metrics,
    alerts,
    handleMetricsUpdate,
  };
};
