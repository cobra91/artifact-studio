# Performance Benchmarking System

This document describes the comprehensive performance benchmarking system implemented for the visual canvas application.

## Overview

The performance benchmarking system provides tools to measure, monitor, and analyze the application's performance across various scenarios including component rendering, canvas interactions, memory usage, AI generation, and more.

## Architecture

### Core Components

1. **Performance Utilities** (`app/lib/performanceUtils.ts`)
   - `PerformanceMonitor`: Real-time performance tracking
   - `BenchmarkRunner`: Automated benchmark execution
   - Performance threshold validation
   - Statistical analysis tools

2. **Performance Benchmarks** (`app/__tests__/performanceBenchmarks.test.ts`)
   - Comprehensive test suite covering all performance scenarios
   - Automated benchmark execution with Jest integration

3. **Performance Monitor Component** (`app/components/PerformanceMonitor.tsx`)
   - Real-time performance dashboard
   - Memory usage visualization
   - Performance metrics display

4. **Performance Panel Component** (`app/components/PerformancePanel.tsx`)
   - Interactive benchmark runner
   - Results visualization
   - Report generation

## Performance Scenarios Covered

### 1. Component Rendering Performance

- **1000+ Component Rendering**: Measures performance when rendering large numbers of components
- **Complex Hierarchy Rendering**: Tests performance with deeply nested component structures
- **Threshold**: 5 seconds max for 1000 components

### 2. Canvas Interaction Performance

- **Drag Operations**: Multi-component drag performance with collision detection
- **Resize Operations**: Component resizing with aspect ratio constraints
- **Selection Operations**: Large-area selection performance
- **Threshold**: 50ms average operation time

### 3. Memory Usage and Leak Detection

- **Memory Leak Detection**: Monitors memory usage during create/delete cycles
- **Extended Usage Memory**: Tracks memory usage during prolonged usage
- **Threshold**: 100MB max memory usage

### 4. State Management Performance

- **Complex Hierarchy Updates**: State updates across large component trees
- **Selector Performance**: State access pattern efficiency
- **Threshold**: 10 operations per second minimum

### 5. AI Generation Performance

- **AI Code Generation**: OpenAI API response time and memory usage
- **Component Tree Building**: Performance of component tree construction
- **Threshold**: 30 seconds max generation time

### 6. Template Operations Performance

- **Template Loading**: Local storage retrieval performance
- **Template Instantiation**: Component creation from templates
- **Template Serialization**: JSON conversion performance
- **Threshold**: 5 seconds max operation time

### 7. Undo/Redo Performance

- **Large History Operations**: Performance with 1000+ history entries
- **State Restoration**: History state loading performance
- **Threshold**: 10 seconds max for large histories

### 8. Search and Filtering Performance

- **Text Search**: Component search across large datasets
- **Complex Filtering**: Multi-condition filtering performance
- **Threshold**: 2 seconds max search time

### 9. Serialization/Deserialization

- **Project Export**: Large project serialization performance
- **Project Import**: Large project deserialization performance
- **Threshold**: 3 seconds max operation time

### 10. Virtual Scrolling and Pagination

- **Virtual Scrolling**: 10,000+ item virtual scrolling performance
- **Pagination**: Large dataset pagination performance
- **Threshold**: 3 seconds max operation time

## Usage

### Running Benchmarks

#### Method 1: Using Jest (Automated)

```bash
npm test -- --testPathPattern=performanceBenchmarks
```

#### Method 2: Using Performance Panel (Interactive)

1. Import the PerformancePanel component
2. Add it to your application
3. Use the interactive dashboard to run benchmarks

#### Method 3: Programmatic Usage

```typescript
import {
  BenchmarkRunner,
  createPerformanceTestSuite,
} from "./lib/performanceUtils";

const runner = new BenchmarkRunner();
const suite = createPerformanceTestSuite("My Performance Suite");

// Run a custom benchmark
const result = await runner.runBenchmark(
  "my-benchmark",
  async () => {
    /* setup */
  },
  async () => {
    /* benchmark function */
  },
  100 // iterations
);
```

### Real-time Monitoring

#### Using PerformanceMonitor Component

```tsx
import { PerformanceMonitor } from "./components/PerformanceMonitor";

function App() {
  return (
    <div>
      <PerformanceMonitor isActive={true} showDetails={true} />
      {/* Your app content */}
    </div>
  );
}
```

#### Using the Hook

```tsx
import { usePerformanceMonitor } from "./components/PerformanceMonitor";

function MyComponent() {
  const { startMeasurement, endMeasurement, memoryUsage } =
    usePerformanceMonitor();

  const handleOperation = async () => {
    startMeasurement("my-operation");
    // ... perform operation
    const metrics = endMeasurement("my-operation");
    console.log("Operation metrics:", metrics);
  };

  return (
    <div>
      <p>Memory Usage: {memoryUsage.usedJSHeapSize / 1024 / 1024} MB</p>
      <button onClick={handleOperation}>Run Operation</button>
    </div>
  );
}
```

