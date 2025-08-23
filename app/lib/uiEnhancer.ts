// Advanced UI/UX enhancement system
import { ComponentNode } from "../types/artifact";

export interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  recommendations: AccessibilityRecommendation[];
  compliance: ComplianceLevel;
}

export interface AccessibilityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'color-contrast' | 'keyboard-navigation' | 'alt-text' | 'heading-structure' | 'focus-management' | 'aria-labels';
  description: string;
  element: string;
  fix: string;
  wcagReference: string;
}

export interface AccessibilityRecommendation {
  priority: number;
  improvement: string;
  implementation: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

export interface ComplianceLevel {
  wcagAA: boolean;
  wcagAAA: boolean;
  section508: boolean;
  ada: boolean;
}

export interface ResponsiveDesignAnalysis {
  breakpoints: BreakpointAnalysis[];
  flexibilityScore: number;
  issues: ResponsiveIssue[];
  recommendations: ResponsiveRecommendation[];
}

export interface BreakpointAnalysis {
  name: string;
  width: number;
  coverage: number; // percentage of components optimized for this breakpoint
  issues: string[];
  score: number;
}

export interface ResponsiveIssue {
  component: string;
  issue: string;
  breakpoint: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fix: string;
}

export interface ResponsiveRecommendation {
  component: string;
  improvement: string;
  breakpoints: string[];
  implementation: string;
}

export interface UXMetrics {
  interactionTime: number;
  errorRate: number;
  taskCompletionRate: number;
  userSatisfactionScore: number;
  cognitiveLoad: number;
  visualHierarchy: number;
}

export class UIEnhancer {
  private static instance: UIEnhancer;
  private interactionLog: InteractionEvent[] = [];
  private performanceMetrics: Map<string, number[]> = new Map();

  static getInstance(): UIEnhancer {
    if (!UIEnhancer.instance) {
      UIEnhancer.instance = new UIEnhancer();
    }
    return UIEnhancer.instance;
  }

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking(): void {
    if (typeof window !== 'undefined') {
      // Track user interactions
      document.addEventListener('click', this.trackInteraction.bind(this));
      document.addEventListener('keydown', this.trackInteraction.bind(this));
      document.addEventListener('focus', this.trackInteraction.bind(this));
      
      // Track performance metrics
      this.startPerformanceMonitoring();
    }
  }

  private trackInteraction(event: Event): void {
    const interactionEvent: InteractionEvent = {
      type: event.type,
      timestamp: Date.now(),
      target: (event.target as Element)?.tagName?.toLowerCase() || 'unknown',
      coordinates: this.getEventCoordinates(event),
      duration: 0, // Will be updated when interaction completes
    };
    
    this.interactionLog.push(interactionEvent);
    
    // Keep only last 1000 interactions to prevent memory leaks
    if (this.interactionLog.length > 1000) {
      this.interactionLog = this.interactionLog.slice(-1000);
    }
  }

  private getEventCoordinates(event: Event): { x: number; y: number } | null {
    if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    }
    return null;
  }

  private startPerformanceMonitoring(): void {
    // Monitor frame rates
    let frameCount = 0;
    let lastTimestamp = performance.now();
    
    const measureFrameRate = () => {
      const currentTime = performance.now();
      frameCount++;
      
      if (currentTime - lastTimestamp >= 1000) {
        const fps = Math.round(frameCount * 1000 / (currentTime - lastTimestamp));
        this.recordMetric('fps', fps);
        
        frameCount = 0;
        lastTimestamp = currentTime;
      }
      
      requestAnimationFrame(measureFrameRate);
    };
    
    requestAnimationFrame(measureFrameRate);
  }

