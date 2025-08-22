// Performance monitoring and benchmarking utilities
export interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: MemoryInfo;
  cpuTime?: number;
  customMetrics?: Record<string, any>;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface BenchmarkResult {
  name: string;
  duration: number;
  memoryUsage: MemoryInfo;
  operationsPerSecond: number;
  avgOperationTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
  p99Time: number;
  samples: number[];
  timestamp: number;
}

export interface PerformanceThresholds {
  maxDuration?: number;
  maxMemoryUsage?: number;
  minOperationsPerSecond?: number;
  maxAvgOperationTime?: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private memoryCheckpoints: Map<string, MemoryInfo> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasurement(name: string, customMetrics?: Record<string, any>): void {
    const startTime = performance.now();
    const memoryUsage = this.getMemoryUsage();

    this.metrics.set(name, {
      name,
      startTime,
      memoryUsage,
      customMetrics,
    });

    this.memoryCheckpoints.set(name, memoryUsage);
  }

  endMeasurement(name: string): PerformanceMetrics | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance measurement '${name}' not found`);
      return null;
    }

    const endTime = performance.now();
    const memoryUsage = this.getMemoryUsage();
    const duration = endTime - metric.startTime;

    const completedMetric: PerformanceMetrics = {
      ...metric,
      endTime,
      duration,
      memoryUsage,
    };

    this.metrics.set(name, completedMetric);
    return completedMetric;
  }

  getMemoryUsage(): MemoryInfo {
    if ("memory" in performance) {
      const mem = (performance as any).memory;
      return {
        usedJSHeapSize: mem.usedJSHeapSize,
        totalJSHeapSize: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
      };
    }
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
    };
  }

  getMemoryLeak(name: string): number {
    const startMemory = this.memoryCheckpoints.get(name);
    const currentMemory = this.getMemoryUsage();

    if (!startMemory) return 0;

    return currentMemory.usedJSHeapSize - startMemory.usedJSHeapSize;
  }

  clearMeasurement(name: string): void {
    this.metrics.delete(name);
    this.memoryCheckpoints.delete(name);
  }

  clearAll(): void {
    this.metrics.clear();
    this.memoryCheckpoints.clear();
  }
}

export class BenchmarkRunner {
  private monitor: PerformanceMonitor;

  constructor() {
    this.monitor = PerformanceMonitor.getInstance();
  }

  async runBenchmark(
    name: string,
    setup: () => Promise<void> | void,
    benchmarkFn: () => Promise<void> | void,
    iterations: number = 100,
    warmupIterations: number = 10
  ): Promise<BenchmarkResult> {
    // Setup phase
    await setup();

    // Warmup phase
    for (let i = 0; i < warmupIterations; i++) {
      await benchmarkFn();
    }

    // Force garbage collection if available
    if ("gc" in window) {
      (window as any).gc();
    }

    // Benchmark phase
    const samples: number[] = [];
    const startMemory = this.monitor.getMemoryUsage();

    for (let i = 0; i < iterations; i++) {
      const iterationName = `${name}_iteration_${i}`;
      this.monitor.startMeasurement(iterationName);

      await benchmarkFn();

      const metric = this.monitor.endMeasurement(iterationName);
      if (metric?.duration) {
        samples.push(metric.duration);
      }
    }

    const endMemory = this.monitor.getMemoryUsage();
    const totalDuration = samples.reduce((sum, duration) => sum + duration, 0);
    const avgDuration = totalDuration / samples.length;

    // Calculate percentiles
    const sortedSamples = [...samples].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedSamples.length * 0.95);
    const p99Index = Math.floor(sortedSamples.length * 0.99);

    const result: BenchmarkResult = {
      name,
      duration: totalDuration,
      memoryUsage: {
        usedJSHeapSize: endMemory.usedJSHeapSize - startMemory.usedJSHeapSize,
        totalJSHeapSize: endMemory.totalJSHeapSize,
        jsHeapSizeLimit: endMemory.jsHeapSizeLimit,
      },
      operationsPerSecond: 1000 / avgDuration,
      avgOperationTime: avgDuration,
      minTime: Math.min(...samples),
      maxTime: Math.max(...samples),
      p95Time: sortedSamples[p95Index] || 0,
      p99Time: sortedSamples[p99Index] || 0,
      samples,
      timestamp: Date.now(),
    };

    return result;
  }

  async runMemoryBenchmark(
    name: string,
    setup: () => Promise<void> | void,
    benchmarkFn: () => Promise<void> | void,
    iterations: number = 50
  ): Promise<BenchmarkResult & { memoryLeak: number }> {
    const startMemory = this.monitor.getMemoryUsage();

    const result = await this.runBenchmark(
      name,
      setup,
      benchmarkFn,
      iterations
    );

    const endMemory = this.monitor.getMemoryUsage();
    const memoryLeak = endMemory.usedJSHeapSize - startMemory.usedJSHeapSize;

    return {
      ...result,
      memoryLeak,
    };
  }

  validateThresholds(
    result: BenchmarkResult,
    thresholds: PerformanceThresholds
  ): string[] {
    const violations: string[] = [];

    if (thresholds.maxDuration && result.duration > thresholds.maxDuration) {
      violations.push(
        `Duration ${result.duration.toFixed(2)}ms exceeds threshold ${thresholds.maxDuration}ms`
      );
    }

    if (
      thresholds.maxMemoryUsage &&
      result.memoryUsage.usedJSHeapSize > thresholds.maxMemoryUsage
    ) {
      violations.push(
        `Memory usage ${result.memoryUsage.usedJSHeapSize} bytes exceeds threshold ${thresholds.maxMemoryUsage} bytes`
      );
    }

    if (
      thresholds.minOperationsPerSecond &&
      result.operationsPerSecond < thresholds.minOperationsPerSecond
    ) {
      violations.push(
        `Operations per second ${result.operationsPerSecond.toFixed(2)} below threshold ${thresholds.minOperationsPerSecond}`
      );
    }

    if (
      thresholds.maxAvgOperationTime &&
      result.avgOperationTime > thresholds.maxAvgOperationTime
    ) {
      violations.push(
        `Average operation time ${result.avgOperationTime.toFixed(2)}ms exceeds threshold ${thresholds.maxAvgOperationTime}ms`
      );
    }

    return violations;
  }
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility functions
export const measureExecutionTime = async <T>(
  fn: () => Promise<T>,
  name: string
): Promise<{ result: T; metrics: PerformanceMetrics | null }> => {
  performanceMonitor.startMeasurement(name);
  try {
    const result = await fn();
    const metrics = performanceMonitor.endMeasurement(name);
    return { result, metrics };
  } catch (error) {
    performanceMonitor.endMeasurement(name);
    throw error;
  }
};

export const createPerformanceTestSuite = (name: string) => {
  return {
    name,
    benchmarks: new Map<string, BenchmarkResult>(),
    thresholds: new Map<string, PerformanceThresholds>(),

    addBenchmark: function (benchmarkName: string, result: BenchmarkResult) {
      this.benchmarks.set(benchmarkName, result);
    },

    setThresholds: function (
      benchmarkName: string,
      thresholds: PerformanceThresholds
    ) {
      this.thresholds.set(benchmarkName, thresholds);
    },

    runValidations: function (): Map<string, string[]> {
      const violations = new Map<string, string[]>();

      for (const [name, result] of this.benchmarks) {
        const thresholds = this.thresholds.get(name);
        if (thresholds) {
          const benchmarkViolations = new BenchmarkRunner().validateThresholds(
            result,
            thresholds
          );
          if (benchmarkViolations.length > 0) {
            violations.set(name, benchmarkViolations);
          }
        }
      }

      return violations;
    },

    generateReport: function (): string {
      const report: string[] = [];
      report.push(`# Performance Test Suite: ${name}`);
      report.push(`Generated: ${new Date().toISOString()}\n`);

