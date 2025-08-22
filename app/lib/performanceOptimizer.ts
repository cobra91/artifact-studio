// Advanced performance optimization utilities
import { ComponentNode } from "../types/artifact";

export interface BundleAnalysis {
  totalSize: number;
  chunks: ChunkInfo[];
  recommendations: OptimizationRecommendation[];
  criticalPath: string[];
}

export interface ChunkInfo {
  name: string;
  size: number;
  modules: ModuleInfo[];
  loadTime: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ModuleInfo {
  name: string;
  size: number;
  usageCount: number;
  isAsync: boolean;
}

export interface OptimizationRecommendation {
  type: 'lazy-loading' | 'code-splitting' | 'tree-shaking' | 'compression';
  impact: 'high' | 'medium' | 'low';
  description: string;
  implementation: string;
  expectedSavings: number; // in bytes
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private loadedModules: Map<string, ModuleInfo> = new Map();
  private performanceObserver: PerformanceObserver | null = null;

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  constructor() {
    this.initializeObserver();
  }

  private initializeObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.processPerformanceEntry(entry);
        });
      });

      this.performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint'] });
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    if (entry.entryType === 'resource' && entry.name.includes('.js')) {
      const moduleInfo: ModuleInfo = {
        name: entry.name,
        size: (entry as PerformanceResourceTiming).transferSize || 0,
        usageCount: 1,
        isAsync: entry.name.includes('chunk') || entry.name.includes('async'),
      };
      
      if (this.loadedModules.has(entry.name)) {
        const existing = this.loadedModules.get(entry.name)!;
        existing.usageCount++;
      } else {
        this.loadedModules.set(entry.name, moduleInfo);
      }
    }
  }

  analyzeBundlePerformance(): BundleAnalysis {
    const chunks = this.generateChunkAnalysis();
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const recommendations = this.generateOptimizationRecommendations(chunks);
    const criticalPath = this.identifyCriticalPath(chunks);

    return {
      totalSize,
      chunks,
      recommendations,
      criticalPath,
    };
  }

  private generateChunkAnalysis(): ChunkInfo[] {
    const chunks: ChunkInfo[] = [];
    
    // Group modules into logical chunks
    const moduleGroups = new Map<string, ModuleInfo[]>();
    
    this.loadedModules.forEach((module, name) => {
      let chunkName = 'main';
      
      if (name.includes('node_modules')) {
        chunkName = 'vendor';
      } else if (name.includes('chunk')) {
        chunkName = name.split('/').pop()?.split('.')[0] || 'dynamic';
      } else if (name.includes('component')) {
        chunkName = 'components';
      }
      
      if (!moduleGroups.has(chunkName)) {
        moduleGroups.set(chunkName, []);
      }
      moduleGroups.get(chunkName)!.push(module);
    });

    moduleGroups.forEach((modules, chunkName) => {
      const size = modules.reduce((sum, mod) => sum + mod.size, 0);
      const priority = this.calculateChunkPriority(chunkName, size);
      const loadTime = this.estimateLoadTime(size);

      chunks.push({
        name: chunkName,
        size,
        modules,
        loadTime,
        priority,
      });
    });

    return chunks.sort((a, b) => b.size - a.size);
  }

  private calculateChunkPriority(chunkName: string, size: number): 'critical' | 'high' | 'medium' | 'low' {
    if (chunkName === 'main' || size > 500000) return 'critical'; // >500KB
    if (chunkName === 'components' || size > 200000) return 'high'; // >200KB
    if (size > 50000) return 'medium'; // >50KB
    return 'low';
  }

  private estimateLoadTime(size: number): number {
    // Estimate load time based on size and average 3G connection (1.5 Mbps)
    const connectionSpeed = 1500000 / 8; // bytes per second
    return (size / connectionSpeed) * 1000; // milliseconds
  }

  private generateOptimizationRecommendations(chunks: ChunkInfo[]): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze each chunk for optimization opportunities
    chunks.forEach(chunk => {
      // Large vendor chunks
      if (chunk.name === 'vendor' && chunk.size > 500000) {
        recommendations.push({
          type: 'code-splitting',
          impact: 'high',
          description: `Vendor chunk is ${(chunk.size / 1024).toFixed(0)}KB. Consider splitting into smaller chunks.`,
          implementation: 'Use dynamic imports and separate common libraries',
          expectedSavings: chunk.size * 0.3, // 30% savings through splitting
        });
      }

      // Heavy component chunks
      if (chunk.name === 'components' && chunk.size > 200000) {
        recommendations.push({
          type: 'lazy-loading',
          impact: 'high',
          description: `Component bundle is ${(chunk.size / 1024).toFixed(0)}KB. Implement lazy loading.`,
          implementation: 'Use React.lazy() and Suspense for route-based code splitting',
          expectedSavings: chunk.size * 0.4, // 40% savings through lazy loading
        });
      }

      // Unused modules
      const unusedModules = chunk.modules.filter(m => m.usageCount === 1);
      if (unusedModules.length > 0) {
        const unusedSize = unusedModules.reduce((sum, m) => sum + m.size, 0);
        recommendations.push({
          type: 'tree-shaking',
          impact: 'medium',
          description: `${unusedModules.length} potentially unused modules detected (${(unusedSize / 1024).toFixed(0)}KB)`,
          implementation: 'Review imports and remove unused code',
          expectedSavings: unusedSize,
        });
      }
    });

    // Overall compression recommendation
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    if (totalSize > 1000000) { // >1MB
      recommendations.push({
        type: 'compression',
        impact: 'high',
        description: `Total bundle size is ${(totalSize / 1024 / 1024).toFixed(2)}MB. Enable compression.`,
        implementation: 'Configure gzip/brotli compression and optimize images',
        expectedSavings: totalSize * 0.6, // 60% savings through compression
      });
    }

    return recommendations.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      return impactScore[b.impact] - impactScore[a.impact];
    });
  }

  private identifyCriticalPath(chunks: ChunkInfo[]): string[] {
    return chunks
      .filter(chunk => chunk.priority === 'critical' || chunk.priority === 'high')
      .map(chunk => chunk.name);
  }

  // Component-level optimization
  optimizeComponentRendering(components: ComponentNode[]): ComponentOptimization[] {
    return components.map(component => this.analyzeComponentPerformance(component));
  }

  private analyzeComponentPerformance(component: ComponentNode): ComponentOptimization {
    const complexity = this.calculateComponentComplexity(component);
    const renderCost = this.estimateRenderCost(component);
    const recommendations = this.generateComponentRecommendations(component, complexity, renderCost);

    return {
      componentId: component.id,
      complexity,
      renderCost,
      recommendations,
    };
  }

  private calculateComponentComplexity(component: ComponentNode): number {
    let complexity = 1; // Base complexity

    // Add complexity for children
    if (component.children) {
      complexity += component.children.length * 0.5;
      
      // Recursive complexity for nested children
      component.children.forEach(child => {
        complexity += this.calculateComponentComplexity(child) * 0.3;
      });
    }

    // Add complexity for props
    if (component.props) {
      complexity += Object.keys(component.props).length * 0.2;
    }

    // Add complexity for styles
    if (component.styles) {
      complexity += Object.keys(component.styles).length * 0.1;
    }

    // Add complexity for responsive styles
    if (component.responsiveStyles) {
      complexity += Object.keys(component.responsiveStyles).length * 0.3;
    }

    return Math.round(complexity * 100) / 100;
  }

  private estimateRenderCost(component: ComponentNode): number {
    let cost = 1; // Base render cost

    // Type-specific costs
    const typeCosts: Record<string, number> = {
      'chart': 5,
      'image': 3,
      'video': 4,
      'canvas': 6,
      'svg': 2,
      'button': 1,
      'text': 0.5,
      'container': 0.8,
    };

    cost *= typeCosts[component.type] || 1;

    // Children render cost
    if (component.children) {
      cost += component.children.reduce((sum, child) => {
        return sum + this.estimateRenderCost(child);
      }, 0);
    }

    return Math.round(cost * 100) / 100;
  }

  private generateComponentRecommendations(
    component: ComponentNode,
    complexity: number,
    renderCost: number
  ): ComponentRecommendation[] {
    const recommendations: ComponentRecommendation[] = [];

    if (complexity > 5) {
      recommendations.push({
        type: 'memoization',
        description: `Component complexity is ${complexity}. Consider React.memo or useMemo.`,
        impact: 'high',
      });
    }

    if (renderCost > 10) {
      recommendations.push({
        type: 'virtualization',
        description: `High render cost (${renderCost}). Consider virtual scrolling if rendering lists.`,
        impact: 'high',
      });
    }

    if (component.children && component.children.length > 10) {
      recommendations.push({
        type: 'chunking',
        description: `${component.children.length} children detected. Consider chunking or pagination.`,
        impact: 'medium',
      });
    }

    return recommendations;
  }

  // Performance monitoring
  getPerformanceMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    const lcp = performance.getEntriesByType('largest-contentful-paint')[0] as PerformanceEntry;

    return {
      // Core Web Vitals
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: lcp?.startTime || 0,
      
      // Navigation timing
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      
      // Resource timing
      totalResourceSize: Array.from(this.loadedModules.values()).reduce((sum, mod) => sum + mod.size, 0),
      resourceCount: this.loadedModules.size,
    };
  }

  dispose(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    this.loadedModules.clear();
  }
}

// Types
export interface ComponentOptimization {
  componentId: string;
  complexity: number;
  renderCost: number;
  recommendations: ComponentRecommendation[];
}

export interface ComponentRecommendation {
  type: 'memoization' | 'virtualization' | 'chunking';
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  domContentLoaded: number;
  loadComplete: number;
  totalResourceSize: number;
  resourceCount: number;
}

// Global instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Utility functions
export const measureComponentRender = async <T>(
  componentFn: () => T,
  componentName: string
): Promise<{ result: T; renderTime: number }> => {
  const startTime = performance.now();
  const result = componentFn();
  const renderTime = performance.now() - startTime;
  
  console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
  
  return { result, renderTime };
};

export const optimizeImageLoading = (src: string): string => {
  // Add loading optimization parameters
  const url = new URL(src);
  url.searchParams.set('auto', 'format,compress');
  url.searchParams.set('fit', 'max');
  return url.toString();
};

export const preloadCriticalResources = (resources: string[]): void => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
};