  private recordMetric(metric: string, value: number): void {
    if (!this.performanceMetrics.has(metric)) {
      this.performanceMetrics.set(metric, []);
    }
    
    const values = this.performanceMetrics.get(metric)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.splice(0, values.length - 100);
    }
  }

  // Accessibility Analysis
  analyzeAccessibility(components: ComponentNode[]): AccessibilityReport {
    const issues: AccessibilityIssue[] = [];
    
    components.forEach(component => {
      issues.push(...this.checkComponentAccessibility(component));
    });

    const score = this.calculateAccessibilityScore(issues);
    const recommendations = this.generateAccessibilityRecommendations(issues);
    const compliance = this.checkCompliance(issues);

    return {
      score,
      issues,
      recommendations,
      compliance,
    };
  }

  private checkComponentAccessibility(component: ComponentNode): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for missing alt text on images
    if (component.type === 'image' && !component.props?.alt) {
      issues.push({
        severity: 'high',
        type: 'alt-text',
        description: 'Image missing alt text for screen readers',
        element: `${component.type}#${component.id}`,
        fix: 'Add descriptive alt text to the image props',
        wcagReference: 'WCAG 2.1 - 1.1.1 Non-text Content',
      });
    }

    // Check for proper heading structure
    if (component.type === 'text' && component.props?.children?.toString().startsWith('h')) {
      // This is a simplistic check - in real implementation, would need more sophisticated parsing
      issues.push({
        severity: 'medium',
        type: 'heading-structure',
        description: 'Verify heading hierarchy is logical',
        element: `${component.type}#${component.id}`,
        fix: 'Ensure headings follow a logical order (h1, h2, h3, etc.)',
        wcagReference: 'WCAG 2.1 - 1.3.1 Info and Relationships',
      });
    }

    // Check for interactive elements without proper labels
    if (['button', 'input', 'select'].includes(component.type)) {
      if (!component.props?.['aria-label'] && !component.props?.children) {
        issues.push({
          severity: 'high',
          type: 'aria-labels',
          description: 'Interactive element missing accessible label',
          element: `${component.type}#${component.id}`,
          fix: 'Add aria-label or meaningful text content',
          wcagReference: 'WCAG 2.1 - 4.1.2 Name, Role, Value',
        });
      }
    }

    // Check color contrast (simplified - would need actual color analysis)
    if (component.styles?.color && component.styles?.backgroundColor) {
      // Placeholder for color contrast checking logic
      const contrastIssue = this.checkColorContrast(
        component.styles.color as string,
        component.styles.backgroundColor as string
      );
      if (contrastIssue) {
        issues.push({
          severity: 'critical',
          type: 'color-contrast',
          description: contrastIssue,
          element: `${component.type}#${component.id}`,
          fix: 'Adjust colors to meet WCAG contrast requirements',
          wcagReference: 'WCAG 2.1 - 1.4.3 Contrast (Minimum)',
        });
      }
    }

    // Recursively check children
    if (component.children) {
      component.children.forEach(child => {
        issues.push(...this.checkComponentAccessibility(child));
      });
    }

    return issues;
  }

  private checkColorContrast(foreground: string, background: string): string | null {
    // Simplified color contrast check
    // In a real implementation, would convert colors to RGB and calculate actual contrast ratio
    if (foreground.toLowerCase() === background.toLowerCase()) {
      return 'Text and background colors are identical';
    }
    
    // Placeholder logic - would implement actual contrast calculation
    const problematicCombinations = [
      ['yellow', 'white'],
      ['gray', 'lightgray'],
      ['blue', 'darkblue'],
    ];
    
    for (const [fg, bg] of problematicCombinations) {
      if (foreground.includes(fg) && background.includes(bg)) {
        return `Poor contrast between ${foreground} and ${background}`;
      }
    }
    
    return null;
  }

  private calculateAccessibilityScore(issues: AccessibilityIssue[]): number {
    const severityWeights = {
      critical: 10,
      high: 6,
      medium: 3,
      low: 1,
    };

    const totalPenalty = issues.reduce((penalty, issue) => {
      return penalty + severityWeights[issue.severity];
    }, 0);

    // Start with 100 and subtract penalties
    const score = Math.max(0, 100 - totalPenalty);
    return Math.round(score);
  }

  private generateAccessibilityRecommendations(issues: AccessibilityIssue[]): AccessibilityRecommendation[] {
    const recommendations: AccessibilityRecommendation[] = [];

    // Group issues by type
    const issueGroups = issues.reduce((groups, issue) => {
      if (!groups[issue.type]) {
        groups[issue.type] = [];
      }
      groups[issue.type].push(issue);
      return groups;
    }, {} as Record<string, AccessibilityIssue[]>);

    // Generate recommendations based on issue patterns
    Object.entries(issueGroups).forEach(([type, groupIssues]) => {
      const criticalCount = groupIssues.filter(i => i.severity === 'critical').length;
      const highCount = groupIssues.filter(i => i.severity === 'high').length;

      if (criticalCount > 0 || highCount > 2) {
        recommendations.push({
          priority: criticalCount > 0 ? 1 : 2,
          improvement: this.getImprovementForType(type),
          implementation: this.getImplementationForType(type),
          impact: criticalCount > 0 ? 'high' : 'medium',
          effort: this.getEffortForType(type),
        });
      }
    });

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  private getImprovementForType(type: string): string {
    const improvements: Record<string, string> = {
      'color-contrast': 'Improve color contrast ratios throughout the application',
      'alt-text': 'Add comprehensive alt text for all images',
      'aria-labels': 'Implement proper ARIA labels for interactive elements',
      'heading-structure': 'Establish clear heading hierarchy',
      'keyboard-navigation': 'Ensure full keyboard accessibility',
      'focus-management': 'Implement proper focus management',
    };
    return improvements[type] || 'Address accessibility issues of this type';
  }

  private getImplementationForType(type: string): string {
    const implementations: Record<string, string> = {
      'color-contrast': 'Use color contrast analyzers and adjust color palette to meet WCAG AA standards',
      'alt-text': 'Add meaningful alt attributes to all img elements and decorative images',
      'aria-labels': 'Add aria-label, aria-labelledby, or aria-describedby attributes to form controls and interactive elements',
      'heading-structure': 'Review and restructure headings to follow logical hierarchy (h1->h2->h3)',
      'keyboard-navigation': 'Ensure all interactive elements are reachable and operable via keyboard',
      'focus-management': 'Implement visible focus indicators and manage focus for dynamic content',
    };
    return implementations[type] || 'Research and implement best practices for this accessibility area';
  }

  private getEffortForType(type: string): 'low' | 'medium' | 'high' {
    const effortLevels: Record<string, 'low' | 'medium' | 'high'> = {
      'color-contrast': 'medium',
      'alt-text': 'low',
      'aria-labels': 'low',
      'heading-structure': 'medium',
      'keyboard-navigation': 'high',
      'focus-management': 'high',
    };
    return effortLevels[type] || 'medium';
  }

  private checkCompliance(issues: AccessibilityIssue[]): ComplianceLevel {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;

    return {
      wcagAA: criticalIssues === 0 && highIssues === 0,
      wcagAAA: criticalIssues === 0 && highIssues === 0 && mediumIssues === 0,
      section508: criticalIssues === 0 && highIssues <= 1,
      ada: criticalIssues === 0 && highIssues === 0,
    };
  }

  // Responsive Design Analysis
  analyzeResponsiveDesign(components: ComponentNode[]): ResponsiveDesignAnalysis {
    const breakpoints = this.analyzeBreakpoints(components);
    const flexibilityScore = this.calculateFlexibilityScore(components);
    const issues = this.findResponsiveIssues(components);
    const recommendations = this.generateResponsiveRecommendations(issues);

    return {
      breakpoints,
      flexibilityScore,
      issues,
      recommendations,
    };
  }

  private analyzeBreakpoints(components: ComponentNode[]): BreakpointAnalysis[] {
    const standardBreakpoints = [
      { name: 'mobile', width: 375 },
      { name: 'tablet', width: 768 },
      { name: 'desktop', width: 1024 },
      { name: 'wide', width: 1440 },
    ];

    return standardBreakpoints.map(bp => {
      const coverage = this.calculateBreakpointCoverage(components, bp.name);
      const issues = this.findBreakpointIssues(components, bp.name);
      const score = this.calculateBreakpointScore(coverage, issues.length);

      return {
        name: bp.name,
        width: bp.width,
        coverage,
        issues,
        score,
      };
    });
  }

  private calculateBreakpointCoverage(components: ComponentNode[], breakpoint: string): number {
    let totalComponents = 0;
    let optimizedComponents = 0;

    const analyzeComponent = (component: ComponentNode) => {
      totalComponents++;
      
      if (component.responsiveStyles && component.responsiveStyles[breakpoint as keyof typeof component.responsiveStyles]) {
        optimizedComponents++;
      }
      
      if (component.children) {
        component.children.forEach(analyzeComponent);
      }
    };

    components.forEach(analyzeComponent);
    
    return totalComponents === 0 ? 100 : Math.round((optimizedComponents / totalComponents) * 100);
  }

  private findBreakpointIssues(components: ComponentNode[], breakpoint: string): string[] {
    const issues: string[] = [];
    
    // Check for common responsive issues
    components.forEach(component => {
      if (component.size.width && component.size.width > 1200 && breakpoint === 'mobile') {
        issues.push(`Component ${component.id} may be too wide for mobile`);
      }
      
      if (component.props?.className?.includes('fixed-width') && breakpoint === 'mobile') {
        issues.push(`Component ${component.id} uses fixed width which may not be responsive`);
      }
    });

    return issues;
  }

  private calculateBreakpointScore(coverage: number, issueCount: number): number {
    let score = coverage;
    score -= issueCount * 10; // Subtract 10 points per issue
    return Math.max(0, Math.min(100, score));
  }

  private calculateFlexibilityScore(components: ComponentNode[]): number {
    let totalComponents = 0;
    let flexibleComponents = 0;

    const analyzeComponent = (component: ComponentNode) => {
      totalComponents++;
      
      // Check for flexible sizing
      const hasRelativeUnits = this.hasRelativeUnits(component);
      const hasResponsiveStyles = component.responsiveStyles && Object.keys(component.responsiveStyles).length > 0;
      const hasFlexibleLayout = this.hasFlexibleLayout(component);

      if (hasRelativeUnits || hasResponsiveStyles || hasFlexibleLayout) {
        flexibleComponents++;
      }
      
      if (component.children) {
        component.children.forEach(analyzeComponent);
      }
    };

    components.forEach(analyzeComponent);
    
    return totalComponents === 0 ? 100 : Math.round((flexibleComponents / totalComponents) * 100);
  }

  private hasRelativeUnits(component: ComponentNode): boolean {
    const styles = component.styles || {};
    const stringValues = Object.values(styles).filter(v => typeof v === 'string');
    
    return stringValues.some(value => 
      value.includes('%') || 
      value.includes('em') || 
      value.includes('rem') || 
      value.includes('vw') || 
      value.includes('vh')
    );
  }

  private hasFlexibleLayout(component: ComponentNode): boolean {
    const styles = component.styles || {};
    return !!(
      styles.display === 'flex' ||
      styles.display === 'grid' ||
      styles.flexGrow ||
      styles.flexShrink ||
      styles.gridTemplate
    );
  }

  private findResponsiveIssues(components: ComponentNode[]): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = [];

    components.forEach(component => {
      // Check for fixed widths
      if (component.size.width && component.size.width > 800) {
        issues.push({
          component: component.id,
          issue: 'Component has fixed width that may cause horizontal scrolling on mobile',
          breakpoint: 'mobile',
          severity: 'high',
          fix: 'Use percentage-based or flexible width instead of fixed pixels',
        });
      }

      // Check for missing mobile styles (checking for 'sm' as the smallest breakpoint)
      if (!component.responsiveStyles || !component.responsiveStyles.sm) {
        issues.push({
          component: component.id,
          issue: 'Component lacks mobile-specific styling',
          breakpoint: 'mobile',
          severity: 'medium',
          fix: 'Add responsive styles for mobile breakpoint',
        });
      }

      // Check for small touch targets on mobile
      if (component.type === 'button' && component.size.height && component.size.height < 44) {
        issues.push({
          component: component.id,
          issue: 'Button height is below recommended touch target size (44px)',
          breakpoint: 'mobile',
          severity: 'medium',
          fix: 'Increase button height to at least 44px for better touch accessibility',
        });
      }
    });

    return issues;
  }

  private generateResponsiveRecommendations(issues: ResponsiveIssue[]): ResponsiveRecommendation[] {
    const recommendations: ResponsiveRecommendation[] = [];
    
    // Group issues by type
    const fixedWidthIssues = issues.filter(i => i.issue.includes('fixed width'));
    const mobileStyleIssues = issues.filter(i => i.issue.includes('mobile-specific'));
    const touchTargetIssues = issues.filter(i => i.issue.includes('touch target'));

    if (fixedWidthIssues.length > 0) {
      recommendations.push({
        component: 'multiple',
        improvement: 'Implement fluid layouts throughout the application',
        breakpoints: ['mobile', 'tablet'],
        implementation: 'Replace fixed widths with percentages, max-width, or flexible units (rem, em)',
      });
    }

    if (mobileStyleIssues.length > 0) {
      recommendations.push({
        component: 'multiple',
        improvement: 'Add comprehensive mobile-first responsive styling',
        breakpoints: ['mobile'],
        implementation: 'Create mobile-specific styles for typography, spacing, and layout adjustments',
      });
    }

    if (touchTargetIssues.length > 0) {
      recommendations.push({
        component: 'interactive elements',
        improvement: 'Ensure all interactive elements meet touch target size requirements',
        breakpoints: ['mobile', 'tablet'],
        implementation: 'Set minimum height/width of 44px for buttons and interactive elements',
      });
    }

    return recommendations;
  }

  // UX Metrics Collection
  collectUXMetrics(): UXMetrics {
    const interactionTime = this.calculateAverageInteractionTime();
    const errorRate = this.calculateErrorRate();
    const taskCompletionRate = this.calculateTaskCompletionRate();
    const userSatisfactionScore = this.calculateUserSatisfactionScore();
    const cognitiveLoad = this.calculateCognitiveLoad();
    const visualHierarchy = this.calculateVisualHierarchy();

    return {
      interactionTime,
      errorRate,
      taskCompletionRate,
      userSatisfactionScore,
      cognitiveLoad,
      visualHierarchy,
    };
  }

  private calculateAverageInteractionTime(): number {
    if (this.interactionLog.length === 0) return 0;
    
    const totalTime = this.interactionLog.reduce((sum, interaction) => sum + interaction.duration, 0);
    return totalTime / this.interactionLog.length;
  }

  private calculateErrorRate(): number {
    // Simplified error rate calculation
    // In real implementation, would track actual errors
    const errorEvents = this.interactionLog.filter(event => 
      event.type === 'error' || event.target === 'error-message'
    );
    
    return this.interactionLog.length === 0 ? 0 : 
      (errorEvents.length / this.interactionLog.length) * 100;
  }

  private calculateTaskCompletionRate(): number {
    // Simplified - would need to define what constitutes task completion
    // For now, assume successful interactions without errors
    const successfulInteractions = this.interactionLog.filter(event => 
      !['error', 'cancel'].includes(event.type)
    );
    
    return this.interactionLog.length === 0 ? 100 : 
      (successfulInteractions.length / this.interactionLog.length) * 100;
  }

  private calculateUserSatisfactionScore(): number {
    // Based on interaction patterns - quick interactions suggest satisfaction
    const quickInteractions = this.interactionLog.filter(event => event.duration < 1000);
    const satisfaction = this.interactionLog.length === 0 ? 85 : 
      (quickInteractions.length / this.interactionLog.length) * 100;
    
    return Math.min(100, satisfaction);
  }

  private calculateCognitiveLoad(): number {
    // Higher number of interactions suggests higher cognitive load
    const recentInteractions = this.interactionLog.filter(event => 
      Date.now() - event.timestamp < 60000 // last minute
    );
    
    // Normalize to 0-100 scale (lower is better)
    const load = Math.min(100, recentInteractions.length * 2);
    return load;
  }

  private calculateVisualHierarchy(): number {
    // Simplified calculation based on interaction patterns
    // Would need more sophisticated analysis in real implementation
    const clickInteractions = this.interactionLog.filter(event => event.type === 'click');
    const focusInteractions = this.interactionLog.filter(event => event.type === 'focus');
    
    // Good hierarchy suggests more clicks on important elements
    const hierarchyScore = clickInteractions.length > focusInteractions.length ? 80 : 60;
    return hierarchyScore;
  }

  dispose(): void {
    // Clean up event listeners
    if (typeof window !== 'undefined') {
      document.removeEventListener('click', this.trackInteraction.bind(this));
      document.removeEventListener('keydown', this.trackInteraction.bind(this));
      document.removeEventListener('focus', this.trackInteraction.bind(this));
    }
    
    this.interactionLog = [];
    this.performanceMetrics.clear();
  }
}

// Types
interface InteractionEvent {
  type: string;
  timestamp: number;
  target: string;
  coordinates: { x: number; y: number } | null;
  duration: number;
}

// Global instance
export const uiEnhancer = UIEnhancer.getInstance();

// Utility functions
export const generateAccessibilityReport = (components: ComponentNode[]): AccessibilityReport => {
  return uiEnhancer.analyzeAccessibility(components);
};

export const generateResponsiveReport = (components: ComponentNode[]): ResponsiveDesignAnalysis => {
  return uiEnhancer.analyzeResponsiveDesign(components);
};