## Performance Thresholds

The system includes configurable performance thresholds:

```typescript
const thresholds = {
  maxDuration: 5000, // Maximum operation duration (ms)
  maxMemoryUsage: 100 * 1024 * 1024, // Maximum memory usage (bytes)
  minOperationsPerSecond: 10, // Minimum operations per second
  maxAvgOperationTime: 100, // Maximum average operation time (ms)
};
```

### Setting Custom Thresholds

```typescript
import { createPerformanceTestSuite } from "./lib/performanceUtils";

const suite = createPerformanceTestSuite("Custom Suite");
suite.setThresholds("my-benchmark", {
  maxDuration: 2000,
  maxMemoryUsage: 50 * 1024 * 1024,
  minOperationsPerSecond: 30,
});
```

## Performance Metrics

The system tracks the following metrics:

### Timing Metrics

- **Duration**: Total benchmark duration
- **Average Operation Time**: Mean time per operation
- **Min/Max Time**: Fastest and slowest operations
- **95th/99th Percentiles**: Statistical distribution analysis

### Memory Metrics

- **Used JS Heap Size**: Current memory usage
- **Total JS Heap Size**: Total allocated memory
- **JS Heap Size Limit**: Browser memory limit
- **Memory Leak Detection**: Memory growth tracking

### Performance Metrics

- **Operations per Second**: Throughput measurement
- **CPU Usage**: Processing time analysis
- **Response Time**: User-perceived performance

## Reporting

### Automated Reports

The system generates comprehensive performance reports:

```typescript
const suite = createPerformanceTestSuite("Performance Suite");
// ... run benchmarks
const report = suite.generateReport();
console.log(report);
```

### Report Format

Reports include:

- Executive summary with pass/fail status
- Detailed benchmark results
- Performance threshold violations
- Recommendations for optimization
- Historical comparison data

### Export Options

- **JSON Export**: Raw benchmark data
- **Markdown Reports**: Formatted performance reports
- **CSV Export**: Spreadsheet-compatible data
- **HTML Dashboard**: Interactive performance dashboard

## Performance Regression Detection

The system automatically detects performance regressions:

```typescript
const violations = suite.runValidations();
if (violations.size > 0) {
  console.warn("Performance regressions detected:");
  violations.forEach((issues, benchmarkName) => {
    console.warn(`${benchmarkName}:`, issues);
  });
}
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Performance Tests
on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run performance benchmarks
        run: npm run test:performance

      - name: Upload performance results
        uses: actions/upload-artifact@v2
        with:
          name: performance-results
          path: performance-results/
```

## Best Practices

### Writing Benchmarks

1. **Proper Setup/Teardown**: Always clean up after benchmarks
2. **Warm-up Phase**: Include warm-up iterations for JIT optimization
3. **Statistical Significance**: Run sufficient iterations for reliable results
4. **Memory Isolation**: Ensure benchmarks don't interfere with each other

### Performance Monitoring

1. **Real-time Monitoring**: Use PerformanceMonitor for live performance tracking
2. **Memory Profiling**: Monitor memory usage during extended sessions
3. **Threshold Setting**: Set realistic performance thresholds
4. **Regular Testing**: Run benchmarks regularly to catch regressions

### Optimization Strategies

1. **Identify Bottlenecks**: Use the benchmark results to find slow operations
2. **Memory Optimization**: Address memory leaks identified by benchmarks
3. **Code Profiling**: Use browser dev tools for detailed performance analysis
4. **Progressive Enhancement**: Optimize critical user paths first

## Troubleshooting

### Common Issues

1. **Inconsistent Results**: Ensure stable testing environment
2. **Memory Leaks**: Use the memory leak detection benchmark
3. **High Variance**: Increase iteration count for more stable results
4. **Browser Throttling**: Disable CPU throttling during benchmarks

### Debug Mode

Enable debug logging for detailed benchmark information:

```typescript
// Enable debug mode
process.env.PERFORMANCE_DEBUG = "true";

// Detailed logging will be enabled
```

## Contributing

When adding new benchmarks:

1. Follow the existing benchmark structure
2. Include appropriate thresholds
3. Add documentation for new metrics
4. Test across different browsers
5. Update this README with new scenarios

## Performance Goals

- **Component Rendering**: < 100ms average for 1000 components
- **Canvas Interactions**: < 50ms average for drag/resize operations
- **Memory Usage**: < 200MB peak for large projects
- **AI Generation**: < 30 seconds for complex prompts
- **Search Operations**: < 2 seconds for 10,000 items
- **Template Operations**: < 5 seconds for large templates

This comprehensive performance benchmarking system ensures the visual canvas application maintains optimal performance across all usage scenarios while providing detailed insights for continuous optimization.