      for (const [benchmarkName, result] of this.benchmarks) {
        report.push(`## ${benchmarkName}`);
        report.push(`- **Total Duration**: ${result.duration.toFixed(2)}ms`);
        report.push(
          `- **Operations per Second**: ${result.operationsPerSecond.toFixed(2)} ops/s`
        );
        report.push(
          `- **Average Operation Time**: ${result.avgOperationTime.toFixed(2)}ms`
        );
        report.push(
          `- **Min/Max Time**: ${result.minTime.toFixed(2)}ms / ${result.maxTime.toFixed(2)}ms`
        );
        report.push(
          `- **95th/99th Percentile**: ${result.p95Time.toFixed(2)}ms / ${result.p99Time.toFixed(2)}ms`
        );
        report.push(
          `- **Memory Usage**: ${(result.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`
        );
        report.push(`- **Sample Count**: ${result.samples.length}\n`);
      }

      const violations = this.runValidations();
      if (violations.size > 0) {
        report.push(`## Threshold Violations`);
        for (const [benchmarkName, benchmarkViolations] of violations) {
          report.push(`### ${benchmarkName}`);
          benchmarkViolations.forEach(violation =>
            report.push(`- ❌ ${violation}`)
          );
          report.push("");
        }
      } else {
        report.push(`## ✅ All benchmarks passed their thresholds`);
      }

      return report.join("\n");
    },
  };
};
